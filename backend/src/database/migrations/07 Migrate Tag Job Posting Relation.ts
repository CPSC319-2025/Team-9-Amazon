import { QueryInterface } from "sequelize";
import { JobTagPostingRelationSchema } from "../models/tagJobPostingRelation";
import { JobTagPostingRelationTableName } from "../models/tableNames";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable(JobTagPostingRelationTableName, JobTagPostingRelationSchema);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable(JobTagPostingRelationTableName);
  },
};
