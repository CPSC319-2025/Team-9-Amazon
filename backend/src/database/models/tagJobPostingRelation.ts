import { DataTypes, Model, Sequelize } from "sequelize";

interface TagJobPostingRelationAttributes {
    id: number | undefined;
    tagId: number;
    jobPostingId: number;
}

export default class TagJobPostingRelation extends Model<TagJobPostingRelationAttributes> implements TagJobPostingRelationAttributes {
    id!: number;
    tagId!: number;
    jobPostingId!: number;

    public static async initDb(sequelize: Sequelize) {
        TagJobPostingRelation.init(
            {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                tagId: { type: DataTypes.INTEGER, allowNull: false, references: {
                    model: "tags", key: "id"
                }},
                jobPostingId: { type: DataTypes.INTEGER, allowNull: false, references: {
                    model: "jobPostings", key: "id"
                }},
            },
            {
                sequelize: sequelize,
                tableName: "tag_job_posting_relations",
            }
        )
    }
}