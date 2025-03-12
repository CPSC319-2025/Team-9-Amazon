import { useState } from "react";
import { useNavigate } from "react-router";
import { ROUTES } from "../routes/routePaths";
import CustomTextField from "../components/Common/FormInputs/CustomTextField";
import CustomButton from "../components/Common/Buttons/CustomButton";
import {
  TextField,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { login } from "../services/auth";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await login(email, password);

      if (response.staff.isHiringManager) {
        navigate(ROUTES.hiringManager.hiringManagerDashboard);
      } else {
        setError("Access denied. Only hiring managers can access this system.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-[#f9f9f9]">
      {/* Logo */}
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
        alt="AWS RECRUIT"
        className="w-[300px] mb-4"
      />

      <h2 className="text-2xl font-bold mb-10 tracking-widest">
        R.E.C.R.U.I.T
      </h2>

      {/* Login Form */}
      <div className="w-[300px] flex flex-col gap-4">
        <CustomTextField
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyPress}
          minWidth={300}
          error={!!error}
        />

        {/* Password Field with Eye Icon */}
        <TextField
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyPress}
          error={!!error}
          sx={{ minWidth: 300 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Login Button */}
        <CustomButton variant="filled" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </CustomButton>
      </div>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setError("")}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
}
