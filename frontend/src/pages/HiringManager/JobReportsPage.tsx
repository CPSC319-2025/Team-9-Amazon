import React from 'react';
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
import { Outlet, useParams } from "react-router";
import { useGetJobReports } from '../../queries/jobPosting';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function JobReportsPage() {
  const params = useParams();
  const jobPostingId = params.jobPostingId;

  const { data, isLoading, error } = useGetJobReports(jobPostingId!);

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading job reports: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Box>
    );
  }

  // Use the data from API or fallback to empty arrays
  const applicationData = data?.applicationData || [];
  const sourceData = data?.sourceData || [];
  const skillMatchData = data?.criteriaMatchStats || [];

  return (
    <Box sx={{ p: 3 }}>
      <Outlet />
      <Typography variant="h4" sx={{ ...titleStyle, mb: 3 }}>
        Job Metrics
      </Typography>

      <Grid container spacing={3}>
        {/* Applications Over Time - Now a Line Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ ...paperStyle, bgcolor: colors.gray1 }}>
            <Typography variant="h6" sx={{ ...titleStyle, mb: 3 }}>
              Applications Over Time
            </Typography>
            <Box sx={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <LineChart
                  data={applicationData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} applications`, 'Applications']}
                    labelStyle={{ color: colors.black1 }}
                    contentStyle={{ 
                      backgroundColor: colors.white,
                      borderColor: colors.gray2,
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="applications" 
                    stroke={colors.orange1} 
                    strokeWidth={2}
                    dot={{ r: 4, fill: colors.orange1, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: colors.orange1, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Application Sources */}
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

        {/* Required Skills Match */}
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
                        {skill.percentage}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={skill.percentage} 
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