import { DataTypes, Model, Sequelize } from "sequelize";
import Applicant from "./applicant";
import JobPosting from "./jobPosting";
import { ApplicantTableName, ApplicationTableName, JobPostingTableName } from "./tableNames";

interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  skills: string[];
  description: string;
}

interface ExperienceJSON {
  experiences: Experience[];
}

interface Education {
  school: string;
  degree: string;
  field_of_study: string;
  from: string;
  to: string;
}

interface EducationJSON {
  education: Education[];
} 

interface ApplicationAttributes {
  jobPostingId: number;
  applicantId: number;
  resumePath: string;
  score: number | undefined;
  experienceJson: ExperienceJSON;
  educationJson: EducationJSON;
  referralSource?: string;
  applicant?: Applicant;
}

interface ApplicationCreationAttributes
  extends Omit<ApplicationAttributes, "createdAt" | "updatedAt"> {}

export const ApplicationSchema = {
  jobPostingId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: JobPostingTableName,
      key: "id",
    },
  },
  applicantId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: ApplicantTableName,
      key: "id",
    },
  },
  resumePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  experienceJson: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: { experiences: [] },
    validate: {
      isValidJSON(value: any) {
        if (!value.experiences || !Array.isArray(value.experiences)) {
          throw new Error("experienceJson must be in array format");
        }

        value.experiences.forEach((exp: any) => {
          if (!exp.title || typeof exp.title !== "string") {
            throw new Error("Each experience must have a title (string)");
          }
          if (!exp.company || typeof exp.company !== "string") {
            throw new Error("Each experience must have a company (string)");
          }
          if (!exp.startDate || !/^\d{2}\/\d{4}$/.test(exp.startDate)) {
            throw new Error(
              "Each experience must have a valid startDate (MM/YYYY)"
            );
          }
          // Allow endDate to be null or a valid date string
          if (
            exp.endDate !== null &&
            exp.endDate !== "Present" &&
            (typeof exp.endDate !== "string" ||
              !/^\d{2}\/\d{4}$/.test(exp.endDate))
          ) {
            throw new Error(
              'endDate must be null, "Present", or a valid date (MM/YYYY)'
            );
          }
          if (!Array.isArray(exp.skills) || exp.skills.length === 0) {
            throw new Error("Each experience must have at least one skill");
          }
          exp.skills.forEach((skill: any) => {
            if (typeof skill !== "string") {
              throw new Error("Skills must be strings");
            }
          });
          if (!exp.description || typeof exp.description !== "string") {
            throw new Error("Each experience must have a description.");
          }
        });
      },
    },
  },
  educationJson: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: { education: [] },
    validate: {
      isValidEduJSON(value: any) {
        if (!value.education || !Array.isArray(value.education)) {
          throw new Error("Education must be an array of valid entries");
        }
  
        value.education.forEach((edu: any) => {
          if (!edu.school || typeof edu.school !== "string") {
            throw new Error("Each education entry must include a valid school name");
          }
  
          if (!edu.degree || typeof edu.degree !== "string") {
            throw new Error("Each education entry must include a valid degree");
          }
  
          if (edu.field_of_study && typeof edu.field_of_study !== "string") {
            throw new Error("Field of study must be a string if provided");
          }
  
          if (!edu.from || typeof edu.from !== "string") {
            throw new Error("Each education entry must include a valid start date");
          }
  
          if (edu.to && typeof edu.to !== "string") {
            throw new Error("End date must be a string if provided");
          }
        });
      }
    }
  },
  referralSource: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: {
        args: [['LinkedIn', 'Amazon', 'Indeed', 'Other']],
        msg: "Referral source must be one of: LinkedIn, Amazon, Indeed, Other"
      }
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
  },
};

export default class Application
  extends Model<ApplicationAttributes, ApplicationCreationAttributes>
  implements ApplicationAttributes
{
  declare jobPostingId: number;
  declare applicantId: number;
  declare resumePath: string;
  declare score: number | undefined;
  declare experienceJson: ExperienceJSON;
  declare educationJson: EducationJSON;
  declare referralSource?: string;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initialize(sequelize: Sequelize) {
    Application.init(ApplicationSchema, {
      sequelize,
      tableName: ApplicationTableName,
      indexes: [
        {
          unique: true,
          fields: ["jobPostingId", "applicantId"],
        },
      ],
    });
  }

  static associate() {
    // Define associations
    Applicant.belongsToMany(JobPosting, {
      through: Application,
      foreignKey: "applicantId",
      otherKey: "jobPostingId",
      as: "jobPostings",
    });

    JobPosting.belongsToMany(Applicant, {
      through: Application,
      foreignKey: "jobPostingId",
      otherKey: "applicantId",
      as: "applicants",
    });

    // Define associations
    Application.belongsTo(JobPosting, {
      foreignKey: "jobPostingId",
      as: "jobPosting",
      onDelete: "CASCADE",
    });

    Application.belongsTo(Applicant, {
      foreignKey: "applicantId",
      as: "applicant",
      onDelete: "CASCADE"
    });
  }
}
