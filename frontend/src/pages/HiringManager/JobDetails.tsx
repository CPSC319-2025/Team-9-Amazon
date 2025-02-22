import { Box, Typography, Button, IconButton, Divider, Grid } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { JobPosting } from "../../types/jobPosting";
import { useOutletContext } from "react-router";

const JobDetails = () => {
  const { jobPosting } = useOutletContext<{ jobPosting: JobPosting | null }>();

  if (!jobPosting) {
    return (
      <Box sx={{ padding: "40px", textAlign: "center" }}>
        <Typography variant="h6" color="error">Job posting not found or loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: "40px", maxWidth: "1200px", margin: "auto" }}>
      {/* Two-column Layout */}
      <Grid container spacing={20}>
        {/* Left Column: Job Description */}
        <Grid item xs={12} md={8}>
          {/* Job Title Section */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>{jobPosting.title}</Typography>
            <IconButton size="small">
              <EditIcon />
            </IconButton>
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            {jobPosting.subtitle}
          </Typography>

          <Divider sx={{ marginY: 2 }} />

          {/* Job Description */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>Job Descriptions</Typography>
            <IconButton size="small">
              <EditIcon />
            </IconButton>
          </Box>
          <Typography variant="body1" sx={{ marginTop: 1 }}>
            {jobPosting.description}
          </Typography>

          <Divider sx={{ marginY: 2 }} />

          {/* Qualifications */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>Qualifications</Typography>
            <IconButton size="small">
              <EditIcon />
            </IconButton>
          </Box>
          <Typography variant="body1" sx={{ marginTop: 1 }}>
            {jobPosting.qualifications}
          </Typography>

          <Divider sx={{ marginY: 2 }} />

          {/* Responsibilities */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>Responsibilities</Typography>
            <IconButton size="small">
              <EditIcon />
            </IconButton>
          </Box>
          <Typography variant="body1" sx={{ marginTop: 1 }}>
            {jobPosting.responsibilities}
          </Typography>
        </Grid>

        {/* Right Column: Job Details */}
        <Grid item xs={12} md={4}>
          <Typography variant="h5" sx={{ fontWeight: "bold", borderBottom: "2px solid black", paddingBottom: "8px" }}>
            Job Details
          </Typography>

          {/* Location */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LocationOnIcon color="info" />
              <Typography>Vancouver, CA</Typography>
            </Box>
            <IconButton size="small">
              <EditIcon />
            </IconButton>
          </Box>

          {/* Job Type */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WorkIcon color="info" />
              <Typography>IT, Software Engineer, Frontend</Typography>
            </Box>
            <IconButton size="small">
              <EditIcon />
            </IconButton>
          </Box>

          {/* Created Date */}
          <Box sx={{ display: "flex", alignItems: "center", marginTop: 2 }}>
            <AccessTimeIcon color="info" />
            <Typography sx={{ marginLeft: 1 }}>Created at: Jan 3rd, 2025</Typography>
          </Box>

          {/* Interactive Edit Button */}
          <Box sx={{ marginTop: 4, textAlign: "center" }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#1976D2",
                color: "#fff",
                fontWeight: "bold",
                padding: "10px 20px",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#125AA0" }
              }}
            >
              Edit In Interactive Mode
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default JobDetails;