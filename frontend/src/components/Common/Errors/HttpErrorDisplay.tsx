import React from "react";
import { Box, Typography, Button } from "@mui/material";

export interface HttpErrorDisplayProps {
    statusCode?: number;
    message?: string;
    details?: string;
    onRetry?: () => void;
}

const HttpErrorDisplay: React.FC<HttpErrorDisplayProps> = ({
    statusCode,
    message,
    details,
    onRetry,
}) => {
    let defaultMessage = "Error";
    let defaultDetails = "Something went wrong.";

    if (statusCode === 404) {
        defaultMessage = "Not Found";
        defaultDetails = "The requested resource could not be found.";
    } else if (statusCode === 403) {
        defaultMessage = "Forbidden";
        defaultDetails = "You are not authorized to access this resource.";
    } else if (statusCode && statusCode >= 500) {
        defaultMessage = "Server Error";
        defaultDetails = "An unexpected error occurred on the server.";
    } else {
        defaultMessage = "Something Went Wrong";
        defaultDetails = "We couldn’t complete your request.";
    }

    const finalMessage = message || defaultMessage;
    const finalDetails = details || defaultDetails;

    return (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#f5f5f5",
                p: 2,
            }}
        >
            <Box
                sx={{
                    backgroundColor: "#fff",
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    textAlign: "center",
                    p: 4,
                    maxWidth: 500,
                    width: "100%",
                }}
            >
                {statusCode !== undefined && (
                    <Typography variant="h2" sx={{ fontWeight: "bold", mb: 1 }}>
                        {statusCode}
                    </Typography>
                )}
                <Typography variant="h5" sx={{ mb: 2 }}>
                    {finalMessage}
                </Typography>
                <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
                    {finalDetails}
                </Typography>

                {onRetry && (
                    <Button variant="contained" onClick={onRetry}>
                        Retry
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default HttpErrorDisplay;