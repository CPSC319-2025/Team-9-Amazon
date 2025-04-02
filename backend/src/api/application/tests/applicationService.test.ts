import { expect } from "chai";
import sinon from "sinon";
import { UniqueConstraintError } from "sequelize";
import { findOrCreateApplicant, createApplication, submitApplication } from "../applicationService";
import Applicant from "@/database/models/applicant";
import Application from "@/database/models/application";
import Database from "@/database/database";
import * as awsTools from "@/common/utils/awsTools";
import { ApplicantCreationError, ValidationError, DuplicateApplicationError, ResumeUploadError } from "@/common/utils/errors";


// Helper to mock a Sequelize-like model instance
function createFakeSequelizeModel<T extends object>(data: Partial<T>) {
    return {
        ...data,
        get: (key?: keyof T) => (key ? data[key] : data),
        set: () => { },
        save: async () => { },
        update: sinon.stub().resolves(),
        destroy: async () => { },
        reload: async () => { },
        dataValues: { ...data },
    } as any;
}

describe("findOrCreateApplicant tests", () => {
    let sandbox: sinon.SinonSandbox;
    const fakeTransaction = {};

    const testInput = {
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
        phone: "1234567890",
        personal_links: "https://linkedin.com/in/testuser",
    };

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should create a new applicant if not found", async () => {
        const fakeApplicant = createFakeSequelizeModel({
            id: 1,
            email: testInput.email,
        }) as unknown as Applicant;

        sandbox.stub(Applicant, "findOne").resolves(null);
        sandbox.stub(Applicant, "create").resolves(fakeApplicant);

        const result = await findOrCreateApplicant(testInput, fakeTransaction);
        console.log("result:", result);

        expect(result.dataValues.id).to.equal(1);
        expect(result.dataValues.email).to.equal("test@example.com");
    });

    it("should update existing applicant if found", async () => {
        const fakeApplicant = createFakeSequelizeModel({
            id: 2,
            email: testInput.email,
            firstName: "OldFirstName",
            lastName: "OldLastName",
            phone: "0000000000",
            linkedIn: "https://old-linkedin.com"
        }) as unknown as Applicant;

        const updateStub = sandbox.stub().callsFake(function (updatedFields) {
            Object.assign(fakeApplicant, updatedFields);
            fakeApplicant.dataValues = { ...fakeApplicant.dataValues, ...updatedFields };
            return Promise.resolve();
        });
        fakeApplicant.update = updateStub;

        sandbox.stub(Applicant, "findOne").resolves(fakeApplicant);

        const result = await findOrCreateApplicant(testInput, fakeTransaction);

        expect(result).to.equal(fakeApplicant);
        expect(result.dataValues.firstName).to.equal("Test");
        expect(updateStub.calledOnce).to.be.true;
        expect(updateStub.calledWithExactly({
            firstName: testInput.first_name,
            lastName: testInput.last_name,
            phone: testInput.phone,
            linkedIn: testInput.personal_links,
        }, { transaction: fakeTransaction })).to.be.true;
    });

    it("should throw ApplicantCreationError if no applicant or no id", async () => {
        const fakeApplicant = createFakeSequelizeModel({
            email: testInput.email,
        }) as unknown as Applicant;

        // Simulate missing id from .get and .dataValues
        fakeApplicant.get = ((key?: keyof typeof fakeApplicant) => {
            if (key === "id") return null;
            return undefined;
        }) as any;

        (fakeApplicant as any).dataValues = {};

        sandbox.stub(Applicant, "findOne").resolves(null);
        sandbox.stub(Applicant, "create").resolves(fakeApplicant);

        try {
            await findOrCreateApplicant(testInput, fakeTransaction);
            throw new Error("Did not throw");
        } catch (err) {
            expect(err).to.be.instanceOf(ApplicantCreationError);
        }
    });
});

