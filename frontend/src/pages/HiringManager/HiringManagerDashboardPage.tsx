import { PlusCircle } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Box, Button, Container, Grid, Typography, CircularProgress, Alert } from "@mui/material";
import { textButtonStyle, colors } from "../../styles/commonStyles";
import { JobCard } from "../../components/Common/JobCard";
import { Header } from "../../components/Common/Header";
import { JobPosting } from "../../types/JobPosting/jobPosting";
import { useNavigate } from "react-router";
import { ROUTES } from "../../routes/routePaths";
import { SearchBar } from "../../components/Common/SearchBar";
import { apiUrls } from "../../api/apiUrls";

const HiringManagerDashboardPage = () => {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Fetch job postings from the API
  useEffect(() => {
    const fetchJobPostings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const response = await fetch(
          apiUrls.getAllJobPostings,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setJobPostings(data);
      } catch (err) {
        console.error('Error fetching job postings:', err);
        setError('Failed to load job postings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobPostings();
  }, []);

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
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 3 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : filteredJobPostings.length > 0 ? (
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
