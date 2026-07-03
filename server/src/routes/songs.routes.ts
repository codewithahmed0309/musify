import { Router } from "express";
import {
  listSongs,
  addSong,
  updateSongHandler,
  deleteSongHandler,
} from "../controllers/songs.controller.js";

const router = Router();

router.get("/", listSongs);
router.post("/", addSong);
router.patch("/:id", updateSongHandler);
router.delete("/:id", deleteSongHandler);

export default router;
