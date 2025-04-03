import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface ManualScoreAttributes {
  id: number;
  jobPostingId: string;
  candidateEmail: string;
  criteriaScores: string; // JSON string containing the criteria scores
  totalScore: number;
  lastUpdated: Date;
}

export interface ManualScoreCreationAttributes
  extends Optional<ManualScoreAttributes, "id" | "lastUpdated"> {}

class ManualScore
  extends Model<ManualScoreAttributes, ManualScoreCreationAttributes>
  implements ManualScoreAttributes {
  public id!: number;
  public jobPostingId!: string;
  public candidateEmail!: string;
  public criteriaScores!: string;
  public totalScore!: number;
  public lastUpdated!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Static methods for model initialization
  public static initialize(sequelize: Sequelize): void {
    ManualScore.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        jobPostingId: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        candidateEmail: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        criteriaScores: {
          type: DataTypes.TEXT('long'),
          allowNull: false,
          get() {
            const rawValue = this.getDataValue('criteriaScores');
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value) {
            this.setDataValue('criteriaScores', 
              typeof value === 'string' ? value : JSON.stringify(value)
            );
          }
        },
        totalScore: {
          type: DataTypes.FLOAT,
          allowNull: false,
          defaultValue: 0,
        },
        lastUpdated: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: "manual_scores",
        timestamps: true,
        indexes: [
          {
            unique: true,
            fields: ["jobPostingId", "candidateEmail"],
          },
        ],
      }
    );
  }

  public static associate(): void {
    // Define associations here if needed
  }
}

export default ManualScore;
