import { Router } from "express";

const router = Router();

// TODO: Implement auth routes
router.get("/", (req, res) => {
    res.status(200).json({ message: "Auth router placeholder" });
});

export default router;
