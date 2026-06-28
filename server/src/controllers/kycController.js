export async function processKYC(req, res, next) {
  try {
    const { extractedText, documentType } = req.body;

    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({ success: false, error: 'No text could be extracted from the image. Please upload a clearer photo.' });
    }

    const text = extractedText.toUpperCase();
    const rawText = extractedText;

    if (documentType === 'pan') {
      const panMatch = text.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);

      if (!panMatch) {
        return res.status(400).json({
          success: false,
          error: 'Invalid PAN document. Please upload a valid PAN card.',
        });
      }

      const nameMatch = rawText.match(/(?:name[:\s]+)?([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})/);
      const dobMatch = rawText.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);

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

    if (documentType === 'aadhaar') {
      const aadhaarMatch = text.match(/\d{4}\s?\d{4}\s?\d{4}/);

      if (!aadhaarMatch) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Aadhaar document. Please upload a valid Aadhaar card.',
        });
      }

      const nameMatch = rawText.match(/([A-Z][a-z]+\s[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/);
      const dobMatch = rawText.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
      const genderMatch = rawText.match(/\b(MALE|FEMALE|male|female)\b/i);

      const rawAadhaar = aadhaarMatch[0].replace(/\s/g, '');
      const maskedAadhaar = rawAadhaar.replace(/(\d{4})(\d{4})(\d{4})/, 'XXXX-XXXX-$3');

      return res.json({
        success: true,
        data: {
          documentType: 'Aadhaar Card',
          aadhaarNumber: maskedAadhaar,
          aadhaarRaw: rawAadhaar,
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
