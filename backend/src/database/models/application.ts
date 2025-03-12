import { DataTypes, Model, Sequelize } from "sequelize";
import { JobPostingTableName } from "./jobPosting";

interface ApplicationAttributes {
  id: number | undefined;
  jobPostingId: number;
  applicantId: number;
  resumePath: string;
  score: number | undefined;
}
export const ApplicationSchema = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  applicantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "applicants",
      key: "id",
    },
  },
  jobPostingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: JobPostingTableName,
      key: "id",
    },
  },
  resumePath: { type: DataTypes.STRING, allowNull: false },
  score: { type: DataTypes.FLOAT, allowNull: true },
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
  extends Model<ApplicationAttributes>
  implements ApplicationAttributes
{
  id!: number;
  jobPostingId!: number;
  applicantId!: number;
  resumePath!: string;
  score: number | undefined;

  static initialize(sequelize: Sequelize) {
    Application.init(ApplicationSchema, {
      sequelize,
      tableName: ApplicationTableName,
    });
  }

  static associate() {
    // No associations
  }
}
