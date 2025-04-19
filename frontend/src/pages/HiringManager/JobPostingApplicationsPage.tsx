import {
  Box,
  Container,
  Paper,
  Grid,
  Snackbar,
  Alert,
  Typography,
  CircularProgress,
  Button,
  DialogActions,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { colors, paperStyle } from "../../styles/commonStyles";
import { ActionButtons } from "../../components/HiringManager/Applicants/ActionButtons";
import { SearchBar } from "../../components/Common/SearchBar";
import { ApplicantList } from "../../components/HiringManager/Applicants/ApplicantList";
import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import {
  useGetApplicationsSummary,
  useGetPotentialCandidates,
} from "../../queries/jobPosting";
import { ApplicationSummary } from "../../types/application";
import { ROUTES } from "../../routes/routePaths";

const JobPostingApplicationsPage = () => {
  const { jobPostingId } = useParams<{ jobPostingId: string }>();
  const location = useLocation();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAscending, setSortAscending] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  const {
    data: summaryData,
    isLoading,
    error,
    refetch: refetchApplications,
  } = useGetApplicationsSummary(jobPostingId || "");

  const {
    data: potentialCandidatesData,
    error: scanError,
    refetch: fetchPotentialCandidates,
  } = useGetPotentialCandidates(jobPostingId || "");

  // Store potential candidates separately
  const [potentialCandidates, setPotentialCandidates] = useState<
    ApplicationSummary[]
  >([]);

  // Refetch data when the applications tab is clicked
  useEffect(() => {
    if (location.pathname.endsWith("/applications")) {
      refetchApplications();
    }
  }, [location.pathname, refetchApplications]);

  // Filter and sort applications based on search term and sort direction
  const filteredApplications = useMemo(() => {
    if (!summaryData?.applications) return [];

    const filtered = summaryData.applications.filter((application) => {
      const fullName =
        `${application.applicant.firstName} ${application.applicant.lastName}`.toLowerCase();
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        application.applicant.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    });

    return filtered.sort((a: ApplicationSummary, b: ApplicationSummary) => {
      return sortAscending ? a.score - b.score : b.score - a.score;
    });
  }, [summaryData?.applications, searchTerm, sortAscending]);

  // Filter and sort potential candidates
  const filteredPotentialCandidates = useMemo(() => {
    if (!potentialCandidates) return [];

    return potentialCandidates
      .filter((candidate) => {
        const fullName =
          `${candidate.applicant.firstName} ${candidate.applicant.lastName}`.toLowerCase();
        return (
          fullName.includes(searchTerm.toLowerCase()) ||
          candidate.applicant.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      })
      .sort((a, b) => (sortAscending ? a.score - b.score : b.score - a.score));
  }, [potentialCandidates, searchTerm, sortAscending]);

  // Handle scanning database for candidates
  const handleScanDatabase = async () => {
    setIsScanning(true);
    setScanned(true);
    setSnackbarMessage(
      "Scanning database for potential candidates... Please keep the page open."
    );
    setSnackbarOpen(true);

    try {
      const result = await fetchPotentialCandidates();
      if (result?.data?.applications) {
        setPotentialCandidates(result.data.applications);
        setSnackbarMessage(
          "Database scan complete. Potential candidates found."
        );
      } else {
        setSnackbarMessage("No potential candidates found.");
      }
    } catch (error) {
      setSnackbarMessage("Error scanning database.");
    } finally {
      setIsScanning(false);
      setSnackbarOpen(true);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSort = () => {
    setSortAscending(!sortAscending);
    setSnackbarMessage(
      `Sorted by score ${sortAscending ? "ascending" : "descending"}`
    );
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="error">
          Error loading applications. Please try again later.
        </Typography>
      </Box>
    );
  }

  const hasEvaluatedApplicants = summaryData?.applications.some(
    (app) => app.score !== undefined
  );

  // Check if the maximum score is zero
  const hasZeroMaxScore = summaryData?.totalPossibleScore === 0;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.white }}>
      <Container maxWidth={false} sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <ActionButtons
            onScanDatabase={handleScanDatabase}
            isScanning={isScanning}
          />
          <SearchBar
            placeholder="Search applicants..."
            onSearch={handleSearch}
            onSort={handleSort}
            showSort={hasEvaluatedApplicants}
          />
        </Box>

        {/* No Scoring Criteria Alert */}
        {hasZeroMaxScore && (
          <Alert
            severity="info"
            sx={{
              mb: 4,
              bgcolor: `${colors.blue1}15`,
              color: colors.blue1,
              "& .MuiAlert-icon": { color: colors.blue1 },
            }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() =>
                  navigate(
                    ROUTES.hiringManager.evaluationMetrics(jobPostingId || "")
                  )
                }
              >
                Add Criteria
              </Button>
            }
          >
            No scoring criteria have been set up for this job posting. Add
            evaluation criteria to start scoring applicants.
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={scanned ? 6 : 12}>
            <Paper elevation={0} sx={paperStyle}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{ mb: 3, color: colors.black1 }}
                >
                  Applications ({summaryData?.totalApplications || 0})
                </Typography>
                {summaryData?.totalPossibleScore !== undefined && (
                  <Typography variant="subtitle1" sx={{ color: colors.gray2 }}>
                    {summaryData.totalPossibleScore > 0
                      ? `Maximum Possible Score: ${summaryData.totalPossibleScore}`
                      : "No scoring criteria available"}
                  </Typography>
                )}
              </Box>
              <ApplicantList applications={filteredApplications} isPotentialList={false}/>
            </Paper>
          </Grid>

          {/* Potential Candidates Section */}
          {scanned && (
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{ ...paperStyle, border: `2px solid ${colors.blue1}15` }}
              >
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{ mb: 3, color: colors.black1 }}
                >
                  Top 10 Potential Candidates
                </Typography>
                {isScanning ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      py: 4,
                    }}
                  >
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography variant="body1" sx={{ color: colors.gray2 }}>
                      Scanning database for potential candidates...
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: colors.gray2, mt: 1 }}
                    >
                      This may take a few minutes. During this time, please keep
                      the page open.
                    </Typography>
                  </Box>
                ) : scanError ? (
                  <Typography color="error">
                    Error fetching candidates.
                  </Typography>
                ) : filteredPotentialCandidates.length > 0 ? (
                  <ApplicantList applications={filteredPotentialCandidates} isPotentialList={true}/>
                ) : (
                  <Typography variant="subtitle1" sx={{ color: colors.gray2 }}>
                    No potential candidates found
                  </Typography>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ top: "24px" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{
            width: "100%",
            bgcolor: colors.blue1,
            color: "white",
            "& .MuiAlert-icon": { color: "white" },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JobPostingApplicationsPage;
