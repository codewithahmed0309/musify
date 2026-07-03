import multer from "multer";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB — covers audio files comfortably

// IMPORTANT: we deliberately do NOT use multer's `fileFilter` to reject files.
// Rejecting a file with fileFilter() while the browser is still streaming its
// bytes up causes multer (1.4.x) to stop draining the incoming request
// stream. The client keeps writing to a socket nobody is reading from, and
// the OS/browser eventually kills the connection — which shows up as
// ERR_CONNECTION_RESET / ERR_CONNECTION_ABORTED on the frontend, and can be
// disruptive enough to affect other connections on the same dev server.
//
// Instead we accept every file into memory (bounded by `limits.fileSize`,
// which multer enforces safely mid-stream) and validate mimetype/extension
// afterwards in the controller, once the full file object is just a plain
// buffer with no stream left to mismanage.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});
