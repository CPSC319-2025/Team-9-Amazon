import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { apiUrls } from "../../api/apiUrls";
import CustomButton from "../../components/Common/Buttons/CustomButton";
import { Job } from "../../components/Common/JobPost";
import { useGetJobPosting } from "../../queries/jobPosting";


export default function JobDetails() {
  const { jobPostingId } = useParams();
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  /*const {

    data: jobPosting,
    isLoading: isLoadingJobPosting,
    error: jobPostingDataError,
  } = useGetJobPosting(jobPostingId || "");
   */
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`${apiUrls.applicantJobPostingsUrl}`);
        const data = await response.json();
        console.log("API response:", data);
        
        if (data.success) {
          setSelectedJob(data.data);
        } else {
          setError("Failed to load job details.");
        }
      } catch (error) {
        setError("Error fetching job details.");
        console.error("Error fetching job details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobPostingId]);


  //if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  if (!selectedJob) return <p className="text-center text-gray-600">Job not found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-[#146eb4]">{selectedJob.title}</h1>
      <p className="text-gray-600">{`#${selectedJob.code}`}</p>
      <p><strong>Location:</strong> {selectedJob.location}</p>
      <p><strong>Job Type:</strong> {selectedJob.job_type}</p>
      <p><strong>Posted:</strong> {selectedJob.posted_at}</p>

      <div className="mt-4">
        <h4 className="font-semibold">About the Role:</h4>
        <p>{selectedJob.description}</p>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold">What You Will Do:</h4>
        <ul className="list-disc list-inside pl-4">
          {selectedJob.responsibilities?.map((responsibility, index) => (
            <li key={index}>{responsibility}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold">What We're Looking For:</h4>
        <ul className="list-disc list-inside pl-4">
          {selectedJob.qualifications?.map((qualification, index) => (
            <li key={index}>{qualification}</li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end mt-6">
        <CustomButton 
          variant="filled"
          onClick={() => navigate(`/applicant/job-postings/apply/${selectedJob.id}?title=${encodeURIComponent(selectedJob.title)}`)}
        >
          Apply Now
        </CustomButton>
      </div>
    </div>
  );
}
