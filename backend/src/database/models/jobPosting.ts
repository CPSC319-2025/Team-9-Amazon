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
    description: string,
    responsibilities: string | undefined,
    qualifications: string | undefined,
    staffId: number,
    criteriaId: number,
    status: JobPostingStatus,
    location: string,
    num_applicants: number,
    num_machine_evaluated: number,
    num_processes: number,
    created_at: string,
}

export default class JobPosting extends Model<JobPostingAttributes> implements JobPostingAttributes {
    id!: number;
    title!: string;
    subtitle: string | undefined;
    description!: string;
    staffId!: number;
    criteriaId!: number;
    status!: JobPostingStatus;
    location!: string;
    responsibilities: string | undefined;
    qualifications: string | undefined;
    num_applicants!: number;
    num_machine_evaluated!: number;
    num_processes!: number;
    created_at!: string;
    
    public static async initDb(sequelize: Sequelize) {
        JobPosting.init({
            id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            title: { type: DataTypes.STRING, allowNull: false},
            subtitle: { type: DataTypes.STRING},
            description: { type: DataTypes.STRING, allowNull: false, defaultValue: ""},
            responsibilities: { type: DataTypes.STRING},
            qualifications: { type: DataTypes.STRING},
            staffId: { type: DataTypes.INTEGER, allowNull: false, references: {
                model: "staff", key: "id"
            }},
            criteriaId: { type: DataTypes.INTEGER, allowNull: false, references: {
                model: "criteria", key: "id"
            }},
            status: { type: DataTypes.STRING, allowNull: false, defaultValue: JobPostingStatus.DRAFT},
            location: { type: DataTypes.STRING, allowNull: false, defaultValue: ""},
            num_applicants: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
            num_machine_evaluated: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
            num_processes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
            created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW}
        },
        {
            sequelize: sequelize, tableName: "job_postings"
        })
    }
}
