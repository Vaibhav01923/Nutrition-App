import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { syncUser, getCurrent } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/sync", protectRoute, syncUser);
router.get("/me", protectRoute, getCurrent);

export default router;
