import { useState, useEffect } from "react";
import {
  Modal,
  Box,
  IconButton,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import JobPost from "../../components/Common/JobPost";
import { Job } from "../../components/Common/JobPost";
import { useOutletContext, useNavigate } from "react-router";
import { apiUrls } from "../../api/apiUrls";

type ContextType = {
  searchTerm: string;
  location: string;
  setHeaderTitle: (title: string) => void;
  setShowSearchBar: (show: boolean) => void;
};

export default function JobPostings() {
  const { setHeaderTitle, setShowSearchBar } = useOutletContext<ContextType>();
  useEffect(() => {
    setHeaderTitle("Job Postings");
    setShowSearchBar(true);
  }, [setHeaderTitle, setShowSearchBar]);

  const { searchTerm, location } = useOutletContext<ContextType>();
  const [jobPostings, setJobPostings] = useState<Job[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Fetch job postings from backend when the page loads
  useEffect(() => {
    const fetchJobPostings = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrls.applicantJobPostingsUrl);
        const data = await response.json();

        if (data.success) {
          setJobPostings(data.data);
        } else {
          setError("Failed to load job postings.");
        }
      } catch (error) {
        setError("Error fetching job postings.");
        console.error("Error fetching job postings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobPostings();
  }, []);

  useEffect(() => {
    const fetchJobTypes = async () => {
      try {
        const response = await fetch(apiUrls.getJobTagsUrl);
        const result = await response.json();

        if (result.success) {
          setJobTypes(result.data);
        } else {
          console.error("Failed to fetch job types");
        }
      } catch (err) {
        console.error("Error fetching job types:", err);
      }
    };

    fetchJobTypes();
  }, []);

  const handleJobClick = (job: Job) => {
    navigate(`details/${job.id}`);
  };

  // Function to handle filter changes
  const handleJobTypeChange = (jobType: string) => {
    setSelectedJobTypes((prev) =>
      prev.includes(jobType)
        ? prev.filter((type) => type !== jobType)
        : [...prev, jobType]
    );
  };

  const handleSortChange = (event: any) => {
    setSortOrder(event.target.value);
  };

  // Filtered and sorted job postings
  const filteredJobs = jobPostings
    .filter((job) => {
      const searchTermLower = searchTerm.toLowerCase();
      const locationLower = location.toLowerCase();

      const jobTypeMatch =
        selectedJobTypes.length === 0 ||
        job.tags?.some((tag: string) => selectedJobTypes.includes(tag));

      return (
        jobTypeMatch &&
        (job.id.toString().includes(searchTermLower) ||
          job.code.toLowerCase().includes(searchTermLower) ||
          job.title.toLowerCase().includes(searchTermLower) ||
          job.description.toLowerCase().includes(searchTermLower) ||
          job.qualifications.some((qual) =>
            qual.toLowerCase().includes(searchTermLower)
          ) ||
          job.responsibilities.some((resp) =>
            resp.toLowerCase().includes(searchTermLower)
          )) &&
        job.location.toLowerCase().includes(locationLower)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.posted_at).getTime();
      const dateB = new Date(b.posted_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="flex flex-col gap-4 m-8">
      {/* Header and Sort Controls */}
      <div className="flex justify-between items-center w-full mb-2">
        <FormControl size="small">
          <InputLabel id="sort-label">Sort By</InputLabel>
          <Select
            labelId="sort-label"
            value={sortOrder}
            onChange={handleSortChange}
            label="Sort By"
          >
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
          </Select>
        </FormControl>
      </div>

      <div className="flex gap-8">
        {/* Sidebar for Filters */}
        <aside
          className="w-[250px] bg-white p-4 rounded-lg shadow-md flex flex-col justify-start"
          style={{
            minWidth: "250px",
            maxWidth: "250px",
            minHeight: "300px",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <h3 className="font-bold text-lg mb-4">Filter By:</h3>

          {/* Job Type Filter */}
          <h4 className="text-md font-medium mb-2 text-[#146eb4]">Job Tags</h4>
          <div className="flex flex-col gap-2 mb-4">
            {jobTypes.map((type) => (
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
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <JobPost
                key={job.id}
                job={job}
                onLearnMore={() =>
                  navigate(`/applicant/job-postings/details/${job.id}`, {
                    state: { job },
                  })
                }
                onApply={() =>
                  navigate(`apply/${job.id}?title=${encodeURIComponent(job.title)}`)
                }
              />
            ))
          ) : (
            <p className="text-gray-600 text-lg font-semibold mt-4">
              No job postings match your search criteria.
            </p>
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      {/*<Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="job-modal-title"
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
            width: "90%",
            m: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxHeight: "90vh",
          }}
        >
          {selectedJob && (
            <>
              <div className="flex justify-between items-center text-gray-800">
                <IconButton
                  onClick={() => setIsModalOpen(false)}
                  aria-label="close"
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
                <h2 className="text-2xl" id="job-modal-title">
                  {selectedJob.title}
                </h2>
                <p>{`#${selectedJob.code}`}</p>
              </div>
              <section className="my-2 custom-scrollbar max-h-[calc(90vh-120px)]">
                <p>
                  <span className="font-semibold">Location:</span>{" "}
                  {selectedJob.location}
                </p>
                <p>
                  <span className="font-semibold">Job Type:</span>{" "}
                  {selectedJob.job_type}
                </p>
                <p>
                  <span className="font-semibold">Posted:</span>{" "}
                  {selectedJob.posted_at}
                </p>
                <div className="mt-4">
                  <h4 className="font-semibold">About the Role:</h4>
                  <p>{selectedJob.description}</p>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold">What You Will Do:</h4>
                  <ul className="list-disc list-inside pl-4">
                    {selectedJob.responsibilities.map(
                      (responsibility, index) => (
                        <li key={index}>{responsibility}</li>
                      )
                    )}
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
      </Modal>  */}
    </div>
  );
}