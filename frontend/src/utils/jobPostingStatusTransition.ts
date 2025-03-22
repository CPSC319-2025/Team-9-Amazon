import { colors } from "../styles/commonStyles";
import { JobPostingStatus } from "../types/JobPosting/jobPosting";

export const JOB_STATUS_TRANSITION = {
    [JobPostingStatus.DRAFT]: {
        next: JobPostingStatus.OPEN,
        buttonText: "PUBLISH JOB",
        buttonColor: colors.orange1,
        buttonTextColor: colors.black1,
        chipText: "DRAFT",
        chipColor: colors.gray2,
        chipTextColor: colors.gray2,
    },
    [JobPostingStatus.OPEN]: {
        next: JobPostingStatus.CLOSED,
        buttonText: "CLOSE JOB",
        buttonColor: colors.orange1,
        buttonTextColor: colors.black1,
        chipText: "OPEN",
        chipColor: colors.green1,
        chipTextColor: colors.green1,
    },
    [JobPostingStatus.CLOSED]: {
        next: JobPostingStatus.OPEN,
        buttonText: "REOPEN JOB",
        buttonColor: colors.orange1,
        buttonTextColor: colors.black1,
        chipText: "CLOSED",
        chipColor: colors.red1,
        chipTextColor: colors.red1,
    },
}