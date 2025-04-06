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
  errorTitle?: string;
  errorSubtitle?: string;
}

const JobTitleSection = ({
  jobPosting,
  editable,
  editMode,
  toggleEditMode,
  handleChange,
  errorTitle,
  errorSubtitle,
}: JobTitleSectionProps) => {
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {editMode === EditMode.Title ? (
          <TextField
            value={jobPosting.title}
            onChange={(e) => handleChange("title", e.target.value)}
            fullWidth
            variant="outlined"
            error={editable && !!errorTitle}
            helperText={editable ? errorTitle : undefined}
          />
        ) : (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>{jobPosting.title}</Typography>
            {editable && errorTitle && (
              <Typography variant="caption" color="error">
                {errorTitle}
              </Typography>
            )}
          </Box>
        )}
        {editable && (
          <IconButton size="small" onClick={() => toggleEditMode(EditMode.Title)}>
            <EditIcon />
          </IconButton>
        )}
      </Box>

      {editMode === EditMode.Title ? (
        <TextField
          value={jobPosting.subtitle}
          onChange={(e) => handleChange("subtitle", e.target.value)}
          fullWidth
          variant="outlined"
          error={editable && !!errorSubtitle}
          helperText={editable ? errorSubtitle : undefined}
        />
      ) : (
        <Box>
          <Typography variant="subtitle1" color="text.secondary">{jobPosting.subtitle}</Typography>
          {editable && errorSubtitle && (
            <Typography variant="caption" color="error">
              {errorSubtitle}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default JobTitleSection;