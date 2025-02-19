import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { 
  Box, 
  Tab, 
  Tabs, 
  AppBar, 
  Typography, 
  Paper,
  LinearProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  IconButton,
  Toolbar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Dummy data (metrics)
const applicationData = [
  { month: 'Jan', applications: 40, percentage: 40 },
  { month: 'Feb', applications: 30, percentage: 30 },
  { month: 'Mar', applications: 45, percentage: 45 },
  { month: 'Apr', applications: 55, percentage: 55 },
];

const sourceData = [
  { name: 'LinkedIn', value: 45, color: '#1976d2' },
  { name: 'Indeed', value: 25, color: '#2196f3' },
  { name: 'Company Site', value: 30, color: '#64b5f6' },
];

const skillMatchData = [
  { name: 'Python', score: 85 },
  { name: 'Java', score: 75 },
  { name: 'React', score: 90 },
  { name: 'SQL', score: 70 },
];

// Dummy data (candidate ranking)
const candidateRankings = [
  { id: 1, name: 'John Doe', score: 92, skills: ['React', 'Node.js', 'Python'] },
  { id: 2, name: 'Jane Smith', score: 88, skills: ['Java', 'Spring', 'SQL'] },
  { id: 3, name: 'Mike Johnson', score: 85, skills: ['Angular', 'TypeScript', 'MongoDB'] },
  { id: 4, name: 'Sarah Wilson', score: 82, skills: ['React', 'JavaScript', 'AWS'] },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function JobReportsPage() {
  const [value, setValue] = useState(0);
  const navigate = useNavigate();
  const { jobId } = useParams();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleBack = () => {
    navigate('/hiring-manager');
  };

  const handleCandidateClick = (candidateId: number) => {
    navigate(`/hiring-manager/job-reports/${jobId}/candidate/${candidateId}`);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <AppBar position="static" color="default">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ ml: 4, flex: 1 }}
          >
            <Tab label="Metrics" />
            <Tab label="Candidate Ranking" />
          </Tabs>
        </Toolbar>
      </AppBar>

      <TabPanel value={value} index={0}>
        <Grid container spacing={3}>
          {/* Applications Over Time */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Applications Over Time
              </Typography>
              <Box sx={{ mt: 2 }}>
                {applicationData.map((item, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{item.month}</Typography>
                      <Typography variant="body2">{item.applications} applications</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={item.percentage} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Application Sources */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Application Sources
              </Typography>
              <Box sx={{ mt: 2 }}>
                {sourceData.map((source, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{source.name}</Typography>
                      <Typography variant="body2">{source.value}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={source.value} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        backgroundColor: `${source.color}40`,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: source.color,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Skill Match Distribution */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Skill Match Distribution
              </Typography>
              <Box sx={{ mt: 2 }}>
                {skillMatchData.map((skill, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{skill.name}</Typography>
                      <Typography variant="body2">{skill.score}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={skill.score} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#4caf50',
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Paper elevation={3}>
          <List>
            {candidateRankings.map((candidate, index) => (
              <React.Fragment key={candidate.id}>
                <ListItem>
                  <Card sx={{ width: '100%' }}>
                    <CardContent sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      '&:last-child': { pb: 2 }
                    }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="h6">
                              {index + 1}. {candidate.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Skills: {candidate.skills.join(', ')}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right', mr: 2 }}>
                            <Typography variant="h4" color="primary">
                              {candidate.score}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Match Score
                            </Typography>
                          </Box>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={candidate.score} 
                          sx={{ 
                            mt: 2,
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#1976d2',
                            },
                          }}
                        />
                      </Box>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleCandidateClick(candidate.id)}
                        sx={{ ml: 2 }}
                      >
                        <ArrowForwardIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                </ListItem>
                {index < candidateRankings.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </TabPanel>
    </Box>
  );
}
