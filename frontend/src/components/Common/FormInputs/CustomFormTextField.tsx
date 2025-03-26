import { UseFormRegister, FieldErrors } from "react-hook-form";
import { TextField } from "@mui/material";

interface CustomFormTextFieldProps {
  label?: string;
  name: string;
  placeholder?: string;
  register: UseFormRegister<any>;
  errors?: FieldErrors;
  required?: boolean;
}

export default function CustomFormTextField(props: CustomFormTextFieldProps) {
  return (
    <div>
      <TextField
        {...props.register(props.name)}
        label={props.label}
        placeholder={props.placeholder}
        required={props.required}
        error={Boolean(props.errors && props.errors[props.name])}
        helperText={
          props.errors && (props.errors[props.name]?.message as string)
        }
        InputLabelProps={{
          shrink: true, //
        }}
        sx={{
          width: "100%",
          "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": {
              borderColor: "#FF9900",
            },
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#FF9900",
          },
        }}
      />
    </div>
  );
}
