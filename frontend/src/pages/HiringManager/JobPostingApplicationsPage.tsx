import { Box, Container, Paper, Grid, Snackbar, Alert } from "@mui/material";
import { colors, paperStyle } from "../../styles/commonStyles";
// import { Header } from "../../components/Common/Header";
import { ActionButtons } from "../../components/HiringManager/Applicants/ActionButtons";
import { SearchBar } from "../../components/Common/SearchBar";
import { ApplicantList } from "../../components/HiringManager/Applicants/ApplicantList";
import { useState } from "react";
import { Applicant } from "../../types/applicant";
import { mockApplicants, mockDatabaseCandidates } from "../../utils/mockData";

const JobPostingApplicationsPage = () => {
  const [applicants, setApplicants] = useState<Applicant[]>(mockApplicants);
  const [databaseCandidates, setDatabaseCandidates] = useState<Applicant[]>([]);
  const [scanned, setScanned] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleEvaluateAll = () => {
    const evaluatedApplicants = applicants.map((applicant) => ({
      ...applicant,
      score: Math.floor(Math.random() * 31) + 150,
      total_score: 180,
    }));
    setApplicants(evaluatedApplicants);
    setSnackbarMessage("All applicants have been evaluated");
    setSnackbarOpen(true);
  };

  const handleScanDatabase = () => {
    setDatabaseCandidates(mockDatabaseCandidates);
    setScanned(true);
    setSnackbarMessage("Database scan complete");
    setSnackbarOpen(true);
  };

  const handleSearch = (value: string) => {
    console.log("Searching:", value);
  };

  const handleFilter = () => {
    console.log("Opening filter dialog");
  };

  const handleViewApplicant = (email: string) => {
    console.log("Viewing applicant:", email);
  };

  const handleAddCandidate = (email: string) => {
    const candidate = databaseCandidates.find((c) => c.email === email);
    if (candidate && !applicants.some((a) => a.email === email)) {
      setApplicants((prev) => [...prev, candidate]);
      setDatabaseCandidates((prev) => prev.filter((c) => c.email !== email));
      setSnackbarMessage(
        "Candidate was successfully added to the applicants pool"
      );
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.white }}>
      {/* <Header
        title="ML Compiler Software Engineer"
        subtitle={`${applicants.length} applications${
          scanned
            ? ` • ${databaseCandidates.length} potential candidates found`
            : ""
        }`}
      /> */}

      <Container maxWidth={false} sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <ActionButtons
            onEvaluateAll={handleEvaluateAll}
            onScanDatabase={handleScanDatabase}
          />
          <SearchBar
            placeholder="Search applicants..."
            onSearch={handleSearch}
            onFilter={handleFilter}
          />
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={scanned ? 6 : 12}>
            <Paper elevation={0} sx={paperStyle}>
              <h2 className="text-xl font-semibold mb-3 text-gray-900">
                Applications
              </h2>
              <ApplicantList
                applicants={applicants}
                onViewApplicant={handleViewApplicant}
              />
            </Paper>
          </Grid>

          {scanned && databaseCandidates.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  ...paperStyle,
                  border: `2px solid ${colors.blue1}15`,
                }}
              >
                <h2 className="text-xl font-semibold mb-3 text-blue-600">
                  Potential Candidates
                </h2>
                <ApplicantList
                  applicants={databaseCandidates}
                  onViewApplicant={handleViewApplicant}
                  onAddCandidate={handleAddCandidate}
                  showAddButton
                />
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
