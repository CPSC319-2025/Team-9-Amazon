import { DataTypes, Model, Sequelize } from "sequelize";

interface CriteriaAttributes {
    id: number | undefined,
    criteraJson: any
}
export default class Criteria extends Model<CriteriaAttributes> implements CriteriaAttributes {
    id!: number;
    criteraJson!: any;

    public static async initDb(sequelize: Sequelize) {
        Criteria.init({
            id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            criteraJson: {type: DataTypes.JSON, allowNull: false}
        },
        {
            sequelize: sequelize, tableName: "criteria"
        })
    }
}