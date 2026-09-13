import multer from "multer";

// diskStorage({}) writes to the OS temp dir — on Vercel that's /tmp, the only
// writable path, and it's what the Cloudinary/pdf-parse uploads read from.
const storage = multer.diskStorage({});

// Cap uploads so a large or malicious file can't fill the disk or burn
// processing time. Route handlers may still apply a stricter limit of their own
// (the resume reviewer rejects anything over 5 MB).
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'application/pdf',
]);

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return callback(null, true);
    }
    const error = new Error('Unsupported file type. Upload an image or a PDF.');
    error.status = 415;
    return callback(error);
  },
});
