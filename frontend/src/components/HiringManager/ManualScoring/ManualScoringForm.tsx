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

// Skill score structure
export interface SkillScore {
  skillName: string;
  score: number;
  maxPoints: number;
}

// Criteria score structure
export interface ManualCriteriaScore {
  id: number;
  name: string;
  skills: SkillScore[];
  totalScore: number;
  maxTotalScore: number;
}

export interface ManualScoreData {
  criteriaScores: ManualCriteriaScore[];
  totalScore: number;
  lastUpdated: Date | null;
}

interface ManualScoringFormProps {
  jobPostingId: string;
  candidateEmail: string;
  criteria: Array<{ 
    name: string; 
    score: number;
    criteriaJson?: {
      rules: Array<{
        skill: string;
        maxPoints: number;
      }>;
    };
    skills?: Array<{
      id: number;
      name: string;
      score?: number;
      maxPoints: number;
    }>;
  }>;
  onScoreSaved?: (manualScore: number) => void;
}

export const ManualScoringForm: React.FC<ManualScoringFormProps> = ({
  jobPostingId,
  candidateEmail,
  criteria,
  onScoreSaved,
}) => {
  // Initialize with criteria and skills from props
  const initialScores: ManualCriteriaScore[] = criteria.map((criterion, index) => {
    // Extract skills from criteriaJson if available, or from skills property
    const skills: SkillScore[] = criterion.skills ? 
      criterion.skills.map(skill => ({
        skillName: skill.name,
        score: skill.score || 0,
        maxPoints: skill.maxPoints,
      })) : 
      criterion.criteriaJson?.rules.map(rule => ({
        skillName: rule.skill,
        score: 0,
        maxPoints: rule.maxPoints,
      })) || [
        // Fallback if no skills data is provided
        {
          skillName: 'General',
          score: 0,
          maxPoints: 10,
        }
      ];

    // Calculate max total score for this criterion
    const maxTotalScore = skills.reduce((sum, skill) => sum + skill.maxPoints, 0);

    return {
      id: index + 1,
      name: criterion.name,
      skills,
      totalScore: 0,
      maxTotalScore,
    };
  });

  const [manualScores, setManualScores] = useState<ManualScoreData>({
    criteriaScores: initialScores,
    totalScore: 0,
    lastUpdated: null,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState<number | false>(false);

  // Handle accordion expansion
  const handleAccordionChange = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  // Calculate total scores whenever skills scores change
  useEffect(() => {
    // First update each criterion's total score
    const updatedCriteriaScores = manualScores.criteriaScores.map(criterion => {
      const criterionTotalScore = criterion.skills.reduce(
        (sum, skill) => sum + skill.score,
        0
      );
      
      return {
        ...criterion,
        totalScore: criterionTotalScore,
      };
    });

    // Then calculate the overall percentage score
    const totalPoints = updatedCriteriaScores.reduce(
      (sum, criterion) => sum + criterion.totalScore,
      0
    );
    
    const totalMaxPoints = updatedCriteriaScores.reduce(
      (sum, criterion) => sum + criterion.maxTotalScore,
      0
    );
    
    const totalScorePercentage = totalMaxPoints > 0 
      ? Math.round((totalPoints / totalMaxPoints) * 100) 
      : 0;
      
    setManualScores({
      criteriaScores: updatedCriteriaScores,
      totalScore: totalScorePercentage,
      lastUpdated: manualScores.lastUpdated,
    });
  }, [manualScores.criteriaScores]);

  // Handle score change for a skill
  const handleSkillScoreChange = (criterionId: number, skillIndex: number, value: string) => {
    const criterionIndex = manualScores.criteriaScores.findIndex(c => c.id === criterionId);
    if (criterionIndex === -1) return;

    const skill = manualScores.criteriaScores[criterionIndex].skills[skillIndex];
    
    // Handle empty input
    if (value === '') {
      setManualScores(prev => {
        const newCriteriaScores = [...prev.criteriaScores];
        newCriteriaScores[criterionIndex] = {
          ...newCriteriaScores[criterionIndex],
          skills: newCriteriaScores[criterionIndex].skills.map((s, idx) => 
            idx === skillIndex ? { ...s, score: 0 } : s
          ),
        };
        
        return {
          ...prev,
          criteriaScores: newCriteriaScores,
        };
      });
      return;
    }
    
    // Parse the input value
    const numericValue = parseInt(value, 10);
    
    // Skip update if not a valid number
    if (isNaN(numericValue)) return;
    
    // Clamp the value between 0 and max points
    const clampedValue = Math.max(0, Math.min(numericValue, skill.maxPoints));
    
    setManualScores(prev => {
      const newCriteriaScores = [...prev.criteriaScores];
      newCriteriaScores[criterionIndex] = {
        ...newCriteriaScores[criterionIndex],
        skills: newCriteriaScores[criterionIndex].skills.map((s, idx) => 
          idx === skillIndex ? { ...s, score: clampedValue } : s
        ),
      };
      
      return {
        ...prev,
        criteriaScores: newCriteriaScores,
      };
    });
  };

  // Handle save
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call
      // For now, we'll simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the last updated timestamp
      setManualScores(prev => ({
        ...prev,
        lastUpdated: new Date(),
      }));
      
      setSuccess(true);
      
      // Notify parent component about the new manual score
      if (onScoreSaved) {
        onScoreSaved(manualScores.totalScore);
      }
    } catch (err) {
      setError('Failed to save manual scores. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  // Simulate loading data (in a real implementation, this would fetch from an API)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For now, we'll just use the initial scores
        // In a real implementation, this would fetch saved scores if they exist
      } catch (err) {
        setError('Failed to load manual scores.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [jobPostingId, candidateEmail]);

  if (loading) {
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
        {manualScores.lastUpdated && (
          <Typography variant="body2" sx={{ color: colors.gray2 }}>
            Last updated: {manualScores.lastUpdated.toLocaleString()}
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
        {manualScores.criteriaScores.map((criterion) => (
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
          Total Score: {manualScores.totalScore}%
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{
            ...filledButtonStyle,
            bgcolor: colors.blue1,
            '&:hover': {
              bgcolor: colors.orange1,
            },
          }}
        >
          {saving ? 'Saving...' : 'Save Scores'}
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
