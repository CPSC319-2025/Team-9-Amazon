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
  Typography,
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
  const [searchTagTerm, setSearchTagTerm] = useState("");

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
          job.qualifications.toLowerCase().includes(searchTermLower) ||
          job.responsibilities.toLowerCase().includes(searchTermLower)) &&
        job.location.toLowerCase().includes(locationLower)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.posted_at).getTime();
      const dateB = new Date(b.posted_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return (
      <Box sx={{ p: 4, m: 0 }}>
        {/* Header and Sort Controls */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
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
        </Box>
  
        {/* Main content area with sidebar filters and job listings */}
        <Box sx={{ display: { xs: "block", md: "flex" }, gap: 2 }}>
          {/* Sidebar for Filters */}
          <Box
            sx={{
              backgroundColor: "white",
              p: 2,
              borderRadius: 2,
              boxShadow: 1,
              minWidth: "250px",
              maxWidth: "250px",
              height: "100%",
              overflowY: "auto",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Filter By:
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 1, color: "#146eb4" }}>
              Job Tags
            </Typography>
            <Box sx={{ mb: 2 }}>
              {/* Using a simple HTML input with inline styles for tag search */}
              <input
                type="text"
                placeholder="Search job tags..."
                value={searchTagTerm}
                onChange={(e) => setSearchTagTerm(e.target.value)}
                style={{
                  padding: "8px",
                  marginBottom: "12px",
                  border: "1px solid #ccc",
                  borderRadius: "9999px",
                  outline: "none",
                  width: "100%",
                }}
              />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: "300px", overflowY: "auto" }}>
              {jobTypes
                .filter((type) =>
                  type.toLowerCase().includes(searchTagTerm.toLowerCase())
                )
                .map((type) => (
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
            </Box>
          </Box>
  
          {/* Job Listings */}
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: "center",
            }}
          >
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
                    navigate(
                      `apply/${job.id}?title=${encodeURIComponent(job.title)}`
                    )
                  }
                />
              ))
            ) : (
              <Typography variant="h6" sx={{ color: "gray", textAlign: "center", mt: 4 }}>
                No job postings match your search criteria.
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    );
}