import { Typography, TextField, IconButton, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { JobPosting } from "../../../../types/JobPosting/jobPosting";
import { EditMode } from "../../../../types/JobPosting/JobPostingEditMode";

interface JobTitleSectionProps {
  jobPosting: JobPosting;
  editable: boolean;
  editMode: EditMode | null;
  toggleEditMode: (mode: EditMode) => void;
  handleChange: (field: keyof JobPosting, value: string) => void;
}

const JobTitleSection = ({ jobPosting, editable, editMode, toggleEditMode, handleChange }: JobTitleSectionProps) => {
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {editMode === EditMode.Title ? (
          <TextField value={jobPosting.title} onChange={(e) => handleChange("title", e.target.value)} fullWidth variant="outlined" />
        ) : (
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>{jobPosting.title}</Typography>
        )}
        {editable && (
          <IconButton size="small" onClick={() => toggleEditMode(EditMode.Title)}>
            <EditIcon />
          </IconButton>
        )}
      </Box>

      {editMode === EditMode.Title ? (
        <TextField value={jobPosting.subtitle} onChange={(e) => handleChange("subtitle", e.target.value)} fullWidth variant="outlined" />
      ) : (
        <Typography variant="subtitle1" color="text.secondary">{jobPosting.subtitle}</Typography>
      )}
    </Box>
  );
};

export default JobTitleSection;