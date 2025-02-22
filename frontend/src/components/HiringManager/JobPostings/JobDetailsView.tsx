import { Box, Typography, Grid, Button, Stack } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useState } from "react";
import { JobPosting } from "../../../types/JobPosting/jobPosting";
import { EditMode } from "../../../types/JobPosting/JobPostingEditMode";
import JobTitleSection from "./JobDetailsView/JobTitleSection";
import JobTextSection from "./JobDetailsView/JobTextSection";
import JobLocation from "./JobDetailsView/JobLocation";
import JobTags from "./JobDetailsView/JobTags";
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { colors } from "../../../styles/commonStyles";
import CustomSnackbar from "../../Common/SnackBar";
import ConfirmDialog from "../../Common/ConfirmDialog";

interface JobDetailsSectionProps {
    jobPosting: JobPosting;
    editable?: boolean;
}

const JobDetailsView = ({ jobPosting, editable = false }: JobDetailsSectionProps) => {
    const [editedJob, setEditedJob] = useState<JobPosting>({ ...jobPosting });
    const [editMode, setEditMode] = useState<EditMode | null>(null);

    // Snackbar
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "info" | "error" | "warning" | undefined>("success");

    // Confirm Dialogue
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    // Handle input changes
    const handleChange = (field: keyof JobPosting, value: string) => {
        setEditedJob((prev) => ({ ...prev, [field]: value }));
    };

    const handleChangeStringArray = (field: keyof JobPosting, value: string[]) => {
        setEditedJob((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        console.log("Saved Job Posting:", editedJob);
        setSnackbarMessage("Job Posting Saved!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        setEditMode(null);
    };

    const handleCancel = () => {
        setConfirmDialogOpen(true);
        setEditMode(null);
    };

    const toggleEditMode = (newEditMode: EditMode) => {
        if (editMode === newEditMode) {
            setEditMode(null);
        } else {
            setEditMode(newEditMode);
        }
    }

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    }

    // Confirm Dialogue
    const handleConfirmCancel = () => {
        setEditedJob({ ...jobPosting });
        setEditMode(null);
        setConfirmDialogOpen(false);
        
        // Show Snackbar
        setSnackbarMessage("Job Posting Cancelled!");
        setSnackbarSeverity("warning");
        setOpenSnackbar(true);
    };

    return (<Box sx={{ padding: "40px", maxWidth: "1200px", margin: "auto" }}>
        {/* Two-column Layout */}
        <Grid container spacing={20}>
            {/* Left Column: Job Description */}
            <Grid item xs={12} md={8}>
                <JobTitleSection jobPosting={editedJob} editable={editable} editMode={editMode} toggleEditMode={toggleEditMode} handleChange={handleChange} />
                <JobTextSection field="description" title="Job Description" jobPosting={editedJob} editable={editable} editMode={editMode} toggleEditMode={toggleEditMode} handleChange={handleChange} />
                <JobTextSection field="qualifications" title="Qualifications" jobPosting={editedJob} editable={editable} editMode={editMode} toggleEditMode={toggleEditMode} handleChange={handleChange} />
                <JobTextSection field="responsibilities" title="Responsibilities" jobPosting={editedJob} editable={editable} editMode={editMode} toggleEditMode={toggleEditMode} handleChange={handleChange} />
            </Grid>

            {/* Right Column: Job Details */}
            <Grid item xs={12} md={4}>
                <Typography variant="h5" sx={{ fontWeight: "bold", borderBottom: "2px solid black", paddingBottom: "8px" }}>
                    Job Details
                </Typography>

                <JobLocation jobPosting={editedJob} editable={editable} editMode={editMode} toggleEditMode={toggleEditMode} handleChange={handleChange} />
                <JobTags jobPosting={editedJob} editable={editable} editMode={editMode} toggleEditMode={toggleEditMode} handleChange={handleChangeStringArray} />

                {/* Created Date */}
                <Box sx={{ display: "flex", alignItems: "center", marginTop: 2 }}>
                    <AccessTimeIcon color="info" />
                    <Typography sx={{ marginLeft: 1 }}>Created at: {jobPosting.created_at}</Typography>
                </Box>

                {/* Save and Cancel */}
                {editable && (
                    <Stack direction="row" spacing={2} sx={{ marginTop: 3, textAlign: "center" }}>
                        <Button variant="outlined"
                            startIcon={<CancelIcon />}
                            onClick={handleCancel}
                            color="warning">
                            Cancel
                        </Button>
                        <Button variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSave} sx={{
                                backgroundColor: colors.orange1,
                                color: colors.white,
                            }}>
                            Save
                        </Button>

                    </Stack>
                )}

                {/* Snack Bar */}
                {editable && <CustomSnackbar
                    open={openSnackbar}
                    message={snackbarMessage}
                    severity={snackbarSeverity}
                    onClose={handleSnackbarClose} />}

                {/* Confirmation Dialog */}
                <ConfirmDialog
                    open={confirmDialogOpen}
                    title="Cancel Changes?"
                    message="Are you sure you want to discard all changes?"
                    onConfirm={handleConfirmCancel}
                    onCancel={() => setConfirmDialogOpen(false)}
                />

            </Grid>
        </Grid>
    </Box>);
};

export default JobDetailsView;