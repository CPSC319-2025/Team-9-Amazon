import { TextField, Button, Stack, InputAdornment } from "@mui/material";
import { Search, Filter } from "lucide-react";
import {
  textButtonStyle,
  searchFieldStyle,
  colors,
} from "../../styles/commonStyles";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  onFilter?: () => void;
  showFilter?: boolean;
}

export const SearchBar = ({
  placeholder = "Search...",
  onSearch,
  onFilter,
  showFilter = true,
}: SearchBarProps) => (
  <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
    <TextField
      fullWidth
      placeholder={placeholder}
      onChange={(e) => onSearch(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search size={20} />
          </InputAdornment>
        ),
      }}
      sx={searchFieldStyle}
    />
    {showFilter && onFilter && (
      <Button
        startIcon={<Filter size={20} />}
        onClick={onFilter}
        sx={{ textButtonStyle, color: colors.orange1, fontWeight: "bold" }}
      >
        Filter
      </Button>
    )}
  </Stack>
);
