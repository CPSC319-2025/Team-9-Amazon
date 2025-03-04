import { QueryInterface, DataTypes } from "sequelize";
import { ApplicationSchema, ApplicationTableName } from "../models/application";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable(ApplicationTableName, ApplicationSchema);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable(ApplicationTableName);
  },
};