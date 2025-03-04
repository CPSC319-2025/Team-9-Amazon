import { DataTypes, Model, Sequelize } from "sequelize";

interface JobTagJobPostingRelationAttributes {
    id: number | undefined;
    tagId: number;
    jobPostingId: number;
}

export default class JobTagJobPostingRelation extends Model<JobTagJobPostingRelationAttributes> implements JobTagJobPostingRelationAttributes {
    id!: number;
    tagId!: number;
    jobPostingId!: number;

    public static async initDb(sequelize: Sequelize) {
        JobTagJobPostingRelation.init(
            {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                tagId: { type: DataTypes.INTEGER, allowNull: false, references: {
                    model: "job_tags", key: "id"
                }},
                jobPostingId: { type: DataTypes.INTEGER, allowNull: false, references: {
                    model: "job_postings", key: "id"
                }},
            },
            {
                sequelize: sequelize,
                tableName: "job_tag_job_posting_relations",
            }
        )
    }
}