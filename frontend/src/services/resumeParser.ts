import mammoth from "mammoth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  skills: string[];
  description: string;
}

interface ParsedResume {
  experiences: Experience[];
}

export async function parseResume(file: File): Promise<ParsedResume> {
  try {
    // Convert Word document to text
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;

    // Use OpenAI to parse the text
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Extract work experience information from the resume text and format it as JSON.
          Rules to Follow:
            Accurate Dates: Extract start and end dates in MM/YYYY format.
            Ongoing Jobs: If the job is not terminated or PRESENT, leave "endDate" as an empty string (""), do not leave it as PRESENT.
            Skills Extraction: Extract relevant skills and list them in an array.
            Multiple Experiences: If multiple jobs exist, extract all into an array under "experiences"
            Usethe following structure:
            {
                "experiences": [
                    {
                    "title": "Job Title",
                    "company": "Company Name",
                    "startDate": "MM/YYYY",
                    "endDate": "MM/YYYY or leave blank if the job is ongoing",
                    "description": "Job description"
                    }
                ]
            }`,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const parsedData = JSON.parse(
      completion.choices[0].message.content || "{}"
    );
    return parsedData;
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw new Error("Failed to parse resume");
  }
}
