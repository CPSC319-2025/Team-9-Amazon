import { DataTypes, Model, Sequelize } from "sequelize";

interface UserAttributes {
    id: number | undefined;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | undefined;
    isAdmin: boolean;
    isHiringManager: boolean;
}
export default class User extends Model<UserAttributes> implements UserAttributes {
    id!: number;
    email!: string;
    firstName!: string;
    lastName!: string;
    phone: string | undefined;
    isAdmin!: boolean;
    isHiringManager!: boolean;

    public static async initDb(sequelize: Sequelize) {
        User.init({
            id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            email: { type: DataTypes.STRING, allowNull: false, unique: true},
            firstName: { type: DataTypes.STRING, allowNull: false},
            lastName: { type: DataTypes.STRING, allowNull: false},
            phone: { type: DataTypes.STRING},
            isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false},
            isHiringManager: { type: DataTypes.BOOLEAN, defaultValue: false},
        },
        {
            sequelize: sequelize, tableName: "users"
        })
    }
}