import { Router } from "express";
import { resolveRedirect } from "../controllers/redirect.controller";

const router = Router();

router.route("/resolve/:shortCode").get(resolveRedirect);

export default router;
