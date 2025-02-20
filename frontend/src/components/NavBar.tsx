import { AppBar, Toolbar, Avatar, IconButton, Menu, MenuItem, Box } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useState } from "react";
import { Link } from "react-router";

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
        <Box>
          <img src="/aws-icon.png" alt="AWS Logo" width={50} />
        </Box>

        {/* Profile Avatar & Dropdown */}
        <IconButton onClick={handleMenuOpen}>
          <Avatar />
         <ArrowDropDownIcon />

        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem component={Link} to="/profile">Profile</MenuItem>
          <MenuItem component={Link} to="/settings">Settings</MenuItem>
          <MenuItem component={Link} to="/logout">Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavbar;