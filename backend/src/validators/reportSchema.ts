import { z } from 'zod';

const toNumber = (value: unknown) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const numberInRange = (min: number, max: number) =>
  z.preprocess(toNumber, z.number().min(min).max(max).optional());

const positiveDecimal = z.preprocess(toNumber, z.number().min(0).optional());

const dateString = z
  .string()
  .min(4)
  .refine((val) => !Number.isNaN(Date.parse(val)), { message: 'Invalid date format' });

export const createReportSchema = z.object({
  ownerName: z.string().min(2).max(100).optional(),
  ownerPhone: z.string().min(6).max(30).optional(),
  ownerEmail: z.string().email().optional().or(z.literal('')).transform((val) => val || undefined),
  ownerLineId: z.string().max(100).optional(),

  petName: z.string().max(100).optional(),
  species: z.string().min(2).max(50),
  breed: z.string().max(100).optional(),
  color: z.string().max(100).optional(),
  sex: z.enum(['male', 'female', 'unknown']).optional().default('unknown'),
  ageYears: positiveDecimal,
  microchipId: z.string().max(100).optional(),
  specialMark: z.string().max(255).optional(),

  reportType: z.enum(['lost', 'found', 'sighted']).default('lost'),
  status: z.enum(['lost', 'found', 'closed']).optional().default('lost'),
  dateLost: dateString,
  province: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  lastSeenAddress: z.string().max(255).optional(),
  lastSeenLat: numberInRange(-90, 90),
  lastSeenLng: numberInRange(-180, 180),
  rewardAmount: positiveDecimal,
  description: z.string().max(5000).optional(),
}).refine(
  (data) => {
    if (data.reportType === 'lost') {
      return Boolean(data.petName && data.petName.trim().length > 0);
    }
    return true;
  },
  { message: 'petName is required for lost reports', path: ['petName'] },
);

export const updateStatusSchema = z.object({
  status: z.enum(['lost', 'found', 'closed']),
});

export const updateReportSchema = z.object({
  petName: z.string().max(100).optional(),
  species: z.string().min(2).max(50).optional(),
  breed: z.string().max(100).optional(),
  color: z.string().max(100).optional(),
  sex: z.enum(['male', 'female', 'unknown']).optional(),
  ageYears: positiveDecimal,
  microchipId: z.string().max(100).optional(),
  specialMark: z.string().max(255).optional(),

  reportType: z.enum(['lost', 'found', 'sighted']).optional(),
  status: z.enum(['lost', 'found', 'closed']).optional(),
  dateLost: dateString.optional(),
  province: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  lastSeenAddress: z.string().max(255).optional(),
  lastSeenLat: numberInRange(-90, 90),
  lastSeenLng: numberInRange(-180, 180),
  rewardAmount: positiveDecimal,
  description: z.string().max(5000).optional(),
});
