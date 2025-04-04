import {
  useOutletContext,
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Modal } from "@mui/material";
import CustomFormTextField from "../../components/Common/FormInputs/CustomFormTextField";
import CustomButton from "../../components/Common/Buttons/CustomButton";
import CircularProgressLoader from "../../components/Common/Loaders/CircularProgressLoader";
import { parseResume } from "../../services/resumeParser";
import { useCreateApplication } from "../../queries/application";
import { useGetSkills } from "../../queries/skill";
import ApplicationErrorModal from "./applicationErrorModal";
import { parsePhoneNumberFromString, AsYouType } from "libphonenumber-js";

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
  .refine((val) => {
    const phoneNumber = parsePhoneNumberFromString(val);
    return phoneNumber?.isValid() ?? false;
  }, {
    message: "Please enter a valid international phone number",
  }),
  resume: z.string().min(1, "Resume is required"),
  personal_links: z.string().optional(),
  work_experience: z
  .array(
    z.object({
      job_title: z.string().min(1, "Job Title is required"),
      company: z.string().min(1, "Company is required"),
      from: z.string().min(1, "Start date is required"),
      to: z.string().optional().nullable(),  
      role_description: z.string().min(1, "Job description is required"),
      skills: z.array(z.string()).min(1, "At least one skill is required"),
    })
  )
  .min(1, "At least one work experience is required"),
  education_experience: z.array(
    z.object({
      school: z.string().min(1, "School or University is required"),
      degree: z.string().min(1, "Degree is required"),
      field_of_study: z.string().optional(),
      from: z.string().min(1, "Start date is required"),
      to: z.string().optional(),
    })),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

/*const formatPhoneNumber = (phoneNumber: string): string => {
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
}; */

//supports international formats
const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return "";
  return new AsYouType('CA').input(phoneNumber);
};

