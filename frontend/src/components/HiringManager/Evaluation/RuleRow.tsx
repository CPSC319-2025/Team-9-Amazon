import { IconButton, TableCell, TableRow } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { colors } from "../../../styles/commonStyles.ts";
import { Rule } from "../../../types/criteria.ts";

interface RuleRowProps {
  rule: Rule;
  onEdit: (rule: Rule) => void;
  onDelete: (rule: Rule) => void;
}

export const RuleRow = ({ rule, onEdit, onDelete }: RuleRowProps) => {
  return (
    <TableRow
      sx={{
        "&:last-child td, &:last-child th": { border: 0 },
        "&:hover": { bgcolor: `${colors.blue1}10` },
      }}
    >
      <TableCell>{rule.skill}</TableCell>
      <TableCell align="center">{rule.pointsPerYearOfExperience}</TableCell>
      <TableCell align="center">{rule.maxPoints}</TableCell>
      <TableCell align="right">
        <IconButton
          size="small"
          onClick={() => onEdit(rule)}
          sx={{ color: colors.black1 }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onDelete(rule)}
          sx={{ color: colors.black1, ml: 1 }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};
