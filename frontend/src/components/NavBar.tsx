import { WorkspacePremium } from "@mui/icons-material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GroupIcon from "@mui/icons-material/Group";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import WorkIcon from "@mui/icons-material/Work";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Toolbar
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { getToken } from "../api/login";
import { ROUTES } from "../routes/routePaths";
import { DecodedToken } from "../types/utils";

const TopNavbar = () => {
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHiringManager, setIsHiringManager] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
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
        let fullName = `${decoded?.firstName} ${decoded?.lastName}`;
        fullName = fullName.length > 25 ? `${fullName.slice(0, 23)}...` : fullName;
        setFullName(fullName);
        let email = decoded?.email;
        email = email.length > 25 ? `${email.slice(0, 23)}...` : email;
        setEmail(email);
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
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
    handleMenuClose();
  };

  // Navigation items for the menu
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
        {/* Left side: Burger menu and AWS Logo */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {shouldShowAccountButton && navigationItems.length > 0 && (
            <>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleMenuOpen}
                sx={{
                  mr: 2,
                  color: "#232F3E",
                  "&:hover": {
                    bgcolor: "rgba(255, 153, 0, 0.1)",
                  },
                }}
              >
                <MenuIcon />
              </IconButton>

              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
              >
                <List sx={{ width: "180px" }}>
                  {navigationItems.map((item, index) => (
                    <ListItemButton
                      key={index}
                      onClick={() => handleNavigation(item.path)}
                      sx={{
                        color: "#232F3E",
                        "&:hover": {
                          bgcolor: "rgba(255, 153, 0, 0.1)",
                        },
                        ...(location.pathname === item.path && {
                          borderLeft: "4px solid #FF9900",
                          bgcolor: "rgba(255, 153, 0, 0.05)",
                        }),
                      }}
                    >
                      <ListItemIcon sx={{ color: location.pathname === item.path ? "#FF9900" : "#232F3E" }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  ))}
                </List>
              </Menu>
            </>
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
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <List sx={{ width: "180px" }}>
                <ListItemText
                  primary={fullName}
                  secondary={email}
                  sx={{ textAlign: "center" }}
                />
                <Divider sx={{ marginBottom: 1 }} />
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
