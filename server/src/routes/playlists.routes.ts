import { Router } from "express";
import {
  listPlaylists,
  getPlaylistHandler,
  createPlaylistHandler,
  updatePlaylistHandler,
  deletePlaylistHandler,
  addSongsToPlaylistHandler,
  removeSongsFromPlaylistHandler,
} from "../controllers/playlists.controller.js";

const router = Router();

router.get("/", listPlaylists);
router.post("/", createPlaylistHandler);
router.get("/:id", getPlaylistHandler);
router.patch("/:id", updatePlaylistHandler);
router.delete("/:id", deletePlaylistHandler);
router.post("/:id/songs", addSongsToPlaylistHandler);
router.delete("/:id/songs", removeSongsFromPlaylistHandler);

export default router;
