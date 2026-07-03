import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import authRoutes from "./auth.routes.js";
import songsRoutes from "./songs.routes.js";
import artistsRoutes from "./artists.routes.js";
import albumsRoutes from "./albums.routes.js";
import playlistsRoutes from "./playlists.routes.js";
import searchRoutes from "./search.routes.js";
import uploadRoutes from "./upload.routes.js";

const router = Router();

// Public
router.use("/auth", authRoutes);

// Everything below requires a valid JWT
router.use("/songs", requireAuth, songsRoutes);
router.use("/artists", requireAuth, artistsRoutes);
router.use("/albums", requireAuth, albumsRoutes);
router.use("/playlists", requireAuth, playlistsRoutes);
router.use("/search", requireAuth, searchRoutes);
router.use("/upload", requireAuth, uploadRoutes);

export default router;
