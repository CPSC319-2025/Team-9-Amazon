import { QueryInterface, DataTypes } from "sequelize";
import { ApplicationTableName } from "../models/tableNames";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.addColumn(ApplicationTableName, "manualScore", {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.removeColumn(ApplicationTableName, "manualScore");
  },
};
