import { format } from "date-fns";
import { UniqueConstraintError } from "sequelize";

import Applicant from "@/database/models/applicant";
import Application from "@/database/models/application";
import Database from "@/database/database";
import { s3UploadBase64 } from "@/common/utils/awsTools";
import { ResumeUploadError, ApplicantCreationError, DuplicateApplicationError, ValidationError } from "@/common/utils/errors";

// Business logic (DB interactions)

export const submitApplication = async (data: any) => {
    const sequelize = Database.GetSequelize();

    try {
        return await sequelize.transaction(async (t) => {
            const applicant = await findOrCreateApplicant(data, t);
            const applicantId = applicant.get("id");

            const resumeFileName = `${data.jobPostingId}-${applicantId}`;
            try {
                await s3UploadBase64(resumeFileName, data.resume);
            } catch (err) {
                throw new ResumeUploadError("Failed to upload resume to S3.");
            }

            return await createApplication(data, applicantId, resumeFileName, t);
        });
    } catch (err: any) {
        // Catch database-level unique constraint violation
        if (err instanceof UniqueConstraintError) {
            throw new DuplicateApplicationError();
        }
        if (err instanceof ApplicantCreationError) {
            throw new ApplicantCreationError();
        }
        throw err;
    }
};

// Exported for unit testing
export const findOrCreateApplicant = async (data: any, t: any) => {
    let applicant = await Applicant.findOne({
        where: { email: data.email },
        transaction: t,
        lock: true // lock prevent race conditions
    });

    if (!applicant) {
        applicant = await Applicant.create({
            email: data.email,
            firstName: data.first_name,
            lastName: data.last_name,
            phone: data.phone,
            linkedIn: data.personal_links,
        }, { transaction: t }
        );
    } else {
        await applicant.update({
            firstName: data.first_name,
            lastName: data.last_name,
            phone: data.phone,
            linkedIn: data.personal_links,
        }, { transaction: t }
        );
    }
    if (!applicant || !applicant.dataValues.id) {
        console.log("applicant:", applicant);
        console.log("applicant.id:", applicant.dataValues.id);
        throw new ApplicantCreationError();
    }
    return applicant;
};

/**
 * Creates a new application entry in the database.
 *
 * ⚠️ IMPORTANT:
 * This function does NOT check for duplicate (applicantId + jobPostingId) manually.
 * It relies on a unique database constraint on (jobPostingId, applicantId).
 *
 * Any duplicates will trigger a SequelizeUniqueConstraintError,
 * which must be caught and converted to a DuplicateApplicationError
 * in the service layer (submitApplication).
 * 
 *  Exported for unit testing
 */
export const createApplication = async (data: any, applicantId: number, resumeFileName: string, t: any) => {
    const rawId = data.jobPostingId;

    // Ensure jobPostingId is a non-empty string and numeric
    if (typeof rawId !== "string" || !/^\d+$/.test(rawId.trim())) {
        throw new ValidationError("Invalid jobPostingId: must be a numeric string");
    }

    const jobPostingId = parseInt(rawId.trim(), 10);

    return await Application.create({
        jobPostingId,
        applicantId,
        resumePath: resumeFileName,
        experienceJson: {
            experiences:
                data.work_experience?.map((exp: any) => ({
                    title: exp.job_title,
                    company: exp.company,
                    startDate: exp.from,
                    endDate: exp.to || null || "Present",
                    skills: (() => { //handle both frontend input string[] or single string and filter out empty values
                        const raw = exp.skills;

                        const parsed = Array.isArray(raw)
                            ? raw
                            : typeof raw === "string"
                                ? raw.split(",")
                                : [];

                        const clean = parsed.map((s) => s.trim()).filter((s) => s.length > 0);

                        if (clean.length === 0) {
                            throw new ValidationError("Each experience must include at least one non-empty skill.");
                        }

                        return clean;
                    })(),
                    description: exp.role_description || "",
                })) || [],
        },
        educationJson: {
            education:
                data.education_experience?.map((edu: any) => ({
                    school: edu.school,
                    degree: edu.degree,
                    field_of_study: edu.field_of_study || "",
                    from: edu.from,
                    to: edu.to || null,
                })) || [],
        },
    }, { transaction: t });
};