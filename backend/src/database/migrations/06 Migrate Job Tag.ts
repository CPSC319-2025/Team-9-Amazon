import { QueryInterface } from "sequelize";
import { JobTagSchema } from "../models/jobTag";
import { JobTagTableName } from "../models/tableNames";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable(JobTagTableName, JobTagSchema);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable(JobTagTableName);
  },
};