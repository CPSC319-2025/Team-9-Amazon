import { DateTime } from "luxon";
import { Rule } from "../types/criteria";

export interface CreateCriteriaRequest {
  name: string;
  criteriaType: "global" | "local";
  criteriaJson?: {
    rules: Array<Rule>;
  };
}

export interface CreateCriteriaResponse {

}

export interface CriteriaRepresentation {
  id: number;
  createdAt: string;
  updatedAt: string;
  criteriaMaxScore: number;
  criteriaType: "global" | "local";
  jobPostingId: number | null;
  name: string;
  criteriaJson: {
    rules: Array<{
      skill: string;
      pointsPerYearOfExperience: number;
      maxPoints: number;
    }>;
  };
}

export interface CriteriaGroupRepresentation {
  id: string;
  name: string;
  rules: Array<Rule>;
}

export const transformToGroupRepresentation = (
  criteria: CriteriaRepresentation
): CriteriaGroupRepresentation => ({
  id: `existing-${criteria.id}`,
  name: criteria.name,
  rules: criteria.criteriaJson.rules.map((rule) => ({
    skill: rule.skill,
    pointsPerYearOfExperience: rule.pointsPerYearOfExperience,
    maxPoints: rule.maxPoints,
  })),
});

export const transformToApiRepresentation = (
  group: CriteriaGroupRepresentation
): Partial<CriteriaRepresentation> => ({
  name: group.name,
  createdAt: DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss"),
  criteriaJson: {
    rules: group.rules.map((rule) => ({
      skill: rule.skill,
      pointsPerYearOfExperience: rule.pointsPerYearOfExperience,
      maxPoints: rule.maxPoints,
    })),
  },
});

export const transformToRequestData = (
  criteria: CriteriaGroupRepresentation
) => ({
  name: criteria.name,
  criteriaJson: {
    rules: criteria.rules.map((rule) => ({
      skill: rule.skill,
      pointsPerYearOfExperience: rule.pointsPerYearOfExperience,
      maxPoints: rule.maxPoints,
    })),
  },
});
