# 📰 Fullstack Article Hub

A fully functional fullstack article publishing platform built with **Next.js**, **Hono**, **Prisma**, and **PostgreSQL**. Users can register, login, write articles, comment, and browse content by categories and tags. Admins get special access to manage users, articles, categories, and tags.

## ✨ Features

### 🔐 Authentication
- Register & login with JWT-based authentication
- Role-based access: Admin vs Regular users
- Secure password hashing with `bcrypt`
- Protected routes using middleware

### 🖊️ Articles & Comments
- Create, read, update, and delete articles
- Optional image upload using **Cloudinary**
- Comment system (including anonymous comments)
- Each article links back to the author

### 🧭 Categories & Tags
- Browse articles by **category** or **tag**
- Admins can create new tags/categories
- Category assignment during article creation

### 📋 User Management
- View all users
- Profile pages showing each user’s articles and comments
- Admins can delete any user
- Users can delete their own accounts

### 🛠️ Admin Dashboard
- Admin-exclusive features in navigation and footer
- Delete users, categories, tags, and articles
- Overview of content and user activity

### 🎨 Frontend
- Built with **Next.js 14** and **App Router**
- Client & server components
- Dynamic routing and parameterized pages
- Protected pages based on login status
- Styled with plain CSS Modules

### ☁️ Deployment & Stack
- Hosted on **Render**
- Backend: Hono (Express-style web framework for modern edge/serverless environments)
- Database: PostgreSQL via Prisma ORM
- Cloudinary for image uploads
- Full TypeScript stack

---

## 🛠️ Tech Stack

| Frontend     | Backend     | Database     | Auth          | Image Upload |
|--------------|-------------|--------------|---------------|--------------|
| Next.js 14   | Hono        | PostgreSQL   | JWT + bcrypt  | Cloudinary   |
| TypeScript   | Prisma ORM  |              |               |              |

---

## 🧪 Testing & Dev Tools
- ESLint with custom config
- Postman used for API testing
- Type-safe with TypeScript across the stack
- Custom seed script with `bcrypt` and user roles

---

## 🚀 Getting Started

1. **Clone the repo**
```bash
git clone https://github.com/yourusername/article-hub
cd article-hub
