import { expect } from "chai";
import { applicationSchema, parseDate } from "../applicationValidation";
import { ValidationError } from "@/common/utils/errors";

describe("parseDate validation", () => {
    it("should parse valid MM/YYYY format", () => {
        const date = parseDate("12/2020");
        expect(date).to.be.an.instanceOf(Date);
    });

    it("should parse single-digit month format like 3/2020", () => {
        const date = parseDate("3/2020");
        expect(date).to.be.an.instanceOf(Date);
    });

    it("should parse single-digit month format with whitespece:  3/2020", () => {
        const date = parseDate(" 3/2020");
        expect(date).to.be.an.instanceOf(Date);
    });

    it("should parse single-digit month format with whitespece:3/2020  ", () => {
        const date = parseDate("3/2020   ");
        expect(date).to.be.an.instanceOf(Date);
    });

    it("should return null for invalid date strings", () => {
        expect(parseDate("2020/12")).to.be.null;
        expect(parseDate("2020-12")).to.be.null;
        expect(parseDate("12-2020")).to.be.null;
        expect(parseDate("13/2020")).to.be.null;
        expect(parseDate("00/2020")).to.be.null;
        expect(parseDate("03/20")).to.be.null;
        expect(parseDate("132020")).to.be.null;
        expect(parseDate("///////")).to.be.null;
        expect(parseDate("abc")).to.be.null;
    });

    it("should parse MM/YYYY with leading/trailing spaces", () => {
        const result = parseDate(" 03/2021 ");
        expect(result).to.be.an.instanceOf(Date);
    });

});

const validInput = {
    first_name: "Alice",
    last_name: "Bob",
    email: "alice@example.com",
    phone: "1234567890",
    resume: "resume",
    jobPostingId: "123",
};

describe("Entire applicationSchema validation", () => {
    it("should fail when the entire schema is empty (missing all required fields)", () => {
        const result = applicationSchema.safeParse({});
        expect(result.success).to.be.false;
        expect(result.error?.issues.length).to.be.greaterThan(0);
        const paths = result.error?.issues.map((issue) => issue.path[0]);
        expect(paths).to.include.members([
            "first_name",
            "last_name",
            "email",
            "phone",
            "resume",
            "jobPostingId"
        ]);
    });

    it("should ignore unknown fields not defined in the schema", () => {
        const result = applicationSchema.safeParse({
            ...validInput,
            unknownField: "surprise"
        });
        expect(result.success).to.be.true;
    });

});

describe("applicationSchema first_name/last_name validation", () => {

    it("should fail when first_name is too short", () => {
        const result = applicationSchema.safeParse({ ...validInput, first_name: "A" });
        expect(result.success).to.be.false;
    });

    it("should pass when first_name is exactly 2 chars", () => {
        const result = applicationSchema.safeParse({ ...validInput, first_name: "Al" });
        expect(result.success).to.be.true;
    });

    it("should pass when first_name is exactly 50 chars", () => {
        const result = applicationSchema.safeParse({ ...validInput, first_name: "A".repeat(50) });
        expect(result.success).to.be.true;
    });

    it("should fail when first_name is too long", () => {
        const result = applicationSchema.safeParse({ ...validInput, first_name: "A".repeat(51) });
        expect(result.success).to.be.false;
    });

    it("should fail when first_name is empty string", () => {
        const result = applicationSchema.safeParse({ ...validInput, first_name: "" });
        expect(result.success).to.be.false;
    });

    it("should fail when first_name is not a string:number", () => {
        const result = applicationSchema.safeParse({ ...validInput, first_name: 123 });
        expect(result.success).to.be.false;
    });

    it("should fail when first_name not a string:null", () => {
        const result = applicationSchema.safeParse({ ...validInput, first_name: null });
        expect(result.success).to.be.false;
    });

    it("should fail when missing first_name field", () => {
        const { first_name, ...missingFirstName } = validInput;
        const result = applicationSchema.safeParse(missingFirstName);
        expect(result.success).to.be.false;
    });

});