describe("createApplication tests", () => {
    const fakeTransaction = {};
    let sandbox: sinon.SinonSandbox;

    const testInput = {
        jobPostingId: "123",
        work_experience: [
            {
                job_title: "Software Engineer",
                company: "Tech Corp",
                from: "01/2020",
                to: "01/2023",
                skills: ["JavaScript", "TypeScript"],
                role_description: "Worked on frontend."
            },
        ]
    };

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    const invalidCases = [
        { desc: "null", input: null },
        { desc: "undefined", input: undefined },
        { desc: "empty string", input: "" },
        { desc: "non-numeric string", input: "123abc" },
        { desc: "decimal number string", input: "123.45" },
        { desc: "negative number string", input: "-123" },
    ];

    invalidCases.forEach(({ desc, input }) => {
        it(`throws ValidationError for jobPostingId: ${desc}`, async () => {
            try {
                await createApplication({ ...testInput, jobPostingId: input }, 42, "resume", fakeTransaction);
                throw new Error("Did not throw");
            } catch (err) {
                if (err instanceof Error) {
                    expect(err).to.be.instanceOf(ValidationError);
                    expect(err.message).to.include("Invalid jobPostingId");
                } else {
                    throw new Error("Caught non-Error exception");
                }
            }
        });
    });

    const validCases = [
        { desc: "whitespace-wrapped", input: " 123 ", expected: 123 },
        { desc: "zero", input: "0", expected: 0 },
        { desc: "leading zeroes", input: "000123", expected: 123 },
    ];

    validCases.forEach(({ desc, input, expected }) => {
        it(`creates application parsing ${desc} jobPostingId string`, async () => {
            const fakeApplication = createFakeSequelizeModel({
                jobPostingId: expected,
            });

            const stub = sandbox.stub(Application, "create").resolves(fakeApplication);
            await createApplication({ ...testInput, jobPostingId: input }, 42, "resume", fakeTransaction);

            expect(stub.calledOnce).to.be.true;
            const args = stub.firstCall.args[0];
            expect(args?.jobPostingId).to.equal(expected);
        });
    });

    it("creates application with single full fields work experience", async () => {
        const fakeApplication = createFakeSequelizeModel({
            experienceJson: { experience: testInput.work_experience },
        });
        const stub = sandbox.stub(Application, "create").resolves(fakeApplication);

        await createApplication(testInput, 42, "resume", fakeTransaction);

        expect(stub.calledOnce).to.be.true;
        const args = stub.firstCall.args[0];
        expect(args?.experienceJson.experiences).to.have.lengthOf(1);
        expect(args?.experienceJson.experiences[0]).to.deep.equal({
            title: "Software Engineer",
            company: "Tech Corp",
            startDate: "01/2020",
            endDate: "01/2023",
            skills: ["JavaScript", "TypeScript"],
            description: "Worked on frontend."
        });

    });

    it("create application with empty work experience array", async () => {
        const fakeApp = createFakeSequelizeModel({ experienceJson: { experiences: [] } });
        const stub = sandbox.stub(Application, "create").resolves(fakeApp);

        const input = { ...testInput, work_experience: [] };
        const result = await createApplication(input, 42, "resume", fakeTransaction);

        expect(stub.calledOnce).to.be.true;
        expect(result).to.equal(fakeApp);
        expect(result.experienceJson.experiences).to.be.an("array").that.is.empty;
    });

    it("creates application with null end date", async () => {
        const input = {
            ...testInput,
            work_experience: [{ ...testInput.work_experience[0], to: null }],
        };

        const fakeApp = createFakeSequelizeModel({
            experienceJson: {
                experiences: [{ ...input.work_experience[0], endDate: null }],
            },
        });

        sandbox.stub(Application, "create").resolves(fakeApp);
        const result = await createApplication(input, 42, "resume", fakeTransaction);
        expect(result.experienceJson.experiences[0].endDate).to.equal(null);
    });

    it("creates application when end date is missing/undefined", async () => {
        const input = {
            ...testInput,
            work_experience: [{
                job_title: "Software Engineer",
                company: "Tech Corp",
                from: "01/2020",
                skills: ["JavaScript", "TypeScript"],
                role_description: "Worked on frontend."
            }],
        };

        const fakeApp = createFakeSequelizeModel({
            experienceJson: {
                experiences: [{
                    title: "Software Engineer",
                    company: "Tech Corp",
                    startDate: "01/2020",
                    endDate: "Present",
                    skills: ["JavaScript", "TypeScript"],
                    description: "Worked on frontend."
                }],
            },
        });

        sandbox.stub(Application, "create").resolves(fakeApp);
        const result = await createApplication(input, 42, "resume", fakeTransaction);
        expect(result.experienceJson.experiences[0].endDate).to.equal("Present");
    });

    it("creates application when end date is null", async () => {
        const input = {
            jobPostingId: "123",
            work_experience: [
                {
                    job_title: "Software Engineer",
                    company: "Tech Corp",
                    from: "01/2020",
                    to: null,
                    skills: "JavaScript",
                    role_description: "Built things",
                },
            ],
        };

        const stub = sandbox.stub(Application, "create").resolves({} as any);
        await createApplication(input, 1, "resume", fakeTransaction);
        const args = stub.firstCall.args[0];
        expect(args?.experienceJson.experiences[0].endDate).to.equal("Present");
    });

    it("creates application with skills as array of strings", async () => {
        const input = {
            ...testInput,
            work_experience: [
                {
                    ...testInput.work_experience[0],
                    skills: ["JavaScript", "TypeScript"],
                },
            ],
        };

        const fakeApp = createFakeSequelizeModel({ experienceJson: { experiences: input.work_experience } });
        const stub = sandbox.stub(Application, "create").resolves(fakeApp);
        const result = await createApplication(input, 42, "resume", fakeTransaction);
        expect(stub.calledOnce).to.be.true;
        expect(result.experienceJson.experiences[0].skills).to.deep.equal(["JavaScript", "TypeScript"]);
    });

    it("creates application with trimed skills in work experience", async () => {
        const input = {
            ...testInput,
            work_experience: [
                {
                    ...testInput.work_experience[0],
                    skills: ["  JavaScript  ", " TypeScript "],
                },
            ],
        };

        const fakeApp = createFakeSequelizeModel({
            experienceJson: {
                experiences: [
                    {
                        ...input.work_experience[0],
                        skills: ["JavaScript", "TypeScript"],
                    },
                ]
            }
        });
        const stub = sandbox.stub(Application, "create").resolves(fakeApp);
        const result = await createApplication(input, 42, "resume", fakeTransaction);
        expect(stub.calledOnce).to.be.true;
        expect(result.experienceJson.experiences[0].skills).to.deep.equal(["JavaScript", "TypeScript"]);
    });

    it("creates application splitting comma-separated skills string", async () => {
        const input = {
            ...testInput,
            work_experience: [
                {
                    ...testInput.work_experience[0],
                    skills: "TypeScript, JavaScript, Node.js"
                },
            ],
        };

        const fakeApp = createFakeSequelizeModel({
            experienceJson: {
                experiences: [
                    {
                        ...input.work_experience[0],
                        skills: ["TypeScript", "JavaScript", "Node.js"],
                    },
                ],
            },
        });

        sandbox.stub(Application, "create").resolves(fakeApp);

        const result = await createApplication(input, 42, "resume", fakeTransaction);
        expect(result.experienceJson.experiences[0].skills).to.deep.equal(["TypeScript", "JavaScript", "Node.js"]);
    });

    it("create application throws error when skills is empty array", async () => {
        const input = {
            ...testInput,
            work_experience: [{ ...testInput.work_experience[0], skills: [] }],
        };

        try {
            await createApplication(input, 42, "resume", fakeTransaction);
            throw new Error("Should have thrown ValidationError");
        } catch (err) {
            expect(err).to.be.instanceOf(ValidationError);
        }
    });

    it("create application throws error when skills is array of empty strings", async () => {
        const input = {
            ...testInput,
            work_experience: [{ ...testInput.work_experience[0], skills: ["", " "] }],
        };

        try {
            await createApplication(input, 42, "resume", fakeTransaction);
            throw new Error("Should have thrown ValidationError");
        } catch (err) {
            expect(err).to.be.instanceOf(ValidationError);
        }
    });

    it("create application throws error when skills is an empty string", async () => {
        const input = {
            ...testInput,
            work_experience: [{ ...testInput.work_experience[0], skills: "" }],
        };

        try {
            await createApplication(input, 42, "resume", fakeTransaction);
            throw new Error("Should have thrown ValidationError");
        } catch (err) {
            expect(err).to.be.instanceOf(ValidationError);
        }
    });

    it("create application throws error when skills is undefined", async () => {
        const input = {
            ...testInput,
            work_experience: [{ ...testInput.work_experience[0], skills: undefined }],
        };

        try {
            await createApplication(input, 42, "resume", fakeTransaction);
            throw new Error("Should have thrown ValidationError");
        } catch (err) {
            expect(err).to.be.instanceOf(ValidationError);
        }
    });

    it("creates application with default empty string role_description", async () => {
        const input = {
            jobPostingId: "456",
            work_experience: [
                {
                    job_title: "Dev",
                    company: "ACME",
                    from: "01/2020",
                    to: "12/2022",
                    skills: "Node",
                },
            ],
        };

        const stub = sandbox.stub(Application, "create").resolves({} as any);
        await createApplication(input, 42, "resume", fakeTransaction);
        const args = stub.firstCall.args[0];
        expect(args?.experienceJson.experiences[0].description).to.equal("");
    });

    it("creates application with long skill list", async () => {
        const input = {
            ...testInput,
            work_experience: [
                {
                    ...testInput.work_experience[0],
                    skills: new Array(50).fill("Skill"),
                },
            ],
        };

        const fakeApp = createFakeSequelizeModel({
            experienceJson: { experiences: input.work_experience },
        });

        sandbox.stub(Application, "create").resolves(fakeApp);
        const result = await createApplication(input, 42, "resume", fakeTransaction);
        expect(result.experienceJson.experiences[0].skills.length).to.equal(50);
    });

    it("create application fails throwing error ", async () => {
        sandbox.stub(Application, "create").throws(new Error("DB error"));

        try {
            await createApplication(testInput, 42, "resume", fakeTransaction);
            throw new Error("Did not throw");
        } catch (error: any) {
            expect(error.message).to.equal("DB error");
        }
    });

    it("handles multiple experiences", async () => {
        const input = {
            jobPostingId: "123",
            work_experience: [
                {
                    job_title: "Dev1",
                    company: "A",
                    from: "01/2019",
                    to: "01/2020",
                    skills: "A,B",
                    role_description: "A",
                },
                {
                    job_title: "Dev2",
                    company: "B",
                    from: "02/2020",
                    to: "Present",
                    skills: "X,Y",
                    role_description: "B",
                },
            ],
        };

        const stub = sandbox.stub(Application, "create").resolves({} as any);
        await createApplication(input, 1, "resume", fakeTransaction);
        const args = stub.firstCall.args[0];
        expect(args?.experienceJson.experiences).to.have.length(2);
        expect(args?.experienceJson.experiences[1].endDate).to.equal("Present");
    });
});

