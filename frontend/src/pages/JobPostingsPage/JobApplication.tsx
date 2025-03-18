import { useOutletContext, useParams, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Modal } from "@mui/material";
import CustomFormTextField from "../../components/Common/FormInputs/CustomFormTextField";
import CustomButton from "../../components/Common/Buttons/CustomButton";
import CircularProgressLoader from "../../components/Common/Loaders/CircularProgressLoader";
import { parseResume } from "../../services/resumeParser";
import { useCreateApplication } from "../../queries/application";

type ContextType = {
  setHeaderTitle: (title: string) => void;
  setShowSearchBar: (show: boolean) => void;
};

// Define the schema with Zod
const applicationSchema = z.object({
  first_name: z
    .string()
    .min(2, "First Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  last_name: z
    .string()
    .min(2, "Last Name must be at least 2 characters")
    .max(50, "Last Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(15, "Phone number must be less than 15 characters"),
  resume: z.string().min(1, "Resume is required"),
  personal_links: z.string().optional(),
  work_experience: z
    .array(
      z.object({
        job_title: z.string().min(1, "Job Title is required"),
        company: z.string().min(1, "Company is required"),
        from: z.string().min(1, "Start date is required"),
        to: z.string().optional().nullable(),
        role_description: z.string().optional(),
        skills: z.string().min(1, "Skills are required"),
      })
    )
    .optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return "";
  const cleaned = phoneNumber?.replace(/\D/g, "");
  if (cleaned?.length === 0) return "";
  if (cleaned?.length <= 3) return cleaned;
  if (cleaned?.length <= 6)
    return `${cleaned?.slice(0, 3)}-${cleaned?.slice(3)}`;
  return `${cleaned?.slice(0, 3)}-${cleaned?.slice(3, 6)}-${cleaned?.slice(
    6,
    10
  )}`;
};

export default function JobApplication() {
  const { jobPostingId } = useParams();
  const [searchParams] = useSearchParams();
  const jobTitle = searchParams.get("title") || "Unknown Job";
  const [job, setJob] = useState({ jobPostingId, title: jobTitle });

  const { setHeaderTitle, setShowSearchBar } = useOutletContext<ContextType>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showWorkExperience, setShowWorkExperience] = useState(false);

  const createApplication = useCreateApplication();

  type WorkExperienceEntry = {
    job_title: string;
    company: string;
    from: string;
    to?: string;
    role_description?: string;
    skills: string;
  };

  const [workExperience, setWorkExperience] = useState<WorkExperienceEntry[]>(
    []
  );

  const applicationForm = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = applicationForm;

  const phone = applicationForm.watch("phone");

  const addWorkExperience = () => {
    setWorkExperience([
      ...workExperience,
      {
        job_title: "",
        company: "",
        from: "",
        skills: "",
      },
    ]);
  };

  const removeWorkExperience = (index: number) => {
    setWorkExperience((prev) => prev.filter((_, i) => i !== index));
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        !file.type.match(
          "application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document|application/pdf"
        )
      ) {
        applicationForm.setError("resume", {
          type: "manual",
          message:
            "Please upload only PDF or Word documents (.pdf, .doc, .docx)",
        });
        return;
      }

      try {
        applicationForm.clearErrors("resume");
        setFileName(file.name);
        setShowWorkExperience(true);

        const base64String = await convertFileToBase64(file);
        setValue("resume", base64String);

        if (file.type.includes("word")) {
          const parsedData = await parseResume(file);

          const formattedExperiences = parsedData.experiences.map((exp) => ({
            job_title: exp.title,
            company: exp.company,
            from: exp.startDate,
            to: exp.endDate,
            role_description: exp.description,
            skills: exp.skills.join(", "),
          }));

          setWorkExperience(formattedExperiences);

          // Set work experience form values
          setValue("work_experience", formattedExperiences);

          // Update each work experience field individually
          formattedExperiences.forEach((exp, index) => {
            setValue(`work_experience.${index}.job_title`, exp.job_title);
            setValue(`work_experience.${index}.company`, exp.company);
            setValue(`work_experience.${index}.from`, exp.from);
            setValue(`work_experience.${index}.to`, exp.to || "");
            setValue(
              `work_experience.${index}.role_description`,
              exp.role_description || ""
            );
            setValue(`work_experience.${index}.skills`, exp.skills);
          });
        }
      } catch (error) {
        console.error("Error processing resume:", error);
        setErrorMessage(
          "Failed to process resume. Please try again or fill in the details manually."
        );
      }
    }
  };

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      setIsSubmitting(true);
      const applicationPayload = {
        ...data,
        jobPostingId: jobPostingId || "",
      };

      const result = await createApplication.mutateAsync(applicationPayload);
      setErrorMessage(null);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
      setIsModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setHeaderTitle("Apply Now");
    setShowSearchBar(false);
  }, [setHeaderTitle, setShowSearchBar]);

  useEffect(() => {
    if (phone) {
      const value = phone?.replace(/\D/g, "");
      const formattedValue = formatPhoneNumber(value);
      setValue("phone", formattedValue);
    }
  }, [phone, setValue]);

  return (
    <div className="flex flex-col items-center min-h-screen">
      {isSubmitting && <CircularProgressLoader />}

      <div className="flex flex-row items-center justify-between gap-16 mb-8 mt-4">
        <div></div>
        <h1 className="text-2xl font-bold text-[#146eb4]">{job?.title}</h1>
        <p className="text-lg">{`#${job?.jobPostingId}`}</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-lg space-y-4"
      >
        <CustomFormTextField
          label="First Name"
          name="first_name"
          placeholder="John"
          register={register}
          errors={errors}
          required
        />
        <CustomFormTextField
          label="Last Name"
          name="last_name"
          placeholder="Doe"
          register={register}
          errors={errors}
          required
        />
        <CustomFormTextField
          label="Email"
          name="email"
          placeholder="john@example.com"
          register={register}
          errors={errors}
          required
        />
        <CustomFormTextField
          label="Phone"
          name="phone"
          placeholder="234-123-2345"
          register={register}
          errors={errors}
          required
        />
        <CustomFormTextField
          label="Personal Links (LinkedIn, GitHub, etc.)"
          name="personal_links"
          placeholder="https://linkedin.com/in/your-profile"
          register={register}
          errors={errors}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Resume</label>
          <input
            type="file"
            accept=".doc,.docx,.pdf"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-[#FF9900] file:text-white
                hover:file:bg-[#FF9966]"
          />
          {fileName && (
            <div className="flex items-center justify-between border-2 border-dashed border-gray-300 p-4 rounded-lg mt-2 hover:border-[#FF9900] transition-colors">
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm text-gray-600 font-medium">
                  {fileName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFileName("");
                  setValue("resume", "");
                  setShowWorkExperience(false);
                  setWorkExperience([]);
                }}
                className="text-gray-500 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
          <input type="hidden" {...register("resume")} />
          {errors.resume && (
            <span className="text-red-500 text-sm">
              {errors.resume.message}
            </span>
          )}
        </div>

        {showWorkExperience && (
          <>
            <h3 className="text-lg font-semibold">Work Experience</h3>
            {workExperience.map((_, index) => (
              <div
                key={index}
                className="relative border p-4 pt-8 space-y-2 bg-gray-50 rounded-lg shadow-md"
              >
                <button
                  type="button"
                  onClick={() => removeWorkExperience(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>

                <CustomFormTextField
                  label="Title *"
                  name={`work_experience.${index}.job_title`}
                  placeholder="Software Engineer"
                  register={register}
                />
                <CustomFormTextField
                  label="Company *"
                  name={`work_experience.${index}.company`}
                  placeholder="AWS"
                  register={register}
                />
                <CustomFormTextField
                  label="Start Date *"
                  name={`work_experience.${index}.from`}
                  register={register}
                  placeholder="MM/YYYY"
                />
                <CustomFormTextField
                  label="End Date"
                  name={`work_experience.${index}.to`}
                  register={register}
                  placeholder="MM/YYYY (leave blank if role hasn't terminated)"
                />
                <CustomFormTextField
                  label="Skills *"
                  name={`work_experience.${index}.skills`}
                  placeholder="JavaScript, React, Node.js"
                  register={register}
                />
                <textarea
                  {...register(`work_experience.${index}.role_description`)}
                  placeholder="Describe your responsibilities and achievements *"
                  className="border border-gray-300 rounded-md p-2 w-full bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ease-in-out duration-150 resize-none"
                  rows={2}
                  onInput={(e) => {
                    e.currentTarget.style.height = "auto";
                    e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                  }}
                />
              </div>
            ))}
            <CustomButton onClick={addWorkExperience}>
              Add Work Experience
            </CustomButton>
          </>
        )}

        <div className="flex justify-end">
          <CustomButton
            onClick={handleSubmit(onSubmit)}
            variant="filled"
            disabled={isSubmitting}
          >
            {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
          </CustomButton>
        </div>
      </form>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="application-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#f9f9f9",
            borderRadius: 0,
            boxShadow: 24,
            p: 4,
            maxWidth: "42rem",
            minWidth: "30rem",
            width: "auto",
            m: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxHeight: "90vh",
          }}
        >
          {errorMessage ? (
            <div className="flex flex-col gap-2 items-center">
              <h2 className="text-xl text-red-600">Application Failed</h2>
              <p>{errorMessage}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 items-center">
              <h2 className="text-xl">Application Submitted for</h2>
              <h2 className="text-xl">{job?.title}</h2>
            </div>
          )}
          <div className="flex justify-end">
            <CustomButton
              variant="filled"
              className="min-w-[50px]"
              onClick={() => {
                setIsModalOpen(false);
              }}
            >
              OK
            </CustomButton>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