describe("applicationSchema email validation", () => {
    const testInput = {
        first_name: "Alice",
        last_name: "Bob",
        phone: "1234567890",
        resume: "resume",
        jobPostingId: "123"
    };

    it("should pass with valid email", () => {
        const result = applicationSchema.safeParse({ ...testInput, email: "alice@example.com" });
        expect(result.success).to.be.true;
    });

    it("should fail with missing email", () => {
        const result = applicationSchema.safeParse(testInput);
        expect(result.success).to.be.false;
        expect(result.error?.issues[0].path).to.include("email");
    });

    it("should fail with empty string", () => {
        const result = applicationSchema.safeParse({ ...testInput, email: "" });
        expect(result.success).to.be.false;
    });

    it("should fail with invalid no @ format", () => {
        const result = applicationSchema.safeParse({ ...testInput, email: "aliceexample.com" });
        expect(result.success).to.be.false;
    });

    it("should fail with invalid no domain format", () => {
        const result = applicationSchema.safeParse({ ...testInput, email: "alice@" });
        expect(result.success).to.be.false;
    });

    it("should fail with invalid no username format", () => {
        const result = applicationSchema.safeParse({ ...testInput, email: "@example.com" });
        expect(result.success).to.be.false;
    });

    it("should fail with non-string type:number", () => {
        const result = applicationSchema.safeParse({ ...testInput, email: 123 as any });
        expect(result.success).to.be.false;
    });

    it("should fail with null", () => {
        const result = applicationSchema.safeParse({ ...testInput, email: null as any });
        expect(result.success).to.be.false;
    });

});

describe("applicationSchema phone validation", () => {
    const testInput = {
        first_name: "Alice",
        last_name: "Bob",
        email: "alice@example.com",
        resume: "resume",
        jobPostingId: "123"
    };

    it("should pass with 10-digit phone", () => {
        const result = applicationSchema.safeParse({ ...testInput, phone: "1234567890" });
        expect(result.success).to.be.true;
    });

    it("should pass with 15-digit phone", () => {
        const result = applicationSchema.safeParse({ ...testInput, phone: "123456789012345" });
        expect(result.success).to.be.true;
    });

    it("should fail with 9-digit phone", () => {
        const result = applicationSchema.safeParse({ ...testInput, phone: "123456789" });
        expect(result.success).to.be.false;
    });

    it("should fail with 16-digit phone", () => {
        const result = applicationSchema.safeParse({ ...testInput, phone: "1234567890123456" });
        expect(result.success).to.be.false;
    });

    it("should fail with empty string", () => {
        const result = applicationSchema.safeParse({ ...testInput, phone: "" });
        expect(result.success).to.be.false;
    });

    it("should fail with number instead of string", () => {
        const result = applicationSchema.safeParse({ ...testInput, phone: 1234567890 as any });
        expect(result.success).to.be.false;
    });

    it("should fail with null", () => {
        const result = applicationSchema.safeParse({ ...testInput, phone: null as any });
        expect(result.success).to.be.false;
    });

    it("should fail when phone is missing", () => {
        const { phone, ...missingPhone } = { ...testInput, phone: "1234567890" };
        const result = applicationSchema.safeParse(missingPhone);
        expect(result.success).to.be.false;
        expect(result.error?.issues[0].path).to.include("phone");
    });

});

