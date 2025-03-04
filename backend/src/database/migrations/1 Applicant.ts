import { QueryInterface, DataTypes } from "sequelize";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable("applicants", 
        {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            email: { type: DataTypes.STRING, allowNull: false, unique: true },
            firstName: { type: DataTypes.STRING, allowNull: false },
            lastName: { type: DataTypes.STRING, allowNull: false },
            phone: { type: DataTypes.STRING, allowNull: true },
            linkedIn: { type: DataTypes.STRING, allowNull: true },
        }
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("applicants");
  },
};