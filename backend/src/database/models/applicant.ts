import { DataTypes, Model, Sequelize } from "sequelize";
import Application from "./application";
import {ApplicantTableName } from "./tableNames";

interface ApplicantAttributes {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | undefined;
  linkedIn: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}
export interface ApplicantCreationAttributes
  extends Omit<ApplicantAttributes, "id" | "createdAt" | "updatedAt"> {}
export const ApplicantSchema = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: true },
  linkedIn: { type: DataTypes.STRING, allowNull: true },
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
export default class Applicant
  extends Model<ApplicantAttributes, ApplicantCreationAttributes>
  implements ApplicantAttributes
{
  id!: number;
  email!: string;
  firstName!: string;
  lastName!: string;
  phone: string | undefined;
  linkedIn: string | undefined;
  createdAt!: Date;
  updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Applicant.init(ApplicantSchema, {
      sequelize,
      tableName: ApplicantTableName,
    });
  }

  static associate() {
    Applicant.hasMany(Application, {
      foreignKey: "applicantId",
      as: "applications",
    });
  }
}