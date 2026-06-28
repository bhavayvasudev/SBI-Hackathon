import { Router } from 'express';
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import { uploadAndProcessKYC } from '../controllers/kycController.js';
import { requireCustomerAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Memory storage — file bytes stay in RAM, never touch disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are accepted.'));
    }
  },
});

// Wrap multer so errors return JSON instead of Express's default HTML
function handleUpload(req, res, next) {
  upload.single('document')(req, res, err => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ success: false, error: 'File size must not exceed 10 MB.' });
    }
    return res.status(400).json({ success: false, error: 'Invalid file upload.' });
  });
}

// Validate actual file bytes after Multer processes the multipart upload.
// Multer's fileFilter uses the client-supplied Content-Type header which can be spoofed;
// magic bytes are read from the file buffer itself and cannot be forged.
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

async function validateMagicBytes(req, res, next) {
  if (!req.file) return next();
  const detected = await fileTypeFromBuffer(req.file.buffer);
  if (!detected || !ALLOWED_MIME.has(detected.mime)) {
    return res.status(400).json({ success: false, error: 'Invalid file upload.' });
  }
  req.file.mimetype = detected.mime; // overwrite header-derived MIME with verified value
  next();
}

// POST /api/kyc/upload — requires customer auth to prevent anonymous OCR abuse
router.post('/upload', requireCustomerAuth, handleUpload, validateMagicBytes, uploadAndProcessKYC);

export default router;
