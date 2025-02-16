import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import { cardStyle, colors, textButtonStyle } from "../../styles/commonStyles";

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
