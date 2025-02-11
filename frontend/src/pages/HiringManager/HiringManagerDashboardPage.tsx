import { PlusCircle, FileText } from "lucide-react";
import { Typography, Box, Button, Container, Grid } from "@mui/material";
import { textButtonStyle, colors } from "../../styles/commonStyles";
import { JobCard } from "../../components/HiringManagerComponents";

const HiringManagerDashboardPage = () => {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.white }}>
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: colors.gray1,
          px: 4,
          py: 3,
          borderRadius: "0 0 12px 12px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FileText size={32} style={{ color: colors.black }} />
            <Typography
              variant="h4"
              component="h1"
              sx={{ color: colors.black, fontWeight: 600 }}
            >
              Job Postings
            </Typography>
          </Box>
          <Button
            startIcon={<PlusCircle size={20} />}
            sx={{ ...textButtonStyle, color: colors.blue1 }}
          >
            Add New Job Posting
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxWidth={false} sx={{ py: 4 }}>
        <Box sx={{ bgcolor: colors.gray1, borderRadius: 2, p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <JobCard />
            </Grid>
            {/* Add more JobCard components as needed */}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default HiringManagerDashboardPage;
