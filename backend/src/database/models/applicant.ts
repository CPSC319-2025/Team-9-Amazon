import { DataTypes, Model, Sequelize } from "sequelize";

interface ApplicantAttributes {
    id: number | undefined;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | undefined;
    linkedIn: string | undefined;
}
export default class Applicant extends Model<ApplicantAttributes> implements ApplicantAttributes {
    id!: number;
    email!: string;
    firstName!: string;
    lastName!: string;
    phone: string | undefined;
    linkedIn: string | undefined;

    public static async initDb(sequelize: Sequelize) {
        Applicant.init(
            {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                email: { type: DataTypes.STRING, allowNull: false, unique: true },
                firstName: { type: DataTypes.STRING, allowNull: false },
                lastName: { type: DataTypes.STRING, allowNull: false },
                phone: { type: DataTypes.STRING, allowNull: true },
                linkedIn: { type: DataTypes.STRING, allowNull: true },
            },
            {
                sequelize: sequelize,
                tableName: "applicants",
            }
        )
    }
}
