import dotenv from "dotenv";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";

dotenv.config();
const app = createApp();
const port = process.env.PORT || 5000;

connectDB()
  .then(() => app.listen(port, () => console.log(`LeadFlow CRM API running on port ${port}`)))
  .catch((error) => {
    console.error("Failed to start server", error.message);
    process.exit(1);
  });