describe("applicationSchema personal_links validation", () => {
    const testInput = {
        first_name: "Alice",
        last_name: "Bob",
        email: "alice@example.com",
        phone: "1234567890",
        resume: "resume",
        jobPostingId: "123"
    };

    it("should pass when missing personal_links", () => {
        const result = applicationSchema.safeParse(testInput);
        expect(result.success).to.be.true;
    });

    it("should pass with a valid personal_links string", () => {
        const result = applicationSchema.safeParse({
            ...testInput,
            personal_links: "https://linkedin.com/in/alice"
        });
        expect(result.success).to.be.true;
    });

    it("should pass with an empty string", () => {
        const result = applicationSchema.safeParse({ ...testInput, personal_links: "" });
        expect(result.success).to.be.true;
    });

    it("should fail if personal_links is a number", () => {
        const result = applicationSchema.safeParse({
            ...testInput,
            personal_links: 12345 as any
        });
        expect(result.success).to.be.false;
        expect(result.error?.issues[0].path).to.include("personal_links");
        expect(result.error?.issues[0].message.toLowerCase()).to.include("string");
    });

    it("should fail if personal_links is null", () => {
        const result = applicationSchema.safeParse({ ...testInput, personal_links: null as any });
        expect(result.success).to.be.false;
        expect(result.error?.issues[0].path).to.include("personal_links");
        expect(result.error?.issues[0].message.toLowerCase()).to.include("string");
    });

    it("should fail if personal_links is an object", () => {
        const result = applicationSchema.safeParse({
            ...testInput,
            personal_links: { url: "https://linkedin.com" } as any
        });
        expect(result.success).to.be.false;
        expect(result.error?.issues[0].path).to.include("personal_links");
    });

});

describe("applicationSchema resume validation", () => {
    const testInput = {
        first_name: "Alice",
        last_name: "Bob",
        email: "alice@example.com",
        phone: "1234567890",
        jobPostingId: "123",
        personal_links: "https://linkedin.com/in/alice"
    };

    it("should pass with valid resume string", () => {
        const result = applicationSchema.safeParse({ ...testInput, resume: "resume" });
        expect(result.success).to.be.true;
    });

    it("should fail with empty resume string", () => {
        const result = applicationSchema.safeParse({ ...testInput, resume: "" });
        expect(result.success).to.be.false;
        expect(result.error?.issues[0].path).to.include("resume");
        expect(result.error?.issues[0].message.toLowerCase()).to.include("at least 1 character");
        console.log(result.error?.issues[0].message);
    });

    it("should fail if resume is missing", () => {
        const result = applicationSchema.safeParse(testInput);
        expect(result.success).to.be.false;
        expect(result.error?.issues[0].path).to.include("resume");
        expect(result.error?.issues[0].message.toLowerCase()).to.include("required");
        console.log(result.error?.issues[0].message);
    });

    it("should fail if resume is null", () => {
        const result = applicationSchema.safeParse({ ...testInput, resume: null as any });
        expect(result.success).to.be.false;
        expect(result.error?.issues[0].path).to.include("resume");
    });

    it("should fail if resume is a number", () => {
        const result = applicationSchema.safeParse({ ...testInput, resume: 123 as any });
        expect(result.success).to.be.false;
        expect(result.error?.issues[0].path).to.include("resume");
    });
});

describe("applicationSchema jobPostingId validation (string & number convertible)", () => {
    const testInput = {
        first_name: "Alice",
        last_name: "Bob",
        email: "alice@example.com",
        phone: "1234567890",
        resume: "resume",
        personal_links: "https://linkedin.com/in/alice"
    };

    it("should pass with numeric string", () => {
        const result = applicationSchema.safeParse({ ...testInput, jobPostingId: "123" });
        expect(result.success).to.be.true;
    });

    it("should pass with numeric string with leading zeros", () => {
        const result = applicationSchema.safeParse({ ...testInput, jobPostingId: "0005" });
        expect(result.success).to.be.true;
    });

    it("should fail with empty string", () => {
        const result = applicationSchema.safeParse({ ...testInput, jobPostingId: "" });
        expect(result.success).to.be.false;
        expect(result.error?.issues[0].message).to.equal("Job posting ID is required");
        expect(result.error?.issues[0].path).to.include("jobPostingId");
    });

    it("should fail with non-numeric string", () => {
        const result = applicationSchema.safeParse({ ...testInput, jobPostingId: "abc" });
        expect(result.success).to.be.false;
        expect(result.error?.issues[0].message).to.equal("Job posting Id must be a numeric string");
        expect(result.error?.issues[0].path).to.include("jobPostingId");
    });

    it("should fail with alphanumeric string", () => {
        const result = applicationSchema.safeParse({ ...testInput, jobPostingId: "123abc" });
        expect(result.success).to.be.false;
        expect(result.error?.issues[0].message).to.equal("Job posting Id must be a numeric string");
    });

    it("should fail with whitespace string", () => {
        const result = applicationSchema.safeParse({ ...testInput, jobPostingId: "   " });
        expect(result.success).to.be.false;
        expect(result.error?.issues[0].message).to.equal("Job posting Id must be a numeric string");
    });

    it("should fail if jobPostingId is null", () => {
        const result = applicationSchema.safeParse({ ...testInput, jobPostingId: null as any });
        expect(result.success).to.be.false;
        expect(result.error?.issues[0].path).to.include("jobPostingId");
    });

    it("should fail if jobPostingId is a number (wrong type)", () => {
        const result = applicationSchema.safeParse({ ...testInput, jobPostingId: 123 as any });
        expect(result.success).to.be.false;
        expect(result.error?.issues[0].path).to.include("jobPostingId");
    });

});

