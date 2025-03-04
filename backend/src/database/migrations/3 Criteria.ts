import { QueryInterface, DataTypes } from "sequelize";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable("criteria", 
        {
            id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            criteraJson: {type: DataTypes.JSON, allowNull: false}
        }
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("criteria");
  },
};