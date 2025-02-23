import * as React from 'react'
import {Modal, Box, Typography, Stack, Button} from '@mui/material';
import { textButtonStyle, colors, filledButtonStyle } from "../../../styles/commonStyles";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: colors.white,
    borderRadius:'0.5rem',
    boxShadow: 24,
    p: 4,
    maxWidth: '42rem',
    minWidth: '30rem',
    width: 'auto ',
    m: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    maxHeight: '90vh',
};

interface ConfirmationModalProps {
    isOpen: boolean;
    handleClose(): void;
    titleText: string;
    actionButton?: React.ReactNode;
}

export const ConfirmationModal = ({
    isOpen,
    handleClose,
    titleText,
    actionButton
}: ConfirmationModalProps) => {
    return (
        <Modal 
        open={isOpen}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'>
            <Box sx={style}>
            <Typography id='modal-modal-title' variant='h6' component='h2'>
                {titleText}
            </Typography>
            <Stack direction='row' justifyContent='flex-end' spacing={2}>
                <Button onClick={handleClose} sx={{...textButtonStyle, ...filledButtonStyle, backgroundColor: colors.gray2}}>
                    CANCEL
                </Button>
                {
                    actionButton ? actionButton :
                    <Button onClick={handleClose} sx={{...textButtonStyle, ...filledButtonStyle, backgroundColor: colors.red1}}>
                    DELETE
                    </Button>
                }
            </Stack>
            </Box>
        </Modal>
    )
}
