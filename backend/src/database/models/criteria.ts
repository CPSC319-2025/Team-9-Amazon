import { DataTypes, Model, Sequelize } from "sequelize";

interface CriteriaAttributes {
  id: number | undefined;
  criteraJson: any;
}
export const CriteriaSchema = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  criteraJson: { type: DataTypes.JSON, allowNull: false },
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
export default class Criteria
  extends Model<CriteriaAttributes>
  implements CriteriaAttributes
{
  id!: number;
  criteraJson!: any;

  static initialize(sequelize: Sequelize) {
    Criteria.init(CriteriaSchema, {
      sequelize,
      tableName: CriteriaTableName,
    });
  }
}
