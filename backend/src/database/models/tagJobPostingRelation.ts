import { DataTypes, Model, Sequelize } from "sequelize";
import { JobPostingTableName, JobTagPostingRelationTableName } from "./tableNames";

interface JobTagJobPostingRelationAttributes {
  id: number | undefined;
  tagId: number;
  jobPostingId: number;
}
export const JobTagPostingRelationSchema = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tagId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "job_tags",
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
export default class JobTagJobPostingRelation
  extends Model<JobTagJobPostingRelationAttributes>
  implements JobTagJobPostingRelationAttributes
{
  id!: number;
  tagId!: number;
  jobPostingId!: number;

  static initialize(sequelize: Sequelize) {
    JobTagJobPostingRelation.init(JobTagPostingRelationSchema, {
      sequelize,
      tableName: JobTagPostingRelationTableName,
    });
  }

  static associate() {
    // No associations
  }
}
