import { DataTypes, Model, Sequelize } from "sequelize";

interface ApplicationAttributes {
    id: number | undefined,
    jobPostingId: number,
    applicantId: number,
    resumePath: string,
    score: number | undefined
}
export default class Application extends Model<ApplicationAttributes> implements ApplicationAttributes {
    id!: number;
    jobPostingId!: number;
    applicantId!: number;
    resumePath!: string;
    score: number | undefined;

    public static async initDb(sequelize: Sequelize) {
        Application.init({
            id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            applicantId: { type: DataTypes.INTEGER, allowNull: false, references: {
                model: 'applicants', key: 'id',
            }},
            jobPostingId: { type: DataTypes.INTEGER, allowNull: false, references: {
                model: 'jobPostings', key: 'id',
            }},
            resumePath: { type: DataTypes.STRING, allowNull: false},
            score: { type: DataTypes.FLOAT, allowNull: true},
        },
        {
            sequelize: sequelize, tableName: "applications"
        })
    }
}
