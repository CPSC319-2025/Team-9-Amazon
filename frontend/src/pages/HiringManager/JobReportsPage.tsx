import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  LinearProgress,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { colors, titleStyle, paperStyle } from '../../styles/commonStyles';
import { Outlet, useNavigate, useParams } from "react-router";
import { ROUTES } from '../../routes/routePaths';
import { apiUrls } from '../../api/apiUrls';

interface ApplicationByMonth {
  month: string;
  applications: number;
  percentage: number;
}

interface JobStatistics {
  applicantsPerMonth: ApplicationByMonth[];
  totalApplicants: number;
  // Uncomment when backend implements these
  // applicationSources: { name: string; value: number }[];
  // skillMatchData: { name: string; score: number }[];
}

export default function JobReportsPage() {
  const navigate = useNavigate();
  const params = useParams();
  const jobPostingId = params.jobPostingId;
  
  const [statistics, setStatistics] = useState<JobStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('fetching statistics for:', jobPostingId);
        const token = localStorage.getItem('token');
        const response = await fetch(
          apiUrls.getJobPostStatistics(jobPostingId!),
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
        setStatistics(data);
      } catch (err) {
        console.error('Error fetching job statistics:', err);
        setError('Failed to load job statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (jobPostingId) {
      fetchStatistics();
    }
  }, [jobPostingId]);

  const handleBack = () => {
    navigate(ROUTES.hiringManager.jobPosting(jobPostingId!));
  };

  // Temp source data until backend implements it
  const sourceData = [
    { name: 'LinkedIn', value: 45, color: colors.orange1 },
    { name: 'Indeed', value: 25, color: colors.blue1 },
    { name: 'Company Site', value: 30, color: colors.gray2 },
  ];

  // Temp skill match data until backend implements it
  const skillMatchData = [
    { name: 'Python', score: 85 },
    { name: 'Java', score: 75 },
    { name: 'React', score: 90 },
    { name: 'SQL', score: 70 },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Outlet />
      <Typography variant="h4" sx={{ ...titleStyle, mb: 3 }}>
        Job Metrics
      </Typography>

      <Grid container spacing={3}>
        {/* Applications Over Time */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ ...paperStyle, bgcolor: colors.gray1 }}>
            <Typography variant="h6" sx={{ ...titleStyle, mb: 3 }}>
              Applications Over Time
            </Typography>
            <Box sx={{ mt: 2 }}>
              {statistics?.applicantsPerMonth.length ? (
                statistics.applicantsPerMonth.map((item, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" sx={{ color: colors.black1 }}>
                        {item.month}
                      </Typography>
                      <Typography variant="body1" sx={{ color: colors.orange1, fontWeight: 500 }}>
                        {item.applications} applications
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={item.percentage} 
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
                ))
              ) : (
                <Typography variant="body1" sx={{ color: colors.black1 + '99', textAlign: 'center', py: 2 }}>
                  No application data available
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Application Sources - Using dummy data until backend implements it */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ ...paperStyle, bgcolor: colors.gray1 }}>
            <Typography variant="h6" sx={{ ...titleStyle, mb: 3 }}>
              Application Sources
            </Typography>
            <Box sx={{ mt: 2 }}>
              {sourceData.map((source, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1" sx={{ color: colors.black1 }}>
                      {source.name}
                    </Typography>
                    <Typography variant="body1" sx={{ color: source.color, fontWeight: 500 }}>
                      {source.value}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={source.value} 
                    sx={{ 
                      height: 8,
                      borderRadius: 4,
                      bgcolor: `${source.color}20`,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: source.color,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Required Skills Match - Using dummy data until backend implements it */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ ...paperStyle, bgcolor: colors.gray1 }}>
            <Typography variant="h6" sx={{ ...titleStyle, mb: 3 }}>
              Required Skills Match
            </Typography>
            <Grid container spacing={2}>
              {skillMatchData.map((skill, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" sx={{ color: colors.black1 }}>
                        {skill.name}
                      </Typography>
                      <Typography variant="body1" sx={{ color: colors.orange1, fontWeight: 500 }}>
                        {skill.score}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={skill.score} 
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
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
