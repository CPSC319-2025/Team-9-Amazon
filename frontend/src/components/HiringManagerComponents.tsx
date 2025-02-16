import {
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Box,
  TextField,
  InputAdornment,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material";
import { Eye, Search, Filter, Database, PlusCircle } from "lucide-react";
import {
  textButtonStyle,
  outlinedButtonStyle,
  filledButtonStyle,
  cardStyle,
  colors,
} from "../styles/commonStyles";
import { Applicant } from "../types/applicant";

interface JobCardProps {
  title: string;
  applicants: number;
}

export const JobCard = ({ title, applicants }: JobCardProps) => {
  return (
    <Card sx={cardStyle}>
      <CardContent>
        <Typography
          variant="h5"
          component="h2"
          sx={{ color: colors.blue1, fontWeight: 600 }}
          gutterBottom
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: colors.black1, fontWeight: 500 }}
        >
          Applicants: {applicants}
        </Typography>
      </CardContent>
      <CardActions
        sx={{
          mt: "auto",
          borderTop: `1px solid ${colors.gray1}`,
          justifyContent: "flex-end",
        }}
      >
        <Button sx={{ ...textButtonStyle, color: colors.orange1 }}>
          VIEW REPORT
        </Button>
      </CardActions>
    </Card>
  );
};

interface ActionButtonsProps {
  onEvaluateAll: () => void;
  onScanDatabase: () => void;
}

export const ActionButtons = ({
  onEvaluateAll,
  onScanDatabase,
}: ActionButtonsProps) => (
  <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
    <Button variant="contained" onClick={onEvaluateAll} sx={filledButtonStyle}>
      Evaluate All Applicants
    </Button>
    <Button
      variant="outlined"
      startIcon={<Database size={20} />}
      onClick={onScanDatabase}
      sx={outlinedButtonStyle}
    >
      Scan Database for Candidates
    </Button>
  </Stack>
);

interface SearchBarProps {
  onSearch: (value: string) => void;
  onFilter: () => void;
}

export const SearchBar = ({ onSearch, onFilter }: SearchBarProps) => (
  <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
    <TextField
      fullWidth
      placeholder="Search applicants..."
      onChange={(e) => onSearch(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search size={20} />
          </InputAdornment>
        ),
      }}
      sx={{
        backgroundColor: colors.white,
        "& .MuiOutlinedInput-root": {
          "& .MuiOutlinedInput-notchedOutline": {
            borderWidth: 2,
            borderColor: `${colors.blue1}50`,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.blue1,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.blue1,
            borderWidth: 2,
          },
        },
      }}
    />
    <Button
      startIcon={<Filter size={20} />}
      onClick={onFilter}
      sx={{ textButtonStyle, color: colors.orange1, fontWeight: "bold" }}
    >
      Filter
    </Button>
  </Stack>
);

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
}: ApplicantListProps) => (
  <Paper
    elevation={0}
    sx={{ bgcolor: colors.gray1, borderRadius: 2, overflow: "hidden" }}
  >
    <List sx={{ py: 0 }}>
      {applicants.map((applicant, index) => (
        <ListItem
          key={applicant.email}
          sx={{
            borderBottom:
              index < applicants.length - 1
                ? `1px solid ${colors.white}`
                : "none",
            transition: "background-color 0.2s ease",
            "&:hover": {
              bgcolor: `${colors.blue1}10`,
            },
            py: 2,
          }}
        >
          <ListItemText
            primary={
              <Typography
                variant="body1"
                sx={{ fontWeight: 500, color: colors.black1 }}
              >
                {`${applicant.first_name} ${applicant.last_name}`}
              </Typography>
            }
          />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              mr: showAddButton ? 8 : 4,
            }}
          >
            {applicant.score !== undefined &&
              applicant.total_score !== undefined && (
                <Typography
                  variant="body2"
                  sx={{ color: colors.black1, whiteSpace: "nowrap" }}
                >
                  Score: {applicant.score}/{applicant.total_score}
                </Typography>
              )}
          </Box>
          <ListItemSecondaryAction sx={{ display: "flex", gap: 1 }}>
            {showAddButton && onAddCandidate && (
              <IconButton
                edge="end"
                onClick={() => onAddCandidate(applicant.email)}
                sx={{
                  color: colors.blue1,
                  transition: "all 0.2s ease",
                  "&:hover": {
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
              onClick={() => onViewApplicant(applicant.email)}
              sx={{
                color: colors.black1,
                transition: "all 0.2s ease",
                "&:hover": {
                  color: colors.blue1,
                  bgcolor: `${colors.blue1}15`,
                },
              }}
            >
              <Eye size={20} color={colors.orange1} />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  </Paper>
);
