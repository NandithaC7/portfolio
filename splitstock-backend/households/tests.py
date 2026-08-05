from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import Household, Membership

User = get_user_model()


class HouseholdTests(APITestCase):
    def setUp(self):
        self.creator = User.objects.create_user(
            username="creator", email="c@test.local", password="a-strong-passphrase-42"
        )
        self.joiner = User.objects.create_user(
            username="joiner", email="j@test.local", password="a-strong-passphrase-42"
        )

    def test_creator_becomes_admin_via_signal(self):
        self.client.force_authenticate(self.creator)
        response = self.client.post(
            "/api/households/", {"name": "Willow Court"}, format="json"
        )
        self.assertEqual(response.status_code, 201)
        membership = Membership.objects.get(user=self.creator)
        self.assertEqual(membership.role, Membership.Role.ADMIN)
        self.assertEqual(response.json()["my_role"], "ADMIN")

    def test_invite_code_is_generated_and_unique(self):
        first = Household.objects.create(name="A", created_by=self.creator)
        second = Household.objects.create(name="B", created_by=self.creator)
        self.assertTrue(first.invite_code)
        self.assertNotEqual(first.invite_code, second.invite_code)

    def test_join_by_code_adds_a_member(self):
        household = Household.objects.create(name="Willow", created_by=self.creator)
        self.client.force_authenticate(self.joiner)
        response = self.client.post(f"/api/households/join/{household.invite_code}/")
        self.assertEqual(response.status_code, 201)
        self.assertTrue(
            Membership.objects.filter(
                user=self.joiner, household=household, role=Membership.Role.MEMBER
            ).exists()
        )

    def test_join_with_a_bad_code_explains_itself(self):
        self.client.force_authenticate(self.joiner)
        response = self.client.post("/api/households/join/NOPENOPE/")
        self.assertEqual(response.status_code, 404)
        self.assertIn("No household matches", response.json()["detail"])

    def test_joining_twice_is_harmless(self):
        household = Household.objects.create(name="Willow", created_by=self.creator)
        self.client.force_authenticate(self.joiner)
        self.client.post(f"/api/households/join/{household.invite_code}/")
        response = self.client.post(f"/api/households/join/{household.invite_code}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            Membership.objects.filter(user=self.joiner, household=household).count(), 1
        )

    def test_only_admins_can_regenerate_the_invite_code(self):
        household = Household.objects.create(name="Willow", created_by=self.creator)
        Membership.objects.create(user=self.joiner, household=household)
        original = household.invite_code

        self.client.force_authenticate(self.joiner)
        self.assertEqual(
            self.client.post(
                f"/api/households/{household.id}/regenerate-invite/"
            ).status_code,
            403,
        )

        self.client.force_authenticate(self.creator)
        response = self.client.post(
            f"/api/households/{household.id}/regenerate-invite/"
        )
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.json()["invite_code"], original)

    def test_you_only_see_households_you_belong_to(self):
        Household.objects.create(name="Not Mine", created_by=self.creator)
        self.client.force_authenticate(self.joiner)
        self.assertEqual(self.client.get("/api/households/").json(), [])

    def test_last_admin_cannot_abandon_the_household(self):
        household = Household.objects.create(name="Willow", created_by=self.creator)
        self.client.force_authenticate(self.creator)
        response = self.client.post(f"/api/households/{household.id}/leave/")
        self.assertEqual(response.status_code, 400)
        self.assertIn("only admin", response.json()["detail"])
