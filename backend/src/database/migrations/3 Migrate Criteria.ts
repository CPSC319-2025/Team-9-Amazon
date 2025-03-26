import { QueryInterface } from "sequelize";
import { CriteriaSchema } from "../models/criteria";
import { CriteriaTableName } from "../models/tableNames";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable(CriteriaTableName, CriteriaSchema);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable(CriteriaTableName);
  },
};