describe("applicationSchema work_experience validation", () => {
    const validWorkExperience = [
        {
            job_title: "Engineer",
            company: "Company A",
            from: "03/2024",
            to: "03/2025",   // current month
            skills: ["React", "Node"]
        }
    ];

    it("should pass with valid work_experience", () => {
        const result = applicationSchema.safeParse({
            ...validInput, work_experience: validWorkExperience
        });
        expect(result.success).to.be.true;
    });

    it("should pass if work_experience is omitted (optional)", () => {
        const result = applicationSchema.safeParse(validInput);
        expect(result.success).to.be.true;
    });

    // missing fields
    it("should fail if job_title is empty", () => {
        const result = applicationSchema.safeParse({
            ...validInput,
            work_experience: [{ ...validWorkExperience[0], job_title: "" }]
        });
        expect(result.success).to.be.false;
        expect(result.error?.issues[0].message).to.equal("Job title is required");
    });

    it("should fail if company is empty", () => {
        const result = applicationSchema.safeParse({
            ...validInput, work_experience: [{ ...validWorkExperience[0], company: "" }]
        });
        expect(result.success).to.be.false;
        expect(result.error?.issues[0].message).to.equal("Company is required");
    });

    // from-to validation
    it("should fail if from is not in MM/YYYY format", () => {
        const result = applicationSchema.safeParse({
            ...validInput, work_experience: [{ ...validWorkExperience[0], from: "2020-03" }]
        });
        expect(result.success).to.be.false;
        expect(result.error?.issues[0].message).to.include("MM/YYYY");
    });

    it("should fail if from is valid format but invalid month:13/2024", () => {
        const result = applicationSchema.safeParse({
            ...validInput, work_experience: [{ ...validWorkExperience[0], from: "13/2024" }]
        });
        expect(result.success).to.be.false;
    });

    it("should fail if from is in the future", () => {
        const nextYear = new Date().getFullYear() + 1;
        const result = applicationSchema.safeParse({
            ...validInput, work_experience: [{ ...validWorkExperience[0], from: `01/${nextYear}` }]
        });
        expect(result.success).to.be.false;
        expect(result.error?.issues.some(issue => issue.message.includes("in the past"))).to.be.true;
    });

    it("should fail if to is valid format but invalid date:00/2025", () => {
        const result = applicationSchema.safeParse({
            ...validInput, work_experience: [{ ...validWorkExperience[0], to: "00/2025" }]
        });
        expect(result.success).to.be.false;
    });

    it("should fail if to is invalid format", () => {
        const result = applicationSchema.safeParse({
            ...validInput, work_experience: [{ ...validWorkExperience[0], to: "March 2024" }]
        });
        expect(result.success).to.be.false;
        expect(result.error?.issues.some(issue => issue.message.includes("MM/YYYY"))).to.be.true;
    });

    it("should pass if to is 'Present'", () => {
        const result = applicationSchema.safeParse({
            ...validInput, work_experience: [{ ...validWorkExperience[0], to: "Present" }]
        });
        expect(result.success).to.be.true;
    });

    it('should accept " Present" with leading space and normalize to "Present"', () => {
        const result = applicationSchema.safeParse({
            ...validInput,
            work_experience: [
                {
                    job_title: "Dev",
                    company: "Company A",
                    from: "01/2023",
                    to: " Present",
                    skills: ["React"]
                }
            ]
        });

        expect(result.success).to.be.true;
    });


    it("should pass if to is number", () => {
        const result = applicationSchema.safeParse({
            ...validInput, work_experience: [{ ...validWorkExperience[0], to: 202503 as any }]
        });
        expect(result.success).to.be.false;
        expect(result.error?.issues[0].path).to.include.members(["work_experience", 0, "to"]);
        expect(result.error?.issues[0].message.toLowerCase()).to.include("invalid input");
    });

    it("should fail if 'to' is an object", () => {
        const result = applicationSchema.safeParse({
            ...validInput, work_experience: [{ ...validWorkExperience[0], to: {} as any }]
        });
        expect(result.success).to.be.false;
        expect(result.error?.issues[0].path).to.include.members(["work_experience", 0, "to"]);
        expect(result.error?.issues[0].message.toLowerCase()).to.include("invalid input");
    });

    it("should pass if to is null", () => {
        const result = applicationSchema.safeParse({
            ...validInput, work_experience: [{ ...validWorkExperience[0], to: null }]
        });
        expect(result.success).to.be.true;
    });

    it("should pass if 'to' date is the current month", () => {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = now.getFullYear();
        const currentMonth = `${month}/${year}`;

        const result = applicationSchema.safeParse({
            ...validInput,
            work_experience: [{
                job_title: "Engineer",
                company: "Company A",
                from: "01/2022",
                to: currentMonth,
                skills: ["React"]
            }]
        });

        expect(result.success).to.be.true;
    });

    it("should fail if 'to' date is in the future", () => {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const month = String(nextMonth.getMonth() + 1).padStart(2, "0");
        const year = nextMonth.getFullYear();
        const futureDate = `${month}/${year}`;

        const result = applicationSchema.safeParse({
            ...validInput,
            work_experience: [{
                job_title: "Engineer",
                company: "Company A",
                from: "01/2022",
                to: futureDate,
                skills: ["React"]
            }]
        });

        expect(result.success).to.be.false;
        expect(result.error?.issues.some(issue =>
            issue.message.includes("can’t be a future date")
        )).to.be.true;
    });


    it("should fail if to is before from", () => {
        const result = applicationSchema.safeParse({
            ...validInput, work_experience: [{ ...validWorkExperience[0], from: "03/2024", to: "02/2024" }]
        });
        expect(result.success).to.be.false;
    });

    it("should fail if 'to' date equals 'from' date", () => {
        const result = applicationSchema.safeParse({
            ...validInput,
            work_experience: [
                {
                    job_title: "Engineer",
                    company: "Company A",
                    from: "03/2024",
                    to: "03/2024", // Same month
                    skills: ["Java"]
                }
            ]
        });
        expect(result.success).to.be.false;
        expect(result.error?.issues.some(issue =>
            issue.message.includes("should come after")
        )).to.be.true;
    });



    // skills validation
    it("should pass with one valid skill", () => {
        const result = applicationSchema.safeParse({
            ...validInput, work_experience: [{ ...validWorkExperience[0], skills: ["React"] }]
        });
        expect(result.success).to.be.true;
    });

    it("should pass with multiple valid skills", () => {
        const result = applicationSchema.safeParse({
            ...validInput, work_experience: [{ ...validWorkExperience[0], skills: ["React", "Node.js", "GraphQL"] }]
        });
        expect(result.success).to.be.true;
    });

    it("should throw ValidationError if skills is an empty string", () => {
        try {
            applicationSchema.parse({
                ...validInput,
                work_experience: [
                    {
                        ...validWorkExperience[0],
                        skills: "",
                    },
                ],
            });
            throw new Error("Expected ValidationError was not thrown");
        } catch (err) {
            expect(err).to.be.instanceOf(ValidationError);
        }
    });

    it("should throw ValidationError if skills is empty array", () => {
        try {
            applicationSchema.parse({
                ...validInput,
                work_experience: [
                    {
                        ...validWorkExperience[0],
                        skills: [], // triggers .transform(), results in cleaned = [], throws ValidationError
                    },
                ],
            });
            throw new Error("Expected ValidationError was not thrown");
        } catch (err) {
            expect(err).to.be.instanceOf(ValidationError);
        }
    });

    it("should pass if skills includes at least one non-empty skill", () => {
        const result = applicationSchema.safeParse({
            ...validInput,
            work_experience: [{
                ...validWorkExperience[0],
                skills: ["", "React", "   "]
            }]
        });

        expect(result.success).to.be.true;
    });


    it("should throw ValidationError if skill string only contains commas or spaces", () => {
        try {
            applicationSchema.parse({
                ...validInput,
                work_experience: [{
                    job_title: "Engineer",
                    company: "Company A",
                    from: "01/2023",
                    to: "01/2024",
                    skills: ", , ,",
                }]
            });
            throw new Error("Expected ValidationError was not thrown");
        } catch (err) {
            expect(err).to.be.instanceOf(ValidationError);
        }
    });

    it("should throw ValidationError with array of only empty strings", () => {
        try {
            applicationSchema.parse({
                ...validInput,
                work_experience: [{
                    job_title: "Engineer",
                    company: "Company A",
                    from: "01/2023",
                    to: "01/2024",
                    skills: ["", "  "]
                }]
            });
            throw new Error("Expected ValidationError was not thrown");
        } catch (err) {
            expect(err).to.be.instanceOf(ValidationError);
        }
    });

    it("should pass with a single skill as string", () => {
        const result = applicationSchema.safeParse({
            ...validInput, work_experience: [{ ...validWorkExperience[0], skills: "React" }]
        });
        expect(result.success).to.be.true;
    });

    it("should fail if skills is null", () => {
        const result = applicationSchema.safeParse({
            ...validInput, work_experience: [{ ...validWorkExperience[0], skills: null as any }]
        });
        expect(result.success).to.be.false;
    });

    it("should pass with comma-separated string of skills", () => {
        const result = applicationSchema.safeParse({
            ...validInput,
            work_experience: [{
                job_title: "Engineer",
                company: "Company A",
                from: "01/2023",
                to: "01/2024",
                skills: "React, Node.js, GraphQL"
            }]
        });
        expect(result.success).to.be.true;
    });

});


