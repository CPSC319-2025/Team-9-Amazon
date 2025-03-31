import React from "react";
import {
  Box,
  Checkbox,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Typography,
} from "@mui/material";
import { colors } from "../../styles/commonStyles";
import { JobPostingStatus } from "../../types/JobPosting/jobPosting";

interface JobStatusFilterSidebarProps {
  selectedStatuses: JobPostingStatus[];
  onChange: (statuses: JobPostingStatus[]) => void;
}

const allStatuses: JobPostingStatus[] = [
  JobPostingStatus.DRAFT,
  JobPostingStatus.OPEN,
  JobPostingStatus.CLOSED,
];

export const JobStatusFilterSidebar: React.FC<JobStatusFilterSidebarProps> = ({
  selectedStatuses,
  onChange,
}) => {
  const handleToggle = (status: JobPostingStatus) => {
    if (selectedStatuses.includes(status)) {
      onChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onChange([...selectedStatuses, status]);
    }
  };

  const handleSelectAll = () => {
    onChange(allStatuses);
  };

  return (
    <Box
      sx={{
        width: 250,
        borderRight: `1px solid ${colors.gray1}`,
        height: "100vh",
        p: 2,
        backgroundColor: colors.white,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Job Status
      </Typography>
      <List>
        {allStatuses.map((status) => (
          <ListItemButton key={status} onClick={() => handleToggle(status)}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={selectedStatuses.includes(status)}
                tabIndex={-1}
                disableRipple
                inputProps={{ "aria-labelledby": `checkbox-list-label-${status}` }}
              />
            </ListItemIcon>
            <ListItemText
              id={`checkbox-list-label-${status}`}
              primary={status[0].toUpperCase() + status.slice(1).toLowerCase()}
            />
          </ListItemButton>
        ))}
      </List>
      <Button variant="outlined" onClick={handleSelectAll} fullWidth sx={{ mt: 2 }}>
        Select All
      </Button>
    </Box>
  );
};
