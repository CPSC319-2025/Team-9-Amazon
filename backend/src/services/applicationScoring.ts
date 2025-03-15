import Application from "@/database/models/application";
import Criteria, { Rule } from "@/database/models/criteria";
import JobPosting from "@/database/models/jobPosting";
import { differenceInMonths } from "date-fns";
export class ApplicationScoring {
  static calculateExperienceDuration(
    startDate: string,
    endDate: string
  ): number {
    const [startMonth, startYear] = startDate.split("/").map(Number);
    const [endMonth, endYear] = endDate.split("/").map(Number);

    const start = new Date(startYear, startMonth - 1);
    const end = new Date(endYear, endMonth - 1);

    const monthsDiff = differenceInMonths(end, start);
    return monthsDiff / 12; // Convert months to years
  }

  static evaluateSkill(
    skill: string,
    experienceDuration: number,
    rule: Rule
  ): number {
    if (skill.toLowerCase().includes(rule.skill.toLowerCase())) {
      const points = rule.pointsPerYearOfExperience * experienceDuration;
      return Math.min(points, rule.maxPoints);
    }
    return 0;
  }

  static async evaluateApplication(
    application: Application,
    criteria: Criteria[]
  ): Promise<number> {
    let totalScore = 0;

    // Get all rules from all criteria
    const rules: Rule[] = criteria.flatMap(
      (criterion) => criterion.criteriaJson.rules
    );

    // Evaluate each experience
    for (const experience of application.experienceJson.experiences) {
      const duration = this.calculateExperienceDuration(
        experience.startDate,
        experience.endDate
      );

      // Evaluate each skill in the experience against all rules
      for (const skill of experience.skills) {
        for (const rule of rules) {
          const skillScore = this.evaluateSkill(skill, duration, rule);
          totalScore += skillScore;
        }
      }
    }

    return totalScore;
  }

  static async updateApplicationScores(jobPostingId: number): Promise<void> {
    try {
      // Get all applications for this job posting with their criteria
      const applications = await Application.findAll({
        where: { jobPostingId },
        include: [
          {
            model: JobPosting,
            as: "jobPostings",
            required: true,
            include: [
              {
                model: Criteria,
                as: "criteria",
                required: false,
              },
            ],
          },
        ],
      });

      if (!applications.length) {
        console.log(`No applications found for job posting ${jobPostingId}`);
        return;
      }

      // Get all criteria for this job posting
      const criteria = await Criteria.findAll({
        where: { jobPostingId },
      });

      if (!criteria.length) {
        console.log(`No criteria found for job posting ${jobPostingId}`);
        return;
      }

      // Update scores for each application
      let updatedCount = 0;
      for (const application of applications) {
        try {
          const score = await this.evaluateApplication(application, criteria);
          await application.update({ score });
          updatedCount++;
        } catch (error) {
          console.error(
            `Error scoring application ${
              (application.applicantId, application.jobPostingId)
            }:`,
            error
          );
        }
      }

      // Update the job posting's machine evaluated count
      const jobPosting = await JobPosting.findByPk(jobPostingId);
      if (jobPosting) {
        await jobPosting.update({
          num_machine_evaluated: updatedCount,
        });
      }

      console.log(
        `Successfully scored ${updatedCount} applications for job posting ${jobPostingId}`
      );
    } catch (error) {
      console.error("Error updating application scores:", error);
      throw error;
    }
  }
}
