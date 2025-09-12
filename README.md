# Expense Tracker Backend API

A comprehensive REST API for expense tracking with user authentication and CRUD operations. Built with Node.js, Express.js, MongoDB, and JWT authentication.

## 🚀 Features

- **User Authentication**: Register, login, and JWT-based authentication
- **Expense Management**: Full CRUD operations for expenses
- **Data Validation**: Comprehensive input validation using express-validator
- **Security**: Password hashing, JWT tokens, and user-specific data access
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Error Handling**: Proper error handling and response formatting
- **Pagination**: Built-in pagination for expense listings
- **Statistics**: Expense analytics and category breakdowns
- **Filtering**: Filter expenses by category, date range, and more

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expense-tracker-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGO_URI=mongodb://localhost:27017/expense-tracker
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📚 API Documentation

### Interactive Documentation
Visit `http://localhost:5000/api-docs` for interactive Swagger documentation.

### Base URL
```
http://localhost:5000/api
```

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Current User Profile
```http
GET /api/auth/me
Authorization: Bearer <your-jwt-token>
```

### Verify Token
```http
POST /api/auth/verify
Authorization: Bearer <your-jwt-token>
```

## 💰 Expense Endpoints

### Create Expense
```http
POST /api/expenses
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Grocery Shopping",
  "amount": 150.50,
  "date": "2024-01-15",
  "category": "Food",
  "description": "Weekly grocery shopping at supermarket"
}
```

### Get All Expenses
```http
GET /api/expenses?page=1&limit=10&category=Food&sortBy=date&sortOrder=desc
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `category` (optional): Filter by category
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter until date (ISO 8601)
- `sortBy` (optional): Sort field (date, amount, createdAt)
- `sortOrder` (optional): Sort order (asc, desc)

### Get Single Expense
```http
GET /api/expenses/{expense-id}
Authorization: Bearer <your-jwt-token>
```

### Update Expense
```http
PUT /api/expenses/{expense-id}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Updated Grocery Shopping",
  "amount": 175.75,
  "category": "Food"
}
```

### Delete Expense
```http
DELETE /api/expenses/{expense-id}
Authorization: Bearer <your-jwt-token>
```

### Get Expense Statistics
```http
GET /api/expenses/stats/summary?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalExpenses": 25,
    "totalAmount": 2500.50,
    "averageAmount": 100.02,
    "categoryBreakdown": [
      {
        "_id": "Food",
        "total": 800.50,
        "count": 10
      }
    ],
    "monthlyBreakdown": [
      {
        "_id": { "year": 2024, "month": 1 },
        "total": 1200.50,
        "count": 15
      }
    ]
  }
}
```

## 📊 Expense Categories

Available categories:
- Food
- Transportation
- Entertainment
- Shopping
- Bills
- Healthcare
- Education
- Travel
- Other

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Input Validation**: Comprehensive validation using express-validator
- **User Isolation**: Users can only access their own expenses
- **CORS Support**: Configurable CORS for frontend integration

## 🚦 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors (if applicable)
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found
- `500`: Internal Server Error

## 🧪 Testing the API

### Using cURL

**Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Create an expense:**
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Coffee","amount":4.50,"date":"2024-01-15","category":"Food"}'
```

### Using Postman

1. Import the API collection (if available)
2. Set the base URL to `http://localhost:5000/api`
3. Use the register/login endpoints to get a JWT token
4. Add the token to the Authorization header: `Bearer <token>`
5. Test the expense endpoints

## 🏗️ Project Structure

```
expense-tracker-backend/
├── models/
│   ├── User.js          # User model with authentication
│   └── Expense.js       # Expense model with validation
├── routes/
│   ├── authRoutes.js    # Authentication endpoints
│   └── expenseRoutes.js # Expense CRUD endpoints
├── middleware/
│   └── auth.js          # JWT authentication middleware
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
├── env.example          # Environment variables template
└── README.md           # This file
```

## 🚀 Deployment

### Environment Variables for Production
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker
JWT_SECRET=your-super-secure-production-jwt-secret
PORT=5000
NODE_ENV=production
PRODUCTION_URL=https://your-api-domain.com
```

### Deployment Platforms
- **Heroku**: Easy deployment with MongoDB Atlas
- **Railway**: Simple Node.js deployment
- **DigitalOcean**: VPS deployment
- **AWS**: EC2 or Elastic Beanstalk

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api-docs`
- Review the error messages for debugging

---

**Happy coding! 🎉**