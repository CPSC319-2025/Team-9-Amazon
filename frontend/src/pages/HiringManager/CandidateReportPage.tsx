import React from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Box,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Grid,
  LinearProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// DUmmy data
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
  const { jobId, candidateId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/hiring-manager/job-reports/${jobId}`);
  };

  return (
    <Box>
      <AppBar position="static" color="default">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>
            Candidate Report
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Header Section */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4">{candidateData.name}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {candidateData.role}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h3" color="primary">
                    {candidateData.matchScore}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Match Score
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Candidate Details */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Candidate Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="Email" secondary={candidateData.details.email} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="Phone" secondary={candidateData.details.phone} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="Location" secondary={candidateData.details.location} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Personal Links" 
                    secondary={candidateData.details.personalLinks.map((link, index) => (
                      <Typography key={index} component="div">
                        <a href={link} target="_blank" rel="noopener noreferrer">
                          {link}
                        </a>
                      </Typography>
                    ))}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Keyword Analysis */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Keyword Analysis
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Matched Keywords
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {candidateData.keywords.matched.map((keyword, index) => (
                    <Chip key={index} label={keyword} color="primary" />
                  ))}
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Missing Keywords
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {candidateData.keywords.missing.map((keyword, index) => (
                    <Chip key={index} label={keyword} color="error" />
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Criteria Scores */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Evaluation Criteria
              </Typography>
              <Box sx={{ mt: 2 }}>
                {candidateData.criteria.map((criterion, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{criterion.name}</Typography>
                      <Typography variant="body2">{criterion.score}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={criterion.score} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#1976d2',
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
