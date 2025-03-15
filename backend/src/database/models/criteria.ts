import { DataTypes, Model, Sequelize } from "sequelize";
import JobPosting, { JobPostingTableName } from "./jobPosting";

interface Rule {
  pointsPerYearOfExperience: number;
  maxPoints: number;
  skill: string;
}

interface CriteriaJSON {
  rules: Rule[];
}

interface CriteriaAttributes {
  id?: number;
  name: string;
  criteriaJson: CriteriaJSON;
  criteriaType: "global" | "local";
  jobPostingId?: number | null;
}

interface CriteriaCreationAttributes
  extends Omit<CriteriaAttributes, "id" | "createdAt" | "updatedAt"> {}

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
          !value.rules ||
          !Array.isArray(value.rules) ||
          value.rules.length === 0
        ) {
          throw new Error("criteriaJson must contain at least one rule");
        }

        value.rules.forEach((rule: any) => {
          if (
            typeof rule.pointsPerYearOfExperience !== "number" ||
            typeof rule.maxPoints !== "number" ||
            typeof rule.skill !== "string"
          ) {
            throw new Error(
              "Each rule must have pointsPerYearOfExperience (number), maxPoints (number), and skill (string)"
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

export default class Criteria extends Model<
  CriteriaAttributes,
  CriteriaCreationAttributes
> {
  declare id: number;
  declare name: string;
  declare criteriaJson: CriteriaJSON;
  declare criteriaType: "global" | "local";
  declare jobPostingId?: number | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare jobPosting?: JobPosting;

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

  static associate() {
    Criteria.belongsTo(JobPosting, {
      foreignKey: "jobPostingId",
      as: "jobPosting",
    });
  }
}
