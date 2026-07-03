import { Router } from "express";
import { listAlbums, updateAlbumHandler } from "../controllers/albums.controller.js";

const router = Router();

router.get("/", listAlbums);
router.patch("/:id", updateAlbumHandler);

export default router;
