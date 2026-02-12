import dotenv from "dotenv";
import { bootstrap } from "./utils/bootstrap";
import app from "./app";

dotenv.config();

const start = async () => {
    await bootstrap();

    const port = process.env.PORT || 3000;

    app.listen(port, () => {
        console.log(`🚀 Sentinel Backend running on port ${port}`);
    });
};

start().catch((err) => {
    console.error("Fatal error during startup:", err);
    process.exit(1);
});
