import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  LinearProgress,
  Grid,
} from '@mui/material';
import { colors } from '../../styles/commonStyles';

// Dummy data (metrics)
const applicationData = [
  { month: 'Jan', applications: 40, percentage: 40 },
  { month: 'Feb', applications: 30, percentage: 30 },
  { month: 'Mar', applications: 45, percentage: 45 },
  { month: 'Apr', applications: 55, percentage: 55 },
];

const sourceData = [
  { name: 'LinkedIn', value: 45, color: colors.orange1 },
  { name: 'Indeed', value: 25, color: colors.blue1 },
  { name: 'Company Site', value: 30, color: colors.gray2 },
];

const skillMatchData = [
  { name: 'Python', score: 85 },
  { name: 'Java', score: 75 },
  { name: 'React', score: 90 },
  { name: 'SQL', score: 70 },
];

export default function JobReportsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ color: colors.black1, mb: 3, fontWeight: 500 }}>
        Job Metrics
      </Typography>

      <Grid container spacing={3}>
        {/* Applications Over Time */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: colors.gray1, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: colors.black1, mb: 3, fontWeight: 500 }}>
              Applications Over Time
            </Typography>
            <Box sx={{ mt: 2 }}>
              {applicationData.map((item, index) => (
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
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Application Sources */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: colors.gray1, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: colors.black1, mb: 3, fontWeight: 500 }}>
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
          <Paper elevation={0} sx={{ p: 3, bgcolor: colors.gray1, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: colors.black1, mb: 3, fontWeight: 500 }}>
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
