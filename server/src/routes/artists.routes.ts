import { Router } from "express";
import { listArtists, updateArtistHandler } from "../controllers/artists.controller.js";

const router = Router();

router.get("/", listArtists);
router.patch("/:id", updateArtistHandler);

export default router;
