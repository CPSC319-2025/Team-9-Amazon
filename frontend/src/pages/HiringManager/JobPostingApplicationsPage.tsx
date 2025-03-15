import {
  Box,
  Container,
  Paper,
  Grid,
  Snackbar,
  Alert,
  Typography,
  CircularProgress,
} from "@mui/material";
import { colors, paperStyle } from "../../styles/commonStyles";
import { ActionButtons } from "../../components/HiringManager/Applicants/ActionButtons";
import { SearchBar } from "../../components/Common/SearchBar";
import { ApplicantList } from "../../components/HiringManager/Applicants/ApplicantList";
import { useState, useMemo } from "react";
import { useParams } from "react-router";
import { useGetApplicationsSummary } from "../../queries/jobPosting";
import { ApplicationSummary } from "../../types/application";

const JobPostingApplicationsPage = () => {
  const { jobPostingId } = useParams<{ jobPostingId: string }>();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAscending, setSortAscending] = useState(false);

  const {
    data: summaryData,
    isLoading,
    error,
  } = useGetApplicationsSummary(jobPostingId || "");

  // Filter and sort applications based on search term and sort direction
  const filteredApplications = useMemo(() => {
    if (!summaryData?.applications) return [];

    let filtered = summaryData.applications.filter((application) => {
      const fullName =
        `${application.applicant.firstName} ${application.applicant.lastName}`.toLowerCase();
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        application.applicant.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    });

    // Sort the filtered applications by score
    return filtered.sort((a: ApplicationSummary, b: ApplicationSummary) => {
      if (sortAscending) {
        return a.score - b.score;
      } else {
        return b.score - a.score;
      }
    });
  }, [summaryData?.applications, searchTerm, sortAscending]);

  const handleScanDatabase = () => {
    // When scanning, only add candidates that aren't already in the applicants list
    // const newCandidates = mockDatabaseCandidates.filter(
    //   (candidate) => !applicants.some((a) => a.email === candidate.email)
    // );
    // setDatabaseCandidates(newCandidates);
    // setScanned(true);
    // setSnackbarMessage("Database scan complete");
    // setSnackbarOpen(true);
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

  const handleViewApplicant = (email: string) => {
    console.log("Viewing applicant:", email);
  };

  const handleAddCandidate = (email: string) => {
    // TODO
    // const candidate = databaseCandidates.find((c) => c.email === email);
    // if (candidate && !applicants.some((a) => a.email === email)) {
    //   setApplicants((prev) => [...prev, candidate]);
    //   setDatabaseCandidates((prev) => prev.filter((c) => c.email !== email));
    //   setSnackbarMessage(
    //     "Candidate was successfully added to the applicants pool"
    //   );
    //   setSnackbarOpen(true);
    // }
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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.white }}>
      <Container maxWidth={false} sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <ActionButtons onScanDatabase={handleScanDatabase} />
          <SearchBar
            placeholder="Search applicants..."
            onSearch={handleSearch}
            onSort={handleSort}
            showSort={hasEvaluatedApplicants}
          />
        </Box>

        <Grid container spacing={4}>
          {/*TODO*/}
          {/*<Grid item xs={12} md={scanned ? 6 : 12}>*/}
          <Grid item xs={12} md={12}>
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
                {summaryData?.totalPossibleScore && (
                  <Typography variant="subtitle1" sx={{ color: colors.gray2 }}>
                    Maximum Possible Score: {summaryData.totalPossibleScore}
                  </Typography>
                )}
              </Box>
              <ApplicantList
                applications={filteredApplications}
                onViewApplicant={handleViewApplicant}
                onAddCandidate={handleAddCandidate}
              />
            </Paper>
          </Grid>

          {/*TODO*/
          /* {scanned && filteredDatabaseCandidates.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  ...paperStyle,
                  border: `2px solid ${colors.blue1}15`,
                }}
              >
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{ mb: 3, color: colors.black1 }}
                >
                  Potential Candidates{" "}
                </Typography>
                <ApplicantList
                  applications={filteredDatabaseCandidates}
                  onViewApplicant={handleViewApplicant}
                  onAddCandidate={handleAddCandidate}
                  showAddButton
                />
              </Paper>
            </Grid>
          )} */}
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
            "& .MuiAlert-icon": {
              color: "white",
            },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JobPostingApplicationsPage;
