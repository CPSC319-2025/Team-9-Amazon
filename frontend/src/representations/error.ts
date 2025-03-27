export interface ApiErrorData {
  error: string;
  details?: string;
}

export class ApiError extends Error {
  details?: string;
  code?: number;

  constructor(error: string, details?: string, code?: number) {
    super(error);
    this.name = "ApiError";
    this.details = details;
    this.code = code;
  }

  static fromResponse(data: ApiErrorData, response: Response | undefined = undefined): ApiError {
    return new ApiError(data.error, data.details, response ? response.status : undefined);
  }
}

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};
