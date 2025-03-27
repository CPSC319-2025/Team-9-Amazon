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
  Stack,
  Tooltip,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import GroupIcon from "@mui/icons-material/Group";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import WorkIcon from "@mui/icons-material/Work";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ROUTES } from "../routes/routePaths";
import { getToken } from "../api/login";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "../types/utils";
import { WorkspacePremium } from "@mui/icons-material";
import AssignmentIcon from '@mui/icons-material/Assignment';

const TopNavbar = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHiringManager, setIsHiringManager] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const shouldShowLoginButton =
    !isLoggedIn && location.pathname !== "/login" && !location.pathname.startsWith("/applicant");

  const shouldShowAccountButton =
    isLoggedIn && location.pathname !== "/login" && !location.pathname.startsWith("/applicant");

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

  // Navigation items for the header
  const navigationItems = [
    ...(isHiringManager ? [
      {
        label: "Dashboard",
        icon: <WorkIcon />,
        path: ROUTES.hiringManager.hiringManagerDashboard,
      }
    ] : []),
    ...(isAdmin ? [
      {
        label: "Users",
        icon: <GroupIcon />,
        path: "admin/user-management",
      },
      {
        label: "Criteria",
        icon: <CheckCircleIcon />,
        path: "admin/criteria-management",
      },
      {
        label: "Skills",
        icon: <WorkspacePremium />,
        path: "admin/skills-management",
      },
      {
        label: "Assign Jobs",
        icon: <AssignmentIcon />,
        path: "admin/assign-job-postings",
      }
    ] : [])
  ];

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#fff", color: "#000", padding: "10px" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left side: AWS Logo */}
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

        {/* Middle: Navigation buttons */}
        {shouldShowAccountButton && navigationItems.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ flexGrow: 0 }}>
            {navigationItems.map((item, index) => (
              <Tooltip key={index} title={item.label}>
                <Button
                  component={Link}
                  to={item.path}
                  variant="text"
                  startIcon={item.icon}
                  sx={{
                    color: '#232F3E',
                    fontWeight: 'medium',
                    '&:hover': {
                      bgcolor: 'rgba(255, 153, 0, 0.1)',
                    },
                    ...(location.pathname === item.path && {
                      borderBottom: '2px solid #FF9900',
                    }),
                  }}
                >
                  {item.label}
                </Button>
              </Tooltip>
            ))}
          </Stack>
        )}

        {/* Right side: Profile menu or Login button */}
        {shouldShowAccountButton ? (
          <>
            <IconButton onClick={handleMenuOpen}>
              <Avatar />
              <ArrowDropDownIcon sx={{ marginLeft: "5px" }} />
            </IconButton>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <List sx={{ width: "180px" }}>
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
