const { ZodError } = require('zod');
const responseCodes = require('../constants/response-codes');

const validateBody = ({ schema }) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(responseCodes.UNPROCESSABLE_ENTITY.status).json({
          errors: error.errors.map((err) => ({ 
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      console.error(error);

      return res.status(responseCodes.INTERNAL_SERVER_ERROR.status).json({
        code: responseCodes.INTERNAL_SERVER_ERROR.code
      });
    }
  }
}

module.exports = validateBody;