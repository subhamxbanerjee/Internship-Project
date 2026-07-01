# CenturyPly Internal Document Portal

A simple internal document management portal for CenturyPly.

## Project Structure

- `backend/` - Spring Boot backend application
- `frontend/` - React + TypeScript frontend application
- `designs/` - design mockups and screenshots

## Backend Setup

1. Install Java 17 and MySQL.
2. Create a MySQL database named `centuryply`.
3. Update `backend/src/main/resources/application.properties` if MySQL credentials differ.
4. Run:
   - `cd backend`
   - `mvn clean install`
   - `mvn spring-boot:run`

The backend runs on `http://localhost:8080`.

## Frontend Setup

1. Install Node.js 20+.
2. Run:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

The frontend runs on `http://localhost:5173`.

## API Endpoints

- `POST /api/auth/login` - login with username and password
- `POST /api/auth/register` - create a new employee account
- `GET /api/documents` - list all documents
- `GET /api/documents/recent` - list recent documents
- `GET /api/documents/summary` - get document counts
- `POST /api/documents/upload` - upload a document file
- `GET /api/documents/download/{id}` - download a document
- `GET /api/users` - list users (Super Admin only)
- `POST /api/users` - add user (Super Admin only)
- `PUT /api/users/{id}` - update user (Super Admin only)
- `DELETE /api/users/{id}` - delete user (Super Admin only)
- `POST /api/users/{id}/reset-password` - reset password (Super Admin only)

## Sample Users

- superadmin / password
- admin / password
- employee / password

## Notes

- Uploaded files are stored in `backend/uploads/`.
- This version is meant as a beginner-friendly internship project.
