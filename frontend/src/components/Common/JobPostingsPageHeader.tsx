import { Link } from "@mui/material";
import CustomTextField from "./FormInputs/CustomTextField";

interface JobPostingsPageHeaderProps {
  headerTitle: string;
  searchTerm: string;
  location: string;
  showSearchBar?: boolean;
  onSearchTermChange: (value: string) => void;
  onLocationChange: (value: string) => void;
}

export default function JobPostingsPageHeader({
  searchTerm,
  location,
  onSearchTermChange,
  onLocationChange,
  headerTitle,
  showSearchBar = true,
}: JobPostingsPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-200 m-4 mt-0 py-5">
      <div className="flex flex-col sm:flex-row w-full md:w-auto justify-around gap-4">
        <h1 className="text-3xl font-bold text-center md:text-left">
          {headerTitle}
        </h1>

        {showSearchBar && (
          <div className="flex flex-col rounded-full sm:flex-row gap-4 w-full md:w-auto">
            <CustomTextField
              placeholder="Search by job ID or keywords"
              minWidth={250}
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
            />
            <CustomTextField
              placeholder="Location"
              value={location}
              onChange={(event) => onLocationChange(event.target.value)}
            />
          </div>
        )}
      </div>

      {/* AWS Logo on the right */}
      <div className="flex-shrink-0">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
          alt="AWS Logo"
          className="h-10 w-auto"
        />
      </div>
    </div>
  );
}
