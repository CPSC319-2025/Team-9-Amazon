import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Box, Button, Container, Grid } from "@mui/material";
import { textButtonStyle, colors } from "../../styles/commonStyles";
import { JobCard } from "../../components/Common/JobCard.tsx";
import { Header } from "../../components/Common/Header";
import { mockJobPostings } from "../../utils/mockData.ts";
import { JobPosting } from "../../types/JobPosting/jobPosting.ts";
import { useNavigate } from "react-router";
import { ROUTES } from "../../routes/routePaths.ts";

const HiringManagerDashboardPage = () => {
  const [jobPostings] = useState<JobPosting[]>(mockJobPostings);

  const handleCreateJob = () => {
    navigate(ROUTES.hiringManager.hiringManagerCreateJob);
  };

  const headerActions = (
    <Button
      startIcon={<PlusCircle size={20} />}
      sx={{ ...textButtonStyle, color: colors.blue1 }}
      onClick={handleCreateJob}
    >
      Add New Job Posting
    </Button>
  );


  const navigate = useNavigate();

  const handleCardClick = (jobPostingId: string) => {
    navigate(ROUTES.hiringManager.jobPosting(jobPostingId));
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.white }}>
      <Header title="Job Postings" actions={headerActions} />

      <Container maxWidth={false} sx={{ py: 4 }}>
        <Box sx={{ bgcolor: colors.gray1, borderRadius: 2, p: 3 }}>
          <Grid container spacing={3}>
            {jobPostings.map((jobPosting) => (
              <Grid item xs={12} md={6} lg={4} key={jobPosting.id}>
                <JobCard
                  title={jobPosting.title}
                  applicants={jobPosting.num_applicants ?? 0}
                  onClick={() => handleCardClick(jobPosting.id)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default HiringManagerDashboardPage;
