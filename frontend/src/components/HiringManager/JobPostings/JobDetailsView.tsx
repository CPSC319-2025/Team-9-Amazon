import { Box, Typography, Grid, Button, Stack, Tooltip } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useEffect, useMemo, useState } from "react";
import { JobPosting } from "../../../types/JobPosting/jobPosting";
import { EditMode } from "../../../types/JobPosting/JobPostingEditMode";
import JobTitleSection from "./JobDetailsView/JobTitleSection";
import JobTextSection from "./JobDetailsView/JobTextSection";
import JobLocation from "./JobDetailsView/JobLocation";
import JobTags from "./JobDetailsView/JobTags";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  colors,
  filledButtonStyle,
  outlinedButtonStyle,
} from "../../../styles/commonStyles";
import ConfirmDialog from "../../Common/ConfirmDialog";
import { JobDetailsMode } from "../../../types/JobPosting/JobDetailsMode";
import { useSnackbar } from "notistack";
import { useBlocker, useBrowserBlocker } from "../UnsavedChangesBlocker";
import { FIELD_MAX_LENGTHS } from "../../../utils/jobPostingValidationRules";
interface JobDetailsSectionProps {
  jobPosting: JobPosting;
  mode: JobDetailsMode;
  editable?: boolean;
  onApply?: () => void;
  onCancel?: () => void;
  onSave?: (jobPosting: JobPosting) => void;

}

