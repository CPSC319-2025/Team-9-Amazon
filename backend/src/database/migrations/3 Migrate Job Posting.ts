import { QueryInterface } from "sequelize";
import { JobPostingSchema } from "../models/jobPosting";
import { JobPostingTableName } from "../models/tableNames";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable(JobPostingTableName, JobPostingSchema);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable(JobPostingTableName);
  },
};
