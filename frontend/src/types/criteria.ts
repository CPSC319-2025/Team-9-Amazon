export interface Keyword {
  name: string;
  pointsPerMatch: number;
  maxPoints: number;
}

export interface CriteriaGroup {
  id: string;
  name: string;
  keywords: Keyword[];
}
