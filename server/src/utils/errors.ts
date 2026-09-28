/**
 * Domain & HTTP Error Hierarchy
 *
 * All domain failures extend DomainError. Express error middleware translates
 * these into standard API error envelopes: { error: { code, message, details? } }
 */

export abstract class DomainError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;
  readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends DomainError {
  readonly statusCode = 400;
  readonly code = 'VALIDATION_ERROR';
}

export class UnauthorizedError extends DomainError {
  readonly statusCode = 401;
  readonly code = 'UNAUTHENTICATED';
  constructor(message = 'Authentication required') {
    super(message);
  }
}

export class ForbiddenError extends DomainError {
  readonly statusCode = 403;
  readonly code = 'FORBIDDEN';
  constructor(message = 'Access denied: insufficient permissions or scope') {
    super(message);
  }
}

export class NotFoundError extends DomainError {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';
  constructor(resource = 'Resource') {
    super(`${resource} not found`);
  }
}

export class InvalidTransitionError extends DomainError {
  readonly statusCode = 409;
  readonly code = 'INVALID_TRANSITION';
  constructor(entity: string, current: string, event: string) {
    super(`Cannot perform '${event}' on ${entity} in status '${current}'`);
  }
}

export class ConflictError extends DomainError {
  readonly statusCode = 409;
  readonly code = 'CONFLICT';
}

export class GuardFailedError extends DomainError {
  readonly statusCode = 422;
  readonly code = 'GUARD_FAILED';
}
