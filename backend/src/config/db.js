import mongoose from "mongoose";

export const connectDB = async ({ logConnection = true } = {}) => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined");
  }

  const connection = await mongoose.connect(mongoUri);
  if (logConnection) console.log(`MongoDB connected: ${connection.connection.host}`);
};
