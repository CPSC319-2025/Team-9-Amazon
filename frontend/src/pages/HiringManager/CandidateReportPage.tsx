import React, { useState, useEffect } from "react";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Snackbar,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonIcon from "@mui/icons-material/Person";
import AssessmentIcon from "@mui/icons-material/Assessment";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import DescriptionIcon from "@mui/icons-material/Description";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import EditIcon from "@mui/icons-material/Edit";
import {
  colors,
  titleStyle,
  paperStyle,
  chipStyle,
  filledButtonStyle,
} from "../../styles/commonStyles";
import { useGetCandidateReport, useGetApplicationsSummary } from "../../queries/jobPosting";
import { useGetCandidateNotes, useSaveCandidateNotes } from "../../queries/candidateNotes";
import { ManualScoringForm } from "../../components/HiringManager/ManualScoring/ManualScoringForm";
import { mockCriteriaWithSkills, getMockManualScoreByEmail } from "../../mocks/manualScoringMocks";

// Mock interview questions data
const mockInterviewQuestions = {
  questions: [
    {
      question: "Can you describe your experience with AWS cloud services and how you've implemented them in previous projects?",
      category: "Technical",
      rationale: "The candidate's resume mentions AWS experience, and this role requires cloud expertise."
    },
    {
      question: "Tell me about a time when you had to meet a tight deadline. How did you prioritize tasks and ensure quality?",
      category: "Behavioral",
      rationale: "This question helps assess the candidate's time management skills and ability to work under pressure."
    },
    {
      question: "How would you approach optimizing a slow-performing database query in a production environment?",
      category: "Problem-solving",
      rationale: "This evaluates the candidate's troubleshooting approach and technical knowledge."
    },
    {
      question: "Describe a situation where you had to learn a new technology quickly. What was your approach?",
      category: "Experience",
      rationale: "This role requires adaptability and continuous learning of new technologies."
    },
    {
      question: "How do you ensure your code is maintainable and follows best practices?",
      category: "Technical",
      rationale: "Code quality and maintainability are important aspects of the role."
    }
  ]
};

