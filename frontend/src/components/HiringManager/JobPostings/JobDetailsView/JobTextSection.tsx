import { Typography, TextField, IconButton, Box, Divider } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { JobPosting } from "../../../../types/JobPosting/jobPosting";
import { EditMode } from "../../../../types/JobPosting/JobPostingEditMode";

interface JobTextSectionProps {
  field: keyof JobPosting;
  title: string;
  jobPosting: JobPosting;
  editable: boolean;
  editMode: EditMode | null;
  toggleEditMode: (mode: EditMode) => void;
  handleChange: (field: keyof JobPosting, value: string) => void;
  errorMessage?: string;
}

const JobTextSection: React.FC<JobTextSectionProps> = ({
  field,
  title,
  jobPosting,
  editable,
  editMode,
  toggleEditMode,
  handleChange,
  errorMessage
}) => {
  return jobPosting[field] || editable ? (
    <>
      <Divider sx={{ marginY: 2 }} />
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {title}
          </Typography>
          {editable && (
            <IconButton size="small" onClick={() => toggleEditMode(field as EditMode)}>
              <EditIcon />
            </IconButton>
          )}
        </Box>
        {editMode === field ? (
          <TextField
            value={jobPosting[field] as string}
            onChange={(e) => handleChange(field, e.target.value)}
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            error={editable && !!errorMessage}
            helperText={editable ? errorMessage : undefined} />
        ) : (
          <Box>
            <Typography variant="body1">{jobPosting[field]?.toString()}</Typography>
            {editable && errorMessage && (
              <Typography variant="caption" color="error">
                {errorMessage}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </>
  ) : null;
};

export default JobTextSection;