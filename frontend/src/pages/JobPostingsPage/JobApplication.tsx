import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Job } from "../../components/Common/JobPost";
import CustomFormTextField from "../../components/Common/FormInputs/CustomFormTextField";
import { jobPostingsData } from "./jobPostingsData";
import CustomButton from "../../components/Common/Buttons/CustomButton";
import { Box, Modal } from "@mui/material";
import CircularProgressLoader from "../../components/Common/Loaders/ircularProgressLoader";

type ContextType = {
  setHeaderTitle: (title: string) => void;
  setShowSearchBar: (show: boolean) => void;
};

// Define the schema with Zod
const applicationSchema = z.object({
  first_name: z.string()
    .min(2, "First Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  last_name: z.string()
    .min(2, "Last Name must be at least 2 characters")
    .max(50, "Last Name must be less than 50 characters"),
  email: z.string()
    .email("Please enter a valid email address"),
  phone: z.string()
    .min(10, "Phone number must be at least 10 characters")
    .max(15, "Phone number must be less than 15 characters"),
  address: z.string()
    .min(1, "Address is required"),
  resume: z.string()
    .min(1, "Resume is required"),
});

// Infer the TypeScript type from the schema
type ApplicationFormData = z.infer<typeof applicationSchema>;

const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  const cleaned = phoneNumber?.replace(/\D/g, '');
  if (cleaned?.length === 0) return '';
  if (cleaned?.length <= 3) return cleaned;
  if (cleaned?.length <= 6) return `${cleaned?.slice(0, 3)}-${cleaned?.slice(3)}`;
  return `${cleaned?.slice(0, 3)}-${cleaned?.slice(3, 6)}-${cleaned?.slice(6, 10)}`;
};

export default function JobApplication() {
    const { setHeaderTitle, setShowSearchBar } = useOutletContext<ContextType>();
    const { id } = useParams();
    const [job, setJob] = useState<Job | null>(null);
    const [applicationId, setApplicationId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileName, setFileName] = useState<string>("");
    const navigate = useNavigate();

    // form
    const applicationForm = useForm<ApplicationFormData>({
      resolver: zodResolver(applicationSchema),
    });

    const {
      register,
      handleSubmit,
      formState: { errors },
    } = applicationForm;

    const phone = applicationForm.watch('phone');


    // handlers
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setFileName(file.name);
        const base64String = await convertFileToBase64(file);
        applicationForm.setValue('resume', base64String);
      }
    };

    const convertFileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          }
        };
        reader.onerror = (error) => reject(error);
      });
    };

    const onSubmit = async (data: ApplicationFormData) => {
      try {
        setIsSubmitting(true);
        console.log("Submitting application:", data);

        // simulate calling api
        setTimeout(() => {
          setIsModalOpen(true);
          setApplicationId(new Date().getTime().toString()); // TODO: get application id from api
          setIsSubmitting(false);
        }, 2000);
      } catch (error) {
        console.error("Error submitting application:", error);
        setIsSubmitting(false);
      }
    };

    // lifecycle
    useEffect(() => {
      const job = jobPostingsData.find((job) => job.id === id);
      if (job) {
        setJob(job);
      }

      setShowSearchBar(false);
      setHeaderTitle(`Apply Now`);
    }, [id]);

    useEffect(() => {
      console.log('phone', phone);
      if (phone) {
        const value = phone?.replace(/\D/g, ''); 
        const formattedValue = formatPhoneNumber(value);
        applicationForm.setValue('phone', formattedValue);
      }
    }, [phone]);

    return (
      <div className="flex flex-col items-center min-h-screen">
        {isSubmitting && (
          <CircularProgressLoader />
        )}
        <div className="flex flex-row items-center justify-between gap-16 mb-8 mt-4">
          <div></div>
          <h1 className="text-2xl font-bold">{job?.title}</h1>
          <p className="text-lg">{`#${job?.code}`}</p>
        </div>
        
        <form 
          onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg space-y-4">
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
            label="Address" 
            name="address" 
            placeholder="Washington, DC" 
            register={register}
            errors={errors}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Resume</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-[#FF9900] file:text-white
                hover:file:bg-[#FF9966] hover:file:text-white"
            />
            {fileName && (
              <div className="flex items-center justify-between border-2 border-dashed border-gray-300 p-4 rounded-lg mt-2 hover:border-[#FF9900] transition-colors">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-gray-600 font-medium">{fileName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFileName("");
                    applicationForm.setValue('resume', '');
                  }}
                  className="text-gray-500 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
            <input type="hidden" {...register('resume')} />
            {errors.resume && (
              <span className="text-red-500 text-sm">{errors.resume.message}</span>
            )}
          </div>

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
              sx={{
              }}
          >
              <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  bgcolor: '#f9f9f9',
                  borderRadius: 0,
                  boxShadow: 24,
                  p: 4,
                  maxWidth: '42rem',
                  minWidth: '30rem',
                  width: 'auto',
                  m: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  maxHeight: '90vh',
              }}>
                <div className="flex flex-col gap-2 items-center">
                  <h2 className="text-xl" id="job-modal-title">Application Submitted for</h2>
                  <h2 className="text-xl" id="job-modal-title">{job?.title}</h2>
                </div>
                <div className="flex flex-col gap-2">
                  <p><span className="font-semibold">Name:</span> {applicationForm.getValues().first_name} {applicationForm.getValues().last_name}</p>
                  <p><span className="font-semibold">Email:</span> {applicationForm.getValues().email}</p>
                  <p><span className="font-semibold">Phone:</span> {formatPhoneNumber(applicationForm.getValues().phone)}</p>
                  <p><span className="font-semibold">Application ID:</span> {applicationId}</p>
                </div>
                <div className="flex justify-end">
                  <CustomButton 
                    variant="filled"
                    className="min-w-[50px]"
                    onClick={() => {
                      setIsModalOpen(false)
                      applicationForm.reset()
                      navigate('/job-postings')
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