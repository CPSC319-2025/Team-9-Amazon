import { QueryInterface } from "sequelize";
import { CriteriaSchema, CriteriaTableName } from "../models/criteria";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable(CriteriaTableName, CriteriaSchema);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable(CriteriaTableName);
  },
};