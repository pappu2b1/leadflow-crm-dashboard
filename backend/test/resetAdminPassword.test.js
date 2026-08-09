import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { after, before, beforeEach, test } from "node:test";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Admin from "../src/models/Admin.js";
import { resetAdminPassword, validateResetEnvironment } from "../src/scripts/resetAdminPassword.js";

let mongo;
let originalPassword;
let newPassword;

before(async () => {
  originalPassword = "A1!" + randomBytes(12).toString("hex");
  newPassword = "B2!" + randomBytes(12).toString("hex");
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

beforeEach(async () => {
  await Admin.deleteMany({});
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test("reset environment rejects a missing MongoDB URI", () => {
  assert.throws(
    () => validateResetEnvironment({ ADMIN_RESET_EMAIL: "admin@example.test", ADMIN_RESET_PASSWORD: newPassword }),
    /MONGO_URI is required/
  );
});

test("reset environment rejects a missing admin email", () => {
  assert.throws(
    () => validateResetEnvironment({ MONGO_URI: "mongodb://example.test/db", ADMIN_RESET_PASSWORD: newPassword }),
    /ADMIN_RESET_EMAIL is required/
  );
});

test("reset environment rejects missing and weak passwords", () => {
  assert.throws(
    () => validateResetEnvironment({ MONGO_URI: "mongodb://example.test/db", ADMIN_RESET_EMAIL: "admin@example.test" }),
    /ADMIN_RESET_PASSWORD is required/
  );
  assert.throws(
    () => validateResetEnvironment({ MONGO_URI: "mongodb://example.test/db", ADMIN_RESET_EMAIL: "admin@example.test", ADMIN_RESET_PASSWORD: "short" }),
    /at least 12 characters/
  );
});

test("password reset rejects a nonexistent account without creating one", async () => {
  await assert.rejects(
    resetAdminPassword({ email: "missing@example.test", password: newPassword }),
    /Admin account not found/
  );
  assert.equal(await Admin.countDocuments(), 0);
});

test("password reset rejects a non-admin account", async () => {
  await Admin.collection.insertOne({
    name: "Synthetic Viewer",
    email: "viewer@example.test",
    password: randomBytes(24).toString("hex"),
    role: "viewer",
    companyName: "Synthetic Co",
    defaultAssignee: "Synthetic Team"
  });
  await assert.rejects(
    resetAdminPassword({ email: "viewer@example.test", password: newPassword }),
    /Account is not an admin/
  );
});

test("password reset hashes once and changes only the admin password", async () => {
  const admin = await Admin.create({
    name: "Synthetic Admin",
    email: "admin@example.test",
    password: originalPassword,
    role: "admin",
    companyName: "Synthetic Co",
    defaultAssignee: "Synthetic Team"
  });
  const before = admin.toObject();

  const maskedEmail = await resetAdminPassword({
    email: " ADMIN@EXAMPLE.TEST ",
    password: newPassword
  });

  const updated = await Admin.findById(admin._id);
  assert.equal(maskedEmail, "a***@example.test");
  assert.equal(await updated.matchPassword(newPassword), true);
  assert.equal(await updated.matchPassword(originalPassword), false);
  assert.notEqual(updated.password, newPassword);
  assert.equal(updated.name, before.name);
  assert.equal(updated.email, before.email);
  assert.equal(updated.role, before.role);
  assert.equal(updated.companyName, before.companyName);
  assert.equal(updated.defaultAssignee, before.defaultAssignee);
  assert.equal(updated.createdAt.getTime(), before.createdAt.getTime());
  assert.equal(updated.updatedAt.getTime(), before.updatedAt.getTime());
});