describe("submitApplication tests", () => {
    let sandbox: sinon.SinonSandbox;
    const fakeTransaction = {};
    const testInput = {
        jobPostingId: "123",
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
        phone: "1234567890",
        personal_links: "https://linkedin.com/test",
        resume: "base64-resume",
        work_experience: []
    };

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        // Mock sequelize transaction
        sandbox.stub(Database, "GetSequelize").returns({
            transaction: (callback: (t: any) => any) => {
                return callback(fakeTransaction);
            },
        } as unknown as ReturnType<typeof Database["GetSequelize"]>);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("submits application successfully", async () => {
        const fakeApplicant = createFakeSequelizeModel({ id: 42 });
        const fakeResult = createFakeSequelizeModel({ message: "application created" });

        sandbox.stub(Applicant, "findOne").resolves(null);
        sandbox.stub(Applicant, "create").resolves(fakeApplicant);
        sandbox.stub(awsTools, "s3UploadBase64").resolves();
        sandbox.stub(Application, "create").resolves(fakeResult);

        const result = await submitApplication(testInput);
        expect(result).to.equal(fakeResult);
    });

    it("throws ResumeUploadError on resume upload failure", async () => {
        const fakeApplicant = createFakeSequelizeModel({ id: 42 });

        sandbox.stub(Applicant, "findOne").resolves(null);
        sandbox.stub(Applicant, "create").resolves(fakeApplicant);
        sandbox.stub(awsTools, "s3UploadBase64").rejects(new Error("S3 failed"));

        try {
            await submitApplication(testInput);
            throw new Error("Did not throw");
        } catch (err) {
            expect(err).to.be.instanceOf(ResumeUploadError);
        }
    });

    it("throws DuplicateApplicationError on unique constraint violation", async () => {
        const fakeApplicant = createFakeSequelizeModel({ id: 42 });

        sandbox.stub(Applicant, "findOne").resolves(null);
        sandbox.stub(Applicant, "create").resolves(fakeApplicant);
        sandbox.stub(awsTools, "s3UploadBase64").resolves();
        sandbox.stub(Application, "create").rejects(new UniqueConstraintError({}));

        try {
            await submitApplication(testInput);
            throw new Error("Did not throw");
        } catch (err) {
            expect(err).to.be.instanceOf(DuplicateApplicationError);
        }
    });

});
