import { useState } from "react";
import { useNavigate } from "react-router";
import { ROUTES } from "../routes/routePaths";
import CustomTextField from "../components/Common/FormInputs/CustomTextField";
import CustomButton from "../components/Common/Buttons/CustomButton";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }
    
    navigate(ROUTES.hiringManager.hiringManagerDashboard);
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
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          minWidth={300}
        />
        
        {/* Password Field with Eye Icon */}
        <TextField
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ minWidth: 300 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Login Button */}
        <CustomButton variant="filled" onClick={handleLogin}>
          Login
        </CustomButton>
      </div>
    </div>
  );
}
