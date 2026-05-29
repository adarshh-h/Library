# HNBGU Library Portal — Frontend

React + Vite + Tailwind CSS frontend for the HNBGU Library Management System.

## Stack
- **React 18** + **Vite**
- **React Router v6** (SPA routing)
- **Axios** (API calls with cookie-based auth)
- **Tailwind CSS** (utility-first styling)
- **react-hot-toast** (notifications)
- **lucide-react** (icons)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env
# Edit .env if your backend runs on a different port

# 3. Start dev server
npm run dev
```

The dev server runs on **http://localhost:5173** and proxies `/api` to `http://localhost:5000`.

## Project structure

```
src/
  api/
    axios.js        # Axios instance (withCredentials, 401 redirect)
    services.js     # All API service functions
  components/
    ui/index.jsx    # Reusable UI components
    ProtectedRoute  # Auth guard
  contexts/
    AuthContext     # Global auth state + session check
  layouts/
    LibrarianLayout # Sidebar + nav for librarian portal
    StudentLayout   # Sidebar + nav for student portal
  pages/
    auth/           # Login pages (librarian + student)
    librarian/      # Dashboard, Students, Books, Issue, Return, History, Profile
    student/        # Dashboard (issued books), History, Profile
    Landing.jsx     # Home page with portal selector
  App.jsx           # Routes
  main.jsx          # Entry point
  index.css         # Tailwind + global component classes
```

## Portals

| Portal | URL | Credentials |
|--------|-----|-------------|
| Landing | `/` | — |
| Librarian login | `/librarian/login` | Email + password |
| Student login | `/student/login` | Email + password |

## Features

### Librarian Portal
- Dashboard with stats
- Student management (add, edit, delete, bulk CSV import, reset password)
- Book catalogue (search, edit, delete, bulk CSV import)
- Issue books (search student by roll, add up to 3 books by accession)
- Return books (search student, select book to return)
- History (search any student's full borrowing history)
- Add librarian accounts
- Profile & password change

### Student Portal
- My books dashboard (issued books with overdue alerts)
- Borrowing history
- Profile & password change
