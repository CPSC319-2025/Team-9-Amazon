import { Sequelize } from "sequelize";
import Applicant from "./models/applicant";
import Application from "./models/application";
import Criteria from "./models/criteria";
import JobPosting from "./models/jobPosting";
import User from "./models/User";

export default class Database {
  private static models = [Applicant, Application, Criteria, JobPosting, User]
  private static sequelize: Sequelize = new Sequelize(
    "recruitDev",
    "bobj0n3s",
    "1234Recruit!",
    {
      host: "db.dev.amazonpleaserecruit.me",
      dialect: "mysql",
      define: {
        freezeTableName: true,
      },
      query: {raw:true}
    }
  );

  public static async InitDb() {
    for (const model of Database.models) {
      model.initDb(Database.GetSequelize())
    }
    await this.sequelize.authenticate();
    await this.sequelize.sync({ alter: true });
  }

  public static GetSequelize() {
    return this.sequelize;
  }
}

Database.InitDb();