const JobDetailsView = ({
  jobPosting,
  mode,
  onApply = () => { },
  onCancel = () => { },
  onSave = () => { },
}: JobDetailsSectionProps) => {
  const [editedJob, setEditedJob] = useState<JobPosting>({ ...jobPosting });
  const [editMode, setEditMode] = useState<EditMode | null>(null);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Synchronize local state when the context jobPosting changes. (for edit mode)
  useEffect(() => {
    setEditedJob({ ...jobPosting });
  }, [jobPosting]);

  // Snackbar
  const { enqueueSnackbar } = useSnackbar();


  // Confirm Dialogue
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [errors, setErrors] = useState<Partial<Record<keyof JobPosting, string>>>({});

  const editable = useMemo(() => mode !== JobDetailsMode.APPLY, [mode]);

  // Handle input changes
  const handleChange = (field: keyof JobPosting, value: string) => {
    setEditedJob((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);

    const maxLength = FIELD_MAX_LENGTHS[field];

    if (maxLength !== undefined && value.length > maxLength) {
      setErrors((prev) => ({
        ...prev,
        [field]: `Maximum allowed characters for ${field} is ${FIELD_MAX_LENGTHS[field]}.`,
      }));
    } else if (!value.trim()) {
      setErrors((prev) => ({ ...prev, [field]: "This field is required." }));
    } else {
      setErrors((prev) => {
        const { [field]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleChangeStringArray = (
    field: keyof JobPosting,
    value: string[]
  ) => {
    setEditedJob((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    setHasUnsavedChanges(false);
    onSave(editedJob);

    // setSnackbarMessage("Job Posting Saved!");
    // setSnackbarSeverity("success");
    // setOpenSnackbar(true);
    setEditMode(null);
  };

  const handleCancel = () => {
    setConfirmDialogOpen(true);
    setHasUnsavedChanges(false);
    setEditMode(null);
  };

  const toggleEditMode = (newEditMode: EditMode) => {
    if (editMode === newEditMode) {
      setEditMode(null);
    } else {
      setEditMode(newEditMode);
    }
  };

  // Confirm Dialogue
  const handleConfirmCancel = () => {
    setEditedJob({ ...jobPosting });
    setEditMode(null);
    setConfirmDialogOpen(false);

    // Show Snackbar
    enqueueSnackbar("Changes Discarded!", { variant: "warning" });

    onCancel();
  };

  // Block navigation if there are unsaved changes
  useBlocker(() =>
    hasUnsavedChanges
      ? window.confirm(
        "You have unsaved changes. Are you sure you want to leave this page?"
      )
      : true,
    hasUnsavedChanges
  );
  useBrowserBlocker(() => hasUnsavedChanges, hasUnsavedChanges);

  return (
    <Box sx={{ padding: "40px", maxWidth: "1200px", margin: "auto" }}>

      {/* Top Row: Job Title + Action Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <JobTitleSection
          jobPosting={editedJob}
          editable={editable}
          editMode={editMode}
          toggleEditMode={toggleEditMode}
          handleChange={handleChange}
          errorTitle={errors.title}
          errorSubtitle={errors.subtitle}
        />
        {mode === JobDetailsMode.APPLY && (
          <Button sx={{
            ...filledButtonStyle,
            color: colors.black
          }}
            variant="contained"
            color="primary"
            onClick={() => onApply && onApply()}>
            Apply
          </Button>
        )}
      </Box>


      {/* Two-column Layout */}
      <Grid container spacing={20}>
        {/* Left Column: Job Description */}
        <Grid item xs={12} md={8}>
          <JobTextSection
            field="description"
            title="Job Description"
            jobPosting={editedJob}
            editable={editable}
            editMode={editMode}
            toggleEditMode={toggleEditMode}
            handleChange={handleChange}
            errorMessage={errors.description}
          />
          <JobTextSection
            field="qualifications"
            title="Qualifications"
            jobPosting={editedJob}
            editable={editable}
            editMode={editMode}
            toggleEditMode={toggleEditMode}
            handleChange={handleChange}
            errorMessage={errors.qualifications}
          />
          <JobTextSection
            field="responsibilities"
            title="Responsibilities"
            jobPosting={editedJob}
            editable={editable}
            editMode={editMode}
            toggleEditMode={toggleEditMode}
            handleChange={handleChange}
            errorMessage={errors.responsibilities}
          />
        </Grid>

        {/* Right Column: Job Details */}
        <Grid item xs={12} md={4}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              borderBottom: "2px solid black",
              paddingBottom: "8px",
            }}
          >
            Job Details
          </Typography>

          <JobLocation
            jobPosting={editedJob}
            editable={editable}
            editMode={editMode}
            toggleEditMode={toggleEditMode}
            handleChange={handleChange}
            errorMessage={errors.location}
          />
          <JobTags
            jobPosting={editedJob}
            editable={editable}
            editMode={editMode}
            toggleEditMode={toggleEditMode}
            handleChange={handleChangeStringArray}
          />

          {/* Created Date */}
          <Box sx={{ display: "flex", alignItems: "center", marginTop: 2 }}>
            <AccessTimeIcon color="info" />
            <Typography sx={{ marginLeft: 1 }}>
              Created at: {jobPosting.createdAt.toString()}
            </Typography>
          </Box>

          {/* Save and Cancel */}
          {editable && (
            <Stack
              direction="row"
              spacing={2}
              sx={{ marginTop: 3, textAlign: "center" }}
            >
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                sx={{
                  ...outlinedButtonStyle,
                  color: colors.orange1,
                  borderColor: colors.orange1,
                }}
              >
                CANCEL
              </Button>
              <Tooltip
                title={
                  Object.keys(errors).length > 0
                    ? "Please fill out all required fields to save."
                    : ""
                }
                arrow
              >
                <span>
                  <Button
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={Object.keys(errors).length > 0}
                    sx={{
                      ...filledButtonStyle,
                    }}
                  >
                    {mode === JobDetailsMode.CREATE ? "Create" : "Save"}
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          )}

          {/* Confirmation Dialog */}
          <ConfirmDialog
            open={confirmDialogOpen}
            title="Discard Changes?"
            message="Are you sure you want to discard all changes?"
            cancelText="Keep Editing"
            confirmText="Discard Changes"
            onConfirm={handleConfirmCancel}
            onCancel={() => {
              setHasUnsavedChanges(true);
              setConfirmDialogOpen(false);
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default JobDetailsView;
