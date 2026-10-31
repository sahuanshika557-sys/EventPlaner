/**
 * Central Zod Validation Schemas
 * Used across client forms and server endpoints to ensure strict data validation.
 */

import { z } from 'zod';

export const EventDomainSchema = z.enum(['wedding', 'birthday', 'community']);

export const BudgetCategorySchema = z.enum([
  'venue',
  'catering',
  'decor',
  'media',
  'contingency',
  'other',
]);

export const VendorCategorySchema = z.enum([
  'Venue',
  'Catering',
  'Decor & Florals',
  'Photography & Media',
  'Entertainment & Sound',
  'Bridal Wear & Styling',
  'Hair & Makeup',
  'Cake & Desserts',
  'Security & Logistics',
  'Permits & Civic',
  'Other',
]);

export const VendorStatusSchema = z.enum([
  'Contacted',
  'Quote Received',
  'Contract Signed',
  'Deposit Paid',
  'Fully Paid',
]);

/**
 * Budget line item schema
 */
export const BudgetLineItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'Item name is required').max(150, 'Name must be under 150 characters'),
  category: BudgetCategorySchema,
  estimatedCost: z.number().min(0, 'Estimated cost cannot be negative').max(100000000, 'Cost exceeds maximum limit'),
  actualCost: z.number().min(0, 'Actual cost cannot be negative').max(100000000, 'Cost exceeds maximum limit'),
  isPaid: z.boolean(),
  notes: z.string().max(500).optional(),
});

/**
 * Vendor item schema
 */
export const VendorItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'Vendor name is required').max(150, 'Name must be under 150 characters'),
  category: VendorCategorySchema,
  service: z.string().max(250).optional(),
  contactPerson: z.string().max(100).optional(),
  email: z.string().email('Invalid email address').or(z.literal('')).optional(),
  phone: z.string().max(30).optional(),
  status: VendorStatusSchema,
  contractAmount: z.number().min(0, 'Contract amount cannot be negative').max(100000000),
  depositPaid: z.number().min(0).max(100000000),
  balanceDue: z.number().min(0).max(100000000),
  balanceDueDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

/**
 * Timeline entry schema
 */
export const TimelineEntrySchema = z.object({
  id: z.string().min(1),
  time: z.string().min(1, 'Time is required'),
  durationMinutes: z.number().int().min(1).max(1440),
  title: z.string().trim().min(1, 'Title is required').max(150),
  owner: z.string().max(100),
  location: z.string().max(150),
  milestone: z.string().max(150),
  status: z.enum(['scheduled', 'in-progress', 'completed', 'delayed']),
});

/**
 * Event creation / onboarding schema
 */
export const CreateEventSchema = z.object({
  domain: EventDomainSchema,
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(100, 'Title must be under 100 characters'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  totalBudget: z.number().min(0, 'Budget cannot be negative').max(100000000, 'Budget cannot exceed 100,000,000'),
  currency: z.string().min(1).max(10),
  guestCount: z.number().int().min(1, 'Guest count must be at least 1').max(100000, 'Guest count cannot exceed 100,000'),
  location: z.string().max(200).optional(),
  theme: z.string().max(100).optional(),
});

/**
 * AI generation parameters schema
 */
export const AIGenerateParamsSchema = z.object({
  eventType: EventDomainSchema,
  theme: z.string().trim().min(1, 'Theme is required').max(200),
  guestCount: z.number().int().min(1).max(100000),
  totalBudget: z.number().min(0).max(100000000).optional(),
  culture: z.string().max(100).optional(),
  preferences: z.string().max(1000).optional(),
  budgetTier: z.string().max(100).optional(),
  venueEnvironment: z.string().max(100).optional(),
});

