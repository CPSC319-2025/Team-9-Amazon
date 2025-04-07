import { QueryInterface } from "sequelize";
import { ApplicantSchema } from "../models/applicant";
import { ApplicantTableName } from "../models/tableNames";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable(ApplicantTableName, ApplicantSchema);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("applicants");
  },
};