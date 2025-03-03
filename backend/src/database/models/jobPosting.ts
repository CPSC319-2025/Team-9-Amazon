import { DataTypes, Model, Sequelize } from "sequelize";

export enum JobPostingStatus {
    DRAFT = "DRAFT",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
}

interface JobPostingAttributes {
    id: number | undefined,
    title: string,
    subtitle: string | undefined,
    description: string | undefined,
    staffId: number,
    criteriaId: number,
    status: JobPostingStatus
}

export default class JobPosting extends Model<JobPostingAttributes> implements JobPostingAttributes {
    id!: number;
    title!: string;
    subtitle: string | undefined;
    description: string | undefined;
    staffId!: number;
    criteriaId!: number;
    status!: JobPostingStatus;
    
    public static async initDb(sequelize: Sequelize) {
        JobPosting.init({
            id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            title: { type: DataTypes.STRING, allowNull: false},
            subtitle: { type: DataTypes.STRING},
            description: { type: DataTypes.STRING},
            staffId: { type: DataTypes.INTEGER, allowNull: false, references: {
                model: "staff", key: "id"
            }},
            criteriaId: { type: DataTypes.INTEGER, allowNull: false, references: {
                model: "criteria", key: "id"
            }},
            status: { type: DataTypes.STRING},
        },
        {
            sequelize: sequelize, tableName: "jobPostings"
        })
    }
}
