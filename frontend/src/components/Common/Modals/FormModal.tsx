import * as React from "react";
import { Modal, Box, Typography, Button, Stack, TextField, formControlClasses } from "@mui/material";
import { textButtonStyle, colors, filledButtonStyle } from "../../../styles/commonStyles";
import MultiSelectChipField from "../FormInputs/MultiSelectChipField";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: colors.white,
  borderRadius: "0.5rem",
  boxShadow: 24,
  p: 4,
  maxWidth: "42rem",
  minWidth: "30rem",
  width: "auto ",
  m: 2,
  display: "flex",
  flexDirection: "column",
  gap: 2,
  maxHeight: "90vh",
};

interface FormModalProps {
  formData?: any;
  isOpen: boolean;
  handleClose(): void;
  titleText: string;
  actionButton?: React.ReactNode;
}

export const FormModal = ({ formData, isOpen, handleClose, titleText, actionButton }: FormModalProps) => {
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>(formData?.role || []);

  React.useEffect(() => {
    if (formData?.role && Array.isArray(formData.role)) {
      setSelectedRoles(formData.role);
    } else {
      setSelectedRoles([]);
    }
  }, [formData]);

  const handleRoleChange = (roles: string[]) => {
    setSelectedRoles(roles);
  };

  return (
    <Modal open={isOpen} onClose={handleClose} aria-labelledby="modal-modal-title">
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          {titleText}
        </Typography>
        {formData ? (
          Object.entries(formData).map(([key, value]) => {
            console.log(key);
            console.log(value);

            if (key == "id" || key == "role") return;

            const formattedKey = key.split("_").join(" ");

            return (
              <TextField
                key={key}
                label={formattedKey}
                variant="standard"
                placeholder={value === "" ? `Enter ${formattedKey} here` : undefined}
                defaultValue={value}
                required
              />
            );
          })
        ) : (
          <></>
        )}
        <MultiSelectChipField selectedRoles={selectedRoles} onChange={handleRoleChange} />
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button
            onClick={handleClose}
            sx={{ ...textButtonStyle, ...filledButtonStyle, backgroundColor: colors.gray2 }}
          >
            CANCEL
          </Button>
          {actionButton ? (
            actionButton
          ) : (
            <Button
              onClick={handleClose}
              sx={{ ...textButtonStyle, ...filledButtonStyle, backgroundColor: colors.blue1 }}
            >
              SAVE
            </Button>
          )}
        </Stack>
      </Box>
    </Modal>
  );
};
