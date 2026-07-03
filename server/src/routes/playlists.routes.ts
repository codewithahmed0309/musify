import { Router } from "express";
import { listPlaylists } from "../controllers/playlists.controller.js";

const router = Router();

router.get("/", listPlaylists);

export default router;
