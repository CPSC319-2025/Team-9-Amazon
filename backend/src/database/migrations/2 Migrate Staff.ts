import { QueryInterface, DataTypes } from "sequelize";
import { StaffSchema, StaffTableName } from "../models/staff";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable(StaffTableName, StaffSchema);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable(StaffTableName);
  },
};