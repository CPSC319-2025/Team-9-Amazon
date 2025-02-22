import { Box, Typography, Button, IconButton, Divider, Grid } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { JobPosting } from "../../types/JobPosting/jobPosting";
import { useOutletContext } from "react-router";
import JobDetailsView from "../../components/HiringManager/JobPostings/JobDetailsView";

const JobDetails = () => {
  const { jobPosting } = useOutletContext<{ jobPosting: JobPosting | null }>();

  if (!jobPosting) {
    return (
      <Box sx={{ padding: "40px", textAlign: "center" }}>
        <Typography variant="h6" color="error">Job posting not found or loading...</Typography>
      </Box>
    );
  }

  return <JobDetailsView jobPosting={jobPosting} editable={true} />;
};

export default JobDetails;