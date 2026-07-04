import { Router } from "express";
import {
  listPlaylists,
  createPlaylistHandler,
  updatePlaylistHandler,
  addSongsToPlaylistHandler,
} from "../controllers/playlists.controller.js";

const router = Router();

router.get("/", listPlaylists);
router.post("/", createPlaylistHandler);
router.patch("/:id", updatePlaylistHandler);
router.post("/:id/songs", addSongsToPlaylistHandler);

export default router;
