import { z } from "zod";
import { format, parse, isBefore, isAfter, isValid } from "date-fns";


// Helper: convert MM/YYYY string into date object & validate real date
export const parseDate = (dateStr: string) => {
    const formatRegex = /^\d{1,2}\/\d{4}$/;
    if (!formatRegex.test(dateStr)) return null;

    const [monthStr, yearStr] = dateStr.split("/");

    const month = monthStr.padStart(2, "0"); // e.g., "3" => "03"
    const normalized = `${month}/${yearStr}`;
    const parsedDate = parse(normalized, "MM/yyyy", new Date() );
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

                from: z.string()
                    .regex(/^\d{2}\/\d{4}$/, "Start date must be in MM/YYYY format"),

                to: z.string()
                    .regex(/^\d{2}\/\d{4}$/, "End date must be in MM/YYYY format")
                    .or(z.literal("Present"))
                    .or(z.string().nullable()),

                role_description: z.string().optional(),
                skills: z.array(z.string().min(1)).min(1, "At least one skill is required"),
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
                        message: "Start date must be valid date in MM/YYYY format",
                        path: [`work_experience.${index}.from`],
                    });
                    return;
                }
                // check start date in the past
                if (!isBefore(parsedFrom, new Date())) {
                    ctx.addIssue({
                        code: "custom",
                        message: "Start date must be in the past or current month",
                        path: [`work_experience.${index}.from`],
                    });
                }
                // check not-null to(date) is valid date and after start
                if (exp.to !== "Present" && exp.to !== null) {
                    const parsedTo = parseDate(exp.to);
                    if (!parsedTo) {
                        ctx.addIssue({
                            code: "custom",
                            message: "End date must be valid date in MM/YYYY format",
                            path: [`work_experience.${index}.to`],
                        });
                        return;
                    }
                    if (!isAfter(parsedTo, parsedFrom)) {
                        ctx.addIssue({
                            code: "custom",
                            message: "End date must be after start date",
                            path: [`work_experience.${index}.to`],
                        });
                    }
                }
            });
        }),
});

