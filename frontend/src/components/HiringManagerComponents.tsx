import {
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { textButtonStyle, cardStyle, colors } from "../styles/commonStyles";

export const JobCard = () => {
  return (
    <Card sx={cardStyle}>
      <CardContent>
        <Typography
          variant="h5"
          component="h2"
          sx={{ color: colors.blue1, fontWeight: 600 }}
          gutterBottom
        >
          ML Compiler Software Engineer PEY Co-op (12-16 months), Annapurna ML
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: colors.black, fontWeight: 500 }}
        >
          Applicants: 70
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
