export interface Rule {
  skill: string;
  pointsPerYearOfExperience: number;
  maxPoints: number;
}

export interface CriteriaGroup {
  id: string;
  name: string;
  rules: Rule[];
}
