import { Typography, Card, CardContent, Chip } from "@mui/material";
import { cardStyle, colors } from "../../styles/commonStyles";
import { JobPostingStatus } from "../../types/JobPosting/jobPosting";
import { JOB_STATUS_TRANSITION } from "../../utils/jobPostingStatusTransition";

interface JobCardProps {
  id?: string;
  title: string;
  description: string;
  status: JobPostingStatus;
  onClick?: () => void;
}

export const JobCard = ({ id, title, description, status, onClick }: JobCardProps) => {
  const chipColor = JOB_STATUS_TRANSITION[status].chipColor;

  return (
    <Card sx={cardStyle} onClick={onClick}>
      <CardContent sx={{ position: "relative", pb: 1 }}>
        <Chip
          size="small"
          label={status}
          variant="outlined"
          sx={{ position: "absolute", top: 16, right: 8, color: chipColor, borderColor: chipColor, borderRadius: "4px" }}
        />

        <Typography
          variant="h5"
          component="h2"
          sx={{ color: colors.blue1, fontWeight: 600, mb: 1, pr: 4 }}
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: colors.black1,
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2, // Limit text to 2 lines
            WebkitBoxOrient: "vertical",
          }}
        >
          {description}
        </Typography>

        {id && (
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              color: colors.gray2,
              // fontSize: "1rem",
            }}
          >
            #{id}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
