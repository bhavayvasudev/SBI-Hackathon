import { extractTextFromImage } from '../services/ocrService.js';

export async function uploadAndProcessKYC(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No document image provided.' });
    }

    // req.body.type is populated by multer from the multipart text field
    const type = req.body?.type;
    if (!['pan', 'aadhaar'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid document type.' });
    }

    // OCR happens on the server — the raw image never needs to leave this process
    const extractedText = await extractTextFromImage(req.file.buffer, req.file.mimetype);

    const text = extractedText.toUpperCase();
    const rawText = extractedText;

    if (type === 'pan') {
      const panMatch = text.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
      if (!panMatch) {
        return res.status(400).json({
          success: false,
          error: 'Invalid PAN document. Please upload a valid PAN card.',
        });
      }
      const nameMatch = rawText.match(/(?:name[:\s]+)?([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})/);
      const dobMatch  = rawText.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
      return res.json({
        success: true,
        data: {
          documentType: 'PAN Card',
          panNumber: panMatch[0],
          name: nameMatch ? nameMatch[1].trim() : null,
          dob: dobMatch ? dobMatch[1] : null,
          verified: true,
          uploadDate: new Date().toISOString(),
          verificationStatus: 'verified',
        },
      });
    }

    if (type === 'aadhaar') {
      const aadhaarMatch = text.match(/\d{4}\s?\d{4}\s?\d{4}/);
      if (!aadhaarMatch) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Aadhaar document. Please upload a valid Aadhaar card.',
        });
      }
      const nameMatch   = rawText.match(/([A-Z][a-z]+\s[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/);
      const dobMatch    = rawText.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
      const genderMatch = rawText.match(/\b(MALE|FEMALE|male|female)\b/i);
      const rawAadhaar  = aadhaarMatch[0].replace(/\s/g, '');
      const masked      = rawAadhaar.replace(/(\d{4})(\d{4})(\d{4})/, 'XXXX-XXXX-$3');
      return res.json({
        success: true,
        data: {
          documentType: 'Aadhaar Card',
          aadhaarNumber: masked,
          name: nameMatch ? nameMatch[1].trim() : null,
          dob: dobMatch ? dobMatch[1] : null,
          gender: genderMatch ? genderMatch[1].toUpperCase() : null,
          verified: true,
          uploadDate: new Date().toISOString(),
          verificationStatus: 'verified',
        },
      });
    }

    return res.status(400).json({ success: false, error: 'Unknown document type.' });
  } catch (err) {
    next(err);
  }
}
