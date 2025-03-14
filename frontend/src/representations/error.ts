export interface ApiErrorData {
  error: string;
  details?: string;
}

export class ApiError extends Error {
  details?: string;

  constructor(error: string, details?: string) {
    super(error);
    this.name = "ApiError";
    this.details = details;
  }

  static fromResponse(data: ApiErrorData): ApiError {
    return new ApiError(data.error, data.details);
  }
}

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};
