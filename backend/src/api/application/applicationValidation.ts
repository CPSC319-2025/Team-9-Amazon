import { z } from "zod";
import { format, parse, isBefore, isAfter, isValid } from "date-fns";
import { ValidationError } from "@/common/utils/errors";


// Helper: convert MM/YYYY string into date object & validate real date
export const parseDate = (dateStr: string) => {
    const trimmed = dateStr.trim();
    const formatRegex = /^\d{1,2}\/\d{4}$/;
    if (!formatRegex.test(trimmed)) return null;

    const [monthStr, yearStr] = trimmed.split("/");
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);
  
    if (month < 1 || month > 12) return null;
  
    const normalized = `${month.toString().padStart(2, "0")}/${yearStr}`;
    const parsedDate = parse(normalized, "MM/yyyy", new Date());
    return isValid(parsedDate) ? parsedDate : null;
};

// Request body validation schema
export const applicationSchema = z.object({
    first_name: z.string().min(2).max(50),
    last_name: z.string().min(2).max(50),
    email: z.string().email(),
    phone: z.string().min(10).max(15),
    personal_links: z.string().optional(),
    resume: z.string().min(1),
    jobPostingId: z.string().min(1, "Job posting ID is required")
        .refine((val) => /^\d+$/.test(val.trim()), {
            message: "Job posting Id must be a numeric string"
        }),
    work_experience: z
        .array(
            z.object({
                job_title: z.string().min(1, "Job title is required"),
                company: z.string().min(1, "Company is required"),
                location: z.string().optional(),

                from: z.string(),
                to: z.string()
                    .trim()
                    .transform((val) =>
                        val.toLowerCase() === "present" ? "Present" : val
                    )
                    .or(z.literal(null)),

                role_description: z.string().optional(),
                skills: z.union([
                    z.string(),
                    z.array(z.string())
                ])
                    .transform((val) => {
                        const arr = Array.isArray(val) ? val : val.split(",");
                        const cleaned = arr.map((s) => s.trim()).filter((s) => s.length > 0);
                        if (cleaned.length === 0) {
                            throw new ValidationError("At least one non-empty skill is required");
                        }
                        return cleaned;
                    }),
            })
        )
        .optional()
        .superRefine((workExp, ctx) => {
            workExp?.forEach((exp, index) => {
                // check start date is valid
                const parsedFrom = parseDate(exp.from);
                if (!parsedFrom) {
                    ctx.addIssue({
                        code: "custom",
                        message: `"${exp.from}" is not valid. Use a real month and year in MM/YYYY format.`,
                        path: [`work_experience.${index}.from`],
                    });
                    return;
                }
                // check start date in the past
                if (!isBefore(parsedFrom, new Date())) {
                    ctx.addIssue({
                        code: "custom",
                        message: `"${exp.from}" cannot be a future date. Please enter a start date in the past or current month.`,
                        path: [`work_experience.${index}.from`],
                    });
                }
                // check not-null to(date) is valid date and after start
                if (exp.to !== null &&
                    typeof exp.to === "string" &&
                    exp.to.toLowerCase() !== "present") {
                    const parsedTo = parseDate(exp.to);
                    if (!parsedTo) {
                        ctx.addIssue({
                            code: "custom",
                            message: `"${exp.to}" is not a valid end date. Please enter a date in MM/YYYY format or leave the field blank if the job is ongoing...`,
                            path: [`work_experience.${index}.to`],
                        });
                        return;
                    }
                    if (!isAfter(parsedTo, parsedFrom)) {
                        ctx.addIssue({
                            code: "custom",
                            message: `End date "${exp.to}" should come after the start date "${exp.from}"`,
                            path: [`work_experience.${index}.to`],
                        });
                    }
                    if (!isBefore(parsedTo, new Date())) {
                        ctx.addIssue({
                            code: "custom",
                            message: `"${exp.to}" can’t be a future date. Use a past or current date, or leave it blank for ongoing positions.`,
                            path: [`work_experience.${index}.to`],
                        });
                    }
                }
            });
        }),
});

