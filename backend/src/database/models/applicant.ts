import { DataTypes, Model, Sequelize } from "sequelize";

interface ApplicantAttributes {
  id: number | undefined;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | undefined;
  linkedIn: string | undefined;
}
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
export const ApplicantTableName = "applicants";
export default class Applicant
  extends Model<ApplicantAttributes>
  implements ApplicantAttributes
{
  id!: number;
  email!: string;
  firstName!: string;
  lastName!: string;
  phone: string | undefined;
  linkedIn: string | undefined;

  static initialize(sequelize: Sequelize) {
    Applicant.init(ApplicantSchema, {
      sequelize,
      tableName: ApplicantTableName,
    });
  }

  static associate() {
    // No associations
  }
}
