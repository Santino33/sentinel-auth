import express from "express";
import dotenv from "dotenv";
import adminContextRouter from "./routes/admin.routes";
import projectContextRouter from "./routes/project.routes";
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

    // Context-based Routing
    app.use("/api/admin", adminContextRouter);
    //app.use("/api", projectContextRouter);

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
