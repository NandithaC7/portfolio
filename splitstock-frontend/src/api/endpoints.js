import client from "./client";

export const auth = {
  register: (payload) => client.post("/auth/register/", payload).then((r) => r.data),
  login: (payload) => client.post("/auth/login/", payload).then((r) => r.data),
  me: () => client.get("/auth/me/").then((r) => r.data),
  updateMe: (payload) => client.patch("/auth/me/", payload).then((r) => r.data),
};

export const households = {
  list: () => client.get("/households/").then((r) => r.data),
  get: (id) => client.get(`/households/${id}/`).then((r) => r.data),
  create: (payload) => client.post("/households/", payload).then((r) => r.data),
  preview: (code) => client.get(`/households/join/${code}/`).then((r) => r.data),
  join: (code) => client.post(`/households/join/${code}/`).then((r) => r.data),
  regenerateInvite: (id) =>
    client.post(`/households/${id}/regenerate-invite/`).then((r) => r.data),
  members: (id) => client.get(`/households/${id}/members/`).then((r) => r.data),
  promote: (id, membershipId) =>
    client
      .post(`/households/${id}/members/${membershipId}/promote/`)
      .then((r) => r.data),
  leave: (id) => client.post(`/households/${id}/leave/`).then((r) => r.data),
  balances: (id) => client.get(`/households/${id}/balances/`).then((r) => r.data),
  settle: (id, payload) =>
    client.post(`/households/${id}/balances/`, payload).then((r) => r.data),
  summary: (id) => client.get(`/households/${id}/summary/`).then((r) => r.data),
};

export const stocks = {
  list: (householdId) =>
    client
      .get("/stocks/", { params: { household: householdId, is_active: true } })
      .then((r) => r.data),
  get: (id) => client.get(`/stocks/${id}/`).then((r) => r.data),
  create: (payload) => client.post("/stocks/", payload).then((r) => r.data),
  update: (id, payload) => client.patch(`/stocks/${id}/`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/stocks/${id}/`).then((r) => r.data),
  usage: (id) => client.get(`/stocks/${id}/usage/`).then((r) => r.data),
  history: (id, days = 30) =>
    client.get(`/stocks/${id}/history/`, { params: { days } }).then((r) => r.data),
  prediction: (id) => client.get(`/stocks/${id}/prediction/`).then((r) => r.data),
  repredict: (id) => client.post(`/stocks/${id}/prediction/`).then((r) => r.data),
  split: (id) => client.get(`/stocks/${id}/split/`).then((r) => r.data),
};

export const usageLogs = {
  create: (payload) => client.post("/usage-logs/", payload).then((r) => r.data),
  list: (params) => client.get("/usage-logs/", { params }).then((r) => r.data),
};

export const me = {
  usage: (householdId) =>
    client
      .get("/me/usage/", { params: { household: householdId } })
      .then((r) => r.data),
  contributions: (householdId) =>
    client
      .get("/me/contributions/", { params: { household: householdId } })
      .then((r) => r.data),
};

export const restock = {
  list: (householdId) =>
    client
      .get("/restock-suggestions/", { params: { household: householdId } })
      .then((r) => r.data),
};
