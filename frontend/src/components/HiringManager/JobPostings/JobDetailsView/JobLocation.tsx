import { Typography, TextField, IconButton, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { JobPosting } from "../../../../types/JobPosting/jobPosting";
import { EditMode } from "../../../../types/JobPosting/JobPostingEditMode";

interface JobLocationProps {
  jobPosting: JobPosting;
  editable: boolean;
  editMode: EditMode | null;
  toggleEditMode: (mode: EditMode) => void;
  handleChange: (field: keyof JobPosting, value: string) => void;
}

const JobLocation: React.FC<JobLocationProps> = ({ jobPosting, editable, editMode, toggleEditMode, handleChange }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <LocationOnIcon color="primary" />
        {editMode === EditMode.Location ? (
          <TextField
            value={jobPosting.location}
            onChange={(e) => handleChange("location", e.target.value)}
            fullWidth
            variant="outlined"
          />
        ) : (
          <Typography>{jobPosting.location}</Typography>
        )}
      </Box>

      {editable && (
        <IconButton size="small" onClick={() => toggleEditMode(EditMode.Location)}>
          <EditIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default JobLocation;