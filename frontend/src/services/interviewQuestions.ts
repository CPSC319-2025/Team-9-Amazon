import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface InterviewQuestion {
  question: string;
  category: string;
  rationale: string;
}

export interface InterviewQuestionsResponse {
  questions: InterviewQuestion[];
}

export interface ExperienceData {
  experiences: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string | null;
    skills: string[];
    description: string;
  }>;
}

/**
 * Generates personalized interview questions based on candidate resume and job details
 * @param experienceJson The candidate's experience data from the application
 * @param jobDescription The job description
 * @param jobTitle The job title
 * @returns A promise that resolves to an array of interview questions
 */
export async function generateInterviewQuestions(
  experienceJson: ExperienceData,
  jobDescription: string,
  jobTitle: string
): Promise<InterviewQuestionsResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert hiring manager who creates personalized interview questions.
          Generate 5 tailored interview questions based on the candidate's work experience and the job description.
          
          Each question should:
          1. Be specific to the candidate's experience or skills
          2. Relate to the requirements of the job
          3. Help assess the candidate's fit for the role
          4. Include a brief rationale for why this question is relevant
          
          Format the response as JSON with the following structure:
          {
            "questions": [
              {
                "question": "The full interview question text",
                "category": "One of: Technical, Behavioral, Experience, Problem-solving, Cultural fit",
                "rationale": "Brief explanation of why this question is relevant for this candidate"
              }
            ]
          }`,
        },
        {
          role: "user",
          content: `Job Title: ${jobTitle}
          
          Job Description: ${jobDescription}
          
          Candidate Experience: ${JSON.stringify(experienceJson)}
          
          Please generate personalized interview questions for this candidate based on their work experience and the job requirements.`,
        },
      ],
    });

    const parsedData = JSON.parse(
      completion.choices[0].message.content || "{}"
    );
    
    return parsedData;
  } catch (error) {
    console.error("Error generating interview questions:", error);
    throw new Error("Failed to generate interview questions");
  }
}
