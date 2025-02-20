import { Box, Typography, Button, Tabs, Tab, Chip } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { ROUTES } from "../../routes/routePaths";


const HiringManagerNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobPostingId } = useParams(); // ✅ Extract jobPostingId from URL
  const [tabValue, setTabValue] = useState(location.pathname);

  useEffect(() => {
    setTabValue(location.pathname);
  }, [location]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
    navigate(newValue);
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", padding: 2 }}>
      {/* Job Title & Status */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5">ML Compiler Software Engineer PEY Co-op</Typography>
        <Chip label="Published" color="success" />
      </Box>

      {/* Job Stats & Actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 1 }}>
        <Typography variant="body2">Application Received: 67 | Machine Evaluated: 12 | Processing: 32</Typography>
        <Button variant="contained" color="error">Close Job</Button>
      </Box>

      {/* Tabs Navigation (Now Uses Constants) */}
      <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ marginTop: 2 }}>
        <Tab label="Job Details" value={ROUTES.jobDetails(jobPostingId!)} />
        <Tab label="Evaluation Metrics" value={ROUTES.evaluationMetrics(jobPostingId!)} />
        <Tab label="Applications" value={ROUTES.applications(jobPostingId!)} />
        <Tab label="Reports" value={ROUTES.reports(jobPostingId!)} />
      </Tabs>
    </Box>
  );
};

export default HiringManagerNav;