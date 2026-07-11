/**
 * Custom application errors with HTTP status codes.
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class RateLimitError extends AppError {
  constructor(message, resetAt) {
    super(message, 429);
    this.name = 'RateLimitError';
    this.resetAt = resetAt;
  }
}

class GitHubApiError extends AppError {
  constructor(message, statusCode = 502) {
    super(message, statusCode);
    this.name = 'GitHubApiError';
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

module.exports = {
  AppError,
  ValidationError,
  RateLimitError,
  GitHubApiError,
  NotFoundError,
};
