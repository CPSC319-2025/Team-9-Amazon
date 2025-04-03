import React, { JSX } from "react";
import { Navigate, useOutletContext, useParams } from "react-router";
import { useSnackbar } from "notistack";

import { JobPosting, JobPostingStatus } from "../types/JobPosting/jobPosting";
import { ROUTES } from "./routePaths";
import HttpErrorDisplay from "../components/Common/Errors/HttpErrorDisplay";


interface OutletContext {
    jobPosting: JobPosting;
  }

interface DraftGuardProps {
    children: JSX.Element;
}

export const DraftGuard: React.FC<DraftGuardProps> = ({ children }) => {
    const { enqueueSnackbar } = useSnackbar();

    const { jobPosting } = useOutletContext<OutletContext>();
    const { jobPostingId } = useParams<{ jobPostingId: string }>();

    // Check if jobPosting is null or undefined
    if (!jobPosting) {
        return (
            <HttpErrorDisplay statusCode={0} message="Job Posting Not Found"/>
        );
    }

    // If the job posting is in DRAFT status, protect the route.
    if (jobPosting.status === JobPostingStatus.DRAFT) {
        enqueueSnackbar(
            "You cannot access this page while the job posting is in DRAFT status.",
            { variant: "error" });
          
        return (
            <Navigate
                to={ROUTES.hiringManager.jobDetails(jobPostingId!)}
                replace
            />
        );
    }

    return children;
};