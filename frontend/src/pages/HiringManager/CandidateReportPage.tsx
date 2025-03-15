import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ROUTES } from '../../routes/routePaths';
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
  Button,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { colors, titleStyle, paperStyle, chipStyle } from '../../styles/commonStyles';
import { apiUrls } from '../../api/apiUrls';

interface CandidateDetails {
  applicant: {
    id: number;
    firstName: string;
    lastName: string;
    role: string;
    matchScore: number;
    details: {
      email: string;
      phone: string;
      personalLinks: string[];
    };
  };
  application: {
    id: number;
    resumePath: string;
    createdAt: string;
  };
  keywords: {
    matched: string[];
    missing: string[];
  };
  criteria: {
    id: number;
    name: string;
    score: number;
  }[];
}

export default function CandidateReportPage() {
  const navigate = useNavigate();
  const { jobPostingId, applicantEmail } = useParams();
  
  const [candidateData, setCandidateData] = useState<CandidateDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidateData = async () => {
      if (!jobPostingId || !applicantEmail) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const response = await fetch(
          apiUrls.getApplicantDetailsByEmail(decodeURIComponent(applicantEmail), jobPostingId),
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
        setCandidateData(data);
      } catch (err) {
        console.error('Error fetching candidate data:', err);
        setError('Failed to load candidate data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, [jobPostingId, applicantEmail]);

  const handleBack = () => {
    navigate(ROUTES.hiringManager.applications(jobPostingId!));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={handleBack}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!candidateData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No data available for this candidate.</Alert>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={handleBack}>
          Go Back
        </Button>
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

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Basic Info Card */}
            <Paper elevation={0} sx={{ ...paperStyle, bgcolor: colors.gray1 }}>
              <Typography variant="h5" sx={{ ...titleStyle, mb: 2 }}>
                {candidateData.applicant.firstName} {candidateData.applicant.lastName}
              </Typography>
              <Typography variant="body1" sx={{ color: colors.gray2, mb: 1 }}>
                {candidateData.applicant.role}
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
                      value={candidateData.applicant.matchScore}
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
                  <Typography variant="body1" sx={{ color: colors.orange1, fontWeight: 500 }}>
                    {candidateData.applicant.matchScore}%
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
                    secondary={candidateData.applicant.details.email}
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      sx: { color: colors.gray2 }
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
                    secondary={candidateData.applicant.details.phone}
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      sx: { color: colors.gray2 }
                    }}
                    secondaryTypographyProps={{
                      variant: "body1",
                      sx: { color: colors.black1 },
                    }}
                  />
                </ListItem>
              </List>
              {candidateData.applicant.details.personalLinks && candidateData.applicant.details.personalLinks.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="body2"
                    sx={{ color: colors.gray2, mb: 1 }}
                  >
                    Personal Links
                  </Typography>
                  {candidateData.applicant.details.personalLinks.map((link, index) => (
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

            {/* Keywords Analysis */}
            <Paper elevation={0} sx={{ ...paperStyle, bgcolor: colors.gray1 }}>
              <Typography variant="h6" sx={{ ...titleStyle, mb: 3 }}>
                Keywords Analysis
              </Typography>
              <Box>
                <Typography variant="body2" sx={{ color: colors.gray2, mb: 1 }}>
                  Matched Keywords
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                  {candidateData.keywords.matched.map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword}
                      sx={{ ...chipStyle, bgcolor: `${colors.green1}20`, color: colors.green1, mb: 1 }}
                    />
                  ))}
                </Stack>
                <Typography variant="body2" sx={{ color: colors.gray2, mb: 1 }}>
                  Missing Keywords
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {candidateData.keywords.missing.map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword}
                      sx={{ ...chipStyle, bgcolor: `${colors.red1}20`, color: colors.red1, mb: 1 }}
                    />
                  ))}
                </Stack>
              </Box>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Criteria Scores */}
            <Paper elevation={0} sx={{ ...paperStyle, bgcolor: colors.gray1 }}>
              <Typography variant="h6" sx={{ ...titleStyle, mb: 3 }}>
                Evaluation Criteria
              </Typography>
              <Grid container spacing={2}>
                {candidateData.criteria.map((criterion, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1" sx={{ color: colors.black1 }}>
                          {criterion.name}
                        </Typography>
                        <Typography variant="body1" sx={{ color: colors.orange1, fontWeight: 500 }}>
                          {criterion.score}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={criterion.score}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: `${colors.orange1}20`,
                          "& .MuiLinearProgress-bar": {
                            bgcolor: colors.orange1,
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Resume Viewer */}
            <Paper elevation={0} sx={{ ...paperStyle, bgcolor: colors.gray1, minHeight: '600px' }}>
              <Typography variant="h6" sx={{ ...titleStyle, mb: 3 }}>
                Resume
              </Typography>
              <Box 
                sx={{ 
                  width: '100%',
                  height: '550px',
                  bgcolor: colors.white,
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: `1px dashed ${colors.gray2}`
                }}
              >
                <Typography variant="body1" sx={{ color: colors.gray2 }}>
                  Resume viewer will be integrated here
                </Typography>
              </Box>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
