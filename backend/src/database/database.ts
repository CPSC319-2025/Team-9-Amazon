import { Sequelize } from "sequelize";
import Applicant from "./models/applicant";
import Staff from "./models/staff";
import Criteria from "./models/criteria";
import JobPosting from "./models/jobPosting";
import JobTag from "./models/jobTag";
import JobTagJobPostingRelation from "./models/tagJobPostingRelation";

const models = [Applicant, Staff, Criteria, JobPosting, JobTag, JobTagJobPostingRelation]
export default class Database {
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
    await this.sequelize.authenticate();
    for (const model of models) {
      model.initialize(this.sequelize)
    }
    // We can turn this on for dev
    // await this.sequelize.sync({force: false, alter: false});
  }

  public static GetSequelize() {
    return this.sequelize;
  }
}