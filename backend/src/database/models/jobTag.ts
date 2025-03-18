import { DataTypes, Model, Sequelize } from "sequelize";
import JobPosting from "./jobPosting";
import JobTagJobPostingRelation from "./tagJobPostingRelation";

export interface JobTagAttributes {
  id: number | undefined;
  name: string;
}
export const JobTagSchema = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
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
export const JobTagTableName = "job_tags";
export default class JobTag extends Model<JobTagAttributes> implements JobTagAttributes {
  id!: number;
  name!: string;

  static initialize(sequelize: Sequelize) {
    JobTag.init(JobTagSchema, {
      sequelize,
      tableName: JobTagTableName,
    });
  }

  static associate() {
    JobTag.belongsToMany(JobPosting, {
      through: JobTagJobPostingRelation,
      as: "jobPostings",
      foreignKey: "tagId",
      otherKey: "jobPostingId",
    });
  }
}
