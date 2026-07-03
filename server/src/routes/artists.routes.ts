import { Router } from "express";
import { listArtists } from "../controllers/artists.controller.js";

const router = Router();

router.get("/", listArtists);

export default router;
