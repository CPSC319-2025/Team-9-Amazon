import { Sequelize } from "sequelize";
import Applicant from "./models/applicant";
import Application from "./models/application";
import Criteria from "./models/criteria";
import JobPosting from "./models/jobPosting";
import Staff from "./models/staff";
import JobTag from "./models/jobTag";
import JobTagJobPostingRelation from "./models/tagJobPostingRelation";

export default class Database {
  private static models = [Applicant, Application, Criteria, JobPosting, Staff, JobTag, JobTagJobPostingRelation];
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
    await this.sequelize.sync({ force: true });
  }

  public static GetSequelize() {
    return this.sequelize;
  }
}

Database.InitDb();