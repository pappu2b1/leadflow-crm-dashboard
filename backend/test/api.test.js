import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { createApp } from "../src/app.js";
import Admin from "../src/models/Admin.js";
import Lead from "../src/models/Lead.js";
import { seedDemoData } from "../src/data/seed.js";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "synthetic_test_secret_not_for_production";
const app = createApp();
let mongo;
let token;
const credentials = { email: "admin@example.test", password: "SyntheticPass123!" };
const leadPayload = { fullName: "Synthetic Lead", email: "lead@example.test", phone: "+910000000001", serviceInterested: "Synthetic CRM", budget: 50000, leadSource: "Website Form", status: "New", priority: "High", assignedTo: "Test Team" };

before(async () => { mongo = await MongoMemoryServer.create(); await mongoose.connect(mongo.getUri()); });
beforeEach(async () => {
  await Promise.all([Admin.deleteMany({}), Lead.deleteMany({})]);
  await Admin.create({ name: "Test Admin", ...credentials, companyName: "Synthetic Co", defaultAssignee: "Test Team" });
  const response = await request(app).post("/api/auth/login").send(credentials);
  token = response.body.token;
});
after(async () => { await mongoose.disconnect(); await mongo.stop(); });

test("health and version endpoints expose safe service information", async () => {
  const health = await request(app).get("/api/health").expect(200);
  assert.equal(health.body.success, true);
  const version = await request(app).get("/api/version").expect(200);
  assert.equal(version.body.version, "1.0.0");
});
test("database health reports a connected test database", async () => { const res = await request(app).get("/api/health/database").expect(200); assert.equal(res.body.status, "connected"); });
test("login accepts valid credentials", async () => { const res = await request(app).post("/api/auth/login").send(credentials).expect(200); assert.ok(res.body.token); });
test("login rejects invalid credentials", async () => { await request(app).post("/api/auth/login").send({ ...credentials, password: "wrong" }).expect(401); });
test("protected endpoints reject missing tokens", async () => { await request(app).get("/api/leads").expect(401); });
test("valid token returns the current admin", async () => { const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`).expect(200); assert.equal(res.body.admin.email, credentials.email); });
test("lead create and update workflow validates and persists data", async () => {
  const created = await request(app).post("/api/leads").set("Authorization", `Bearer ${token}`).send(leadPayload).expect(201);
  const updated = await request(app).put(`/api/leads/${created.body.lead._id}`).set("Authorization", `Bearer ${token}`).send({ status: "Qualified" }).expect(200);
  assert.equal(updated.body.lead.status, "Qualified");
});
test("lead deletion removes the lead", async () => {
  const lead = await Lead.create(leadPayload);
  await request(app).delete(`/api/leads/${lead._id}`).set("Authorization", `Bearer ${token}`).expect(200);
  assert.equal(await Lead.countDocuments(), 0);
});
test("lead search, filtering, and pagination work", async () => {
  await Lead.create([leadPayload, { ...leadPayload, fullName: "Second Person", email: "second@example.test", status: "Contacted" }]);
  const res = await request(app).get("/api/leads?search=Synthetic&status=New&page=1&limit=1").set("Authorization", `Bearer ${token}`).expect(200);
  assert.equal(res.body.leads.length, 1); assert.equal(res.body.pagination.total, 1);
});
test("follow-ups exclude converted and lost leads", async () => {
  const tomorrow = new Date(Date.now() + 86400000);
  await Lead.create([{ ...leadPayload, followUpDate: tomorrow }, { ...leadPayload, email: "closed@example.test", status: "Converted", followUpDate: tomorrow }]);
  const res = await request(app).get("/api/leads/follow-ups").set("Authorization", `Bearer ${token}`).expect(200);
  assert.equal(res.body.leads.length, 1); assert.equal(res.body.leads[0].status, "New");
});
test("follow-up type filters respect date boundaries and pagination", async () => {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  await Lead.create([
    { ...leadPayload, email: "overdue@example.test", followUpDate: yesterday },
    { ...leadPayload, email: "today@example.test", followUpDate: today },
    { ...leadPayload, email: "upcoming@example.test", followUpDate: tomorrow }
  ]);
  const auth = { Authorization: `Bearer ${token}` };
  const overdue = await request(app).get("/api/leads/follow-ups?type=overdue&page=1&limit=1").set(auth).expect(200);
  const dueToday = await request(app).get("/api/leads/follow-ups?type=today").set(auth).expect(200);
  const upcoming = await request(app).get("/api/leads/follow-ups?type=upcoming").set(auth).expect(200);
  assert.equal(overdue.body.pagination.total, 1);
  assert.equal(dueToday.body.leads[0].email, "today@example.test");
  assert.equal(upcoming.body.leads[0].email, "upcoming@example.test");
});
test("profile updates allowed fields without changing role", async () => {
  const res = await request(app).put("/api/auth/profile").set("Authorization", `Bearer ${token}`).send({ name: "Updated Admin", email: credentials.email, companyName: "Updated Co", defaultAssignee: "Updated Team", role: "superadmin" }).expect(200);
  assert.equal(res.body.admin.name, "Updated Admin"); assert.equal(res.body.admin.role, "admin");
});
test("reports endpoint returns portfolio analytics", async () => { await Lead.create(leadPayload); const res = await request(app).get("/api/stats/reports").set("Authorization", `Bearer ${token}`).expect(200); assert.equal(res.body.reportCards.conversionRate, 0); });
test("demo seed is idempotent and preserves unrelated records", async () => {
  process.env.DEMO_ADMIN_EMAIL = "demo-seed@example.test";
  process.env.DEMO_ADMIN_PASSWORD = "SyntheticSeedPassword123!";
  await Lead.create({ ...leadPayload, email: "unrelated@example.test", fullName: "Unrelated Synthetic Lead" });
  await seedDemoData();
  await seedDemoData();
  assert.equal(await Admin.countDocuments({ email: "demo-seed@example.test" }), 1);
  assert.equal(await Lead.countDocuments({ email: { $in: ["rahul.sharma@example.com", "unrelated@example.test"] } }), 2);
  assert.equal(await Lead.countDocuments(), 16);
});
test("malformed identifiers and unknown API routes return safe 4xx JSON", async () => {
  const malformed = await request(app).get("/api/leads/not-an-object-id").set("Authorization", `Bearer ${token}`).expect(400);
  assert.equal(malformed.body.message, "Invalid resource identifier");
  const missing = await request(app).get("/api/does-not-exist").expect(404);
  assert.equal(missing.body.success, false);
});
test("production CORS is disabled until CLIENT_URL is configured", async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousClientUrl = process.env.CLIENT_URL;
  try {
    process.env.NODE_ENV = "production";
    delete process.env.CLIENT_URL;
    const unconfigured = await request(createApp()).get("/api/health").set("Origin", "https://untrusted.example").expect(200);
    assert.equal(unconfigured.headers["access-control-allow-origin"], undefined);

    process.env.CLIENT_URL = "https://leadflow.example";
    const configured = await request(createApp()).get("/api/health").set("Origin", "https://leadflow.example").expect(200);
    assert.equal(configured.headers["access-control-allow-origin"], "https://leadflow.example");
  } finally {
    process.env.NODE_ENV = previousNodeEnv;
    if (previousClientUrl === undefined) delete process.env.CLIENT_URL;
    else process.env.CLIENT_URL = previousClientUrl;
  }
});
