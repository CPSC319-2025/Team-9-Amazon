import { Box, Typography, Button, Tabs, Tab, Chip } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { ROUTES } from "../../routes/routePaths";

const HiringManagerNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobPostingId } = useParams(); 
  const [tabValue, setTabValue] = useState(location.pathname);

  useEffect(() => {
    setTabValue(location.pathname);
  }, [location]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
    navigate(newValue);
  };

  return (
    <Box sx={{ backgroundColor: "#fff", boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)", padding: "20px", borderRadius: "8px" }}>
      {/* Job Title & Status */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <Box>
          <Typography variant="h4">ML Compiler Software Engineer PEY Co-op</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem", marginBottom: "8px" }}>
            (12-16 months), Annapurna ML - Co-op
          </Typography>
          <Typography variant="body2" sx={{ fontSize: "0.95rem", color: "#333" }}>
            <strong>Application Received:</strong> 67 | <strong>Machine Evaluated:</strong> 12 | <strong>Processing:</strong> 32
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
        <Chip
            label="Published"
            sx={{
              backgroundColor: "white",
              color: "#5fa81a",
              border: "1.5px solid #5fa81a",
              fontSize: "0.85rem",
              fontWeight: "500",
              padding: "6px 12px",
              borderRadius: "16px"
            }}
          />
          {/* <Chip label="Published" sx={{borderColor: "#5fa81a", borderBottomWidth: 3, backgroundColor: "#fff", color: "#5fa81a", fontSize: "0.85rem", fontWeight: "500", padding: "6px 12px", borderRadius: "5px" }} /> */}
          <Button variant="contained" sx={{ backgroundColor: "#D32F2F", color: "#fff", fontWeight: "500", padding: "8px 16px", borderRadius: "6px", "&:hover": { backgroundColor: "#B71C1C" } }}>
            CLOSE JOB
          </Button>
        </Box>
      </Box>

      {/* Tabs Navigation */}
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