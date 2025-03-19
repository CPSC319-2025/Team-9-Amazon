import {
  AppBar,
  Toolbar,
  Avatar,
  IconButton,
  Menu,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import GroupIcon from "@mui/icons-material/Group";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import WorkIcon from "@mui/icons-material/Work";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // ✅ FIXED
import { ROUTES } from "../routes/routePaths";
import { getToken } from "../api/login";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "../types/utils";

const TopNavbar = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHiringManager, setIsHiringManager] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const shouldShowLoginButton =
    !isLoggedIn &&
    location.pathname !== "/login" &&
    !location.pathname.startsWith("/applicant");

  const shouldShowAccountButton =
    isLoggedIn &&
    location.pathname !== "/login" &&
    !location.pathname.startsWith("/applicant");

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      if (!token) {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setIsHiringManager(false);
        return;
      }

      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setIsLoggedIn(true);
        setIsAdmin(Boolean(decoded?.isAdmin));
        setIsHiringManager(Boolean(decoded?.isHiringManager));
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        if (location.pathname !== "/login") {
          navigate("/login");
        }
      }
    };

    checkAuth();
  }, [navigate, location.pathname]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsAdmin(false);
    setIsHiringManager(false);
    navigate("/login");
    handleMenuClose();
  };

  return (
    <AppBar
      position="sticky"
      sx={{ backgroundColor: "#fff", color: "#000", padding: "10px" }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* AWS Logo */}
        <Box
          component={Link}
          to={
            isHiringManager
              ? ROUTES.hiringManager.hiringManagerDashboard
              : isAdmin
              ? "admin/user-management"
              : "/applicant/job-postings"
          }
          sx={{ display: "flex", alignItems: "center" }}
        >
          <img src="/aws-icon.png" alt="AWS Logo" width={50} />
        </Box>

        {/* Show either Login button or Profile Avatar based on login status */}
        {shouldShowAccountButton ? (
          <>
            <IconButton onClick={handleMenuOpen}>
              <Avatar />
              <ArrowDropDownIcon sx={{ marginLeft: "5px" }} />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              sx={{ minWidth: "250px" }}
            >
              <List sx={{ width: "220px" }}>
                {isHiringManager && (
                  <ListItemButton
                    component={Link}
                    to={ROUTES.hiringManager.hiringManagerDashboard}
                    onClick={handleMenuClose}
                  >
                    <ListItemIcon>
                      <WorkIcon />
                    </ListItemIcon>
                    <ListItemText primary="Hiring Manager Dashboard" />
                  </ListItemButton>
                )}

                {isAdmin && (
                  <>
                    <ListItemButton
                      component={Link}
                      to="admin/user-management"
                      onClick={handleMenuClose}
                    >
                      <ListItemIcon>
                        <GroupIcon />
                      </ListItemIcon>
                      <ListItemText primary="User accounts management" />
                    </ListItemButton>

                    <ListItemButton
                      component={Link}
                      to="admin/criteria-management"
                      onClick={handleMenuClose}
                    >
                      <ListItemIcon>
                        <CheckCircleIcon />
                      </ListItemIcon>
                      <ListItemText primary="Criteria management" />
                    </ListItemButton>
                  </>
                )}

                <Divider />

                <ListItemButton onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Sign out" />
                </ListItemButton>
              </List>
            </Menu>
          </>
        ) : (
          shouldShowLoginButton && (
            <Button
              component={Link}
              to="/login"
              variant="contained"
              sx={{
                bgcolor: "#FF9900",
                "&:hover": {
                  bgcolor: "#FF8800",
                },
              }}
            >
              Login
            </Button>
          )
        )}
      </Toolbar>
    </AppBar>
  );
};

export default TopNavbar;
