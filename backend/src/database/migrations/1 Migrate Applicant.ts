import { QueryInterface } from "sequelize";
import { ApplicantSchema, ApplicantTableName } from "../models/applicant";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable(ApplicantTableName, ApplicantSchema);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("applicants");
  },
};