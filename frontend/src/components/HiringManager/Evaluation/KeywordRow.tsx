import { IconButton, TableCell, TableRow } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { colors } from "../../../styles/commonStyles";
import { Keyword } from "../../../types/criteria.ts";

interface KeywordRowProps {
  keyword: Keyword;
  onEdit: (keyword: Keyword) => void;
  onDelete: (keyword: Keyword) => void;
}

export const KeywordRow = ({ keyword, onEdit, onDelete }: KeywordRowProps) => {
  return (
    <TableRow
      sx={{
        "&:last-child td, &:last-child th": { border: 0 },
        "&:hover": { bgcolor: `${colors.blue1}10` },
      }}
    >
      <TableCell>{keyword.name}</TableCell>
      <TableCell align="center">{keyword.pointsPerMatch}</TableCell>
      <TableCell align="center">{keyword.maxPoints}</TableCell>
      <TableCell align="right">
        <IconButton
          size="small"
          onClick={() => onEdit(keyword)}
          sx={{ color: colors.black1 }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onDelete(keyword)}
          sx={{ color: colors.black1, ml: 1 }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};
