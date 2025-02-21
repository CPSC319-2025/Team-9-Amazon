import { useState } from "react";
import JobPostingsPageHeader from "../../components/Common/JobPostingsPageHeader";
import { Outlet } from "react-router-dom";

export default function JobPostingsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [location, setLocation] = useState("");
    const [headerTitle, setHeaderTitle] = useState("Job Postings");
    const [showSearchBar, setShowSearchBar] = useState(true);

    return (
        <div>
            <JobPostingsPageHeader
                searchTerm={searchTerm}
                location={location}
                onSearchTermChange={(value: string) => setSearchTerm(value)}
                onLocationChange={(value: string) => setLocation(value)}
                headerTitle={headerTitle}
                showSearchBar={showSearchBar}
            />
            <Outlet context={{ searchTerm, location, setHeaderTitle, setShowSearchBar }} />
        </div>
    );
}