// Tab panel component
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
      id={`candidate-tabpanel-${index}`}
      aria-labelledby={`candidate-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ height: '100%', pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `candidate-tab-${index}`,
    'aria-controls': `candidate-tabpanel-${index}`,
  };
}

export default function CandidateReportPage() {
  const { jobPostingId, candidateEmail } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  
  // Notes state
  const [notes, setNotes] = useState<string>("");
  const [notesSuccess, setNotesSuccess] = useState<boolean>(false);
  
  // Manual score state
  const [manualScore, setManualScore] = useState<number | null>(null);

  // Load initial mock manual score if available
  useEffect(() => {
    if (candidateEmail) {
      const mockScore = getMockManualScoreByEmail(candidateEmail);
      if (mockScore !== undefined) {
        setManualScore(mockScore);
      }
    }
  }, [candidateEmail]);

  const {
    data: candidateData,
    isLoading,
    error,
  } = useGetCandidateReport(jobPostingId!, candidateEmail!);

  // Get application summary to access totalPossibleScore
  const {
    data: summaryData,
  } = useGetApplicationsSummary(jobPostingId!);

  // Load candidate notes using React Query
  const {
    data: noteData,
    isLoading: isLoadingNotes,
    error: notesQueryError
  } = useGetCandidateNotes(jobPostingId!, candidateEmail!);

  // Save notes mutation
  const { 
    mutate: saveNotes,
    isPending: isSavingNotes,
    error: saveNotesError
  } = useSaveCandidateNotes();

  // Set notes from query data when it loads
  React.useEffect(() => {
    if (noteData) {
      setNotes(noteData.notes);
    }
  }, [noteData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveNotes = async () => {
    if (!jobPostingId || !candidateEmail) return;

    console.log("Saving notes:", notes);
    
    saveNotes(
      { 
        jobPostingId, 
        candidateEmail, 
        notes 
      },
      {
        onSuccess: (data) => {
          console.log("Notes saved successfully:", data);
          setNotesSuccess(true);
        },
        onError: (error) => {
          console.error("Error in save notes mutation:", error);
        }
      }
    );
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotes(event.target.value);
  };

  const handleCloseSnackbar = () => {
    setNotesSuccess(false);
  };

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
    <Box sx={{ p: 3, height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header with back button and candidate summary */}
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
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ ...titleStyle, mb: 0.5 }}>
            {candidateData.name}
          </Typography>
          <Typography variant="body1" sx={{ color: colors.gray2 }}>
            {candidateData.role} • {candidateData.details.email}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mr: 2 }}>
            <Typography variant="body2" sx={{ color: colors.gray2, mb: 0.5 }}>
              Auto Score
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LinearProgress
                variant="determinate"
                value={summaryData?.totalPossibleScore ? (candidateData.matchScore / summaryData.totalPossibleScore) * 100 : candidateData.matchScore}
                sx={{
                  width: 80,
                  height: 8,
                  borderRadius: 4,
                  mr: 1,
                  bgcolor: `${colors.orange1}20`,
                  "& .MuiLinearProgress-bar": {
                    bgcolor: colors.orange1,
                    borderRadius: 4,
                  },
                }}
              />
              <Typography
                variant="body1"
                sx={{ color: colors.orange1, fontWeight: 500 }}
              >
                {summaryData?.totalPossibleScore 
                  ? `${Math.round((candidateData.matchScore / summaryData.totalPossibleScore) * 100)}%` 
                  : `${candidateData.matchScore}%`}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Typography variant="body2" sx={{ color: colors.gray2, mb: 0.5 }}>
              Manual Score
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {manualScore !== null ? (
                <>
                  <LinearProgress
                    variant="determinate"
                    value={manualScore}
                    sx={{
                      width: 80,
                      height: 8,
                      borderRadius: 4,
                      mr: 1,
                      bgcolor: `${colors.blue1}20`,
                      "& .MuiLinearProgress-bar": {
                        bgcolor: colors.blue1,
                        borderRadius: 4,
                      },
                    }}
                  />
                  <Typography
                    variant="body1"
                    sx={{ color: colors.blue1, fontWeight: 500 }}
                  >
                    {manualScore}%
                  </Typography>
                </>
              ) : (
                <Typography
                  variant="body1"
                  sx={{ color: colors.gray2, fontWeight: 500 }}
                >
                  Not scored
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Tabs navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="candidate report tabs"
          sx={{
            '& .MuiTab-root': {
              minHeight: '48px',
              fontSize: '0.875rem',
            },
            '& .Mui-selected': {
              color: colors.orange1,
              fontWeight: 'bold',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: colors.orange1,
            },
            '& .MuiTab-root:hover': {
              color: colors.orange1,
              opacity: 0.7,
            },
            '& .MuiTab-root.Mui-focusVisible': {
              backgroundColor: `${colors.orange1}10`,
            },
            '& .MuiTouchRipple-root': {
              color: colors.orange1,
            },
          }}
        >
          <Tab icon={<PersonIcon />} iconPosition="start" label="Profile & Notes" {...a11yProps(0)} />
          <Tab icon={<QuestionAnswerIcon />} iconPosition="start" label="Interview Questions" {...a11yProps(1)} />
          <Tab icon={<DescriptionIcon />} iconPosition="start" label="Resume" {...a11yProps(2)} />
          <Tab icon={<AssessmentIcon />} iconPosition="start" label="Manual Scoring" {...a11yProps(3)} />
        </Tabs>
      </Box>

      {/* Tab content panels */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* Profile, Evaluation & Notes Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3} sx={{ height: '100%' }}>
            <Grid item xs={12} md={4} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Paper elevation={0} sx={{ ...paperStyle, bgcolor: colors.gray1, mb: 3, flex: '0 0 auto' }}>
                <Typography variant="h6" sx={{ ...titleStyle, mb: 3 }}>
                  Contact Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: colors.gray2 }}>
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.black1, wordBreak: 'break-word' }}>
                      {candidateData.details.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: colors.gray2 }}>
                      Phone
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.black1 }}>
                      {candidateData.details.phone}
                    </Typography>
                  </Grid>
                </Grid>
                
                {candidateData.details.personalLinks.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography
                      variant="body2"
                      sx={{ color: colors.gray2, mb: 1 }}
                    >
                      Personal Links
                    </Typography>
                    <Box sx={{ maxHeight: '100px', overflowY: 'auto' }}>
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
                    </Box>
                  </>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4} sx={{ height: '100%' }}>
              <Paper elevation={0} sx={{ ...paperStyle, bgcolor: colors.gray1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ ...titleStyle, mb: 3 }}>
                  Evaluation Criteria
                </Typography>
                <Box sx={{ overflow: 'auto', flex: '1 1 auto' }}>
                  {candidateData.criteria.map((criterion, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
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
                  ))}
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="h6" sx={{ ...titleStyle, mb: 2 }}>
                    Skills Analysis
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: colors.gray2, mb: 1 }}>
                    Matched Skills
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                    {candidateData.rules.matched.length > 0 ? (
                      candidateData.rules.matched.map((rule, index) => (
                        <Chip
                          key={index}
                          label={rule}
                          sx={{
                            bgcolor: `${colors.orange1}20`,
                            color: colors.orange1,
                            fontWeight: 500,
                          }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ color: colors.gray2, fontStyle: 'italic' }}>
                        No matched skills found
                      </Typography>
                    )}
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: colors.gray2, mb: 1 }}>
                    Missing Skills
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {candidateData.rules.missing.length > 0 ? (
                      candidateData.rules.missing.map((rule, index) => (
                        <Chip 
                          key={index} 
                          label={rule} 
                          sx={{
                            bgcolor: `${colors.gray2}20`,
                            color: colors.gray2,
                            fontWeight: 500,
                          }} 
                        />
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ color: colors.gray2, fontStyle: 'italic' }}>
                        No missing skills found
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4} sx={{ height: '100%' }}>
              <Paper elevation={0} sx={{ ...paperStyle, bgcolor: colors.gray1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ ...titleStyle, mb: 3 }}>
                  Interview Notes
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto' }}>
                  {isLoadingNotes ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      {(notesQueryError || saveNotesError) && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {notesQueryError instanceof Error 
                            ? notesQueryError.message 
                            : saveNotesError instanceof Error 
                              ? saveNotesError.message 
                              : "An error occurred with the notes"}
                        </Alert>
                      )}
                      <TextField
                        fullWidth
                        multiline
                        placeholder="Add your notes about this candidate here..."
                        value={notes}
                        onChange={handleNotesChange}
                        sx={{ 
                          mb: 2,
                          flex: '1 1 auto',
                          '& .MuiOutlinedInput-root': {
                            bgcolor: colors.white,
                            height: '100%',
                          },
                          '& .MuiInputBase-multiline': {
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                          },
                          '& textarea': {
                            flex: '1 1 auto',
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveNotes}
                        disabled={isSavingNotes}
                        sx={{
                          bgcolor: colors.blue1,
                          '&:hover': {
                            bgcolor: colors.orange1,
                          },
                          alignSelf: 'flex-end',
                        }}
                      >
                        {isSavingNotes ? 'Saving...' : 'Save Notes'}
                      </Button>
                    </>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Interview Questions Tab */}
        <TabPanel value={tabValue} index={1}>
          <Paper elevation={0} sx={{ ...paperStyle, bgcolor: colors.gray1, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ ...titleStyle, mb: 3 }}>
              Suggested Interview Questions
            </Typography>
            <Box sx={{ overflow: 'auto', flex: '1 1 auto' }}>
              <Stack spacing={2}>
                {mockInterviewQuestions.questions.map((question, index) => (
                  <Accordion 
                    key={index}
                    sx={{ 
                      boxShadow: 'none', 
                      bgcolor: colors.white,
                      '&:before': { display: 'none' },
                      borderRadius: '8px',
                      overflow: 'hidden',
                      mb: 1,
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ 
                        bgcolor: `${colors.blue1}10`,
                        '&:hover': { bgcolor: `${colors.blue1}20` },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Typography sx={{ flexGrow: 1, fontWeight: 500 }}>
                          {question.question}
                        </Typography>
                        <Chip 
                          label={question.category} 
                          size="small" 
                          sx={{ 
                            ml: 2,
                            bgcolor: colors.blue1,
                            color: 'white',
                            fontWeight: 500,
                          }} 
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" sx={{ color: colors.gray2 }}>
                        {question.rationale}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            </Box>
          </Paper>
        </TabPanel>

        {/* Resume Tab */}
        <TabPanel value={tabValue} index={2}>
          <Paper 
            elevation={0} 
            sx={{ 
              ...paperStyle,
              bgcolor: colors.gray1, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column' 
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ ...titleStyle }}>
                Resume Preview
              </Typography>

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
                  }}
                  aria-label="Fullscreen"
                >
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              {candidateData.resume ? (
                <Box
                  sx={{
                    height: '100%',
                    bgcolor: colors.white,
                    borderRadius: 1,
                    p: 2,
                    overflow: "hidden",
                  }}
                >
                  <iframe
                    id="resume-preview-iframe"
                    src={candidateData.resume}
                    title="Resume Preview"
                    width="100%"
                    height="100%"
                    style={{
                      border: "none",
                      borderRadius: "4px",
                    }}
                    allowFullScreen
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    height: '100%',
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    bgcolor: colors.white,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body1" sx={{ color: colors.gray2 }}>
                    No resume available for preview
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </TabPanel>

        {/* Manual Scoring Tab */}
        <TabPanel value={tabValue} index={3}>
          <ManualScoringForm 
            jobPostingId={jobPostingId!}
            candidateEmail={candidateEmail!}
            criteria={mockCriteriaWithSkills}
            onScoreSaved={(manualScore) => {
              setManualScore(manualScore);
              // In a real implementation, this would save to the backend
              console.log(`Saved manual score: ${manualScore}% for ${candidateEmail}`);
            }}
          />
        </TabPanel>
      </Box>

      {/* Success notification */}
      <Snackbar
        open={notesSuccess}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Notes saved successfully
        </Alert>
      </Snackbar>
    </Box>
  );
}
