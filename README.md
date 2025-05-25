# E-commerce API

A RESTful API for an e-commerce platform built with Node.js, Express, and PostgreSQL. This API provides endpoints for user authentication, product management, shopping cart operations, and order processing.

## Features

- User authentication (signup, login, logout)
- Product management
- Shopping cart functionality
- Order processing with Stripe integration
- Secure endpoints with JWT authentication
- Input validation using Zod
- Security features with Helmet

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Products
- `POST /api/products` - Create a new product (authenticated)
- `GET /api/products` - Get all products (authenticated)

### Shopping Cart
- `GET /api/cart` - Get user's cart (authenticated)

### Orders
- `POST /api/orders/checkout` - Process checkout (authenticated)
- `GET /api/orders` - Get user's orders (authenticated)
- `GET /api/orders/:order_id` - Get specific order details (authenticated)

