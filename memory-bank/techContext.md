# Technical Context

## Tech Stack Decision

**Selected: Option A - React + Node.js/Express + PostgreSQL**

### Rationale
- Common, well-documented stack
- Good Docker support
- Fast development iteration
- Strong ecosystem for both frontend and backend

### Components
- **Frontend**: React (with modern hooks, no complex state management needed)
- **Backend**: Node.js with Express
- **Database**: PostgreSQL (preferred over SQLite for better production readiness)
- **Containerization**: Docker + docker-compose

## Development Approach

### Container Architecture
- **Option Selected**: Separate containers with docker-compose
  - `app` service: Node.js backend serving React frontend (production build)
  - `db` service: PostgreSQL database
  - Single docker-compose.yml orchestrates both

### Why Separate Containers
- Clear separation of concerns
- Easier to scale/update independently
- Better production practices
- Still simple enough for Phase 1

## Environment Variables

### Database Connection
- `POSTGRES_HOST=db`
- `POSTGRES_DB=family_crm`
- `POSTGRES_USER=family_user`
- `POSTGRES_PASSWORD=family_pass` (default, should be changed in production)

### Application
- `NODE_ENV=production`
- `PORT=3000` (internal)
- `API_KEY=your-secret-key` (for API authentication)

## Port Configuration

- **Host Port**: 8080 (exposed to host)
- **Container Port**: 3000 (internal)
- **Database Port**: 5432 (internal only, not exposed)

## Build Strategy

- Frontend: React build (production optimized)
- Backend: Node.js Express server
- Combined: Backend serves static React build files
- Single Dockerfile builds both frontend and backend

