export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ApplicantCreationError extends Error {
  constructor() {
    super("Applicant creation failed.");
    this.name = "ApplicantCreationError";
  }
}

export class DuplicateApplicationError extends Error {
  constructor() {
    super("You have already applied for this job.");
    this.name = "DuplicateApplicationError";
  }
}

export class ResumeUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResumeUploadError";
  }
}

export class ExperienceJsonError extends Error {
  constructor() {
    super("Invalid experienceJson format.");
    this.name = "ExperienceJsonError";
  }
}
