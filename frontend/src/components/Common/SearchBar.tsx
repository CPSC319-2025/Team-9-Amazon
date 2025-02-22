import { TextField, Button, Stack, InputAdornment } from "@mui/material";
import {
  Search as SearchIcon,
  SwapVert as SwapVertIcon,
} from "@mui/icons-material";
import { textButtonStyle, searchFieldStyle } from "../../styles/commonStyles";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  onSort?: () => void;
  showSort?: boolean;
}

export const SearchBar = ({
  placeholder = "Search...",
  onSearch,
  onSort,
  showSort = true,
}: SearchBarProps) => (
  <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
    <TextField
      fullWidth
      placeholder={placeholder}
      onChange={(e) => onSearch(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ fontSize: 20 }} />
          </InputAdornment>
        ),
      }}
      sx={searchFieldStyle}
    />
    {showSort && onSort && (
      <Button
        startIcon={<SwapVertIcon />}
        onClick={onSort}
        sx={textButtonStyle}
      >
        SORT
      </Button>
    )}
  </Stack>
);
