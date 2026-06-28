import { z } from 'zod';

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, error: 'Invalid request data.' });
    }
    req.body = result.data;
    next();
  };
}

// Trim and strip HTML tags; min/max validated before transform
const safeStr = (max, min = 0) =>
  z.string().trim().min(min).max(max).transform(s => s.replace(/<[^>]*>/g, '').trim());

export const loginSchema = z.object({
  customerId: safeStr(20, 1),
  mpin: z.string().length(6).regex(/^\d{6}$/, 'MPIN must be 6 digits'),
});

export const adminLoginSchema = z.object({
  username: safeStr(50, 1),
  password: z.string().min(1).max(128),
});

export const createAccountSchema = z.object({
  profile: z
    .object({ name: safeStr(100, 2) })
    .passthrough()
    .transform(p => ({
      ...p,
      name: p.name,
      ...(typeof p.city === 'string' ? { city: p.city.replace(/<[^>]*>/g, '').trim() } : {}),
      ...(typeof p.occupation === 'string' ? { occupation: p.occupation.replace(/<[^>]*>/g, '').trim() } : {}),
    })),
  sessionId: z.string().optional(),
  kycData: z
    .object({
      panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/).nullish(),
      panName: safeStr(100).nullish(),
      panDob: safeStr(20).nullish(),
      aadhaarNumber: safeStr(20).nullish(),
      aadhaarName: safeStr(100).nullish(),
      aadhaarDob: safeStr(20).nullish(),
      aadhaarGender: z.enum(['MALE', 'FEMALE']).nullish(),
    })
    .optional(),
  onboardingTime: z.number().min(0).optional().nullable(),
});

export const kycActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
});
