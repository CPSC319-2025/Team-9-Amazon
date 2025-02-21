import { Box, Typography, Button } from "@mui/material";
import { useParams } from "react-router";

const JobDetails = () => {
  const { jobPostingId } = useParams(); // ✅ Extract jobPostingId

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4">Job Details - Job ID: {jobPostingId}</Typography>
      <Typography variant="body1">Amazon Search creates powerful, customer-focused product search solutions...</Typography>

      <Typography variant="h5" sx={{ marginTop: 3 }}>Job Details</Typography>
      <Typography variant="body2">📍 Vancouver, CA</Typography>
      <Typography variant="body2">💼 IT, Software Engineer, Frontend</Typography>
      <Typography variant="body2">🕒 Created at: Jan 3rd, 2025</Typography>

      <Button variant="contained" sx={{ marginTop: 2 }}>Edit in Interactive Mode</Button>
    </Box>
  );
};

export default JobDetails;