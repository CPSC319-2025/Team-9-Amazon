import { DateTime } from "luxon";

export interface CriteriaRepresentation {
  id: number;
  name: string;
  type?: string;
  description: string;
  image: string;
  rating: number;
  address: string;
  hours: string;
  createdAt: string;
  criteriaJson: {
    rules: Array<{
      skill: string;
      pointsPerYearOfExperience: number;
      maxPoints: number;
    }>;
  };
  criteriaType: "global" | "local";
  jobPostingId?: number;
}

export interface CriteriaGroupRepresentation {
  id: string;
  name: string;
  type?: string;
  description: string;
  image: string;
  rating: number;
  address: string;
  hours: string;
  rules: Array<{
    skill: string;
    pointsPerYearOfExperience: number;
    maxPoints: number;
  }>;
}

export const transformToGroupRepresentation = (
  criteria: CriteriaRepresentation
): CriteriaGroupRepresentation => ({
  id: `existing-${criteria.id}`,
  name: criteria.name,
  type: criteria.type,
  description: criteria.description,
  image: criteria.image,
  rating: criteria.rating,
  address: criteria.address,
  hours: criteria.hours,
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
  type: group.type,
  description: group.description,
  image: group.image,
  rating: group.rating,
  address: group.address,
  hours: group.hours,
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
