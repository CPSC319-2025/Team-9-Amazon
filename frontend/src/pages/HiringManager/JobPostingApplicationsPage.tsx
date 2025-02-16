import {
  Typography,
  Box,
  Container,
  Paper,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import { colors } from "../../styles/commonStyles";
import {
  ActionButtons,
  SearchBar,
  ApplicantList,
} from "../../components/HiringManagerComponents";
import { useState } from "react";
import { Applicant } from "../../types/applicant";

const mockApplicants = [
  {
    email: "alice@example.com",
    first_name: "Alice",
    last_name: "Johnson",
  },
  {
    email: "bob@example.com",
    first_name: "Bob",
    last_name: "Smith",
  },
  {
    email: "carol@example.com",
    first_name: "Carol",
    last_name: "White",
  },
  {
    email: "david@example.com",
    first_name: "David",
    last_name: "Brown",
  },
  {
    email: "eva@example.com",
    first_name: "Eva",
    last_name: "Martinez",
  },
];

const mockDatabaseCandidates = [
  {
    email: "jane@example.com",
    first_name: "Jane",
    last_name: "Wilson",
    score: 175,
    total_score: 180,
  },
  {
    email: "michael@example.com",
    first_name: "Michael",
    last_name: "Chen",
    score: 168,
    total_score: 180,
  },
  {
    email: "sarah@example.com",
    first_name: "Sarah",
    last_name: "Davis",
    score: 172,
    total_score: 180,
  },
];

const JobPostingApplicationsPage = () => {
  const [applicants, setApplicants] = useState<Applicant[]>(mockApplicants);
  const [databaseCandidates, setDatabaseCandidates] = useState<Applicant[]>([]);
  const [scanned, setScanned] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleEvaluateAll = () => {
    const evaluatedApplicants = applicants.map((applicant) => ({
      ...applicant,
      score: Math.floor(Math.random() * 31) + 150, // Random score between 150-180
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
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: colors.gray1,
          px: 4,
          py: 3,
          borderRadius: "0 0 12px 12px",
        }}
      >
        <Box sx={{ maxWidth: 800 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ color: colors.black1, fontWeight: 600, mb: 1 }}
          >
            ML Compiler Software Engineer
          </Typography>
          <Typography variant="body1" sx={{ color: colors.black1 }}>
            {applicants.length} applications
            {scanned &&
              ` • ${databaseCandidates.length} potential candidates found`}
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxWidth={false} sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <ActionButtons
            onEvaluateAll={handleEvaluateAll}
            onScanDatabase={handleScanDatabase}
          />
          <SearchBar onSearch={handleSearch} onFilter={handleFilter} />
        </Box>

        <Grid container spacing={4}>
          {/* Current Applications */}
          <Grid item xs={12} md={scanned ? 6 : 12}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                bgcolor: colors.white,
                borderRadius: 2,
                height: "100%",
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                sx={{ mb: 3, fontWeight: 600, color: colors.black1 }}
              >
                Applications
              </Typography>

              <ApplicantList
                applicants={applicants}
                onViewApplicant={handleViewApplicant}
              />
            </Paper>
          </Grid>

          {/* Database Candidates */}
          {scanned && databaseCandidates.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  bgcolor: colors.white,
                  borderRadius: 2,
                  height: "100%",
                  border: `2px solid ${colors.blue1}15`,
                }}
              >
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{ mb: 3, fontWeight: 600, color: colors.blue1 }}
                >
                  Potential Candidates
                </Typography>
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
