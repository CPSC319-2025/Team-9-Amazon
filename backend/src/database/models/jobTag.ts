import { DataTypes, Model, Sequelize } from "sequelize";

interface JobTagAttributes {
    id: number | undefined;
    name: string;
}

export default class JobTag extends Model<JobTagAttributes> implements JobTagAttributes {
    id!: number;
    name!: string;

    public static async initDb(sequelize: Sequelize) {
        JobTag.init(
            {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                name: { type: DataTypes.STRING, allowNull: false, unique: true },
            },
            {
                sequelize: sequelize,
                tableName: "job_tags",
            }
        )
    }
}