export default function JobApplication() {
  const { jobPostingId } = useParams();
  const [searchParams] = useSearchParams();
  const jobTitle = searchParams.get("title") || "Unknown Job";
  const [job, setJob] = useState({ jobPostingId, title: jobTitle });

  const { setHeaderTitle, setShowSearchBar } = useOutletContext<ContextType>();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [showWorkExperience, setShowWorkExperience] = useState(false);
  const [showEducationExperience, setShowEducationExperience] = useState(false);
  const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createApplication = useCreateApplication();

  const {
    data: skills,
    isLoading: skillsLoading,
    error: skillsError,
  } = useGetSkills();
  const [selectedSkills, setSelectedSkills] = useState<{
    [key: number]: string[];
  }>({});
  const [openDropdowns, setOpenDropdowns] = useState<{
    [key: number]: boolean;
  }>({});
  const navigate = useNavigate();
  const [isParsing, setIsParsing] = useState(false);
  const [searchTerms, setSearchTerms] = useState<{
    [key: number]: string;
  }>({});

  type WorkExperienceEntry = {
    job_title: string;
    company: string;
    from: string;
    to?: string;
    role_description?: string;
    skills: string[];
  };

  interface ExperienceEntry {
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
    skills?: string | string[];
  }

  type EducationEntry = {
    school: string;
    degree: string;
    field_of_study?: string;
    from: string;
    to?: string;
  };


  const [workExperience, setWorkExperience] = useState<WorkExperienceEntry[]>(
    []
  );

  const [educationExperience, setEducationExperience] = useState<EducationEntry[]>([]);

  const applicationForm = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      work_experience: [],
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = applicationForm;

  const phone = applicationForm.watch("phone");

  const addWorkExperience = () => {
    setWorkExperience([
      ...workExperience,
      {
        job_title: "",
        company: "",
        from: "",
        skills: [],
      },
    ]);
  };

  const removeWorkExperience = (index: number) => {
    // Update local state
    setWorkExperience((prev) => prev.filter((_, i) => i !== index));

    // Get current form values
    const currentWorkExperience =
      applicationForm.getValues("work_experience") || [];

    // Remove the selected work experience entry
    const updatedWorkExperience = currentWorkExperience.filter(
      (_, i) => i !== index
    );

    // Update form state
    setValue("work_experience", updatedWorkExperience);
  };

  const addEducationExperience = () => {
    setEducationExperience((prev) => [
      ...prev,
      {
        school: "",
        degree: "",
        field_of_study: "",
        from: "",
        to: "",
      },
    ]);
  };
  
  const removeEducationExperience = (index: number) => {
    // Update local state
    setEducationExperience((prev) => prev.filter((_, i) => i !== index));
  
    // Get current form values
    const currentEducationExperience =
      applicationForm.getValues("education_experience") || [];
  
    // Remove the selected education entry
    const updatedEducationExperience = currentEducationExperience.filter(
      (_, i) => i !== index
    );
  
    // Update form state
    setValue("education_experience", updatedEducationExperience);
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          // Remove metadata prefix before sending
          const base64Data = reader.result.split(",")[1];
          resolve(base64Data);
          // use this line in order to incl matedata
          // resolve(reader.result);
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const filterSkills = (index: number, skills: any[]) => {
    if (!searchTerms[index] || searchTerms[index].trim() === "") {
      return skills;
    }

    const searchTerm = searchTerms[index].toLowerCase();
    return skills.filter((skill) =>
      skill.name.toLowerCase().includes(searchTerm)
    );
  };

  // Function to find the first missing required field
const validateForm = (data: ApplicationFormData): string | null => {
  // Check personal information first
  if (!data.first_name || data.first_name.trim() === "") return "First Name";
  if (!data.last_name || data.last_name.trim() === "") return "Last Name";
  if (!data.email || data.email.trim() === "") return "Email";
  if (!data.phone || data.phone.trim() === "") return "Phone";
  if (!data.resume || data.resume.trim() === "") return "Resume";

  // Check work experience entries
  if (!data.work_experience || data.work_experience.length === 0) {
    return "Work Experience (at least one entry required)";
  } else {
    for (let index = 0; index < data.work_experience.length; index++) {
      const exp = data.work_experience[index];

      if (!exp.job_title || exp.job_title.trim() === "")
        return `Job Title (Work Experience #${index + 1})`;

      if (!exp.company || exp.company.trim() === "")
        return `Company (Work Experience #${index + 1})`;

      if (!exp.from || exp.from.trim() === "")
        return `Start Date (Work Experience #${index + 1})`;

      if (!exp.skills || exp.skills.length === 0)
        return `Skills (Work Experience #${index + 1})`;

      if (exp.role_description?.trim() === "")
        return `Description (Work Experience #${index + 1})`;
    }
  }

  // Check education experience entries
  if (!data.education_experience || data.education_experience.length === 0) {
    return "Education Experience (at least one entry required)";
  } else {
    for (let index = 0; index < data.education_experience.length; index++) {
      const edu = data.education_experience[index];

      if (!edu.school || edu.school.trim() === "")
        return `School (Education #${index + 1})`;

      if (!edu.degree || edu.degree.trim() === "")
        return `Degree (Education #${index + 1})`;

      if (!edu.field_of_study || edu.field_of_study.trim() === "")
        return `Field of Study (Education #${index + 1})`;

      if (!edu.from || edu.from.trim() === "")
        return `Start Date (Education #${index + 1})`;

      // Optional field: to — no validation needed
    }
  }

  return null; // All fields are valid
};


  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        !file.type.match(
          "application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
      ) {
        applicationForm.setError("resume", {
          type: "manual",
          message: "Please upload only Word documents (.doc, .docx)",
        });
        return;
      }
  
      try {
        setIsParsing(true);
        applicationForm.clearErrors("resume");
        setFileName(file.name);
        setShowWorkExperience(true);
        setShowEducationExperience(true);
  
        const base64String = await convertFileToBase64(file);
        setValue("resume", base64String);
  
        if (file.type.includes("word")) {
          // Set parsing state to true before starting the parsing process
          setIsParsing(true);

          const parsedData = await parseResume(file);
  
          // Set basic info
          setValue("first_name", parsedData.firstName || "");
          setValue("last_name", parsedData.lastName || "");
          setValue("email", parsedData.email || "");
          setValue("phone", parsedData.phone || "");
  
          // --- Handle Work Experience ---
          const formattedExperiences = (parsedData.experiences ?? []).map(
            (exp: ExperienceEntry) => ({
              job_title: exp.title,
              company: exp.company,
              from: exp.startDate,
              to: exp.endDate,
              role_description: exp.description,
              skills: Array.isArray(exp.skills)
                ? exp.skills.flat()
                : exp.skills
                ? [exp.skills]
                : [],
            })
          );
  
          setWorkExperience(formattedExperiences);
          setValue("work_experience", formattedExperiences);
  
          formattedExperiences.forEach((exp, index) => {
            setValue(`work_experience.${index}.job_title`, exp.job_title);
            setValue(`work_experience.${index}.company`, exp.company);
            setValue(`work_experience.${index}.from`, exp.from);
            setValue(`work_experience.${index}.to`, exp.to || "");
            setValue(
              `work_experience.${index}.role_description`,
              exp.role_description || ""
            );
            setValue(
              `work_experience.${index}.skills`,
              Array.isArray(exp.skills)
                ? exp.skills.flat()
                : exp.skills
                ? [exp.skills]
                : []
            );

            // Update selected skills state to match form values
            setSelectedSkills((prev) => ({
              ...prev,
              [index]: Array.isArray(exp.skills)
                ? exp.skills.flat()
                : exp.skills
                ? [exp.skills]
                : [],
            }));
          });

          // Set parsing state to false after the parsing process is complete
          setIsParsing(false);
  
          // --- Handle Education Experience ---
          const formattedEducation = (parsedData.education ?? []).map(
            (edu: {
              school?: string;
              degree?: string;
              fieldOfStudy?: string;
              startDate?: string;
              endDate?: string;
            }) => ({
              school: edu.school || "",
              degree: edu.degree || "",
              field_of_study: edu.fieldOfStudy || "",
              from: edu.startDate || "",
              to: edu.endDate || "",
            })
          );
  
          setEducationExperience(formattedEducation);
          setValue("education_experience", formattedEducation);
  
          formattedEducation.forEach((edu, index) => {
            setValue(`education_experience.${index}.school`, edu.school);
            setValue(`education_experience.${index}.degree`, edu.degree);
            setValue(
              `education_experience.${index}.field_of_study`,
              edu.field_of_study || ""
            );
            setValue(`education_experience.${index}.from`, edu.from);
            setValue(`education_experience.${index}.to`, edu.to || "");
          });
        }
      } catch (error) {
        console.error("Error processing resume:", error);
        // Make sure to set parsing state to false in case of an error
        setIsParsing(false);
        setErrorMessage(
          `Failed to process resume. ${error} Please try again or fill in the details manually.`
        );
        setIsErrorModalOpen(true);
      }
    }

    // Reset the file input value so the same file can be uploaded again
    event.target.value = "";
  };

  // Improved resetResume function to replace the inline function in the "delete" button onClick
  const resetResume = () => {
    setFileName("");
    setValue("resume", "");
    setShowWorkExperience(false);
    setWorkExperience([]);
    setSelectedSkills({});

    // Reset all form fields
    setValue("first_name", "");
    setValue("last_name", "");
    setValue("email", "");
    setValue("phone", "");
    setValue("work_experience", []);

    // Clear any error states
    applicationForm.clearErrors();
  };

  const onSubmit = async (data: ApplicationFormData) => {
    console.log("SUBMIT TRIGGERED");
    try {
      setIsSubmitting(true);

      const applicationPayload = {
        ...data,
        jobPostingId: jobPostingId || "",
        work_experience: data.work_experience?.map((exp) => ({
          ...exp,
          skills: exp.skills?.join(", ") || "",
        })),
        education_experience: data.education_experience || [],
      };

      const result = await createApplication.mutateAsync(applicationPayload);
      setErrorMessage(null);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Error submitting application:", JSON.stringify(error));
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
      setIsErrorModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitForm = () => {
    // Get the current form values directly
    const formData = applicationForm.getValues();

    // Run your custom validation first
    const missingField = validateForm(formData);
    console.log("missing", missingField);

    if (missingField) {
      // If validation fails, show error and stop
      setErrorMessage(`Please complete the required field: ${missingField}`);
      setIsErrorModalOpen(true);
      return;
    }

    // If validation passes, then process and submit the form data
    onSubmit(formData);
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

  useEffect(() => {
    // Handle clicks outside of dropdowns
    function handleClickOutside(event: MouseEvent) {
      Object.entries(dropdownRefs.current).forEach(([index, ref]) => {
        if (
          ref &&
          !ref.contains(event.target as Node) &&
          openDropdowns[parseInt(index)]
        ) {
          setOpenDropdowns((prev) => ({
            ...prev,
            [parseInt(index)]: false,
          }));
        }
      });
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdowns]);

  return (
    <div className="flex flex-col items-center min-h-screen pb-12">
      {isSubmitting && <CircularProgressLoader />}

      <div className="flex flex-row items-center justify-between w-full max-w-lg mb-8 mt-4">
        <div>
          <button
            type="button"
            onClick={() => navigate("/applicant/job-postings")}
            className="flex items-center text-[#146eb4] hover:text-[#0d4b7a] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </button>
        </div>
        <h1 className="text-2xl font-bold text-[#146eb4]">{job?.title}</h1>
        <p className="text-lg">{`#${job?.jobPostingId}`}</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-lg space-y-4"
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <label
            htmlFor="file-upload"
            className="text-sm text-gray-500 py-2 px-4
              rounded-full border-0
              font-semibold
              bg-[#FF9900] text-white
              hover:bg-[#FF9966] cursor-pointer
              mx-auto"
          >
            Upload Resume to Auto Parse
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
          {isParsing && (
            <div className="mt-4 flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9900]"></div>
              <p className="text-sm text-gray-600 mt-2">
                Parsing your resume...
              </p>
            </div>
          )}
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
                <span className="text-sm text-center text-gray-600 font-medium">
                  {fileName}
                </span>
              </div>
              <button
                type="button"
                onClick={resetResume}
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

        <CustomFormTextField
          label="First Name"
          name="first_name"
          placeholder={!watch("first_name") ? "John" : ""}
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
          label="LinkedIn"
          name="personal_links"
          placeholder="https://linkedin.com/in/your-profile"
          register={register}
          errors={errors}
        />

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
                  errors={errors}
                />
                <CustomFormTextField
                  label="Company *"
                  name={`work_experience.${index}.company`}
                  placeholder="AWS"
                  register={register}
                  errors={errors}
                />
                <CustomFormTextField
                  label="Start Date *"
                  name={`work_experience.${index}.from`}
                  register={register}
                  placeholder="MM/YYYY"
                  errors={errors}
                />
                <CustomFormTextField
                  label="End Date"
                  name={`work_experience.${index}.to`}
                  register={register}
                  placeholder="MM/YYYY (leave blank if role hasn't terminated)"
                />

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Skills *
                  </label>

                  {/* Dropdown */}
                  <div
                    className="relative"
                    ref={(el) => {
                      dropdownRefs.current[index] = el;
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setOpenDropdowns((prev) => ({
                          ...prev,
                          [index]: !prev[index],
                        }));
                      }}
                      className="border border-gray-300 rounded-md p-2 w-full bg-white text-gray-700 flex justify-between items-center"
                    >
                      {selectedSkills[index]?.length > 0
                        ? selectedSkills[index].join(", ")
                        : "Select Skills"}
                      <span className="ml-2">▼</span>
                    </button>

                    {/* Scrollable Checkboxes + Custom Skill */}
                    <div
                      className="relative"
                      ref={(el) => {
                        dropdownRefs.current[index] = el;
                      }}
                    >
                      {openDropdowns[index] && (
                        <div className="absolute w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 z-10">
                          {/* Search Input */}
                          <div className="p-2 border-b">
                            <input
                              type="text"
                              placeholder="Search skills..."
                              value={searchTerms[index] || ""}
                              onChange={(e) => {
                                setSearchTerms((prev) => ({
                                  ...prev,
                                  [index]: e.target.value,
                                }));
                              }}
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          {/* Skills List */}
                          <div className="max-h-40 overflow-y-auto">
                            {skillsLoading ? (
                              <p className="p-2">Loading skills...</p>
                            ) : skillsError ? (
                              <p className="p-2 text-red-500">Error fetching skills</p>
                            ) : (
                              <div className="p-2">
                                {skills && filterSkills(index, skills).length > 0 ? (
                                  filterSkills(index, skills).map((skill) => (
                                    <label
                                      key={skill.skillId}
                                      className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        value={skill.name}
                                        checked={
                                          selectedSkills[index]?.includes(skill.name) || false
                                        }
                                        onChange={(e) => {
                                          const updatedSkills = e.target.checked
                                            ? [...(selectedSkills[index] || []), skill.name]
                                            : (selectedSkills[index] || []).filter(
                                                (s) => s !== skill.name
                                              );

                                          setSelectedSkills((prev) => ({
                                            ...prev,
                                            [index]: updatedSkills,
                                          }));

                                          setValue(
                                            `work_experience.${index}.skills`,
                                            updatedSkills
                                          );
                                        }}
                                        className="rounded text-blue-500 focus:ring-2 focus:ring-blue-400"
                                      />
                                      {skill.name}
                                    </label>
                                  ))
                                ) : (
                                  <p className="p-2 text-gray-500">No matching skills found</p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Add Custom Skill */}
                          <div className="p-2 border-t flex gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Add your own skill"
                              value={searchTerms[index] || ""}
                              onChange={(e) =>
                                setSearchTerms((prev) => ({
                                  ...prev,
                                  [index]: e.target.value,
                                }))
                              }
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const customSkill = searchTerms[index]?.trim();
                                if (
                                  customSkill &&
                                  !selectedSkills[index]?.includes(customSkill)
                                ) {
                                  const updatedSkills = [
                                    ...(selectedSkills[index] || []),
                                    customSkill,
                                  ];
                                  setSelectedSkills((prev) => ({
                                    ...prev,
                                    [index]: updatedSkills,
                                  }));
                                  setValue(
                                    `work_experience.${index}.skills`,
                                    updatedSkills as string[]
                                  );
                                  setSearchTerms((prev) => ({
                                    ...prev,
                                    [index]: "",
                                  }));
                                }
                              }}
                              className="px-3 py-2 bg-[#146eb4] text-white rounded-md hover:bg-[#0d4b7a] text-sm"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Display Skills */}
                  {selectedSkills[index]?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedSkills[index].map((skill, i) => (
                        <div
                          key={i}
                          className="bg-gray-200 px-3 py-1 rounded-md flex items-center gap-2"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => {
                              const updatedSkills: string[] = selectedSkills[index].filter(
                                (s) => s !== skill
                              );

                              setSelectedSkills((prev) => ({
                                ...prev,
                                [index]: updatedSkills,
                              }));
                              setValue(
                                `work_experience.${index}.skills`,
                                updatedSkills as string[]
                              );
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <label className="text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
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

        {showEducationExperience && (
          <>
            <h3 className="text-lg font-semibold">Education Experience</h3>
            {educationExperience.map((_, index) => (
              <div
                key={index}
                className="relative border p-4 pt-8 space-y-2 bg-gray-50 rounded-lg shadow-md"
              >
                <button
                  type="button"
                  onClick={() => removeEducationExperience(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>

                <CustomFormTextField
                  label="School or University"
                  name={`education_experience.${index}.school`}
                  placeholder="University of British Columbia"
                  register={register}
                  errors={errors}
                />
                <CustomFormTextField
                  label="Degree"
                  name={`education_experience.${index}.degree`}
                  placeholder="Bachelor of Science"
                  register={register}
                  errors={errors}
                />
                <CustomFormTextField
                  label="Field of Study"
                  name={`education_experience.${index}.field_of_study`}
                  placeholder="Computer Science"
                  register={register}
                  errors={errors}
                />
                <CustomFormTextField
                  label="Start Date"
                  name={`education_experience.${index}.from`}
                  placeholder="MM/YYYY"
                  register={register}
                  errors={errors}
                />
                <CustomFormTextField
                  label="End Date"
                  name={`education_experience.${index}.to`}
                  placeholder="MM/YYYY or leave blank if ongoing"
                  register={register}
                  errors={errors}
                />
              </div>
            ))}
            <CustomButton onClick={addEducationExperience}>
              Add Education Experience
            </CustomButton>
          </>
        )}

        <div className="flex justify-end">
          <CustomButton
            onClick={submitForm}
            variant="filled"
            disabled={isSubmitting}
          >
            {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
          </CustomButton>
        </div>
      </form>

      <Modal
        open={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
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
          <div>
            <div className="flex flex-col gap-2 items-center">
              <h2 className="text-xl">Application Submitted for</h2>
              <h2 className="text-xl">{job?.title}</h2>
            </div>
            <div className="flex flex-col gap-2">
              <p>
                <span className="font-semibold">Name:</span>{" "}
                {applicationForm.getValues().first_name}{" "}
                {applicationForm.getValues().last_name}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {applicationForm.getValues().email}
              </p>
              <p>
                <span className="font-semibold">Phone:</span>{" "}
                {formatPhoneNumber(applicationForm.getValues().phone)}
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <CustomButton
              variant="filled"
              className="min-w-[50px]"
              onClick={() => {
                setIsSuccessModalOpen(false);
                navigate("/applicant/job-postings"); // Navigate only on success
              }}
            >
              OK
            </CustomButton>
          </div>
        </Box>
      </Modal>
      <ApplicationErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        errorMessage={errorMessage}
      />
    </div>
  );
}
