import { useState } from "react";
import { Modal, Box, IconButton, FormControlLabel, Checkbox } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import JobPost from "../../components/Common/JobPost";
import { Job } from "../../components/Common/JobPost";
import { jobPostingsData as jobs } from "./jobPostingsData";
import { useOutletContext, useNavigate } from "react-router";

type ContextType = {
  searchTerm: string;
  location: string;
  setHeaderTitle: (title: string) => void;
  setShowSearchBar: (show: boolean) => void;
};

export default function JobPostings() {
  const { setHeaderTitle, setShowSearchBar } = useOutletContext<ContextType>();
  setHeaderTitle("Job Postings");
  setShowSearchBar(true);

  const { searchTerm, location } = useOutletContext<ContextType>();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // State for job type filter
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  // Function to handle filter changes
  const handleJobTypeChange = (jobType: string) => {
    setSelectedJobTypes((prev) =>
      prev.includes(jobType) ? prev.filter((type) => type !== jobType) : [...prev, jobType]
    );
  };

  // Filtered job postings
  const filteredJobs = jobs.filter((job) => {
    const searchTermLower = searchTerm.toLowerCase();
    const locationLower = location.toLowerCase();
    
    // Job type filtering logic
    const jobTypeMatch =
      selectedJobTypes.length === 0 || selectedJobTypes.includes(job.job_type);

    return (
      jobTypeMatch &&
      (
        job.id.toLowerCase().includes(searchTermLower) ||
        job.code.toLowerCase().includes(searchTermLower) ||
        job.title.toLowerCase().includes(searchTermLower) ||
        job.description.toLowerCase().includes(searchTermLower) ||
        job.job_type.toLowerCase().includes(searchTermLower) ||
        job.department.toLowerCase().includes(searchTermLower) ||
        job.qualifications.some((qual) => qual.toLowerCase().includes(searchTermLower)) ||
        job.responsibilities.some((resp) => resp.toLowerCase().includes(searchTermLower))
      ) &&
      job.location.toLowerCase().includes(locationLower)
    );
  });

  return (
    <div className="flex gap-8 m-8">
      {/* Sidebar for Filters */}
      <aside 
      className="w-[250px] h-[300px] bg-white p-4 rounded-lg shadow-md flex flex-col justify-start"
      style={{ minWidth: "250px", maxWidth: "250px", minHeight: "300px", maxHeight: "300px", overflow: "hidden" }}
      >
        <h3 className="font-bold text-lg mb-4">Filter By:</h3>

        {/* Job Type Filter */}
        <h4 className="text-md font-medium mb-2 text-[#146eb4]">Job Type</h4>
        <div className="flex flex-col gap-2">
          {["Full-time", "Part-time", "Remote"].map((type) => (
            <FormControlLabel
              key={type}
              control={
                <Checkbox
                  checked={selectedJobTypes.includes(type)}
                  onChange={() => handleJobTypeChange(type)}
                />
              }
              label={type}
            />
          ))}
        </div>
      </aside>

      {/* Job Listings */}
      <div className="flex flex-wrap gap-8 justify-center flex-grow">
        {filteredJobs.map((job) => (
          <JobPost 
            key={job.id} 
            job={job} 
            onLearnMore={() => handleJobClick(job)}
            onApply={() => navigate(`/applicant/job-postings/apply/${job.id}`)}
          />
        ))}
      </div>

      {/* Job Details Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} aria-labelledby="job-modal-title">
        <Box sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "#f9f9f9",
          borderRadius: 0,
          boxShadow: 24,
          p: 4,
          maxWidth: "42rem",
          width: "90%",
          m: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxHeight: "90vh",
        }}>
          {selectedJob && (
            <>
              <div className="flex justify-between items-center text-gray-800">
                <IconButton onClick={() => setIsModalOpen(false)} aria-label="close" size="small">
                  <CloseIcon />
                </IconButton>
                <h2 className="text-2xl" id="job-modal-title">{selectedJob.title}</h2>
                <p>{`#${selectedJob.code}`}</p>
              </div>
              <section className="my-2 custom-scrollbar max-h-[calc(90vh-120px)]">
                <p><span className="font-semibold">Location:</span> {selectedJob.location}</p>
                <p><span className="font-semibold">Job Type:</span> {selectedJob.job_type}</p>
                <p><span className="font-semibold">Posted:</span> {selectedJob.posted_at}</p>
                <div className="mt-4">
                  <h4 className="font-semibold">About the Role:</h4>
                  <p>{selectedJob.description}</p>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold">What You Will Do:</h4>
                  <ul className="list-disc list-inside pl-4">
                    {selectedJob.responsibilities.map((responsibility, index) => (
                      <li key={index}>{responsibility}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold">What We're Looking For:</h4>
                  <ul className="list-disc list-inside pl-4">
                    {selectedJob.qualifications.map((qualification, index) => (
                      <li key={index}>{qualification}</li>
                    ))}
                  </ul>
                </div>
              </section>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
}
