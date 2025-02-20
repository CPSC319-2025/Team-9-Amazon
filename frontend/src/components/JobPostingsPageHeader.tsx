import { Link } from '@mui/material';
import CustomTextField from './Common/FormInputs/CustomTextField';

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
  showSearchBar = true
}: JobPostingsPageHeaderProps) {

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-200 m-4">
      <div className="flex flex-col sm:flex-row w-full md:w-auto justify-around gap-4">
        <h1 className="text-2xl font-bold text-center md:text-left">{headerTitle}</h1>

        {showSearchBar && (
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <CustomTextField 
              placeholder="Search by job ID or keywords..."
              minWidth={400}
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
          />
          <CustomTextField 
            placeholder="Location"
            value={location}
            onChange={(event) => onLocationChange(event.target.value)}
          />
        </div>)}

      </div>
      <div className="w-[80px] mt-4 md:mt-0">
        <Link href="/">
          <img src="/amazon-logo.png" alt="Amazon Logo" className="amazon-logo" height={40}/>
        </Link>
      </div>
    </div>
  );
}