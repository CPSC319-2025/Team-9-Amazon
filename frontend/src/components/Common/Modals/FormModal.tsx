import { Autocomplete, Box, Button, Checkbox, FormControlLabel, MenuItem, Modal, Stack, TextField, Typography } from "@mui/material";
import { UseMutationResult } from "@tanstack/react-query";
import * as React from "react";
import { colors, filledButtonStyle, modalStyle, textButtonStyle } from "../../../styles/commonStyles";
import CustomSnackbar from "../SnackBar";

const formatCamelCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Insert a space between lowercase and uppercase letters
    .split(" ") // Split the string into words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(" "); // Join the words back into a single string
};

// Maps form key name, to supported select options
export interface FormSelectOptions {
  [key: string]: {
    name: any;
    value: any
  }[]
}

interface FormModalProps<T extends Record<string, unknown>> {
  dataState: T;
  initialDataState?: T;
  setDataState: React.Dispatch<React.SetStateAction<T>>;
  formSelectOptions?: FormSelectOptions;
  isOpen: boolean;
  handleClose(): void;
  titleText: string;
  mutationHook: () => UseMutationResult<any, any, any, any>;
}

export const FormModal = <T extends Record<string, any>>({
  dataState,
  initialDataState,
  setDataState,
  formSelectOptions,
  isOpen,
  handleClose,
  titleText,
  mutationHook,
}: FormModalProps<T>) => {
  const excludedKeys = ["id", "role", "criteriaType", "criteriaJson"];
  const { mutate, isError, isPending, isSuccess, error } = mutationHook();
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<"success" | "info" | "error" | "warning" | undefined>(
    "success"
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: string | boolean = e.target.value;
    const { type, name } = e.target;
    if (type == "checkbox") {
      value = e.target.checked;
    }
    setDataState({
      ...dataState,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    mutate(dataState, {
      onSuccess: () => {
        setSnackbarSeverity("success");
        setSnackbarMessage("Success");
        setSnackbarOpen(true);
        if (initialDataState) {
          setDataState(initialDataState);
        }
        handleClose();
      },
      onError: (error: any) => {
        setSnackbarSeverity("error");
        setSnackbarMessage(error.message);
        setSnackbarOpen(true);
      },
    });
  };

  const renderFormField = (key: string, value: any) => {
    if (excludedKeys.includes(key)) return;
    const formattedKey = formatCamelCase(key);

    if (formSelectOptions && key in formSelectOptions) {
      const options = formSelectOptions[key];
      return (
        <Autocomplete
          key={key}
          options={options}
          getOptionLabel={(option: any) => option.name}
          value={options.find((option: any) => option.value === value) || null}
          onChange={(_, newValue) => {
            setDataState({
              ...dataState,
              [key]: newValue ? newValue.value : "",
            });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              name={key}
              label={formattedKey}
              variant="standard"
              required
            />
          )}
        />
      );
    }
    switch (typeof value) {
      case "string":
        return (
          <TextField
            key={key}
            name={key}
            label={formattedKey}
            variant="standard"
            value={value}
            onChange={handleInputChange}
            required
          />
        );
      case "boolean":
        return (
          <FormControlLabel
            key={key}
            name={key}
            control={<Checkbox checked={value} onChange={handleInputChange} />}
            label={formattedKey}
          />
        );
    }
  };

  return (
    <>
      <Modal open={isOpen} onClose={handleClose} aria-labelledby="modal-modal-title">
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {titleText}
          </Typography>
          {dataState &&
            Object.entries(dataState).map(([key, value]) => {
              return renderFormField(key, value);
            })}
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button
              onClick={handleClose}
              sx={{ ...textButtonStyle, ...filledButtonStyle, backgroundColor: colors.gray2 }}
            >
              CANCEL
            </Button>
            <Button
              onClick={handleSubmit}
              loading={isPending}
              sx={{ ...textButtonStyle, ...filledButtonStyle, backgroundColor: colors.blue1 }}
            >
              SAVE
            </Button>
          </Stack>
        </Box>
      </Modal>
      <CustomSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />
    </>
  );
};
