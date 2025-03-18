import { UseFormRegister } from "react-hook-form";
import { TextField } from "@mui/material";

interface CustomFormTextFieldProps {
  label?: string;
  name: string;
  placeholder?: string;
  register: UseFormRegister<any>;
  errors?: Record<string, any | undefined>;
  required?: boolean;
}

const CustomFormTextField = ({
  label,
  name,
  placeholder,
  register,
  errors,
  required,
}: CustomFormTextFieldProps) => {
  const error = errors?.[name];

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium">
          {label} {required && "*"}
        </label>
      )}
      <input
        {...register(name)}
        placeholder={placeholder}
        className={`border rounded-md p-2 w-full bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ease-in-out duration-150 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && <span className="text-red-500 text-sm">{error.message}</span>}
    </div>
  );
};

export default CustomFormTextField;
