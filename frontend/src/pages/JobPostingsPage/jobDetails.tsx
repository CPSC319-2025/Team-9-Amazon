import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { apiUrls } from "../../api/apiUrls";
import CustomButton from "../../components/Common/Buttons/CustomButton";

export interface Job {
  id: string;
  code: string;
  title: string;
  job_type: string;
  location: string;
  description: string;
  department: string;
  posted_at: string;
  qualifications: string[];
  responsibilities: string[];
}

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`${apiUrls.applicantJobPostingsUrl}/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setJob(data.data);
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
  }, [id]);

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  if (!job) return <p className="text-center text-gray-600">Job not found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-[#146eb4]">{job.title}</h1>
      <p className="text-gray-600">{`#${job.code}`}</p>
      <p><strong>Location:</strong> {job.location}</p>
      <p><strong>Job Type:</strong> {job.job_type}</p>
      <p><strong>Posted:</strong> {job.posted_at}</p>

      <div className="mt-4">
        <h4 className="font-semibold">About the Role:</h4>
        <p>{job.description}</p>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold">What You Will Do:</h4>
        <ul className="list-disc list-inside pl-4">
          {job.responsibilities.map((responsibility, index) => (
            <li key={index}>{responsibility}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold">What We're Looking For:</h4>
        <ul className="list-disc list-inside pl-4">
          {job.qualifications.map((qualification, index) => (
            <li key={index}>{qualification}</li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end mt-6">
        <CustomButton 
          variant="filled"
          onClick={() => navigate(`/applicant/job-postings/apply/${job.id}?title=${encodeURIComponent(job.title)}`)}
        >
          Apply Now
        </CustomButton>
      </div>
    </div>
  );
}
