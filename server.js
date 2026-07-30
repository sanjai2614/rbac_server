import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import ConnectDb from "./config/db.js";

ConnectDb();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("server running", PORT));
