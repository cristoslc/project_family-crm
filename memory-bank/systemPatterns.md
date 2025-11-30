# System Patterns & Architecture

## Application Structure

```
family-crm/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/  # API client
│   │   └── App.js
│   └── package.json
├── backend/           # Express API
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── models/    # Database models
│   │   ├── controllers/
│   │   ├── db/        # DB connection & migrations
│   │   └── server.js
│   └── package.json
├── Dockerfile         # Builds frontend + backend
├── docker-compose.yml
└── README.md
```

## Database Schema Patterns

### Soft Deletes
- Use `active` boolean field instead of hard deletes
- Default `active = true`
- Filter queries to exclude `active = false` by default
- Allow admin override to see inactive records

### Timestamps
- All tables include:
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

### Foreign Keys
- Use proper FK constraints for data integrity
- Cascade deletes where appropriate (e.g., relationships when person deleted)
- Set NULL where appropriate (e.g., person.household_id when household deleted)

## API Patterns

### RESTful Conventions
- GET /api/resource - List all (with optional filters)
- GET /api/resource/:id - Get one
- POST /api/resource - Create
- PATCH /api/resource/:id - Update (partial)
- DELETE /api/resource/:id - Soft delete (sets active=false)

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Format
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

### Authentication
- Simple API key in header: `X-API-Key: your-secret-key`
- No user-level auth for Phase 1
- `recorded_by` field tracks who created record

## Frontend Patterns

### Component Structure
- **Pages**: Top-level route components
- **Components**: Reusable UI elements
- **Services**: API client functions

### State Management
- React hooks (useState, useEffect)
- No Redux/Context needed for Phase 1
- Local component state + API calls

### Navigation
- React Router for client-side routing
- Bottom tab navigation on mobile
- Simple menu on desktop

## Data Flow

1. User action → React component
2. Component calls API service function
3. Service makes HTTP request to Express backend
4. Express route handler processes request
5. Database query via model/ORM
6. Response sent back through chain
7. Component updates UI

