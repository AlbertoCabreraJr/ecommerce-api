const responseCodes = require('../constants/response-codes');
const productModel = require('../models/product.model')

const createProduct = async (req, res) => {
  const { name, description, price, stock, image_url } = req.body;

  try {
    const product = await productModel.createProduct({ name, description, price, stock, image_url })

    return res.status(responseCodes.CREATED.status).json({ product })
  } catch (error) {
    console.error(error);
    return res.status(responseCodes.INTERNAL_SERVER_ERROR.status).json({ code: responseCodes.INTERNAL_SERVER_ERROR.code })
  }
}

const getProducts = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const products = await productModel.getProducts({ page, limit })  

    const total = products[0]?.total ? Number(products[0].total) : 0;
    const totalPages = Math.ceil(total / limit);
  
    const response = {
      products: products.map(({ total, ...product }) => product),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }
    }

    return res.status(responseCodes.OK.status).json(response)
  } catch (error) {
    console.error(error);
    return res.status(responseCodes.INTERNAL_SERVER_ERROR.status).json({ code: responseCodes.INTERNAL_SERVER_ERROR.code })
  }
}

module.exports = {
  createProduct,
  getProducts
}