import {
  Paper,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import {
  CriteriaGroup as CriteriaGroupType,
  Keyword,
} from "../../../types/criteria";
import {
  colors,
  filledButtonStyle,
  paperStyle,
  textButtonStyle,
} from "../../../styles/commonStyles";
import { useState } from "react";
import { EditCriteriaNameDialog } from "./EditCriteriaNameDialog";

interface CriteriaGroupProps {
  group: CriteriaGroupType;
  onDeleteGroup: (groupId: string) => void;
  onEditKeyword: (groupId: string, keyword: Keyword) => void;
  onDeleteKeyword: (groupId: string, keyword: Keyword) => void;
  onAddKeyword: (groupId: string) => void;
  onEditName: (groupId: string, newName: string) => void;
}

interface KeywordRowProps {
  keyword: Keyword;
  onEdit: (keyword: Keyword) => void;
  onDelete: (keyword: Keyword) => void;
}

const KeywordRow = ({ keyword, onEdit, onDelete }: KeywordRowProps) => (
  <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
    <TableCell>{keyword.name}</TableCell>
    <TableCell align="center">{keyword.pointsPerYearOfExperience}</TableCell>
    <TableCell align="center">{keyword.maxPoints}</TableCell>
    <TableCell align="right">
      <IconButton onClick={() => onEdit(keyword)} size="small" sx={{ mr: 1 }}>
        <EditIcon />
      </IconButton>
      <IconButton
        onClick={() => onDelete(keyword)}
        size="small"
        sx={{ color: colors.black1 }}
      >
        <DeleteIcon />
      </IconButton>
    </TableCell>
  </TableRow>
);

export const CriteriaGroup = ({
  group,
  onDeleteGroup,
  onEditKeyword,
  onDeleteKeyword,
  onAddKeyword,
  onEditName,
}: CriteriaGroupProps) => {
  const [isEditingName, setIsEditingName] = useState(false);

  const handleSaveName = (newName: string) => {
    onEditName(group.id, newName);
    setIsEditingName(false);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        bgcolor: colors.gray1,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 4,
          borderBottom: 1,
          borderColor: "grey.100",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" component="h3" sx={{ color: colors.black1 }}>
            {group.name}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setIsEditingName(true)}
            sx={{ color: colors.black1 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
        <IconButton
          onClick={() => onDeleteGroup(group.id)}
          sx={{ color: colors.black1 }}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Keyword</TableCell>
              <TableCell align="center">
                Points per Year of Experience
              </TableCell>
              <TableCell align="center">Max Points</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {group.keywords.map((keyword) => (
              <KeywordRow
                key={keyword.name}
                keyword={keyword}
                onEdit={(k) => onEditKeyword(group.id, k)}
                onDelete={(k) => onDeleteKeyword(group.id, k)}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ p: 2, borderTop: `1px solid ${colors.gray1}` }}></Box>
      <Button
        startIcon={<AddIcon />}
        onClick={() => onAddKeyword(group.id)}
        sx={{ ...textButtonStyle }}
      >
        Add Keyword
      </Button>

      <EditCriteriaNameDialog
        open={isEditingName}
        name={group.name}
        onClose={() => setIsEditingName(false)}
        onSave={handleSaveName}
      />
    </Paper>
  );
};
