<p align="center">
  <img src="frontend/src/assets/logo-new.png" alt="CenturyPly Logo" width="220"/>
</p>

# CenturyPly Internal Document Portal

An internal document management portal for CenturyPly, built for uploading, organizing, and accessing company documents with role-based access control.

<p align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white&style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white&style=for-the-badge)
![React Router](https://img.shields.io/badge/React_Router-6-CA4245?logo=reactrouter&logoColor=white&style=for-the-badge)
![Java](https://img.shields.io/badge/Java-17-007396?logo=openjdk&logoColor=white&style=for-the-badge)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-6DB33F?logo=springboot&logoColor=white&style=for-the-badge)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?logo=springsecurity&logoColor=white&style=for-the-badge)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white&style=for-the-badge)
![Maven](https://img.shields.io/badge/Maven-C71A36?logo=apachemaven&logoColor=white&style=for-the-badge)
![Git](https://img.shields.io/badge/Git-F05032?logo=git&logoColor=white&style=for-the-badge)

</p>

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [API Endpoints](#api-endpoints)
- [Sample Users](#sample-users)
- [Roadmap](#roadmap)
- [Notes](#notes)

## Tech Stack

**Frontend**
- ⚛️ React 18 + TypeScript
- ⚡ Vite — dev server & build tool
- 🧭 React Router — client-side routing
- 🎨 Tailwind CSS — utility-first styling

**Backend**
- ☕ Java 17
- 🍃 Spring Boot 3 — REST API framework
- 🔒 Spring Security — authentication & role-based authorization
- 🐬 MySQL — relational database
- 📦 Maven — dependency management & build

## Project Structure

```
CENT-PLY/
├── backend/          # Spring Boot backend application
├── frontend/         # React + TypeScript frontend application
│   ├── public/        # Static assets served as-is (favicon, etc.)
│   └── src/
│       ├── assets/     # Images, logos
│       ├── components/ # Reusable UI components
│       ├── context/    # Auth context/provider
│       ├── hooks/       # Custom React hooks
│       ├── layouts/     # Page layout wrappers
│       ├── pages/        # Route-level pages
│       └── services/     # API service calls
└── designs/          # Design mockups and screenshots
```

## Features

- 🔐 Secure login with role-based access (Employee, Admin, Super Admin)
- 📊 Dashboard with document overview
- 📁 Document listing and browsing
- ⬆️ Document upload
- 👥 User management (Super Admin only)
- ⚙️ Settings page
- 🛡️ Protected routes with auth guards

## Backend Setup

1. Install Java 17 and MySQL.
2. Create a MySQL database named `centuryply`.
3. Update `backend/src/main/resources/application.properties` if MySQL credentials differ.
4. Run:
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

The backend runs on `http://localhost:8080`.

## Frontend Setup

1. Install Node.js 20+.
2. Run:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The frontend runs on `http://localhost:5173`.

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with username and password |
| POST | `/api/auth/register` | Create a new employee account |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | List all documents |
| GET | `/api/documents/recent` | List recent documents |
| GET | `/api/documents/summary` | Get document counts |
| POST | `/api/documents/upload` | Upload a document file |
| GET | `/api/documents/download/{id}` | Download a document |

### Users (Super Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users |
| POST | `/api/users` | Add user |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |
| POST | `/api/users/{id}/reset-password` | Reset password |

## Sample Users

| Username | Password | Role |
|----------|----------|------|
| superadmin | password | SUPER_ADMIN |
| admin | password | ADMIN |
| employee | password | EMPLOYEE |

## Roadmap

Planned/upcoming features:

- [ ] _(add tomorrow's features here as they're built)_

## Notes

- Uploaded files are stored in `backend/uploads/`.
- This version is a beginner-friendly internship project and is under active development.