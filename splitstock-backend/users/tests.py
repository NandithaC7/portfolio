from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

User = get_user_model()


class AuthTests(APITestCase):
    def test_register_returns_tokens_and_user(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "newbie",
                "email": "newbie@test.local",
                "password": "a-strong-passphrase-42",
                "password_confirm": "a-strong-passphrase-42",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        body = response.json()
        self.assertIn("access", body["tokens"])
        self.assertEqual(body["user"]["username"], "newbie")

    def test_mismatched_passwords_are_rejected(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "newbie",
                "email": "newbie@test.local",
                "password": "a-strong-passphrase-42",
                "password_confirm": "something-else-entirely",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("don't match", str(response.json()))

    def test_duplicate_email_points_at_logging_in(self):
        User.objects.create_user(
            username="first", email="taken@test.local", password="a-strong-passphrase-42"
        )
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "second",
                "email": "taken@test.local",
                "password": "a-strong-passphrase-42",
                "password_confirm": "a-strong-passphrase-42",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("logging in", str(response.json()))

    def test_duplicate_username_points_at_picking_another(self):
        User.objects.create_user(
            username="maya", email="first@test.local", password="a-strong-passphrase-42"
        )
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "maya",
                "email": "second@test.local",
                "password": "a-strong-passphrase-42",
                "password_confirm": "a-strong-passphrase-42",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("taken", str(response.json()))

    def test_login_accepts_an_email_as_the_identifier(self):
        User.objects.create_user(
            username="maya", email="maya@test.local", password="a-strong-passphrase-42"
        )
        response = self.client.post(
            "/api/auth/login/",
            {"username": "maya@test.local", "password": "a-strong-passphrase-42"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.json()["tokens"])

    def test_wrong_password_says_so_without_leaking_which_part(self):
        User.objects.create_user(
            username="maya", email="maya@test.local", password="a-strong-passphrase-42"
        )
        response = self.client.post(
            "/api/auth/login/",
            {"username": "maya", "password": "not-the-password"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("don't match an account", str(response.json()))

    def test_me_requires_a_token(self):
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 401)

    def test_me_can_update_the_phone_number(self):
        user = User.objects.create_user(
            username="maya", email="maya@test.local", password="a-strong-passphrase-42"
        )
        self.client.force_authenticate(user)
        response = self.client.patch(
            "/api/auth/me/", {"phone_number": "+919000000001"}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertEqual(user.phone_number, "+919000000001")


class UserDisplayTests(APITestCase):
    """The corkboard and avatars lean on these, so they need to be sane."""

    def test_initials_use_first_and_last_name(self):
        user = User.objects.create_user(
            username="maya",
            email="maya@test.local",
            password="a-strong-passphrase-42",
            first_name="Maya",
            last_name="Iyer",
        )
        self.assertEqual(user.initials, "MI")
        self.assertEqual(user.display_name, "Maya Iyer")

    def test_initials_fall_back_to_the_username(self):
        user = User.objects.create_user(
            username="nadia", email="n@test.local", password="a-strong-passphrase-42"
        )
        self.assertEqual(user.initials, "NA")
        self.assertEqual(user.display_name, "nadia")
