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
  Drawer,
  Typography,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import GroupIcon from "@mui/icons-material/Group";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import WorkIcon from "@mui/icons-material/Work";
import MenuIcon from "@mui/icons-material/Menu";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ROUTES } from "../routes/routePaths";
import { getToken } from "../api/login";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "../types/utils";
import { WorkspacePremium } from "@mui/icons-material";
import AssignmentIcon from '@mui/icons-material/Assignment';

const TopNavbar = () => {
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHiringManager, setIsHiringManager] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsAdmin(false);
    setIsHiringManager(false);
    navigate("/login");
    handleProfileMenuClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  // Navigation items for the drawer menu
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
        {/* Left side: Hamburger menu and AWS Logo */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {shouldShowAccountButton && navigationItems.length > 0 && (
            <IconButton 
              edge="start" 
              color="inherit" 
              aria-label="menu" 
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2,
                color: '#232F3E',
                '&:hover': {
                  bgcolor: 'rgba(255, 153, 0, 0.1)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
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
        </Box>

        {/* Right side: Profile menu or Login button */}
        {shouldShowAccountButton ? (
          <>
            <IconButton onClick={handleProfileMenuOpen}>
              <Avatar />
              <ArrowDropDownIcon sx={{ marginLeft: "5px" }} />
            </IconButton>

            <Menu 
              anchorEl={profileAnchorEl} 
              open={Boolean(profileAnchorEl)} 
              onClose={handleProfileMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
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

      {/* Navigation Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': { 
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: '#fff',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Typography variant="h6" sx={{ color: '#232F3E', fontWeight: 'bold' }}>
            AWS Hiring Portal
          </Typography>
        </Box>
        <List>
          {navigationItems.map((item, index) => (
            <ListItemButton 
              key={index} 
              onClick={() => handleNavigation(item.path)}
              sx={{
                color: '#232F3E',
                '&:hover': {
                  bgcolor: 'rgba(255, 153, 0, 0.1)',
                },
                ...(location.pathname === item.path && {
                  borderLeft: '4px solid #FF9900',
                  bgcolor: 'rgba(255, 153, 0, 0.05)',
                }),
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? '#FF9900' : '#232F3E' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </AppBar>
  );
};

export default TopNavbar;
