import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import Criteria from "./criteria";
import JobTag from "./jobTag";
import JobTagJobPostingRelation from "./tagJobPostingRelation";

// types
import {
  BelongsToManyGetAssociationsMixin,
  BelongsToManySetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToManyCountAssociationsMixin,
} from "sequelize";
import { JobPostingTableName } from "./tableNames";

export enum JobPostingStatus {
  DRAFT = "DRAFT",
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

export interface JobPostingAttributes {
  id: number | undefined;
  title: string;
  subtitle: string | undefined;
  description: string;
  responsibilities: string | undefined;
  qualifications: string | undefined;
  staffId: number | undefined | null;
  status: JobPostingStatus;
  location: string;
  num_applicants: number;
  num_machine_evaluated: number;
  num_processes: number;
  createdAt: Date;
}

export interface JobPostingCreationAttributes extends Optional<
  JobPostingAttributes,
  "staffId" | "id" | "createdAt" | "status" | "num_applicants" | "num_machine_evaluated" | "num_processes"
> {}

export const JobPostingSchema = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  subtitle: { type: DataTypes.STRING },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "",
  },
  responsibilities: { type: DataTypes.STRING },
  qualifications: { type: DataTypes.STRING },
  staffId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "staff",
      key: "id",
    },
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: JobPostingStatus.DRAFT,
  },
  location: { type: DataTypes.STRING, allowNull: false, defaultValue: "" },
  num_applicants: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  num_machine_evaluated: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  num_processes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
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


export default class JobPosting
  extends Model<JobPostingAttributes, JobPostingCreationAttributes>
  implements JobPostingAttributes
{
  id!: number;
  title!: string;
  subtitle: string | undefined;
  description!: string;
  staffId: number | undefined | null;
  status!: JobPostingStatus;
  location!: string;
  responsibilities: string | undefined;
  qualifications: string | undefined;
  num_applicants!: number;
  num_machine_evaluated!: number;
  num_processes!: number;
  createdAt!: Date;

  // for typescript
  public getJobTags!: BelongsToManyGetAssociationsMixin<JobTag>;
  public setJobTags!: BelongsToManySetAssociationsMixin<JobTag, number>;
  public addJobTag!: BelongsToManyAddAssociationMixin<JobTag, number>;
  public addJobTags!: BelongsToManyAddAssociationsMixin<JobTag, number>;
  public removeJobTag!: BelongsToManyRemoveAssociationMixin<JobTag, number>;
  public removeJobTags!: BelongsToManyRemoveAssociationsMixin<JobTag, number>;
  public hasJobTag!: BelongsToManyHasAssociationMixin<JobTag, number>;
  public hasJobTags!: BelongsToManyHasAssociationsMixin<JobTag, number>;
  public countJobTags!: BelongsToManyCountAssociationsMixin;

  static initialize(sequelize: Sequelize) {
    const jobPosting = JobPosting.init(JobPostingSchema, {
      sequelize,
      tableName: JobPostingTableName,
    });

    return jobPosting;
  }

  static associate() {
    JobPosting.hasMany(Criteria, {
      foreignKey: "jobPostingId",
      as: "criteria",
    });

    JobPosting.belongsToMany(JobTag, {
      through: JobTagJobPostingRelation,
      as: "jobTags",
      foreignKey: "jobPostingId",
      otherKey: "tagId",
    });
  }
}
