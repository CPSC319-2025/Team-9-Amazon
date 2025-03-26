import { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router";
import { apiUrls } from "../../api/apiUrls";
import CustomButton from "../../components/Common/Buttons/CustomButton";
import { Job } from "../../components/Common/JobPost";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
//import AccessTimeIcon from "@mui/icons-material/AccessTime";

type ContextType = {
  setHeaderTitle: (title: string) => void;
  setShowSearchBar: (show: boolean) => void;
};


export default function JobDetails() {
  const { jobPostingId } = useParams();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setShowSearchBar } = useOutletContext<ContextType>();

  useEffect(() => {
    setShowSearchBar(false);
  }, [setShowSearchBar]);


  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`${apiUrls.applicantJobPostingsUrl}`);
        const data = await response.json();

        if (data.success) {
          const matchedJob = data.data.find((j: Job) => j.id.toString() === jobPostingId);
          setSelectedJob(matchedJob || null);
        } else {
          setError("Failed to load job details.");
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
        setError("Error fetching job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobPostingId]);

  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!selectedJob) return <p className="text-center text-gray-600">Job not found.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-[#146eb4]">{selectedJob.title}</h1>
        <p className="text-gray-600">#{selectedJob.code}</p>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Content */}
        <div className="md:col-span-2">
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">About the Role</h4>
            <p>{selectedJob.description}</p>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">What You Will Do</h4>
            <ul className="list-disc list-inside space-y-1">
              {selectedJob.responsibilities?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-2">What We're Looking For</h4>
            <ul className="list-disc list-inside space-y-1">
              {selectedJob.qualifications?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-lg mb-4">Job Details</h4>

          <div className="flex items-start gap-2 mb-3">
            <LocationOnIcon className="text-[#146eb4] mt-0.5" />
            <div>
              <p className="text-base text-gray-600 font-medium">Location</p>
              <p className="text-sm text-gray-800">{selectedJob.location}</p>
            </div>
          </div>

          {selectedJob.tags?.length > 0 && (
            <div className="flex items-start gap-2 mb-3">
              <WorkIcon className="text-[#146eb4] mt-0.5" />
              <div>
                <p className="text-base text-gray-600 font-medium">Tags</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedJob.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-[#146eb4] text-white text-xs px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <CustomButton
          variant="filled"
          onClick={() => window.open(`/applicant/job-postings/apply/${selectedJob.id}?title=${encodeURIComponent(selectedJob.title)}`, '_blank')}
        >
          Apply Now
        </CustomButton>
      </div>
    </div>
  );
}

