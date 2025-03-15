import { DataTypes, Model, Sequelize } from "sequelize";
import JobPosting, { JobPostingTableName } from "./jobPosting";
import Applicant, { ApplicantTableName } from "./applicant";

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

interface ApplicationAttributes {
  jobPostingId: number;
  applicantId: number;
  resumePath: string;
  score: number | undefined;
  experienceJson: ExperienceJSON;
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
        if (
          !value.experiences ||
          !Array.isArray(value.experiences) ||
          value.experiences.length === 0
        ) {
          throw new Error(
            "experienceJson must contain at least one experience"
          );
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
          if (!exp.endDate || !/^\d{2}\/\d{4}$/.test(exp.endDate)) {
            throw new Error(
              "Each experience must have a valid endDate (MM/YYYY)"
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
            throw new Error("Each experience must have a description (string)");
          }
        });
      },
    },
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

export const ApplicationTableName = "applications";

export default class Application
  extends Model<ApplicationAttributes, ApplicationCreationAttributes>
  implements ApplicationAttributes
{
  declare jobPostingId: number;
  declare applicantId: number;
  declare resumePath: string;
  declare score: number | undefined;
  declare experienceJson: ExperienceJSON;
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
    Application.belongsToMany(JobPosting, {
      through: Application,
      foreignKey: "applicantId",
      otherKey: "jobPostingId",
      as: "jobPostings",
    });

    Application.belongsToMany(Applicant, {
      through: Application,
      foreignKey: "jobPostingId",
      otherKey: "applicantId",
      as: "applicants",
    });
  }
}
