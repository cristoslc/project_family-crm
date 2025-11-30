# Family Gift & Relationship Tracker

A small, full-stack application for tracking gifts, relationships, and holiday events within an extended family network.

## Purpose

This app helps a household manage and track:

- **People & Households** - Extended family members and their relationships
- **Gifts** - Both gifts given ("outbound") and received ("inbound")
- **Events** - Holiday occasions like "Christmas 2025" and "New Year 2026 cards"
- **Cards** - Holiday card sending status and tracking

## Key Features

- Mobile-first design for quick gift logging during present-opening
- Full CRUD operations for all entities (people, households, events, gifts, cards)
- Household merge and relationship management
- API endpoints for importing historical data from spreadsheets
- Simple, family-focused authentication (no complex auth flows)

## Use Cases

- Quickly log gifts received during holiday celebrations on mobile
- Track gift exchanges and maintain balance awareness
- Manage household addresses and card sending status
- Import historical gift data from existing spreadsheets
- Edit or correct entries easily when mistakes are discovered

## Phase 1 Scope

This is an experimental application focused on:
- Speed of implementation
- Mobile usability
- Quick data entry and correction
- Simple, conversation-driven iteration

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Git (for cloning the repository)

### Running the Application

1. **Start the application**:
   ```bash
   docker compose up -d
   ```

2. **Access the application**:
   - Frontend: http://localhost:8080
   - API Health Check: http://localhost:8080/api/health

3. **Stop the application**:
   ```bash
   docker compose down
   ```

4. **View logs**:
   ```bash
   docker compose logs -f app
   ```

### Development

The application uses:
- **Frontend**: React with Vite
- **Backend**: Node.js with Express
- **Database**: PostgreSQL 15

The database schema is automatically initialized on first startup.

### Environment Variables

Default values are set in `docker-compose.yml`. For production, update:
- `API_KEY`: Change from default value
- `POSTGRES_PASSWORD`: Use a strong password

---

*Built for tracking Christmas 2025 and New Year 2026 holiday activities.*

