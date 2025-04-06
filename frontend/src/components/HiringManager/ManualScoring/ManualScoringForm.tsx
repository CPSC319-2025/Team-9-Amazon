import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { colors, paperStyle, filledButtonStyle } from '../../../styles/commonStyles';
import { useGetManualScore, useSaveManualScore } from '../../../queries/jobPosting';

// Skill score structure
export interface SkillScore {
  skillName: string;
  score: number;
  maxPoints: number;
  isActive?: boolean;
}

// Criteria score structure
export interface ManualCriteriaScore {
  id: number;
  name: string;
  skills: SkillScore[];
  totalScore: number;
  maxTotalScore: number;
  isActive?: boolean;
}

export interface ManualScoreData {
  criteriaScores: ManualCriteriaScore[];
  totalScore: number;
  lastUpdated: Date | null;
}

// New CriteriaRepresentation interface
export interface CriteriaRepresentation {
  id: number;
  createdAt: string;
  updatedAt: string;
  criteriaMaxScore: number;
  criteriaType: "global" | "local";
  jobPostingId: number | null;
  name: string;
  criteriaJson: {
    rules: Array<{
      skill: string;
      pointsPerYearOfExperience: number;
      maxPoints: number;
      isActive?: boolean;
    }>;
  };
}

interface ManualScoringFormProps {
  jobPostingId: string;
  candidateEmail: string;
  criteria: CriteriaRepresentation[];
  onScoreSaved?: (manualScore: number) => void;
}