describe("applicationSchema multiple work_experience entries & edge cases validation", () => {
    it("should pass with multiple valid work experience entries", () => {
        const result = applicationSchema.safeParse({
            ...validInput,
            work_experience: [
                {
                    job_title: "Engineer",
                    company: "Company A",
                    from: "03/2023",
                    to: "03/2024",
                    skills: ["React"]
                },
                {
                    job_title: "Manager",
                    company: "Company B",
                    from: "04/2022",
                    to: "03/2023",
                    skills: ["Leadership"]
                }
            ]
        });
        expect(result.success).to.be.true;
    });

    it("should fail if any one entry is invalid (e.g., empty job title)", () => {
        const result = applicationSchema.safeParse({
            ...validInput,
            work_experience: [
                {
                    job_title: "Engineer",
                    company: "Company A",
                    from: "03/2023",
                    to: "03/2024",
                    skills: ["React"]
                },
                {
                    job_title: "", // empty
                    company: "Company B",
                    from: "04/2022",
                    to: "03/2023",
                    skills: ["Leadership"]
                }
            ]
        });
        expect(result.success).to.be.false;
        expect(result.error?.issues[0].path).to.deep.equal(["work_experience", 1, "job_title"]);
    });

    it("should pass with mixed entries: one with 'Present', one with null", () => {
        const result = applicationSchema.safeParse({
            ...validInput,
            work_experience: [
                {
                    job_title: "Dev",
                    company: "Company A",
                    from: "03/2023",
                    to: "Present",
                    skills: ["Python"]
                },
                {
                    job_title: "Intern",
                    company: "Company B",
                    from: "01/2022",
                    to: null,
                    skills: ["Go"]
                }
            ]
        });
        expect(result.success).to.be.true;
    });


});

