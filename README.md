# Social-Media-Micro-Services

This API Gateway is built using **Express.js** and serves as a reverse proxy to multiple microservices, including the Identity, Post, Media, Search, and Profile services. It handles authentication, rate limiting, logging, and error management to provide a secure and efficient API layer.

## 🚀 Features

- **Reverse Proxy**: For Identity, Post, Media, Search, and Profile microservices.
- **Rate Limiting**: Configured using Redis for distributed rate limiting.
- **Authentication Middleware**: Token validation for secured routes.
- **Centralized Logging**: Logs all requests and service responses.
- **Error Handling**: Centralized error management.
- **Security**: Uses Helmet for securing HTTP headers.

## 📦 Technologies Used

- **Node.js** & **Express.js**
- **ioredis** for Redis client
- **express-http-proxy** for service proxying
- **dotenv** for environment variable management
- **express-rate-limit** with **rate-limit-redis**
- **Helmet** for HTTP security
- **CORS** middleware

## 🗂️ Project Structure

```
├── middleware
│   ├── authMiddleware.js
│   └── errorHandler.js
├── utils
│   └── logger.js
├── controllers
│   ├── post-controller.js
│   ├── media-controller.js
│   ├── identity-controller.js
│   ├── search-controller.js
│   └── profile-controller.js
├── routes
│   ├── post-routes.js
│   ├── media-routes.js
│   ├── identity-routes.js
│   ├── search-routes.js
│   └── profile-routes.js
├── .env
├── app.js (Main entry point)
└── package.json
```

## ⚙️ Setup Instructions

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/DhruvGajera9022/Social-Media-Micro-Services.git
   cd Social-Media-Micro-Services
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file with the following variables:

   ```env
   PORT=3000
   REDIS_URL=redis://localhost:6379
   IDENTITY_SERVICE_URL=http://localhost:4000
   POST_SERVICE_URL=http://localhost:4001
   MEDIA_SERVICE_URL=http://localhost:4002
   SEARCH_SERVICE_URL=http://localhost:4003
   PROFILE_SERVICE_URL=http://localhost:4004
   ```

4. **Run the Server:**

   ```bash
   npm start
   ```

## 🛡️ Middleware Details

- **CORS:** Allows cross-origin requests.
- **Helmet:** Secures HTTP headers.
- **Rate Limiting:** Limits requests to 100 per 15 minutes per IP.
- **Authentication:** `validateToken` middleware checks JWT tokens.
- **Error Handling:** Catches all errors and sends proper responses.

## 🌐 API Endpoints

### **Authentication Service** (`/v1/auth`)

- `POST /register` - Register a new user
- `POST /login` - Login user
- `POST /refresh-token` - Refresh JWT token
- `POST /forgot-password` - Request password reset
- `POST /logout` - Logout user

### **Post Service** (`/v1/posts`)

- `POST /create-post` - Create a new post _(Auth required)_
- `GET /posts` - Get all posts _(Auth required)_
- `GET /:id` - Get a single post by ID _(Auth required)_
- `DELETE /:id` - Delete a post by ID _(Auth required)_

### **Media Service** (`/v1/media`)

- `POST /upload` - Upload media _(Auth required)_
- `GET /get` - Get all media _(Auth required)_

### **Search Service** (`/v1/search`)

- `GET /posts` - Search posts _(Auth required)_

### **Profile Service** (`/v1/profile`)

- `GET /get-profile` - Get user profile _(Auth required)_
- `POST /edit-profile` - Edit user profile _(Auth required)_

## 🔒 Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per IP
- **Storage:** Redis
- **Response for Limit Exceeded:**
  ```json
  {
    "success": false,
    "message": "Too many requests"
  }
  ```

## 📝 Logging

Logs include:

- Incoming requests (method, URL, body)
- Responses from proxied services
- Rate limit violations
- Errors in proxying

## ⚠️ Error Handling

Centralized error handling returns structured JSON responses:

```json
{
  "message": "Internal server error",
  "error": "Detailed error message"
}
```

## 📄 License

This project is licensed under the MIT License.

---

**Maintained by:** [Dhruv Gajera]  
**Version:** 1.0.0
