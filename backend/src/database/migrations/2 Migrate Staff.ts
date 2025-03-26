import { QueryInterface, DataTypes } from "sequelize";
import { StaffSchema } from "../models/staff";
import { StaffTableName } from "../models/tableNames";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable(StaffTableName, StaffSchema);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable(StaffTableName);
  },
};