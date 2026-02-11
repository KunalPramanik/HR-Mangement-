import { z } from 'zod';

export const leaveSchema = z.object({
    leaveType: z.enum(['annual', 'sick', 'personal', 'unpaid', 'maternity', 'paternity']),
    startDate: z.string().or(z.date()).transform(val => new Date(val)),
    endDate: z.string().or(z.date()).transform(val => new Date(val)),
    reason: z.string().min(5, "Reason must be at least 5 characters"),
    totalDays: z.number().optional(), // Can be calculated on backend if missing
    attachments: z.array(z.string()).optional()
}).refine(data => data.endDate >= data.startDate, {
    message: "End date must be after or equal to start date",
    path: ["endDate"]
});

export const userUpdateSchema = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    skills: z.array(z.string()).optional(),
    // Add other fields that are safe to update
});
