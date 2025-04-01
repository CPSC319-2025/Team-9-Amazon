import React from "react";
import { useParams, useNavigate } from "react-router";
import { ROUTES } from "../../routes/routePaths";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Stack,
  Link,
  CircularProgress,
  Alert,
  Tooltip,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  colors,
  titleStyle,
  paperStyle,
  chipStyle,
  filledButtonStyle,
} from "../../styles/commonStyles";
import { useGetCandidateReport } from "../../queries/jobPosting";
import { FullscreenIcon } from "lucide-react";

export default function CandidateReportPage() {
  const { jobPostingId, candidateEmail } = useParams();
  const navigate = useNavigate();

  const {
    data: candidateData,
    isLoading,
    error,
  } = useGetCandidateReport(jobPostingId!, candidateEmail!);

  const handleBack = () => {
    navigate(ROUTES.hiringManager.applications(jobPostingId!));
  };

  let isPdf = null
  if (candidateData?.resume) {
    isPdf = candidateData?.resume.fileType == 'application/pdf';
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !candidateData) {
    return (
      <Box sx={{ p: 3 }}>
        <IconButton
          onClick={handleBack}
          sx={{
            mr: 2,
            color: colors.orange1,
            "&:hover": {
              bgcolor: `${colors.orange1}10`,
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Alert severity="error" sx={{ mt: 2 }}>
          Error loading candidate report:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton
          onClick={handleBack}
          sx={{
            mr: 2,
            color: colors.orange1,
            "&:hover": {
              bgcolor: `${colors.orange1}10`,
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ ...titleStyle }}>
          Candidate Report
        </Typography>
      </Box>

      <Grid container xs={12} spacing={3}>
        {/* Left Column - Candidate Info */}
        <Grid item xs={12} md={3}>
          <Stack spacing={3}>
            {/* Basic Info Card */}
            <Paper elevation={0} sx={{ ...paperStyle, bgcolor: colors.gray1 }}>
              <Typography variant="h5" sx={{ ...titleStyle, mb: 2 }}>
                {candidateData.name}
              </Typography>
              <Typography variant="body1" sx={{ color: colors.gray2, mb: 1 }}>
                {candidateData.role}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ color: colors.gray2, mb: 0.5 }}
                >
                  Match Score
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box sx={{ flexGrow: 1, mr: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={candidateData.matchScore}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: `${colors.orange1}20`,
                        "& .MuiLinearProgress-bar": {
                          bgcolor: colors.orange1,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ color: colors.orange1, fontWeight: 500 }}
                  >
                    {candidateData.matchScore}%
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Contact Info Card */}
            <Paper elevation={0} sx={{ ...paperStyle, bgcolor: colors.gray1 }}>
              <Typography variant="h6" sx={{ ...titleStyle, mb: 2 }}>
                Contact Information
              </Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemText
                    primary="Email"
                    secondary={candidateData.details.email}
                    primaryTypographyProps={{
                      variant: "body2",
                      sx: { color: colors.gray2 },
                    }}
                    secondaryTypographyProps={{
                      variant: "body1",
                      sx: { color: colors.black1 },
                    }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemText
                    primary="Phone"
                    secondary={candidateData.details.phone}
                    primaryTypographyProps={{
                      variant: "body2",
                      sx: { color: colors.gray2 },
                    }}
                    secondaryTypographyProps={{
                      variant: "body1",
                      sx: { color: colors.black1 },
                    }}
                  />
                </ListItem>
              </List>
              {candidateData.details.personalLinks.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="body2"
                    sx={{ color: colors.gray2, mb: 1 }}
                  >
                    Personal Links
                  </Typography>
                  {candidateData.details.personalLinks.map((link, index) => (
                    <Link
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: colors.blue1,
                        display: "block",
                        mb: 0.5,
                        "&:hover": {
                          color: colors.orange1,
                        },
                      }}
                    >
                      {link}
                    </Link>
                  ))}
                </>
              )}
            </Paper>
          </Stack>
        </Grid>

        {/* Middle Column - Evaluation */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Evaluation Criteria */}
            <Paper elevation={0} sx={{ ...paperStyle, bgcolor: colors.gray1 }}>
              <Typography variant="h6" sx={{ ...titleStyle, mb: 3 }}>
                Evaluation Criteria
              </Typography>
              <Grid container spacing={2}>
                {candidateData.criteria.map((criterion, index) => (
                  <Grid item xs={12} key={index}>
                    <Box sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ color: colors.black1 }}
                        >
                          {criterion.name}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ color: colors.orange1, fontWeight: 500 }}
                        >
                          {criterion.score}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={criterion.score}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: `${colors.orange1}20`,
                          "& .MuiLinearProgress-bar": {
                            bgcolor: colors.orange1,
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Rules Analysis */}
            <Paper elevation={0} sx={{ ...paperStyle, bgcolor: colors.gray1 }}>
              <Typography variant="h6" sx={{ ...titleStyle, mb: 3 }}>
                Rules Analysis
              </Typography>
              <Box>
                <Typography variant="body2" sx={{ color: colors.gray2, mb: 1 }}>
                  Matched Rules
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                  {candidateData.rules.matched.map((rule, index) => (
                    <Chip
                      key={index}
                      label={rule}
                      sx={{
                        bgcolor: `${colors.orange1}20`,
                        color: colors.orange1,
                        fontWeight: 500,
                      }}
                    />
                  ))}
                </Box>
                <Typography variant="body2" sx={{ color: colors.gray2, mb: 1 }}>
                  Missing Rules
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {candidateData.rules.missing.map((rule, index) => (
                    <Chip key={index} label={rule} sx={{ ...chipStyle }} />
                  ))}
                </Box>
              </Box>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Column - Resume */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              ...paperStyle,
              bgcolor: colors.gray1,
              height: "100%",
              minHeight: "600px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                // Add a fixed height to ensure consistent alignment
                height: "40px",
                // Ensure there's no internal padding affecting alignment
                padding: 0,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  ...titleStyle,
                  // Remove any margins that might affect alignment
                  m: 0,
                  // Ensure the text is vertically centered
                  lineHeight: "40px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Resume Preview
              </Typography>
              {candidateData.resume && (
                isPdf ? (
                  <Tooltip title="View in fullscreen">
                    <IconButton
                      onClick={() => {
                        const iframe = document.getElementById(
                          "resume-preview-iframe"
                        );
                        if (iframe && iframe.requestFullscreen) {
                          iframe.requestFullscreen();
                        }
                      }}
                      sx={{
                        color: colors.blue1,
                        "&:hover": {
                          bgcolor: `${colors.blue1}10`,
                        },
                        m: 0,
                        padding: "8px",
                        height: "40px",
                        width: "40px",
                      }}
                      aria-label="Fullscreen"
                    >
                      <FullscreenIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Button
                    variant="contained"
                    sx={{
                      ...filledButtonStyle,
                      backgroundColor: colors.orange1,
                      color: colors.black1,
                    }}
                    onClick={()=>{window.location.href = candidateData.resume.url}}
                  >
                    Download Resume
                  </Button>
                )
              )}
            </Box>
            {candidateData?.resume ? (
              <Box
                sx={{
                  flexGrow: 1,
                  bgcolor: colors.white,
                  borderRadius: 1,
                  p: 2,
                  overflowY: "auto",
                }}
              >
                {isPdf ? 
                  <iframe
                    id="resume-preview-iframe"
                    src={candidateData?.resume.url}
                    title="Resume Preview"
                    width="100%"
                    height="100%"
                    style={{
                      border: "none",
                      flexGrow: 1,
                      minHeight: "550px",
                      borderRadius: "4px",
                    }}
                    allowFullScreen
                  />
                  :
                  <Alert severity="error">
                    Can not display Word docs. Please convert to .pdf to see here or download the file
                  </Alert>
                
                }
              </Box>
            ) : (
              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  bgcolor: colors.white,
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <Typography variant="body1" sx={{ color: colors.gray2 }}>
                  No resume available for preview
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
