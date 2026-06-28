import { Router } from 'express';
import multer from 'multer';
import { uploadAndProcessKYC } from '../controllers/kycController.js';

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

// POST /api/kyc/upload — receives raw image, runs server-side OCR, returns parsed document data
router.post('/upload', handleUpload, uploadAndProcessKYC);

export default router;
