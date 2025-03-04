import { QueryInterface } from "sequelize";
import { JobTagPostingRelationSchema, JobTagPostingRelationTableName } from "../models/tagJobPostingRelation";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable(JobTagPostingRelationTableName, JobTagPostingRelationSchema);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable(JobTagPostingRelationTableName);
  },
};
