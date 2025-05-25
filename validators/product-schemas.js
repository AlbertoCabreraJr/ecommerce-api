const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().min(0),
  image_url: z.string().min(1),
});

module.exports = { createProductSchema };