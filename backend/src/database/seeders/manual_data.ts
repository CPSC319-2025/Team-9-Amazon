import { QueryInterface, Sequelize } from "sequelize";
import Staff, { StaffCreationAttributes } from "../models/staff";
import { initModels } from "../database";
import bcrypt from "bcryptjs";

const saltRounds = 10;

const hashPasswords = async (): Promise<StaffCreationAttributes[]> => {
  return [
    {
      email: "violet@CHPostal.com",
      password: await bcrypt.hash("password", saltRounds),
      firstName: "Violet",
      lastName: "Evergarden",
      isAdmin: true,
      isHiringManager: true,
    },
    {
      email: "admin@example.com",
      password: await bcrypt.hash("admin123", saltRounds),
      firstName: "Admin",
      lastName: "Staff",
      isAdmin: true,
      isHiringManager: true,
    },
  ];
};

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    initModels(queryInterface.sequelize);

    // Ensure passwords are hashed before inserting
    const listOfStaff = await hashPasswords();

    await Staff.bulkCreate(listOfStaff, { ignoreDuplicates: true });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    initModels(queryInterface.sequelize);

    const staffEmails = ["violet@CHPostal.com", "admin@example.com"];

    await Staff.destroy({ where: { email: staffEmails } });
  },
};
