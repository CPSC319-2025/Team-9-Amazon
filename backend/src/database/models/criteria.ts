import { DataTypes, Model, Sequelize } from "sequelize";
import JobPosting, { JobPostingTableName } from "./jobPosting";

interface Token {
  points_per_year_of_experience: number;
  max_points: number;
  word: string;
}

interface CriteriaJSON {
  tokens: Token[];
}

interface CriteriaAttributes {
  id: number;
  name: string;
  criteriaJson: CriteriaJSON;
  criteriaType: "global" | "local";
  jobPostingId?: number | null;
}

export const CriteriaSchema = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: {
        args: [1, 255] as [number, number],
        msg: "Name must be between 1 and 255 characters",
      },
    },
  },
  criteriaJson: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidJSON(value: any) {
        if (
          !value.tokens ||
          !Array.isArray(value.tokens) ||
          value.tokens.length === 0
        ) {
          throw new Error("criteriaJson must contain at least one token");
        }

        value.tokens.forEach((token: any) => {
          if (
            typeof token.points_per_year_of_experience !== "number" ||
            typeof token.max_points !== "number" ||
            typeof token.word !== "string"
          ) {
            throw new Error(
              "Each token must have points_per_year_of_experience (number), max_points (number), and word (string)"
            );
          }
        });
      },
    },
  },
  criteriaType: {
    type: DataTypes.ENUM("global", "local"),
    allowNull: false,
    defaultValue: "local",
  },
  jobPostingId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: JobPostingTableName,
      key: "id",
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

export const CriteriaTableName = "criteria";

export default class Criteria
  extends Model<CriteriaAttributes>
  implements CriteriaAttributes
{
  id!: number;
  name!: string;
  criteriaJson!: CriteriaJSON;
  criteriaType!: "global" | "local";
  jobPostingId?: number | null;

  static initialize(sequelize: Sequelize) {
    const criteria = Criteria.init(CriteriaSchema, {
      sequelize,
      tableName: CriteriaTableName,
      validate: {
        criteriaTypeValidation() {
          if (this.criteriaType === "local" && !this.jobPostingId) {
            throw new Error("Local criteria must have a job posting reference");
          }
          if (this.criteriaType === "global" && this.jobPostingId) {
            throw new Error(
              "Global criteria cannot have a job posting reference"
            );
          }
        },
      },
    });

    return criteria;
  }
}
