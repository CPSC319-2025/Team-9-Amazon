import { QueryInterface, DataTypes } from "sequelize";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable("staff", 
      {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        email: { type: DataTypes.STRING, allowNull: false, unique: true},
        firstName: { type: DataTypes.STRING, allowNull: false},
        lastName: { type: DataTypes.STRING, allowNull: false},
        phone: { type: DataTypes.STRING},
        isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false},
        isHiringManager: { type: DataTypes.BOOLEAN, defaultValue: false},
     }
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("staff");
  },
};