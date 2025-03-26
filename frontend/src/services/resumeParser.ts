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
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  experiences: Experience[];
}

export async function parseResume(file: File): Promise<ParsedResume> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Extract applicant details and work experience from the resume text and format it as JSON.

            Rules to Follow:
            1. Extract the following fields: firstName, lastName, email, phone, and experiences.
            2. Email must be valid and match standard email format.
            3. Phone must follow xxx-xxx-xxxx format (US-style).
            4. Accurate Dates: Extract start and end dates in MM/YYYY format.
            5. Ongoing Jobs: If the job is current, leave "endDate" as an empty string.
            6. Skills Extraction: Extract relevant skills and list them in an array.
            7. If multiple jobs exist, extract all into an array under "experiences".

            Use this structure:
            {
              "firstName": "John",
              "lastName": "Doe",
              "email": "john.doe@example.com",
              "phone": "123-456-7890",
              "experiences": [
                {
                  "title": "Software Engineer",
                  "company": "Tech Corp",
                  "startDate": "01/2021",
                  "endDate": "12/2023",
                  "skills": ["JavaScript", "React", "Node.js"],
                  "description": "Worked on web applications..."
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

    const parsedData = JSON.parse(completion.choices[0].message.content || "{}");

    // Validate email and phone
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;

    if (!emailRegex.test(parsedData.email)) {
      throw new Error("Extracted email is not in a valid format.");
    }

    if (!phoneRegex.test(parsedData.phone)) {
      throw new Error("Extracted phone number must be in xxx-xxx-xxxx format.");
    }

    return parsedData;
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw new Error("Failed to parse resume");
  }
}
