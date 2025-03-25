import CustomButton from "./Buttons/CustomButton";
import { Chip } from "@mui/material";

export interface Job {
  id: string;
  code: string;
  title: string;
  job_type: string;
  location: string;
  description: string;
  department: string;
  posted_at: string;
  qualifications: string[];
  responsibilities: string[];
  tags?: string[]; 
}

interface JobPostProps {
  job: Job;
  onLearnMore: () => void;
  onApply: () => void;
}

export default function JobPost({ job, onLearnMore, onApply }: JobPostProps) {
  console.log("Job tags:", job.tags);
  return (
    <div
      className="flex flex-col gap-4 w-[450px] rounded-xl p-4 
      backdrop-blur-md bg-white/30 border border-white/40 shadow-lg
      hover:shadow-xl transition-all hover:scale-101 min-h-[250px]"
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <h3 className="font-bold text-2xl text-[#146eb4]">{job.title}</h3>
          <p className="text-lg text-gray-600">{job.location}</p>
        </div>
        <h3 className="text-gray-800 text-sm">{`#${job.code}`}</h3>
      </div>

      <section className="flex-grow">
        {job.description.length > 150
          ? `${job.description.slice(0, 150)}...`
          : job.description}
      </section>

      <div className="flex justify-between items-center">
        <CustomButton variant="outlined" onClick={onLearnMore}>
          Learn More
        </CustomButton>
        <CustomButton variant="filled" onClick={onApply}>
          Apply
        </CustomButton>
      </div>

      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {job.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              variant="outlined"
              color="primary"
              size="small"
            />
          ))}
        </div>
      )}
    </div>
  );
}
