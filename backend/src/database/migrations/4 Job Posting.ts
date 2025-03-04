import { QueryInterface, DataTypes } from "sequelize";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable("jobPostings", 
      {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        title: { type: DataTypes.STRING, allowNull: false},
        subtitle: { type: DataTypes.STRING},
        description: { type: DataTypes.STRING},
        staffId: { type: DataTypes.INTEGER, allowNull: false, references: {
            model: "staff", key: "id"
        }},
        criteriaId: { type: DataTypes.INTEGER, allowNull: false, references: {
            model: "criteria", key: "id"
        }},
        status: { type: DataTypes.STRING},
    }
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("jobPostings");
  },
};