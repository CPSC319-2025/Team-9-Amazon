import { Button } from "@mui/material";
import { filledButtonStyle } from "../../styles/commonStyles";
import { JobPostingStatus } from "../../types/JobPosting/jobPosting";
import { JOB_STATUS_TRANSITION } from "../../utils/jobPostingStatusTransition";


interface ChangeStatusButtonProps {
    status: JobPostingStatus;
    onClick?: () => void;
};

const ChangeStatusButton = ({ status, onClick }: ChangeStatusButtonProps) => {

    return (
        <Button
            variant="contained"
            sx={{
              ...filledButtonStyle,
              backgroundColor: JOB_STATUS_TRANSITION[status].buttonColor,
              color: JOB_STATUS_TRANSITION[status].buttonTextColor,
            }}
            onClick={onClick}
          >
            {JOB_STATUS_TRANSITION[status].buttonText}
          </Button>
    );

};

export default ChangeStatusButton;