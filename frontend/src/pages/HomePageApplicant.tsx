import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import CustomButton from "../components/Common/Buttons/CustomButton";
import { colors } from "../styles/commonStyles";

const HomePage = () => {
  return (
    <Box
      sx={{
        // Outer container that fills the viewport and centers content
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        p: 4,
        backgroundColor: "#f9f9f9",
      }}
    >
      <Box
        sx={{
          // Inner wrapper with 6xl max width (~1152px) and full width
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          maxWidth: "65rem", // 72rem = Tailwind’s max-w-6xl
          width: "100%",
        }}
      >
        {/* Left Column */}
        <Box
          sx={{
            width: { xs: "100%", md: "50%" },
            backgroundColor: "white",
            p: { xs: 4, md: 5 }, // Tailwind p-10 ≈ 2.5rem
            boxShadow: 4,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              mb: 3,
              color: "#146eb4",
              // Tailwind text-4xl = 2.25rem
              fontSize: { xs: "2rem", md: "2.25rem" },
            }}
          >
            Empowering Builders to Change the World
          </Typography>

          <Typography
            sx={{
              // Tailwind text-lg = 1.125rem
              fontSize: { xs: "1rem", md: "1rem" },
              color: colors.gray2,
              lineHeight: 1.5,
              mb: 4,
            }}
          >
            At AWS, we empower builders to turn bold ideas into
            reality—transforming industries, communities, and the world. Here,
            you'll collaborate with the brightest minds in cloud
            innovation, solve meaningful challenges, and push the boundaries of
            what's possible. Your voice matters, your impact is real, and
            your potential is limitless. Join a culture where diverse
            perspectives fuel innovation, and where you have the freedom to
            build, lead, and make a difference.
          </Typography>

          <Link to="/applicant/job-postings" style={{ textDecoration: "none" }}>
            <CustomButton variant="filled" className="text-lg px-8 py-4"
            >
              Apply Now
            </CustomButton>
          </Link>
        </Box>

        {/* Right Column */}
        <Box
          sx={{
            width: { xs: "100%", md: "50%" },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: { xs: 4, md: 0 },
          }}
        >
          <Box
            component="img"
            src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
            alt="AWS RECRUIT"
            sx={{
              // Tailwind w-64 = 16rem
              width: "15rem",
              mb: 3,
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              letterSpacing: "0.1em", // Tailwind tracking-widest
              color: colors.black,
              fontSize: { xs: "1.5rem", md: "2.25rem" },
            }}
          >
            R.E.C.R.U.I.T
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;