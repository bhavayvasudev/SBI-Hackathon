import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function extractTextFromImage(buffer, mimeType) {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error('Unsupported image format. Use JPEG, PNG, or WebP.');
  }

  const response = await genai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType,
              data: buffer.toString('base64'),
            },
          },
          {
            text: 'Extract all visible text from this identity document image exactly as it appears. Return only the raw extracted text, preserving line breaks. Do not add any explanation, formatting, or additional content.',
          },
        ],
      },
    ],
  });

  const text = response.text ?? '';
  if (!text.trim()) {
    throw new Error('No text could be extracted from the image. Please upload a clearer photo.');
  }
  return text;
}
