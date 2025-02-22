import { Box, Typography, Button, Tabs, Tab, Chip } from "@mui/material";
import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { ROUTES } from "../../routes/routePaths";
import {
  chipStyle,
  colors,
  filledButtonStyle,
} from "../../styles/commonStyles";
import { JobPosting } from "../../types/jobPosting";

interface HiringManagerNavProps {
  jobPostingId: string;
  jobPosting: JobPosting;
}

const HiringManagerNav = ({ jobPostingId, jobPosting }: HiringManagerNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabValue, setTabValue] = useState(location.pathname);

  useEffect(() => {
    // If on base job posting route, default to "Job Details"
    if (location.pathname === ROUTES.jobPosting(jobPostingId!)) {
      setTabValue(ROUTES.jobDetails(jobPostingId!));
    } else {
      setTabValue(location.pathname);
    }
  }, [location.pathname, jobPostingId]);

  useEffect(() => {
    setTabValue(location.pathname);
  }, [location]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
    navigate(newValue);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
        padding: "20px",
        borderRadius: "8px",
      }}
    >
      {/* Job Title & Status */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 3,
        }}
      >
        <Box>
          <Typography variant="h4">
            {jobPosting.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "1rem", marginBottom: "8px" }}
          >
            {jobPosting.subtitle}
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontSize: "0.95rem", color: "#333" }}
          >
            <strong>Application Received:</strong> {jobPosting.num_applicants ?? 0} |{" "}
            <strong>Machine Evaluated:</strong> {jobPosting.num_machine_evaluated ?? 0} |{" "}
            <strong>Processing:</strong> {jobPosting.num_processes ?? 0}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Chip
            label="PUBLISHED"
            sx={{
              ...chipStyle,
              color: `${colors.green2}`,
              borderColor: colors.green2,
            }}
          />
          <Button
            variant="contained"
            sx={{
              ...filledButtonStyle,
              backgroundColor: colors.orange1,
              color: colors.black1,
            }}
          >
            CLOSE JOB
          </Button>
        </Box>
      </Box>

      {/* Tabs Navigation */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        centered
        sx={{ marginTop: 2 }}
      >
        <Tab label="Job Details" value={ROUTES.jobDetails(jobPostingId!)} />
        <Tab
          label="Evaluation Metrics"
          value={ROUTES.evaluationMetrics(jobPostingId!)}
        />
        <Tab label="Applications" value={ROUTES.applications(jobPostingId!)} />
        <Tab label="Reports" value={ROUTES.reports(jobPostingId!)} />
      </Tabs>
    </Box>
  );
};

export default HiringManagerNav;
