# MERN Stack Authentication System

A full-stack authentication application built with the MERN (MongoDB, Express, React, Node.js) stack. This project provides user registration, login, and authentication functionality with JWT tokens and protected routes.

## 🚀 Features

- **User Registration** - Create new user accounts with username, email, and password
- **User Login** - Secure authentication with email and password
- **JWT Authentication** - Token-based authentication system
- **Protected Routes** - Secure access to authenticated pages
- **Password Hashing** - Passwords are securely hashed using bcrypt
- **Post Management** - Create, read, update, and delete posts with optional Cloudinary-hosted images
- **Toast Notifications** - User-friendly notifications using react-hot-toast
- **Responsive Design** - Modern UI built with Tailwind CSS
- **Logout Functionality** - Secure session termination

## 🛠️ Tech Stack

### Frontend
- **React** 19.1.1 - UI library
- **React Router DOM** 7.9.5 - Client-side routing
- **Vite** 7.1.7 - Build tool and dev server
- **Tailwind CSS** 4.1.16 - Utility-first CSS framework
- **Axios** 1.13.2 - HTTP client
- **React Hot Toast** 2.6.0 - Toast notifications

### Backend
- **Node.js** - Runtime environment
- **Express** 5.1.0 - Web framework
- **MongoDB** - Database
- **Mongoose** 8.19.3 - MongoDB object modeling
- **JWT** 9.0.2 - JSON Web Tokens for authentication
- **bcryptjs** 3.0.3 - Password hashing
- **dotenv** 17.2.3 - Environment variables
- **Cloudinary** 2.5.1 - Media storage and delivery
- **Multer** 1.4.5-lts.1 - `multipart/form-data` parsing for image uploads

## 📁 Project Structure

```
login_fullstack/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js      # Cloudinary configuration and helpers
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication middleware
│   │   └── upload.js          # Multer middleware for image uploads
│   ├── models/
│   │   ├── Post.js            # Post schema and model
│   │   └── User.js            # User schema and model
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   └── post.js            # Post CRUD routes
│   └── server.js              # Express server setup
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx     # Navigation bar component
│   │   ├── pages/
│   │   │   ├── Home.jsx       # Home page (protected)
│   │   │   ├── Login.jsx      # Login page
│   │   │   └── Register.jsx   # Registration page
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── index.html
│   ├── vite.config.js         # Vite configuration
│   └── package.json
├── .gitignore
└── package.json
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd login_fullstack
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Set up environment variables**

   Create a `.env` file in the `backend` directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```


5. **Create a `.env` file in the root** (if needed for additional configuration)

## 🚀 Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   npm run dev
   ```
   The backend server will run on `http://localhost:3000` (or the PORT specified in .env)

2. **Start the frontend development server** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

3. **Open your browser**
   Navigate to `http://localhost:5173`

### Production Build

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Preview the production build**
   ```bash
   npm run preview
   ```

## 🔌 API Endpoints

### Authentication Routes (`/api/users`)

#### Register User
- **POST** `/api/users/register`
- **Body:**
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:** User object with JWT token

#### Login User
- **POST** `/api/users/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:** User object with JWT token

#### Get Current User (Protected)
- **GET** `/api/users/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Current user object (without password)

### Post Routes (`/api/posts`)

All post routes that modify data require the `Authorization: Bearer <token>` header.

#### Create Post (Protected)
- **POST** `/api/posts`
- **Headers:** `Content-Type: multipart/form-data`
- **Body:**
  - `title` (string, required)
  - `content` (string, required)
  - `image` (file, optional)
- **Response:** Created post with populated author and optional `imageUrl`

#### Get All Posts
- **GET** `/api/posts`
- **Response:** Array of posts sorted by most recent

#### Get Current User Posts (Protected)
- **GET** `/api/posts/my/posts`
- **Response:** Posts authored by the authenticated user

#### Get Post By ID
- **GET** `/api/posts/:id`
- **Response:** Single post object

#### Update Post (Protected)
- **PUT** `/api/posts/:id`
- **Headers:** `Content-Type: multipart/form-data`
- **Body:**
  - `title` (string, optional)
  - `content` (string, optional)
  - `image` (file, optional) – uploading a new image replaces the previous one
  - `removeImage` (boolean/string, optional) – set to `true` to remove the current image without replacing it
- **Response:** Updated post object

#### Delete Post (Protected)
- **DELETE** `/api/posts/:id`
- **Response:** Success message; associated Cloudinary image (if any) is removed

## 🔐 Authentication Flow

1. **Registration/Login**: User submits credentials
2. **Token Generation**: Server generates JWT token upon successful authentication
3. **Token Storage**: Token is stored in localStorage
4. **Protected Routes**: Token is sent in Authorization header for protected routes
5. **Token Verification**: Middleware verifies token and attaches user to request

## 🎨 Frontend Features

### Pages
- **Home Page** (`/`) - Protected route, displays user information
- **Login Page** (`/login`) - User authentication
- **Register Page** (`/register`) - New user registration

### Components
- **Navbar** - Dynamic navigation bar that changes based on authentication status
  - Shows "Login" and "Register" when not authenticated
  - Shows username and "Logout" button when authenticated

### Route Protection
- Protected routes redirect to login if user is not authenticated
- Authenticated users are redirected from login/register pages to home

## 📝 Environment Variables

### Backend (.env)
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
PORT=3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend
The frontend uses Vite's proxy configuration to forward `/api` requests to the backend server.

## 🔒 Security Features

- **Password Hashing**: Passwords are hashed using bcrypt before storage
- **JWT Tokens**: Secure token-based authentication
- **Protected Routes**: Middleware protects sensitive endpoints
- **Token Expiration**: JWT tokens expire after 30 days
- **Environment Variables**: Sensitive data stored in .env files

## 🐛 Troubleshooting

### Backend not connecting to MongoDB
- Check your `MONGO_URI` in the `.env` file
- Ensure MongoDB is running (if using local instance)
- Verify network connectivity (if using MongoDB Atlas)

### Frontend not connecting to backend
- Verify backend server is running on the correct port
- Check `vite.config.js` proxy configuration matches backend port
- Ensure CORS is properly configured (if needed)

### Token authentication issues
- Verify `JWT_SECRET` is set in backend `.env`
- Check token expiration
- Ensure token is being sent in Authorization header

## 📦 Dependencies

### Backend
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT implementation
- `bcryptjs` - Password hashing
- `dotenv` - Environment variables
- `cloudinary` - Image hosting and transformation
- `multer` - Multipart form-data parsing for uploads

### Frontend
- `react` - UI library
- `react-router-dom` - Routing
- `axios` - HTTP client
- `tailwindcss` - CSS framework
- `react-hot-toast` - Notifications
- `vite`