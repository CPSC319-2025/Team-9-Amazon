import {
  Box,
  Container,
  Paper,
  Grid,
  Snackbar,
  Alert,
  Typography,
} from "@mui/material";
import { colors, paperStyle } from "../../styles/commonStyles";
import { ActionButtons } from "../../components/HiringManager/Applicants/ActionButtons";
import { SearchBar } from "../../components/Common/SearchBar";
import { ApplicantList } from "../../components/HiringManager/Applicants/ApplicantList";
import { useState, useMemo } from "react";
import { Applicant } from "../../types/applicant";
import { mockApplicants, mockDatabaseCandidates } from "../../utils/mockData";

const JobPostingApplicationsPage = () => {
  const [applicants, setApplicants] = useState<Applicant[]>(mockApplicants);
  const [databaseCandidates, setDatabaseCandidates] = useState<Applicant[]>([]);
  const [scanned, setScanned] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAscending, setSortAscending] = useState(false);

  // Check if applicants have been evaluated
  const hasEvaluatedApplicants = useMemo(() => {
    return applicants.some((applicant) => applicant.score !== undefined);
  }, [applicants]);

  // Filter applicants based on search term
  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      const fullName =
        `${applicant.first_name} ${applicant.last_name}`.toLowerCase();
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [applicants, searchTerm]);

  // Filter database candidates based on search term and existing applicants
  const filteredDatabaseCandidates = useMemo(() => {
    return databaseCandidates.filter((candidate) => {
      // First filter out candidates that are already in applicants list
      const isNotInApplicants = !applicants.some(
        (a) => a.email === candidate.email
      );
      if (!isNotInApplicants) return false;

      // Then apply search term filter
      const fullName =
        `${candidate.first_name} ${candidate.last_name}`.toLowerCase();
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [databaseCandidates, applicants, searchTerm]);

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
    // When scanning, only add candidates that aren't already in the applicants list
    const newCandidates = mockDatabaseCandidates.filter(
      (candidate) => !applicants.some((a) => a.email === candidate.email)
    );
    setDatabaseCandidates(newCandidates);
    setScanned(true);
    setSnackbarMessage("Database scan complete");
    setSnackbarOpen(true);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSort = () => {
    const sortFn = (a: Applicant, b: Applicant) => {
      // Handle cases where score might be undefined
      const scoreA = a.score ?? -1;
      const scoreB = b.score ?? -1;

      if (sortAscending) {
        return scoreA - scoreB;
      } else {
        return scoreB - scoreA;
      }
    };

    setApplicants([...applicants].sort(sortFn));
    setDatabaseCandidates([...databaseCandidates].sort(sortFn));
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
      <Container maxWidth={false} sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <ActionButtons
            onEvaluateAll={handleEvaluateAll}
            onScanDatabase={handleScanDatabase}
          />
          <SearchBar
            placeholder="Search applicants..."
            onSearch={handleSearch}
            onSort={handleSort}
            showSort={hasEvaluatedApplicants}
          />
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={scanned ? 6 : 12}>
            <Paper elevation={0} sx={paperStyle}>
              <Typography variant="h4"> Applications </Typography>
              <ApplicantList
                applicants={filteredApplicants}
                onViewApplicant={handleViewApplicant}
              />
            </Paper>
          </Grid>

          {scanned && filteredDatabaseCandidates.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  ...paperStyle,
                  border: `2px solid ${colors.blue1}15`,
                }}
              >
                <Typography variant="h4">Potential Candidates </Typography>
                <ApplicantList
                  applicants={filteredDatabaseCandidates}
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
