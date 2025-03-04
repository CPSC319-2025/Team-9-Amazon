import { DataTypes, Model, Sequelize } from "sequelize";

interface StaffAttributes {
  id: number | undefined;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | undefined;
  isAdmin: boolean;
  isHiringManager: boolean;
}
export const StaffSchema = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
  isHiringManager: { type: DataTypes.BOOLEAN, defaultValue: false },
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
export const StaffTableName = "staff";
export default class Staff
  extends Model<StaffAttributes>
  implements StaffAttributes
{
  id!: number;
  email!: string;
  firstName!: string;
  lastName!: string;
  phone: string | undefined;
  isAdmin!: boolean;
  isHiringManager!: boolean;

  static initialize(sequelize: Sequelize) {
    Staff.init(StaffSchema, {
      sequelize,
      tableName: StaffTableName,
    });
  }
}
