import { QueryInterface, Sequelize } from "sequelize";
import Staff, { StaffCreationAttributes } from "../models/staff";
import { initModels } from "../database";

const listOfStaff: StaffCreationAttributes[] = [
  {
    email: "violet@CHPostal.com",
    password: "password",
    firstName: "Violet",
    lastName: "Evergarden",
    isAdmin: true,
    isHiringManager: true,
  },
  {
    email: "admin@example.com",
    password: "admin123",
    firstName: "Admin",
    lastName: "Staff",
    isAdmin: true,
    isHiringManager: true,
  },
  {
    email: "lloyd@forger.com",
    password: "anya123",
    firstName: "Lloyd",
    lastName: "Forger",
    isAdmin: true,
    isHiringManager: true,
  },
];

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    initModels(queryInterface.sequelize);

    for (const staff of listOfStaff) {
      await Staff.findOrCreate({where: {email: staff.email}, defaults: staff});
    }
  },

  down: async (queryInterface: QueryInterface, Sequelize: Sequelize): Promise<void> => {
    initModels(queryInterface.sequelize);
    const staffEmails: string[] = listOfStaff.map((staff) => staff.email);

    Staff.destroy({where: {email: staffEmails}});
  },
};
