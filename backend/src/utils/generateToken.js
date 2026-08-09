import jwt from "jsonwebtoken";

export const generateToken = (adminId) => {
  return jwt.sign({ id: adminId, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
};

export const generateDemoToken = () => jwt.sign(
  { role: "demo", mode: "readonly" },
  process.env.JWT_SECRET,
  { expiresIn: "2h" }
);
