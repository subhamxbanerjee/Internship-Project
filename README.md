<div align="center">

<img src="./logo-new.png" alt="CenturyPly Logo" width="160"/>

# CenturyPly Internal Portal

An internal document and incident management portal built for CenturyPly's Guwahati branch. Handles document storage, incident/ticket tracking, and role-based access, all running on a single internal LAN server.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Build_Tool-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-38B2AC?logo=tailwindcss&logoColor=white)
![Java](https://img.shields.io/badge/Java-17-007396?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-6DB33F?logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-Build-C71A36?logo=apachemaven&logoColor=white)
![Deployment](https://img.shields.io/badge/Deployed_via-NSSM-0078D6?logo=windows&logoColor=white)
![License](https://img.shields.io/badge/status-internal_project-lightgrey)

</div>

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Deployment](#deployment)
- [Backend Setup (Local Dev)](#backend-setup-local-dev)
- [Frontend Setup (Local Dev)](#frontend-setup-local-dev)
- [API Endpoints](#api-endpoints)
- [Sample Users](#sample-users)
- [Roadmap](#roadmap)
- [Notes](#notes)

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router

**Backend**
- Java 17
- Spring Boot 3
- Spring Security (role-based auth)
- MySQL
- Maven

## Project Structure

```
CENT-PLY/
├── backend/          # Spring Boot backend
├── frontend/         # React + TypeScript frontend
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       └── services/
└── designs/          # Design mockups and screenshots
```

<img width="1918" height="917" alt="image" src="https://github.com/user-attachments/assets/041a7aae-84cc-49f1-9a5d-de4a9a1bedd5" />

## Features

- Secure login with role-based access (Employee, Admin, Super Admin)
- Real-time dashboard with live PDF preview, auto-syncing every 10 seconds
- Document listing, upload, download, and delete (role-restricted)
- Incident and ticket management module
- User management (Super Admin only)
- Settings page
- Protected routes with auth guards

## Deployment

This portal runs as a Windows Service on an internal LAN server, deployed at a static IP so it's reachable by everyone on the network without needing to start anything manually.

- Backend packaged as a single executable JAR (no Docker, no Nginx, no microservices — kept simple for a LAN setup)
- Deployed as a Windows Service using **NSSM** (Non-Sucking Service Manager), so it auto-starts with the machine and keeps running in the background
- Service logs output for monitoring and debugging
- Reachable on the LAN at the server's static IP

## Backend Setup (Local Dev)

1. Install Java 17 and MySQL
2. Create a MySQL database named `centuryply`
3. Update `backend/src/main/resources/application.properties` if your MySQL credentials differ
4. Run:
   ```
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```
5. Backend runs on `http://localhost:8080`

## Frontend Setup (Local Dev)

1. Install Node.js 20+
2. Run:
   ```
   cd frontend
   npm install
   npm run dev
   ```
3. Frontend runs on `http://localhost:5173`

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/login | Login with username and password |
| POST | /api/auth/register | Create a new employee account |

### Documents
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/documents | List all documents |
| GET | /api/documents/recent | List recent documents |
| GET | /api/documents/summary | Get document counts |
| POST | /api/documents/upload | Upload a document file |
| GET | /api/documents/download/{id} | Download a document |

### Users (Super Admin only)
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/users | List users |
| POST | /api/users | Add user |
| PUT | /api/users/{id} | Update user |
| DELETE | /api/users/{id} | Delete user |
| POST | /api/users/{id}/reset-password | Reset password |

## Sample Users

`superadmin`, `admin`, `employee`

## Roadmap

**Completed**
- Backend setup with Spring Boot + MySQL
- Authentication with role-based access
- Role-based route protection
- Real-time dashboard with live sync
- Document listing, upload, download, delete
- Incident and ticket management
- User management (Super Admin only)
- Settings page
- Deployed to LAN server via NSSM (Windows Service, static IP)

**Planned**
- Further polish on incident/ticket workflows
- Additional file preview formats

## Notes

- Uploaded files are stored in `backend/uploads/`
- This is a beginner-friendly internship project, built and deployed incrementally over the course of the internship
