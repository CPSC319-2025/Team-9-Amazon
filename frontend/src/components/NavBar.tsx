import { AppBar, Toolbar, Avatar, IconButton, Menu, Box, List, ListItemButton, ListItemIcon, ListItemText, Divider } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import WorkIcon from '@mui/icons-material/Work';
import { useState } from "react";
import { Link } from "react-router";
import { ROUTES } from "../routes/routePaths";

const TopNavbar = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#fff", color: "#000", padding: "10px" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* AWS Logo */}
        <Box component={Link} to="/" sx={{ display: "flex", alignItems: "center" }}>
          <img src="/aws-icon.png" alt="AWS Logo" width={50} />
        </Box>

        {/* Profile Avatar & Dropdown */}
        <IconButton onClick={handleMenuOpen}>
          <Avatar />
         <ArrowDropDownIcon sx={{ marginLeft: "5px" }} />
        </IconButton>
        
        {/* Dropdown Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} sx={{ minWidth: "250px" }}>
          <List sx={{ width: "220px" }}>
            <ListItemButton component={Link} to="/profile" onClick={handleMenuClose}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Your profile" />
            </ListItemButton>
            
            <Divider />

            <ListItemButton component={Link} to={ROUTES.hiringManager.hiringManagerDashboard} onClick={handleMenuClose}>
              <ListItemIcon>
                <WorkIcon />
              </ListItemIcon>
              <ListItemText primary="Hiring Manager Dashboard" />
            </ListItemButton>

            <ListItemButton component={Link} to="/user-management" onClick={handleMenuClose}>
              <ListItemIcon>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="User accounts management" />
            </ListItemButton>

            <ListItemButton component={Link} to="/criteria-management" onClick={handleMenuClose}>
              <ListItemIcon>
                <CheckCircleIcon />
              </ListItemIcon>
              <ListItemText primary="Criteria management" />
            </ListItemButton>

            <Divider />

            <ListItemButton component={Link} to="/logout" onClick={handleMenuClose}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Sign out" />
            </ListItemButton>
          </List>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavbar;