import { QueryInterface, DataTypes } from "sequelize";
import { ApplicationSchema } from "../models/application";
import { ApplicationTableName } from "../models/tableNames";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable(ApplicationTableName, ApplicationSchema);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable(ApplicationTableName);
  },
};