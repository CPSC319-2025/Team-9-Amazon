import { Sequelize } from "sequelize";
import dbConfig from "./config/config.json";
import Applicant from "./models/applicant";
import Criteria from "./models/criteria";
import JobPosting from "./models/jobPosting";
import JobTag from "./models/jobTag";
import Staff from "./models/staff";
import JobTagJobPostingRelation from "./models/tagJobPostingRelation";
import Application from "./models/application";

const models = [
  Applicant,
  Staff,
  JobPosting,
  Application,
  Criteria,
  JobTag,
  JobTagJobPostingRelation,
];

export const initModels = (sequelize: Sequelize) => {
  for (const model of models) {
    model.initialize(sequelize);
  }
  for (const model of models) {
    model.associate();
  }
};

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

  public static async InitDb() {
    try {
      await this.sequelize.authenticate();

      // Initialize models
      initModels(this.sequelize);

      // Development Tool:
      // Set "force: true" to drop and recreate tables
      // Set "alter: true" to update tables
      // await this.sequelize.sync({ force: true, alter: true });

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
