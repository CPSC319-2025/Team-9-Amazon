import {
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { colors } from "../../../styles/commonStyles";
import { useNavigate, useParams } from "react-router";
import { ROUTES } from "../../../routes/routePaths";
import { ApplicationSummary } from "../../../types/application";

interface ApplicantListProps {
  applications: ApplicationSummary[];
  isPotentialList: boolean;
}

export const ApplicantList = ({ applications, isPotentialList }: ApplicantListProps) => {
  const navigate = useNavigate();
  const { jobPostingId } = useParams();

  const handleNavigateToReport = (email: string, originalPostingId: number) => {
    if(isPotentialList) {
      navigate(ROUTES.hiringManager.potentialCandidateReport(jobPostingId!, email, originalPostingId));
    } else {
      navigate(ROUTES.hiringManager.candidateReport(jobPostingId!, email));
    }
  };

  if (applications.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body1" sx={{ color: colors.gray2 }}>
          No applications found
        </Typography>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{ bgcolor: colors.gray1, borderRadius: 2, overflow: "hidden" }}
    >
      <List sx={{ py: 0 }}>
        {applications.map((application, index) => (
          <ListItem
            key={[application.applicantId, application.jobPostingId].join("-")}
            sx={{
              borderBottom:
                index < applications.length - 1
                  ? `1px solid ${colors.white}`
                  : "none",
              transition: "background-color 0.2s ease",
              "&:hover": {
                bgcolor: `${colors.blue1}10`,
                cursor: "pointer",
              },
              py: 2,
            }}
            onClick={() => handleNavigateToReport(application.applicant.email, application.jobPostingId)}
          >
            <ListItemText
              primary={
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500, color: colors.black1 }}
                >
                  {`${application.applicant.firstName} ${application.applicant.lastName}`}
                </Typography>
              }
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              {application.score !== undefined && (
                <Typography
                  variant="body2"
                  sx={{ color: colors.orange1, whiteSpace: "nowrap" }}
                >
                  Auto: {application.score.toFixed(2)}
                </Typography>
              )}
              {application.manualScore !== undefined && application.manualScore !== null && (
                <Typography
                  variant="body2"
                  sx={{ color: colors.blue1, whiteSpace: "nowrap" }}
                >
                  Manual: {application.manualScore} pts
                </Typography>
              )}
            </Box>
            <ListItemSecondaryAction sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="View candidate report" arrow>
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click event from firing
                    handleNavigateToReport(application.applicant.email, application.jobPostingId);
                  }}
                  sx={{
                    color: colors.black1,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: colors.blue1,
                      bgcolor: `${colors.blue1}15`,
                    },
                  }}
                >
                  <AssessmentIcon sx={{ color: colors.orange1 }} />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};