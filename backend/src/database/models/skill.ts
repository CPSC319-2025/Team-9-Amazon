import { DataTypes, Model, Sequelize } from "sequelize";
import { SkillTableName } from "./tableNames";
import Criteria from "./criteria";
import Application from "./application";

interface SkillAttributes {
  skillId: number;
  name: string;
}

interface SkillCreationAttributes
  extends Omit<SkillAttributes, "skillId" | "createdAt" | "updatedAt"> {}

export const SkillSchema = {
  skillId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'skills_name',
    validate: {
      notEmpty: true,
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
  },
};

export default class Skill
  extends Model<SkillAttributes, SkillCreationAttributes>
  implements SkillAttributes
{
  skillId!: number;
  name!: string;
  createdAt!: Date;
  updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Skill.init(SkillSchema, {
      sequelize,
      tableName: SkillTableName,
      indexes: [
        {
          unique: true,
          fields: ["name"],
        },
      ],
      hooks: {
        beforeUpdate: async (skill: Skill) => {
          if (skill.changed("name")) {
            const oldName = skill.previous("name");
            const newName = skill.get("name");

            // Find all criteria that reference this skill
            const affectedCriteria = await Criteria.findAll({
              where: Sequelize.literal(
                `JSON_CONTAINS(criteriaJson->'$.rules', '{"skill": "${oldName}"}')`
              ),
            });

            console.log("affected", affectedCriteria);
            console.log("affected", oldName);
            console.log("affected", skill.dataValues.name);

            // Update each criteria with the new skill name
            for (const criteria of affectedCriteria) {
              const criteriaData = criteria.dataValues;

              const updatedRules = criteriaData.criteriaJson.rules.map(
                (rule) => ({
                  ...rule,
                  skill: rule.skill === oldName ? newName : rule.skill,
                })
              );

              // Get a fresh instance of the criteria to ensure we have the latest data
              const criteriaInstance = await Criteria.findByPk(criteriaData.id);
              if (!criteriaInstance) {
                continue; // Skip if criteria no longer exists
              }

              // Update criteria with filtered rules
              await criteriaInstance.update({
                criteriaJson: {
                  rules: updatedRules,
                },
              });
            }

            // Find all applications that reference this skill
            const applications = await Application.findAll({
              where: Sequelize.literal(
                `JSON_SEARCH(experienceJson, 'one', '${oldName}', NULL, '$.experiences[*].skills[*]') IS NOT NULL`
              ),
            });

            // Update each application with the new skill name
            for (const application of applications) {
              const applicationData = application.dataValues;
              const updatedExperiences =
                applicationData.experienceJson.experiences.map((exp) => ({
                  ...exp,
                  skills: exp.skills.map((skill) =>
                    skill === oldName ? newName : skill
                  ),
                }));

              await application.update({
                experienceJson: {
                  experiences: updatedExperiences,
                },
              });
            }
          }
        },
        beforeDestroy: async (skill: Skill) => {
          try {
            // Find all criteria that reference this skill
            const affectedCriteria = await Criteria.findAll({
              where: Sequelize.literal(
                `JSON_CONTAINS(criteriaJson->'$.rules', '{"skill": "${skill.dataValues.name}"}')`
              ),
            });

            // Update each criteria to remove rules with this skill
            for (const criteria of affectedCriteria) {
              const criteriaData = criteria.dataValues;
              const updatedRules = criteriaData.criteriaJson.rules.filter(
                (rule: { skill: string }) =>
                  rule.skill !== skill.dataValues.name
              );

              // Get a fresh instance of the criteria to ensure we have the latest data
              const criteriaInstance = await Criteria.findByPk(criteriaData.id);
              if (!criteriaInstance) {
                continue; // Skip if criteria no longer exists
              }

              if (updatedRules.length === 0) {
                // If no rules remain, destroy the criteria
                await criteriaInstance.destroy();
              } else {
                // Update criteria with filtered rules
                await criteriaInstance.update({
                  criteriaJson: {
                    rules: updatedRules,
                  },
                });
              }
            }
          } catch (error) {
            console.error("Error in beforeDestroy hook:", error);
            throw error;
          }
        },
      },
    });
  }

  static associate() {}
}
