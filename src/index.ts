import express from "express";
import dotenv from "dotenv";
import adminRouter from "./modules/adminKeys/adminKey.router";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/admin", adminRouter);

app.listen(port, () => {
  console.log(`🚀 Sentinel Backend running on port ${port}`);
});
