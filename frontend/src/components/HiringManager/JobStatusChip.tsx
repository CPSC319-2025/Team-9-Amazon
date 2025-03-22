import { Chip } from "@mui/material";
import { chipStyle } from "../../styles/commonStyles";
import { JobPostingStatus } from "../../types/JobPosting/jobPosting";
import { JOB_STATUS_TRANSITION } from "../../utils/jobPostingStatusTransition";


interface JobStatusChipProps {
    status: JobPostingStatus;

}

const JobStatusChip = ({ status }: JobStatusChipProps) => {

    return (
        <Chip
            label={JOB_STATUS_TRANSITION[status].chipText}
            sx={{
              ...chipStyle,
              color: JOB_STATUS_TRANSITION[status].chipTextColor,
              borderColor: JOB_STATUS_TRANSITION[status].chipColor,
            }}
          />
    );

};

export default JobStatusChip;