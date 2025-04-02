// server.ts
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import sinon from "sinon";
import { expect } from "chai";
import { app } from "@/server";

import * as applicationService from "@/api/application/applicationService";
import * as awsTools from "@/common/utils/awsTools";
import { ApplicantCreationError, DuplicateApplicationError, ResumeUploadError } from "@/common/utils/errors";


const validApplicationData = {
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    phone: "1234567890",
    personal_links: "https://linkedin.com/in/johndoe",
    resume: "base64string==",
    jobPostingId: "123",
    work_experience: [
        {
            job_title: "Engineer",
            company: "TechCorp",
            from: "01/2020",
            to: "01/2023",
            role_description: "Built cool stuff",
            skills: ["JavaScript", "TypeScript"]
        }
    ]
};

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


describe("POST /api/applications(isolated API)", () => {

    afterEach(() => sinon.restore());

    it("should return 201 when submitApplication succeeds", async () => {
        sinon.stub(applicationService, "submitApplication").resolves();

        const res = await request(app)
            .post("/applications")
            .send(validApplicationData);

        console.log("Status:", res.status);
        console.log("Body:", res.body);

        expect(res.status).to.equal(StatusCodes.CREATED);
        expect(res.body.message).to.equal("Application submitted successfully");
    });

    it("should return 422 for Zod validation error:invalid email", async () => {
        const invalidData = { ...validApplicationData, email: "not-an-email" };

        const res = await request(app)
            .post("/applications")
            .send(invalidData);

        expect(res.statusCode).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
        console.log("res.body.message", res.body.message);
        expect(res.body.message).to.include("Validation Error");
    });

    it("should return 422 for Zod validation:missing last name", async () => {
        const invalidData = { ...validApplicationData };
        delete (invalidData as any).last_name;

        const res = await request(app)
            .post("/applications")
            .send(invalidData);

        expect(res.statusCode).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
        console.log("res.body.message:", res.body.message);
        expect(res.body.message).to.include("Validation Error");
    });


    it("should return 422 for custom ValidationError:from date is after to", async () => {
        const invalidData = {
            ...validApplicationData,
            work_experience: [
                {
                    ...validApplicationData.work_experience[0],
                    from: "01/2025",
                    to: "01/2023",
                },
            ],
        };
        const res = await request(app)
            .post("/applications")
            .send(invalidData);

        expect(res.statusCode).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
        console.log("res.body.message", res.body.message);
        expect(res.body.message).to.include("Validation Error");
    });

    it("should return 422 for custom ValidationError: non-numeric jobPostingId", async () => {
        const invalidData = {
            ...validApplicationData,
            jobPostingId: "abc123", // invalid non-numeric string
        };
    
        const res = await request(app)
            .post("/applications")
            .send(invalidData);
    
        expect(res.statusCode).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
        console.log("res.body.message:", res.body.message);
        expect(res.body.message).to.include("Validation Error");
        expect(res.body.message).to.include("Job posting Id must be a numeric string");
    });
    

    it("should return 409 for DuplicateApplicationError", async () => {
        const stub = sinon.stub(applicationService, "submitApplication");
        stub.onFirstCall().resolves();
        stub.onSecondCall().throws(new DuplicateApplicationError()); 
    
        const res = await request(app)
            .post("/applications")
            .send(validApplicationData);
    
        const res1 = await request(app)
            .post("/applications")
            .send(validApplicationData);
    
        expect(res.statusCode).to.equal(StatusCodes.CREATED);
        expect(res1.statusCode).to.equal(StatusCodes.CONFLICT);
        expect(res1.body.message).to.include("You have already applied for this job.");
    });

    it("should return 500 for ResumeUploadError", async () => {
        const fakeApplicant = createFakeSequelizeModel({ id: 42 });

        sinon.stub(applicationService, "findOrCreateApplicant").resolves(fakeApplicant);
        sinon.stub(awsTools, "s3UploadBase64").throws(new ResumeUploadError("Upload failed"));

        const res = await request(app)
            .post("/applications")
            .send(validApplicationData);

        expect(res.statusCode).to.equal(StatusCodes.INTERNAL_SERVER_ERROR);
        console.log("res.body.message:", res.body.message);
        expect(res.body.message).to.include("Failed to upload resume");

    });

    it("should return 500 for ApplicantCreationError", async () => {
        sinon.stub(applicationService, "findOrCreateApplicant").throws(new ApplicantCreationError());

        const res = await request(app)
            .post("/applications")
            .send(validApplicationData);

        expect(res.statusCode).to.equal(StatusCodes.INTERNAL_SERVER_ERROR);
        console.log("res.body.message:", res.body.message);
        expect(res.body.message).to.include("Applicant creation failed.");
    });

});
