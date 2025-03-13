export interface Keyword {
  name: string;
  pointsPerYearOfExperience: number;
  maxPoints: number;
}

export interface CriteriaGroup {
  id: string;
  name: string;
  keywords: Keyword[];
}
