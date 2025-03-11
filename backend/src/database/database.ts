import { Sequelize } from "sequelize";
import dbConfig from "./config/config.json";
import bcrypt from "bcryptjs";
import Applicant from "./models/applicant";
import Staff from "./models/staff";
import Criteria from "./models/criteria";
import JobPosting from "./models/jobPosting";
import JobTag from "./models/jobTag";
import JobTagJobPostingRelation from "./models/tagJobPostingRelation";

const models = [
  Applicant,
  Staff,
  Criteria,
  JobPosting,
  JobTag,
  JobTagJobPostingRelation,
];

export default class Database {
  private static sequelize: Sequelize = new Sequelize(
    dbConfig.development.database,
    dbConfig.development.username,
    dbConfig.development.password,
    {
      host: dbConfig.development.host,
      dialect: "mysql",
      define: {
        freezeTableName: true,
      },
    }
  );

  private static async createInitialAdmin() {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      // Create a new admin user
      const [admin, created] = await Staff.findOrCreate({
        where: { email: "admin@example.com" },
        defaults: {
          email: "admin@example.com",
          password: hashedPassword,
          firstName: "Admin",
          lastName: "User",
          isAdmin: true,
          isHiringManager: true,
        },
      });

      if (created) {
        console.log("Initial admin user created successfully");
      } else {
        // Update password if admin exists
        admin.password = hashedPassword;
        await admin.save();
        console.log("Admin user password updated");
      }

      return admin;
    } catch (error) {
      console.error("Error handling initial admin:", error);
      throw error;
    }
  }

  public static async InitDb() {
    try {
      await this.sequelize.authenticate();

      // Initialize models
      for (const model of models) {
        model.initialize(this.sequelize);
      }

      // Sync with alter option for development
      // await this.sequelize.sync({ force: true, alter: true });

      // Create initial admin
      await this.createInitialAdmin();

      return this.sequelize;
    } catch (error) {
      console.error("Database initialization failed:", error);
      throw error;
    }
  }

  public static GetSequelize() {
    return this.sequelize;
  }
}
