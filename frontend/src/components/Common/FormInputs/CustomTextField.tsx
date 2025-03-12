import { TextField, TextFieldVariants } from "@mui/material";

interface CustomTextFieldProps {
  placeholder?: string;
  variant?: TextFieldVariants;
  size?: "small" | "medium";
  minWidth?: number;
  borderColor?: string;
  focusedColor?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  InputProps?: any;
  sx?: any;
}

export default function CustomTextField({
  placeholder = "Enter text here",
  variant = "outlined",
  size = "small",
  minWidth = 200,
  borderColor = "#FF9900",
  focusedColor = "#FF9900",
  value,
  onChange,
  error,
  onKeyDown,
  InputProps,
  sx,
  ...props
}: CustomTextFieldProps) {
  return (
    <TextField
      placeholder={placeholder}
      variant={variant}
      size={size}
      value={value}
      onChange={onChange}
      sx={{
        minWidth: minWidth,
        maxWidth: "100%",
        width: "auto",
        "& .MuiOutlinedInput-root": {
          width: "100%",
          "&.Mui-focused fieldset": {
            borderColor: borderColor,
          },
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: focusedColor,
        },
      }}
    />
  );
}
