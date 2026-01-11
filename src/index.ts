import express from "express";
import dotenv from "dotenv";
import adminRouter from "./modules/adminKeys/adminKey.router";
import { bootstrap } from "./utils/bootstrap";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const start = async () => {
    await bootstrap();

    const app = express();
    const port = process.env.PORT || 3000;

    app.use(express.json());

    // Health check
    app.get("/health", (req, res) => {
        res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
    });

    // Routes
    app.use("/api/admin", adminRouter);

    // Global Error Handler
    app.use(errorHandler);

    app.listen(port, () => {
        console.log(`🚀 Sentinel Backend running on port ${port}`);
    });
};

start().catch((err) => {
    console.error("Fatal error during startup:", err);
    process.exit(1);
});
