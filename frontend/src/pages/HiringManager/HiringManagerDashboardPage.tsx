import { PlusCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { textButtonStyle, colors } from "../../styles/commonStyles";
import { JobCard } from "../../components/Common/JobCard";
import { Header } from "../../components/Common/Header";
import { mockJobPostings } from "../../utils/mockData";
import { JobPosting } from "../../types/JobPosting/jobPosting";
import { useNavigate } from "react-router";
import { ROUTES } from "../../routes/routePaths";
import { SearchBar } from "../../components/Common/SearchBar";

const HiringManagerDashboardPage = () => {
  const [jobPostings] = useState<JobPosting[]>(mockJobPostings);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

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
    if (!searchTerm.trim()) return jobPostings;

    const searchLower = searchTerm.toLowerCase();
    return jobPostings.filter(
      (job) =>
        job.title.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower)
    );
  }, [jobPostings, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.white }}>
      <Header title="Job Postings" actions={headerActions} />

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
  );
};

export default HiringManagerDashboardPage;
