import { Box, CircularProgress, Typography } from "@mui/material";

export interface LoadingIndicatorProps {
  variant?: "indeterminate" | "determinate";
  value?: number;
  text?: string;
  size?: number;
}


export default function CircularProgressLoader(
  {variant = "indeterminate",
  value = 0,
  text = "",
  size = 40}: LoadingIndicatorProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <CircularProgress variant={variant} value={value} size={size} />
      <Typography variant="body2" sx={{ mt: 1 }}>
        {text}
      </Typography>
    </Box>
  );
}
