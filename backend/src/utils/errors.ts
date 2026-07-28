export class AppError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found.') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message, 403)
    this.name = 'ForbiddenError'
  }
}

export class ConflictError extends AppError {
  constructor(message = 'This resource already exists.') {
    super(message, 409)
    this.name = 'ConflictError'
  }
}

export class AuthError extends AppError {
  constructor(message: string, statusCode = 401) {
    super(message, statusCode)
    this.name = 'AuthError'
  }
}
