import { Sequelize } from "sequelize";
import dbConfig from "../config/config.json";
import JobTag from "../models/jobTag";

// Initialize Sequelize (Modify based on your project setup)
const sequelize: Sequelize = new Sequelize(
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

// Ensure the JobTag model is properly initialized
JobTag.initialize(sequelize);

const addJobTag = async () => {
  try {
    await sequelize.authenticate(); // Connect to the database
    console.log("Connected to the database successfully.");

    await JobTag.create({ name: "fullstack" });
    console.log("Job tag 'fullstack' added successfully!");
  } catch (error) {
    console.error("Error adding job tag:", error);
  } finally {
    await sequelize.close(); // Close connection after execution
  }
};

// Run the function
addJobTag();