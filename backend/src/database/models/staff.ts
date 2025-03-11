import { DataTypes, Model, Sequelize } from "sequelize";
import bcrypt from "bcryptjs";

interface StaffAttributes {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password: string;
  isAdmin: boolean;
  isHiringManager: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface StaffCreationAttributes
  extends Omit<StaffAttributes, "id" | "createdAt" | "updatedAt"> {}

export const StaffSchema = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  isHiringManager: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
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

export const StaffTableName = "staff";

class Staff extends Model<StaffAttributes, StaffCreationAttributes> {
  declare id: number;
  declare email: string;
  declare firstName: string;
  declare lastName: string;
  declare phone?: string;
  declare password: string;
  declare isAdmin: boolean;
  declare isHiringManager: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;

  async validatePassword(password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      console.error("Password validation error:", error);
      return false;
    }
  }

  static initialize(sequelize: Sequelize) {
    Staff.init(StaffSchema, {
      sequelize,
      tableName: StaffTableName,
      hooks: {
        beforeSave: async (staff: Staff) => {
          // Only hash the password if it's new or modified
          if (staff.changed("password") && !staff.password.startsWith("$2")) {
            const salt = await bcrypt.genSalt(10);
            staff.password = await bcrypt.hash(staff.password, salt);
          }
        },
      },
    });

    return Staff;
  }
}

export default Staff;
