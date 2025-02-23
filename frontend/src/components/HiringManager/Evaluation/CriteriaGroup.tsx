import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { colors } from "../../../styles/commonStyles";
import {
  CriteriaGroup as CriteriaGroupType,
  Keyword,
} from "../../../types/criteria";
import { KeywordRow } from "./KeywordRow";

interface CriteriaGroupProps {
  group: CriteriaGroupType;
  onDeleteGroup: (groupId: string) => void;
  onEditKeyword: (groupId: string, keyword: Keyword) => void;
  onDeleteKeyword: (groupId: string, keyword: Keyword) => void;
  onAddKeyword: (groupId: string) => void;
}

export const CriteriaGroup = ({
  group,
  onDeleteGroup,
  onEditKeyword,
  onDeleteKeyword,
  onAddKeyword,
}: CriteriaGroupProps) => {
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
        <Typography variant="h6" component="h3" sx={{ color: colors.black1 }}>
          {group.name} #{group.id}
        </Typography>
        <IconButton
          size="small"
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
              <TableCell align="center">Points per Match</TableCell>
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
      <Box sx={{ p: 2, borderTop: `1px solid ${colors.gray1}` }}>
        <Button
          startIcon={<AddIcon />}
          onClick={() => onAddKeyword(group.id)}
          sx={{
            color: colors.blue1,
            "&:hover": {
              bgcolor: `${colors.blue1}10`,
            },
          }}
        >
          Add Keyword
        </Button>
      </Box>
    </Paper>
  );
};
