import { CircularProgress } from "@mui/material";

export default function CircularProgressLoader() {
  return (
    <div className="fixed inset-0 bg-opacity-30 z-50 flex items-center justify-center">
      <CircularProgress size={40} sx={{ color: '#FF9900' }} />
    </div>
  );
}
