import { useState } from "react";
import { Box, Typography, TextField, IconButton, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import WorkIcon from "@mui/icons-material/Work";
import { JobPosting } from "../../../../types/JobPosting/jobPosting";
import { EditMode } from "../../../../types/JobPosting/JobPostingEditMode";

interface JobTagsProps {
    jobPosting: JobPosting;
    editable: boolean;
    editMode: EditMode | null;
    toggleEditMode: (mode: EditMode) => void;
    handleChange: (field: keyof JobPosting, value: string[]) => void;
}

const JobTags: React.FC<JobTagsProps> = ({ jobPosting, editable, editMode, toggleEditMode, handleChange }) => {
    const [tags, setTags] = useState<string[]>(jobPosting.tags || []);
    const [newTag, setNewTag] = useState("");

    const handleDeleteTag = (tagToDelete: string) => {
        const updatedTags = tags.filter((tag) => tag !== tagToDelete);
        setTags(updatedTags);
        handleChange("tags", updatedTags);
    };

    const handleAddTag = () => {
        if (newTag.trim() !== "" && !tags.includes(newTag)) {
            const updatedTags = [...tags, newTag.trim()];
            setTags(updatedTags);
            handleChange("tags", updatedTags);
            setNewTag("");
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, marginTop: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <WorkIcon color="primary" />
                    <Typography>Tags</Typography>
                </Box>
                {editable && (
                    <IconButton size="small" onClick={() => toggleEditMode(EditMode.Tags)}>
                        <EditIcon />
                    </IconButton>
                )}
            </Box>

            {/* Tags */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {tags && tags.length > 0 ? (
                    tags.map((tag) => (
                        <Chip
                            key={tag}
                            label={tag}
                            onDelete={editMode === EditMode.Tags ? () => handleDeleteTag(tag) : undefined}
                            color="primary"
                            variant="outlined"
                        />
                    ))
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        {editMode === EditMode.Tags ? "Add tags below" : "No tags added"}
                    </Typography>
                )}
            </Box>

            {/* Input field */}
            {editMode === EditMode.Tags && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginTop: 1 }}>
                    <TextField
                        label="Add Tag"
                        variant="outlined"
                        size="small"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                    />
                    <IconButton size="small" onClick={handleAddTag} color="primary">
                        <AddCircleOutlineIcon />
                    </IconButton>
                </Box>
            )}
        </Box>
    );
};

export default JobTags;