import { QueryInterface, DataTypes } from "sequelize";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable("applications", 
        {
            id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            applicantId: { type: DataTypes.INTEGER, allowNull: false, references: {
                model: 'applicants', key: 'id',
            }},
            jobPostingId: { type: DataTypes.INTEGER, allowNull: false, references: {
                model: 'jobPostings', key: 'id',
            }},
            resumePath: { type: DataTypes.STRING, allowNull: false},
            score: { type: DataTypes.FLOAT, allowNull: true},
        }
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("applications");
  },
};