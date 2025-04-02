import React from 'react';
import { Box, Modal } from "@mui/material";
import CustomButton from "../../components/Common/Buttons/CustomButton";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string | null;
}

const ApplicationErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  errorMessage
}) => {
  if (!errorMessage) return null;
  
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="error-modal"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "#f9f9f9",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          maxWidth: "30rem",
          minWidth: "20rem",
          width: "auto",
          m: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <div className="flex flex-col gap-3 items-center">
          <div className="flex items-center justify-center">
            <div className="mr-2 flex-shrink-0 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-600">Error</h2>
          </div>
          <p className="text-center">{errorMessage}</p>
        </div>
        <div className="flex justify-center mt-2">
          <CustomButton
            variant="filled"
            className="min-w-[100px]"
            onClick={onClose}
          >
            OK
          </CustomButton>
        </div>
      </Box>
    </Modal>
  );
};

export default ApplicationErrorModal;