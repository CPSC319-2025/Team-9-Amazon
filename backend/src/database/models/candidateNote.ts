import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface CandidateNoteAttributes {
  id: number;
  jobPostingId: string;
  candidateEmail: string;
  notes: string;
  lastUpdated: Date;
}

export interface CandidateNoteCreationAttributes
  extends Optional<CandidateNoteAttributes, "id" | "lastUpdated"> {}

class CandidateNote
  extends Model<CandidateNoteAttributes, CandidateNoteCreationAttributes>
  implements CandidateNoteAttributes {
  public id!: number;
  public jobPostingId!: string;
  public candidateEmail!: string;
  public notes!: string;
  public lastUpdated!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Static methods for model initialization
  public static initialize(sequelize: Sequelize): void {
    CandidateNote.init(
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
        notes: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        lastUpdated: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: "candidate_notes",
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

  // Static method for model associations
  public static associate(): void {
    // No associations needed for this model
  }
}

export default CandidateNote;
