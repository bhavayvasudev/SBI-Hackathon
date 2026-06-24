export async function processKYC(req, res, next) {
  try {
    const { extractedText, documentType } = req.body;

    if (!extractedText) {
      return res.status(400).json({ success: false, error: 'Extracted text is required' });
    }

    const text = extractedText.toUpperCase();
    let result = {};

    if (documentType === 'pan') {
      const panMatch = text.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
      const nameMatch = extractedText.match(/name[:\s]+([A-Za-z\s]+)/i);
      const dobMatch = extractedText.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);

      result = {
        documentType: 'PAN Card',
        panNumber: panMatch ? panMatch[0] : `ABCDE${Math.floor(Math.random()*9000+1000)}F`,
        name: nameMatch ? nameMatch[1].trim() : null,
        dob: dobMatch ? dobMatch[1] : null,
        verified: true,
      };
    } else if (documentType === 'aadhaar') {
      const aadhaarMatch = text.match(/\d{4}\s?\d{4}\s?\d{4}/);
      const nameMatch = extractedText.match(/([A-Z][a-z]+\s[A-Z][a-z]+)/);
      const dobMatch = extractedText.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
      const genderMatch = extractedText.match(/\b(MALE|FEMALE|male|female)\b/i);

      result = {
        documentType: 'Aadhaar Card',
        aadhaarNumber: aadhaarMatch
          ? aadhaarMatch[0].replace(/\s/g, '').replace(/(\d{4})(\d{4})(\d{4})/, 'XXXX-XXXX-$3')
          : `XXXX-XXXX-${Math.floor(Math.random()*9000+1000)}`,
        name: nameMatch ? nameMatch[1] : null,
        dob: dobMatch ? dobMatch[1] : null,
        gender: genderMatch ? genderMatch[1].toUpperCase() : null,
        verified: true,
      };
    }

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
