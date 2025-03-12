import React from 'react';
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { colors, titleStyle, paperStyle, chipStyle } from '../../styles/commonStyles';

// Dummy data
const candidateData = {
  name: 'Robbie Laughlen',
  role: 'SDE1 Intern',
  matchScore: 92,
  details: {
    email: 'robbie@laughlen.com',
    phone: '333-333-3333',
    location: 'Vancouver',
    personalLinks: ['https://www.linkedin.com/in/robbielaughlen/']
  },
  keywords: {
    matched: ['NodeJS', 'React', 'Docker'],
    missing: ['MongoDB']
  },
  criteria: [
    { name: 'Technical Skills', score: 95 },
    { name: 'Experience', score: 88 },
    { name: 'Education', score: 90 },
    { name: 'Cultural Fit', score: 85 }
  ]
};

export default function CandidateReportPage() {
  const { jobPostingId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(ROUTES.hiringManager.applications(jobPostingId!));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={handleBack}
          sx={{ 
            mr: 2,
            color: colors.orange1,
            '&:hover': {
              bgcolor: `${colors.orange1}10`
            }
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
                {candidateData.name}
              </Typography>
              <Typography variant="body1" sx={{ color: colors.gray2, mb: 1 }}>
                {candidateData.role}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: colors.gray2, mb: 0.5 }}>
                  Match Score
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1, mr: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={candidateData.matchScore}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: `${colors.orange1}20`,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: colors.orange1,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="body1" sx={{ color: colors.orange1, fontWeight: 500 }}>
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
                      variant: 'body2',
                      sx: { color: colors.gray2 }
                    }}
                    secondaryTypographyProps={{
                      variant: 'body1',
                      sx: { color: colors.black1 }
                    }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemText
                    primary="Phone"
                    secondary={candidateData.details.phone}
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      sx: { color: colors.gray2 }
                    }}
                    secondaryTypographyProps={{
                      variant: 'body1',
                      sx: { color: colors.black1 }
                    }}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText
                    primary="Location"
                    secondary={candidateData.details.location}
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      sx: { color: colors.gray2 }
                    }}
                    secondaryTypographyProps={{
                      variant: 'body1',
                      sx: { color: colors.black1 }
                    }}
                  />
                </ListItem>
              </List>
              {candidateData.details.personalLinks.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" sx={{ color: colors.gray2, mb: 1 }}>
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
                        display: 'block',
                        mb: 0.5,
                        '&:hover': {
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
            {/* Evaluation Criteria */}
            <Paper elevation={0} sx={{ ...paperStyle, bgcolor: colors.gray1 }}>
              <Typography variant="h6" sx={{ ...titleStyle, mb: 3 }}>
                Evaluation Criteria
              </Typography>
              <Grid container spacing={2}>
                {candidateData.criteria.map((criterion, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: colors.gray2 }}>
                          {criterion.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.orange1 }}>
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
                          '& .MuiLinearProgress-bar': {
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
