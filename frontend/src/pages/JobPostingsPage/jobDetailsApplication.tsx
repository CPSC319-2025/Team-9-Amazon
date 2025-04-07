import { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router";
import { apiUrls } from "../../api/apiUrls";
import { Job } from "../../components/Common/JobPost";
import JobDetailsView from "../../components/HiringManager/JobPostings/JobDetailsView";
import { JobDetailsMode } from "../../types/JobPosting/JobDetailsMode";
import { JobPosting, JobPostingStatus } from "../../types/JobPosting/jobPosting";
//import AccessTimeIcon from "@mui/icons-material/AccessTime";

type ContextType = {
  setHeaderTitle: (title: string) => void;
  setShowSearchBar: (show: boolean) => void;
};


export default function JobDetailsApplicant() {
  const { jobPostingId } = useParams();

  const [jobPosting, setJobPosting] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setShowSearchBar } = useOutletContext<ContextType>();
  const { setHeaderTitle } = useOutletContext<ContextType>();

  useEffect(() => {
    setHeaderTitle("Learn More");
    setShowSearchBar(false);
  }, [setShowSearchBar]);


  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`${apiUrls.applicantJobPostingsUrl}`);
        const data = await response.json();

        if (data.success) {
          const matchedJob = data.data.find((j: Job) => j.id.toString() === jobPostingId);

          matchedJob.createdAt = new Date(matchedJob.posted_at);
          matchedJob.status = JobPostingStatus.OPEN;
          setJobPosting(matchedJob || null);
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
  if (!jobPosting) return <p className="text-center text-gray-600">Job not found.</p>;

  return (
    <JobDetailsView
      jobPosting={jobPosting}
      mode={JobDetailsMode.APPLY}
      onApply={ () => {window.open(`/applicant/job-postings/apply/${jobPosting.id}?title=${encodeURIComponent(jobPosting.title)}`, '_blank')}}
    />
  );
}