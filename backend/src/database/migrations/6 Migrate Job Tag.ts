import { QueryInterface } from "sequelize";
import { JobTagSchema, JobTagTableName } from "../models/jobTag";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable(JobTagTableName, JobTagSchema);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable(JobTagTableName);
  },
};