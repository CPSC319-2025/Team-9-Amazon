import { DataTypes, Model, Sequelize } from "sequelize";
import { SkillTableName } from "./tableNames";

interface SkillAttributes {
  skillId: number;
  name: string;
}

interface SkillCreationAttributes
  extends Omit<SkillAttributes, "skillId" | "createdAt" | "updatedAt"> {}

export const SkillSchema = {
  skillId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
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


export default class Skill
  extends Model<SkillAttributes, SkillCreationAttributes>
  implements SkillAttributes
{
  skillId!: number;
  name!: string;
  createdAt!: Date;
  updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Skill.init(SkillSchema, {
      sequelize,
      tableName: SkillTableName,
      indexes: [
        {
          unique: true,
          fields: ["name"],
        },
      ],
    });
  }

  static associate() {}
}
