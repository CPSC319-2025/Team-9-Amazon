import { DataTypes, Model, Sequelize } from "sequelize";

interface TagAttributes {
    id: number | undefined;
    name: string;
}

export default class Tag extends Model<TagAttributes> implements TagAttributes {
    id!: number;
    name!: string;

    public static async initDb(sequelize: Sequelize) {
        Tag.init(
            {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                name: { type: DataTypes.STRING, allowNull: false, unique: true },
            },
            {
                sequelize: sequelize,
                tableName: "tags",
            }
        )
    }
}

