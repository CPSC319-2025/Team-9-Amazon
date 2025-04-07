import { QueryInterface } from "sequelize";
import { SkillSchema } from "../models/skill";
import { SkillTableName } from "../models/tableNames";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable(SkillTableName, SkillSchema);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable(SkillTableName);
  },
};
