import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import ConnectDb from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await ConnectDb();

    app.listen(PORT, () => {
      console.log("Server running on port", PORT);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
