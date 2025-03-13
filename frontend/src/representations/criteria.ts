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
    tokens: Array<{
      word: string;
      points_per_year_of_experience: number;
      max_points: number;
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
  keywords: Array<{
    name: string;
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
  keywords: criteria.criteriaJson.tokens.map((token) => ({
    name: token.word,
    pointsPerYearOfExperience: token.points_per_year_of_experience,
    maxPoints: token.max_points,
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
    tokens: group.keywords.map((keyword) => ({
      word: keyword.name,
      points_per_year_of_experience: keyword.pointsPerYearOfExperience,
      max_points: keyword.maxPoints,
    })),
  },
});

export const transformToRequestData = (
  criteria: CriteriaGroupRepresentation
) => ({
  name: criteria.name,
  criteriaJson: {
    tokens: criteria.keywords.map((keyword) => ({
      word: keyword.name,
      points_per_year_of_experience: keyword.pointsPerYearOfExperience,
      max_points: keyword.maxPoints,
    })),
  },
});
