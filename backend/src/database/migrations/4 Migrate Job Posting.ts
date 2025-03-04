import { QueryInterface, DataTypes } from "sequelize";
import { JobPostingSchema, JobPostingStatus, JobPostingTableName } from "../models/jobPosting";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable(JobPostingTableName, JobPostingSchema);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable(JobPostingTableName);
  },
};