export const ManualScoringForm: React.FC<ManualScoringFormProps> = ({
  jobPostingId,
  candidateEmail,
  criteria,
  onScoreSaved,
}) => {
  // Initialize with criteria and skills from CriteriaRepresentation
  const initialScores: ManualCriteriaScore[] = criteria.map((criterion) => {
    // Extract skills from criteriaJson
    const skills: SkillScore[] = criterion.criteriaJson.rules.map(rule => ({
      skillName: rule.skill,
      score: 0,
      maxPoints: rule.maxPoints,
      isActive: rule.isActive !== false, // Default to true if not specified
    }));

    // Calculate max total score for this criterion based on skills
    const maxTotalScore = skills.reduce((sum, skill) => sum + skill.maxPoints, 0);

    return {
      id: criterion.id,
      name: criterion.name,
      skills,
      totalScore: 0,
      maxTotalScore,
      isActive: true, // Default to active
    };
  });

  const [criteriaScores, setCriteriaScores] = useState<ManualCriteriaScore[]>(initialScores);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [totalScorePoints, setTotalScorePoints] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState<number | false>(false);

  // Get manual score query
  const {
    data: savedScoreData,
    isLoading,
    isError,
    error: fetchError,
  } = useGetManualScore(jobPostingId, candidateEmail);

  // Save manual score mutation
  const {
    mutate: saveScore,
    isPending: isSaving,
    error: saveError,
  } = useSaveManualScore();

  // Handle accordion expansion
  const handleAccordionChange = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  // Handle score change for a skill - calculate everything in one place
  const handleSkillScoreChange = (criterionId: number, skillIndex: number, value: string) => {
    const criterionIndex = criteriaScores.findIndex(c => c.id === criterionId);
    if (criterionIndex === -1) return;

    const skill = criteriaScores[criterionIndex].skills[skillIndex];
    
    // Determine the new score value
    let newScore = 0;
    if (value !== '') {
      const numericValue = parseInt(value, 10);
      if (!isNaN(numericValue)) {
        // Clamp value between 0 and max points
        newScore = Math.max(0, Math.min(numericValue, skill.maxPoints));
      }
    }
    
    // Skip update if the value is the same
    if (skill.score === newScore) return;
    
    // Create a new criteriaScores array with the updated skill score
    const newCriteriaScores = [...criteriaScores];
    const newSkills = [...newCriteriaScores[criterionIndex].skills];
    newSkills[skillIndex] = { ...newSkills[skillIndex], score: newScore };
    
    newCriteriaScores[criterionIndex] = {
      ...newCriteriaScores[criterionIndex],
      skills: newSkills,
    };
    
    // Calculate all the totals immediately
    // 1. Update each criterion's total score
    const updatedCriteriaScores = newCriteriaScores.map(criterion => {
      const totalScore = criterion.skills.reduce((sum, s) => sum + s.score, 0);
      return { ...criterion, totalScore };
    });
    
    // 2. Calculate the overall percentage
    const totalPoints = updatedCriteriaScores.reduce(
      (sum, criterion) => sum + criterion.totalScore, 0
    );
    
    const totalMaxPoints = updatedCriteriaScores.reduce(
      (sum, criterion) => sum + criterion.maxTotalScore, 0
    );
    
    const calculatedTotalScore = totalMaxPoints > 0 
      ? Math.round((totalPoints / totalMaxPoints) * 100) 
      : 0;
    
    // 3. Update both states in sequence
    setCriteriaScores(updatedCriteriaScores);
    setTotalScore(calculatedTotalScore);
    setTotalScorePoints(totalPoints)
  };

  // Handle save using the mutation
  const handleSave = async () => {
    setError(null);
    
    try {
      await saveScore({
        jobPostingId,
        candidateEmail,
        data: {
          criteriaScores: criteriaScores,
          totalScore: totalScorePoints,
        },
      });
      
      // Update the last updated timestamp
      setLastUpdated(new Date());
      
      setSuccess(true);
      
      // Notify parent component about the new manual score
      if (onScoreSaved) {
        onScoreSaved(totalScorePoints);
      }
    } catch (err) {
      console.error('Error saving manual scores:', err);
      setError('Failed to save manual scores. Please try again.');
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  // Set error message if fetch or save operation fails
  useEffect(() => {
    if (isError && fetchError) {
      setError('Failed to load manual scores.');
    } else if (saveError) {
      setError('Failed to save manual scores. Please try again.');
    }
  }, [isError, fetchError, saveError]);

  // Load saved scores data when available
  useEffect(() => {
    if (savedScoreData && savedScoreData.criteriaScores) {
      // Merge saved scores with existing criteria structure
      const mergedCriteriaScores = initialScores.map(criterion => {
        const savedCriterion = savedScoreData.criteriaScores.find(
          c => c.name === criterion.name
        );
        
        if (savedCriterion) {
          // Merge skills scores
          const mergedSkills = criterion.skills.map(skill => {
            const savedSkill = savedCriterion.skills.find(
              s => s.skillName === skill.skillName
            );
            return savedSkill ? { ...skill, score: savedSkill.score } : skill;
          });
          
          return {
            ...criterion,
            skills: mergedSkills,
            totalScore: mergedSkills.reduce((sum, skill) => sum + skill.score, 0),
          };
        }
        
        return criterion;
      });
      
      setCriteriaScores(mergedCriteriaScores);
      
      // Recalculate total score
      const totalPoints = mergedCriteriaScores.reduce(
        (sum, criterion) => sum + criterion.totalScore, 0
      );
      
      const totalMaxPoints = mergedCriteriaScores.reduce(
        (sum, criterion) => sum + criterion.maxTotalScore, 0
      );
      
      const calculatedTotalScore = totalMaxPoints > 0 
        ? Math.round((totalPoints / totalMaxPoints) * 100) 
        : 0;
      
      setTotalScore(calculatedTotalScore);
      setLastUpdated(savedScoreData.lastUpdated ? new Date(savedScoreData.lastUpdated) : new Date());
    }
  }, [savedScoreData, initialScores]);

  // Handle initialization when criteria props change
  useEffect(() => {
    setCriteriaScores(initialScores);
    // Reset total score when criteria changes
    const totalMaxPoints = initialScores.reduce(
      (sum, criterion) => sum + criterion.maxTotalScore, 0
    );
    
    const calculatedTotalScore = totalMaxPoints > 0 
      ? Math.round((initialScores.reduce((sum, criterion) => sum + criterion.totalScore, 0) / totalMaxPoints) * 100) 
      : 0;
    
    setTotalScore(calculatedTotalScore);
  }, [criteria]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ ...paperStyle, bgcolor: colors.gray1, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.black1 }}>
          Manual Scoring
        </Typography>
        {lastUpdated && (
          <Typography variant="body2" sx={{ color: colors.gray2 }}>
            Last updated: {lastUpdated.toLocaleString()}
          </Typography>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Typography variant="body2" sx={{ mb: 2, color: colors.gray2 }}>
        Assign scores to each skill within criteria based on your evaluation of the candidate.
      </Typography>
      
      <Box sx={{ mb: 3, flex: '1 1 auto', overflow: 'auto' }}>
        {criteriaScores.map((criterion) => (
          <Accordion 
            key={criterion.id}
            expanded={expandedPanel === criterion.id}
            onChange={handleAccordionChange(criterion.id)}
            sx={{ 
              mb: 2, 
              '&:before': { display: 'none' },
              boxShadow: 'none',
              border: `1px solid ${colors.gray2}`,
              borderRadius: '4px !important',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                bgcolor: colors.white,
                borderRadius: expandedPanel === criterion.id ? '4px 4px 0 0' : '4px',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 600 }}>{criterion.name}</Typography>
                <Typography sx={{ color: criterion.totalScore > 0 ? colors.orange1 : colors.gray2 }}>
                  {criterion.totalScore} / {criterion.maxTotalScore} points
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: colors.white, pt: 0 }}>
              <Divider sx={{ mt: 0, mb: 2 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Skill</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Score</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Max Points</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {criterion.skills.map((skill, skillIndex) => (
                      <TableRow key={skillIndex}>
                        <TableCell>{skill.skillName}</TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            value={skill.score}
                            onChange={(e) => handleSkillScoreChange(criterion.id, skillIndex, e.target.value)}
                            inputProps={{ 
                              min: 0, 
                              max: skill.maxPoints,
                              step: 1,
                              style: { textAlign: 'center' } 
                            }}
                            sx={{ width: '80px' }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">{skill.maxPoints}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
        <Typography variant="h6" sx={{ color: colors.orange1, fontWeight: 600 }}>
          Total Score: {totalScore}%
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={isSaving}
          sx={{
            ...filledButtonStyle,
            bgcolor: colors.blue1,
            '&:hover': {
              bgcolor: colors.orange1,
            },
          }}
        >
          {isSaving ? 'Saving...' : 'Save Scores'}
        </Button>
      </Box>
      
      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Manual scores saved successfully
        </Alert>
      </Snackbar>
    </Paper>
  );
};