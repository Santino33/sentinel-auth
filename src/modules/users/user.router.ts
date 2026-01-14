import { Router } from "express";

const router = Router();

// TODO: Implement user routes
router.get("/", (req, res) => {
    res.status(200).json({ message: "User router placeholder" });
});

export default router;
