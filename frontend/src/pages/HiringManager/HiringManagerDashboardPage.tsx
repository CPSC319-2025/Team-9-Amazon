import { PlusCircle } from "lucide-react";
import { Box, Button, Container, Grid } from "@mui/material";
import { textButtonStyle, colors } from "../../styles/commonStyles";
import { JobCard } from "../../components/Common/JobCard.tsx";
import { Header } from "../../components/Common/Header";

const HiringManagerDashboardPage = () => {
  const headerActions = (
    <Button
      startIcon={<PlusCircle size={20} />}
      sx={{ ...textButtonStyle, color: colors.blue1 }}
    >
      Add New Job Posting
    </Button>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.white }}>
      <Header title="Job Postings" actions={headerActions} />

      <Container maxWidth={false} sx={{ py: 4 }}>
        <Box sx={{ bgcolor: colors.gray1, borderRadius: 2, p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <JobCard title="Software Engineer" applicants={70} />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <JobCard title="Frontend Developer" applicants={45} />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <JobCard title="DevOps Engineer" applicants={32} />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default HiringManagerDashboardPage;
