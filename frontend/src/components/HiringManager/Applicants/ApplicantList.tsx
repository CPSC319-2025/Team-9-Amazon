import {
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import { PlusCircle } from 'lucide-react';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { colors } from '../../../styles/commonStyles';
import { Applicant } from '../../../types/applicant';
import { useNavigate, useParams } from 'react-router';
import { ROUTES } from '../../../routes/routePaths';

interface ApplicantListProps {
  applicants: Applicant[];
  onViewApplicant: (email: string) => void;
  onAddCandidate?: (email: string) => void;
  showAddButton?: boolean;
}

export const ApplicantList = ({
  applicants,
  onViewApplicant,
  onAddCandidate,
  showAddButton,
}: ApplicantListProps) => {
  const navigate = useNavigate();
  const { jobPostingId } = useParams();

  return (
    <Paper elevation={0} sx={{ bgcolor: colors.gray1, borderRadius: 2, overflow: 'hidden' }}>
      <List sx={{ py: 0 }}>
        {applicants.map((applicant, index) => (
          <ListItem
            key={applicant.email}
            sx={{
              borderBottom: index < applicants.length - 1 ? `1px solid ${colors.white}` : 'none',
              transition: 'background-color 0.2s ease',
              '&:hover': {
                bgcolor: `${colors.blue1}10`,
              },
              py: 2,
            }}
          >
            <ListItemText
              primary={
                <Typography variant="body1" sx={{ fontWeight: 500, color: colors.black1 }}>
                  {`${applicant.first_name} ${applicant.last_name}`}
                </Typography>
              }
            />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                mr: showAddButton ? 8 : 4,
              }}
            >
              {applicant.score !== undefined && applicant.total_score !== undefined && (
                <Typography variant="body2" sx={{ color: colors.black1, whiteSpace: 'nowrap' }}>
                  Score: {applicant.score}/{applicant.total_score}
                </Typography>
              )}
            </Box>
            <ListItemSecondaryAction sx={{ display: 'flex', gap: 1 }}>
              {showAddButton && onAddCandidate && (
                <IconButton
                  edge="end"
                  onClick={() => onAddCandidate(applicant.email)}
                  sx={{
                    color: colors.blue1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: colors.blue1,
                      bgcolor: `${colors.blue1}15`,
                    },
                  }}
                >
                  <PlusCircle size={20} />
                </IconButton>
              )}
              <IconButton
                edge="end"
                onClick={() => navigate(ROUTES.hiringManager.candidateReport(jobPostingId!, applicant.email))}
                sx={{
                  color: colors.black1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: colors.blue1,
                    bgcolor: `${colors.blue1}15`,
                  },
                }}
              >
                <AssessmentIcon sx={{ color: colors.orange1 }} />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};