import { PlusCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { textButtonStyle, colors } from "../../styles/commonStyles";
import { JobCard } from "../../components/Common/JobCard";
import { Header } from "../../components/Common/Header";
import { useNavigate } from "react-router";
import { ROUTES } from "../../routes/routePaths";
import { SearchBar } from "../../components/Common/SearchBar";
import { useGetAllJobPostings } from "../../queries/jobPosting";
import CircularProgressLoader from "../../components/Common/Loaders/CircularProgressLoader";
import HttpErrorDisplay from "../../components/Common/Errors/HttpErrorDisplay";
import { JobPostingStatus } from "../../types/JobPosting/jobPosting";
import { JobStatusFilterSidebar } from "../../components/HiringManager/JobFilterSidebar";

const HiringManagerDashboardPage = () => {
  const navigate = useNavigate();

  const { data: jobPostings, isLoading, error } = useGetAllJobPostings();

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStatuses, setSelectedStatuses] = useState<JobPostingStatus[]>([
    JobPostingStatus.DRAFT,
    JobPostingStatus.OPEN,
    JobPostingStatus.CLOSED,
  ]);

  const handleCreateJob = () => {
    navigate(ROUTES.hiringManager.hiringManagerCreateJob);
  };

  const headerActions = (
    <Button
      startIcon={<PlusCircle size={20} />}
      sx={{ ...textButtonStyle, color: colors.blue1 }}
      onClick={handleCreateJob}
    >
      Add New Job Posting
    </Button>
  );

  const handleCardClick = (jobPostingId: string) => {
    navigate(ROUTES.hiringManager.jobPosting(jobPostingId));
  };

  const filteredJobPostings = useMemo(() => {
    if (!jobPostings) return [];
    let filtered = jobPostings;

    // Filter by search term if provided
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchLower) ||
          (job.description?.toLowerCase() || "").includes(searchLower)
      );
    }
    // Filter by job status based on selected statuses
    filtered = filtered.filter((job) => selectedStatuses.includes(job.status));

    return filtered;
  }, [jobPostings, searchTerm, selectedStatuses]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };


  if (isLoading) {
    return (
      <CircularProgressLoader
        variant="indeterminate"
        text="Loading job postings ..." />
    );
  }

  if (error) {

    if (error.code === 404) {
      return (<HttpErrorDisplay
        statusCode={error.code}
        message="Job postings not found"
        details="Error loading job postings. Please try again later." />);
    }
    if (error.code === 403) {
      return (<HttpErrorDisplay
        statusCode={error.code}
        message="Forbidden"
        details="You are not authorized to access this resource." />);
    }


    return (
      <HttpErrorDisplay
        statusCode={error.code || -1}
        message="Error"
        details={error.message} />
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.white }}>
      <Header title="Job Postings" actions={headerActions} />


      <Box sx={{ display: "flex" }}>
        <JobStatusFilterSidebar selectedStatuses={selectedStatuses} onChange={setSelectedStatuses} />

        <Box sx={{ flex: 1 }}>
          <Container maxWidth={false} sx={{ py: 4 }}>
            {/* Search Section */}
            <Box
              sx={{
                mb: 4,
                maxWidth: "800px",
                mx: "auto",
                px: 2,
              }}
            >
              <SearchBar
                placeholder="Search job postings by title or description..."
                onSearch={handleSearch}
                showSort={false}
              />
            </Box>

            {/* Results Section */}
            <Box sx={{ bgcolor: colors.gray1, borderRadius: 2, p: 3 }}>
              {filteredJobPostings.length > 0 ? (
                <Grid container spacing={3}>
                  {filteredJobPostings.map((jobPosting) => (
                    <Grid item xs={12} md={6} lg={4} key={jobPosting.id}>
                      <JobCard
                        id={jobPosting.id}
                        title={jobPosting.title}
                        description={jobPosting.description ?? ""}
                        onClick={() => handleCardClick(jobPosting.id)}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box
                  sx={{
                    py: 8,
                    textAlign: "center",
                    color: colors.black1,
                  }}
                >
                  <Typography variant="h6">
                    No job postings found matching "{searchTerm}"
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ mt: 1, color: colors.black1 + "99" }}
                  >
                    Try adjusting your search terms or browse all postings
                  </Typography>
                </Box>
              )}
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default HiringManagerDashboardPage;
