module.exports = {
  // 2xx 
  OK: {
    code: 'OK',
    status: 200,
  },
  CREATED: {
    code: 'CREATED',
    status: 201,
  },
  ACCEPTED: {
    code: 'ACCEPTED',
    status: 202,
  },
  NO_CONTENT: {
    code: 'NO_CONTENT',
  },

  // 4xx
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    status: 400,
  },
  EMAIL_ALREADY_EXISTS: {
    code: 'EMAIL_ALREADY_EXISTS',
    status: 409,
  },
  UNPROCESSABLE_ENTITY: {
    code: 'UNPROCESSABLE_ENTITY',
    status: 422,
  },

  // 5xx
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    status: 500,
  },
}