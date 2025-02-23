import { Typography, Card, CardContent } from "@mui/material";
import { cardStyle, colors } from "../../styles/commonStyles";

interface JobCardProps {
  id?: string;
  title: string;
  description: string;
  onClick?: () => void;
}

export const JobCard = ({ id, title, description, onClick }: JobCardProps) => {
  return (
    <Card sx={cardStyle} onClick={onClick}>
      <CardContent sx={{ position: "relative", pb: 1 }}>
        {id && (
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              top: 16,
              right: 8,
              color: colors.black1,
              fontSize: "1rem",
            }}
          >
            #{id}
          </Typography>
        )}
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
      </CardContent>
    </Card>
  );
};
