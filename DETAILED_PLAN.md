# Detailed Implementation Plan: Family Gift & Relationship Tracker

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [API Specification](#api-specification)
4. [UI/UX Design](#uiux-design)
5. [Docker Configuration](#docker-configuration)
6. [Implementation Phases](#implementation-phases)
7. [File Structure](#file-structure)

---

## Architecture Overview

### Tech Stack
- **Frontend**: React (production build)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Containerization**: Docker + docker-compose

### Architecture Decision: Monolithic Container
- Single Dockerfile builds both frontend and backend
- Express server serves static React build files
- Single `app` container + `db` container
- Simplifies deployment and reduces complexity

### Container Services
1. **app**: Node.js/Express serving React frontend + API
2. **db**: PostgreSQL database

---

## Database Schema

### 1. people

```sql
CREATE TABLE people (
  id SERIAL PRIMARY KEY,
  display_name VARCHAR(255) NOT NULL,
  short_name VARCHAR(100),
  household_id INTEGER REFERENCES households(id) ON DELETE SET NULL,
  relationship_label VARCHAR(100),
  notes TEXT,
  is_child BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_people_household ON people(household_id);
CREATE INDEX idx_people_active ON people(active);
```

**Key Fields:**
- `display_name`: Full name (required)
- `short_name`: Nickname/label (optional, defaults to display_name)
- `household_id`: FK to households (optional, allows unassigned people)
- `relationship_label`: Free text like "grandma", "uncle", "friend"
- `is_child`: Boolean flag for filtering children
- `active`: Soft delete flag

### 2. households

```sql
CREATE TABLE households (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address_line_1 VARCHAR(255),
  address_line_2 VARCHAR(255),
  city VARCHAR(100),
  region VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  card_greeting_name VARCHAR(255),
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_households_active ON households(active);
```

**Key Fields:**
- `name`: Household name (required, e.g., "Garcia family")
- `card_greeting_name`: Name for cards (e.g., "The Garcias", "Alex & Jamie Garcia")
- Address fields: Optional, for card sending
- `active`: Soft delete flag

### 3. relationships

```sql
CREATE TABLE relationships (
  id SERIAL PRIMARY KEY,
  person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  related_person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(person_id, related_person_id, relationship_type)
);

CREATE INDEX idx_relationships_person ON relationships(person_id);
CREATE INDEX idx_relationships_related ON relationships(related_person_id);
```

**Key Fields:**
- `person_id`: First person in relationship
- `related_person_id`: Second person in relationship
- `relationship_type`: "parent", "sibling", "cousin", "friend", etc.
- Unique constraint prevents duplicate relationships

### 4. events

```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  event_date DATE,
  event_type VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_date ON events(event_date);
```

**Key Fields:**
- `name`: Event name (required, unique, e.g., "Christmas 2025")
- `event_date`: Date of event
- `event_type`: "gift_exchange", "cards", etc.

### 5. gifts

```sql
CREATE TABLE gifts (
  id SERIAL PRIMARY KEY,
  direction VARCHAR(3) NOT NULL CHECK (direction IN ('in', 'out')),
  event_id INTEGER REFERENCES events(id) ON DELETE SET NULL,
  giver_person_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
  giver_household_id INTEGER REFERENCES households(id) ON DELETE SET NULL,
  receiver_person_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
  receiver_household_id INTEGER REFERENCES households(id) ON DELETE SET NULL,
  description VARCHAR(500) NOT NULL,
  est_value DECIMAL(10, 2),
  given_date DATE,
  notes TEXT,
  recorded_by VARCHAR(50) NOT NULL DEFAULT 'me',
  visibility_hint VARCHAR(20) DEFAULT 'public' CHECK (visibility_hint IN ('public', 'mine_private', 'spouse_private')),
  thank_you_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gifts_direction ON gifts(direction);
CREATE INDEX idx_gifts_event ON gifts(event_id);
CREATE INDEX idx_gifts_giver_person ON gifts(giver_person_id);
CREATE INDEX idx_gifts_giver_household ON gifts(giver_household_id);
CREATE INDEX idx_gifts_receiver_person ON gifts(receiver_person_id);
CREATE INDEX idx_gifts_receiver_household ON gifts(receiver_household_id);
CREATE INDEX idx_gifts_given_date ON gifts(given_date);
```

**Key Fields:**
- `direction`: "in" (received) or "out" (gave)
- `event_id`: FK to events (optional, defaults to current Christmas event)
- Giver/receiver: Can be person OR household (not both required)
- `description`: Short gift description (required)
- `est_value`: Approximate value
- `given_date`: When gift was given (defaults to event_date)
- `recorded_by`: "me", "spouse", "imported"
- `visibility_hint`: Privacy filter ("public", "mine_private", "spouse_private")
- `thank_you_sent`: Boolean flag

### 6. cards

```sql
CREATE TABLE cards (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  household_id INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  address_name VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'written', 'sent', 'returned')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, household_id)
);

CREATE INDEX idx_cards_event ON cards(event_id);
CREATE INDEX idx_cards_household ON cards(household_id);
CREATE INDEX idx_cards_status ON cards(status);
```

**Key Fields:**
- `event_id`: FK to events (required)
- `household_id`: FK to households (required)
- `address_name`: Override for card address (defaults to household.card_greeting_name)
- `status`: "planned", "written", "sent", "returned"
- Unique constraint: one card per event per household

---

## API Specification

### Base URL
- Development: `http://localhost:3001`
- API prefix: `/api`

### Authentication
- Header: `X-API-Key: your-secret-key`
- Simple token-based auth (no user-level auth in Phase 1)

### Import Endpoints

#### POST /api/import-gifts

**Purpose**: Bulk import gifts from spreadsheets

**Request Body**:
```json
{
  "gifts": [
    {
      "direction": "in",
      "giver_name": "John Smith",
      "giver_household_name": "Smith Family",
      "receiver_name": "Me",
      "receiver_household_name": null,
      "description": "Coffee maker",
      "est_value": 45.00,
      "event_name": "Christmas 2023",
      "given_date": "2023-12-25",
      "recorded_by": "imported",
      "visibility_hint": "public"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "created": 5,
    "updated": 0,
    "errors": []
  }
}
```

**Logic**:
- Auto-create people/households if they don't exist
- Look up or create event by name
- Match existing gifts by description + date + giver/receiver (optional dedupe)
- Return summary of created/updated counts

#### POST /api/import-people

**Purpose**: Bulk import people and households

**Request Body**:
```json
{
  "people": [
    {
      "display_name": "John Smith",
      "household_name": "Smith Family",
      "relationship_label": "uncle",
      "is_child": false
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "people_created": 3,
    "households_created": 2,
    "errors": []
  }
}
```

### CRUD Endpoints

#### People

- `GET /api/people` - List all active people (query params: `?household_id=1&is_child=true`)
- `GET /api/people/:id` - Get one person
- `POST /api/people` - Create person
- `PATCH /api/people/:id` - Update person
- `DELETE /api/people/:id` - Soft delete (sets active=false)

**POST /api/people Request**:
```json
{
  "display_name": "Jane Doe",
  "short_name": "Jane",
  "household_id": 1,
  "relationship_label": "cousin",
  "is_child": false,
  "notes": "Lives in Seattle"
}
```

#### Households

- `GET /api/households` - List all active households
- `GET /api/households/:id` - Get one household (includes members)
- `POST /api/households` - Create household
- `PATCH /api/households/:id` - Update household
- `DELETE /api/households/:id` - Soft delete

**POST /api/households Request**:
```json
{
  "name": "Garcia Family",
  "address_line_1": "123 Main St",
  "city": "Portland",
  "region": "OR",
  "postal_code": "97201",
  "country": "USA",
  "card_greeting_name": "The Garcias"
}
```

#### Events

- `GET /api/events` - List all events (query: `?event_type=gift_exchange`)
- `GET /api/events/:id` - Get one event (includes gift/card counts)
- `POST /api/events` - Create event
- `PATCH /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event (hard delete, cascade to gifts/cards)

**POST /api/events Request**:
```json
{
  "name": "Christmas 2025",
  "event_date": "2025-12-25",
  "event_type": "gift_exchange",
  "notes": "Main holiday event"
}
```

#### Gifts

- `GET /api/gifts` - List gifts (query: `?direction=in&event_id=1&household_id=2`)
- `GET /api/gifts/:id` - Get one gift
- `POST /api/gifts` - Create gift
- `PATCH /api/gifts/:id` - Update gift
- `DELETE /api/gifts/:id` - Delete gift (hard delete)

**POST /api/gifts Request**:
```json
{
  "direction": "in",
  "event_id": 1,
  "giver_person_id": 5,
  "giver_household_id": null,
  "receiver_person_id": null,
  "receiver_household_id": null,
  "description": "Hand-knitted scarf",
  "est_value": 25.00,
  "given_date": "2025-12-25",
  "recorded_by": "me",
  "visibility_hint": "public",
  "thank_you_sent": false
}
```

#### Cards

- `GET /api/cards` - List cards (query: `?event_id=1&status=sent`)
- `GET /api/cards/:id` - Get one card
- `POST /api/cards` - Create card
- `PATCH /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card (hard delete)

**POST /api/cards Request**:
```json
{
  "event_id": 2,
  "household_id": 3,
  "address_name": "The Garcias",
  "status": "written",
  "notes": "Mailed on Dec 20"
}
```

### Special Endpoints

#### POST /api/households/merge

**Purpose**: Merge two households

**Request Body**:
```json
{
  "source_household_id": 5,
  "target_household_id": 2
}
```

**Logic**:
1. Update all `people.household_id` from source → target
2. Update all `gifts.giver_household_id` from source → target
3. Update all `gifts.receiver_household_id` from source → target
4. Update all `cards.household_id` from source → target
5. Set `source_household.active = false`
6. Return summary of moved records

**Response**:
```json
{
  "success": true,
  "data": {
    "people_moved": 3,
    "gifts_updated": 12,
    "cards_updated": 2
  }
}
```

---

## UI/UX Design

### Navigation Structure

**Mobile**: Bottom tab bar
- Home
- Log Gifts
- People
- Households
- Events

**Desktop**: Top navigation bar (same items)

### Key Screens

#### 1. Home Screen

**Layout**:
- Large action buttons (mobile-friendly):
  - "Log Gift Received" (primary, green)
  - "Log Gift We're Giving" (primary, blue)
  - "Today's Gifts" (secondary)
  - "Household Summary" (secondary)
- Quick stats cards:
  - Gifts received this event
  - Gifts given this event
  - Cards sent/planned

**Purpose**: Quick access to most common actions

#### 2. Log Gift Received Screen

**Form Fields**:
- Event picker (dropdown/search, default: "Christmas 2025")
- Giver section:
  - Toggle: Person / Household
  - Searchable picker (typeahead)
  - "Add new person/household" quick link
- Receiver section:
  - Chips: "Family" / "Me" / "Spouse" / [Children list]
  - Or searchable person picker
- Description (text input, required)
- Value:
  - Preset buttons: $10, $25, $50, $100, $250, $500, Custom
  - Custom numeric input
- Notes (textarea, optional)
- Toggle: "Thank you sent" (checkbox)
- Action buttons:
  - "Save & Add Another" (primary)
  - "Save & Done" (secondary)

**UX Notes**:
- Auto-save draft to localStorage
- Large touch targets
- Minimal typing required

#### 3. Log Gift We're Giving Screen

**Mirror of "Log Gift Received"**:
- We are the givers
- Receiver picker (person/household)
- Same value/description/notes fields
- "Save & Add Another" / "Save & Done"

#### 4. Today's Gifts Screen

**Layout**:
- Tabs: "Received" / "Given"
- List view:
  - Each gift: Description, Giver/Receiver, Value, Date
  - Tap to edit
  - Swipe to delete (mobile)
  - Filter by event (dropdown)
- Summary at top: Total received, Total given

**Quick Actions**:
- Edit gift (tap)
- Delete gift (swipe or button)
- Filter by event
- Filter by household

#### 5. Household Summary Screen

**Layout**:
- Year selector (dropdown, default: 2025)
- List of households:
  - Name
  - Gifts to them: $X (count)
  - Gifts from them: $Y (count)
  - Net: $Z
  - Tap to see detail
- Household detail modal:
  - All gifts for this household
  - Edit/delete gift buttons
  - Household info edit link

**Purpose**: Balance awareness, gift tracking by household

#### 6. People List Screen

**Features**:
- Search bar (filters by name)
- Filters: "All" / "Active" / "Children" / "By Household"
- List items:
  - Name, Household, Relationship
  - Tap to view/edit
- Floating action button: "Add Person"

#### 7. Person Detail Screen

**Tabs**:
- Info (edit form)
- Gifts (received/given)
- Relationships

**Info Tab**:
- Edit form: name, household, relationship, notes, is_child
- "Move to different household" button
- "Deactivate" button (soft delete)

#### 8. Households List Screen

**Features**:
- Search bar
- List items:
  - Name, Address (truncated), Member count
  - Tap to view/edit
- Floating action button: "Add Household"

#### 9. Household Detail Screen

**Tabs**:
- Info (edit form)
- Members (people list)
- Gifts (to/from this household)
- Cards

**Info Tab**:
- Edit form: name, address fields, card_greeting_name
- "Merge with another household" button (opens merge dialog)
- "Deactivate" button

**Members Tab**:
- List of people in household
- "Add member" button
- "Remove from household" button (sets household_id to null)

**Merge Dialog**:
- Select target household (searchable)
- Preview: "Will move 3 people, 12 gifts, 2 cards"
- Confirm button

#### 10. Events List Screen

**Features**:
- List of events (sorted by date, newest first)
- Each item: Name, Date, Type, Gift count, Card count
- Tap to view/edit
- Floating action button: "Add Event"

#### 11. Event Detail Screen

**Tabs**:
- Info (edit form)
- Gifts (all gifts for this event)
- Cards (all cards for this event)

**Info Tab**:
- Edit form: name, date, type, notes
- Stats: Total gifts, Total value, Cards sent/planned

#### 12. Cards Management Screen

**Layout**:
- Event selector (dropdown)
- Status filter: "All" / "Planned" / "Written" / "Sent" / "Returned"
- List of cards:
  - Household name, Address, Status
  - Quick status buttons: Planned / Written / Sent / Returned
  - Tap to edit details
- Floating action button: "Add Card"

**Quick Actions**:
- Status update buttons (large, color-coded)
- Bulk actions: "Mark all as sent"

### Design Principles

1. **Mobile-First**:
   - Large touch targets (min 44px)
   - Bottom navigation on mobile
   - Swipe gestures for delete
   - Minimal typing (searchable lists, chips, presets)

2. **Quick Actions**:
   - "Save & Add Another" for rapid entry
   - Quick status updates (buttons, not dropdowns)
   - Search everywhere

3. **Error Correction**:
   - Easy edit from list views
   - Swipe to delete
   - Undo notifications (optional, Phase 2)

4. **Visual Hierarchy**:
   - Primary actions: Large, colored buttons
   - Secondary actions: Smaller, outlined buttons
   - Destructive actions: Red, with confirmation

---

## Docker Configuration

### docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: family-crm-db
    environment:
      POSTGRES_DB: family_crm
      POSTGRES_USER: family_user
      POSTGRES_PASSWORD: family_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U family_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: family-crm-app
    ports:
      - "3001:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      POSTGRES_HOST: db
      POSTGRES_DB: family_crm
      POSTGRES_USER: family_user
      POSTGRES_PASSWORD: family_pass
      API_KEY: change-me-in-production
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
```

### Dockerfile

```dockerfile
# Multi-stage build: frontend + backend

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend and combine
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
# Copy frontend build into backend public directory
COPY --from=frontend-builder /app/frontend/build ./public

# Stage 3: Production runtime
FROM node:18-alpine
WORKDIR /app
# Copy backend files
COPY --from=backend-builder /app/backend ./
# Install production dependencies only
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "src/server.js"]
```

### Key Docker Decisions

1. **Multi-stage build**: Reduces final image size
2. **Frontend served by backend**: Simplifies deployment
3. **Health checks**: Ensures DB is ready before app starts
4. **Volume for DB**: Persists data between container restarts
5. **Environment variables**: Configurable without rebuilding

---

## Implementation Phases

### Phase 1.1: Project Setup
- [ ] Initialize frontend (React + Vite or Create React App)
- [ ] Initialize backend (Express + Node.js)
- [ ] Set up Docker files (Dockerfile, docker-compose.yml)
- [ ] Database connection setup
- [ ] Basic API health check endpoint

### Phase 1.2: Database
- [ ] Create database schema (migrations or SQL scripts)
- [ ] Set up database connection in backend
- [ ] Test database connectivity from container

### Phase 1.3: Core API
- [ ] People CRUD endpoints
- [ ] Households CRUD endpoints
- [ ] Events CRUD endpoints
- [ ] Gifts CRUD endpoints
- [ ] Cards CRUD endpoints
- [ ] Household merge endpoint

### Phase 1.4: Import APIs
- [ ] POST /api/import-gifts
- [ ] POST /api/import-people
- [ ] Error handling and validation

### Phase 1.5: Frontend Foundation
- [ ] React Router setup
- [ ] API client service
- [ ] Basic navigation (tabs/menu)
- [ ] Layout components

### Phase 1.6: Core UI Screens
- [ ] Home screen
- [ ] People list & detail
- [ ] Households list & detail
- [ ] Events list & detail
- [ ] Gifts list (Today's Gifts)
- [ ] Cards management

### Phase 1.7: Gift Logging UI
- [ ] Log Gift Received form
- [ ] Log Gift We're Giving form
- [ ] Form validation and error handling
- [ ] "Save & Add Another" functionality

### Phase 1.8: Household Summary
- [ ] Year selector
- [ ] Household list with gift totals
- [ ] Household detail with gift list
- [ ] Edit/delete gifts from summary

### Phase 1.9: Polish & Testing
- [ ] Mobile responsiveness testing
- [ ] Error handling improvements
- [ ] Loading states
- [ ] Form auto-save (localStorage)
- [ ] README documentation

### Phase 1.10: Data Migration
- [ ] Pull down existing spreadsheets with historical data
- [ ] Analyze spreadsheet structure and format
- [ ] Document data mapping (spreadsheet columns → API fields)
- [ ] Prepare data for import:
  - Clean and normalize data
  - Handle missing fields
  - Resolve name inconsistencies
  - Map event names to existing events
- [ ] Import people and households via `POST /api/import/people`
- [ ] Import historical gifts via `POST /api/import/gifts`
- [ ] Validate data integrity:
  - Verify all people imported correctly
  - Check household assignments
  - Validate gift records (dates, values, relationships)
  - Test household summary calculations
  - Ensure event associations are correct
- [ ] Fix any data issues discovered during validation
- [ ] Document migration process and any data transformations

**Migration Strategy**:
1. Start with people/households import (foundation data)
2. Then import gifts (depends on people/households existing)
3. Validate relationships and calculations
4. Test UI with real data

**Import API Endpoints**:
- `POST /api/import/people` - Bulk import people and households
- `POST /api/import/gifts` - Bulk import gifts with auto-create logic

---

## File Structure

```
family-crm/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── NavBar.jsx
│   │   │   │   └── TabBar.jsx
│   │   │   ├── GiftForm.jsx
│   │   │   ├── PersonForm.jsx
│   │   │   ├── HouseholdForm.jsx
│   │   │   └── SearchInput.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── LogGiftReceived.jsx
│   │   │   ├── LogGiftGiven.jsx
│   │   │   ├── TodaysGifts.jsx
│   │   │   ├── HouseholdSummary.jsx
│   │   │   ├── PeopleList.jsx
│   │   │   ├── PersonDetail.jsx
│   │   │   ├── HouseholdsList.jsx
│   │   │   ├── HouseholdDetail.jsx
│   │   │   ├── EventsList.jsx
│   │   │   ├── EventDetail.jsx
│   │   │   └── CardsManagement.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── vite.config.js (or similar)
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── people.js
│   │   │   ├── households.js
│   │   │   ├── events.js
│   │   │   ├── gifts.js
│   │   │   ├── cards.js
│   │   │   └── import.js
│   │   ├── controllers/
│   │   │   ├── peopleController.js
│   │   │   ├── householdsController.js
│   │   │   ├── eventsController.js
│   │   │   ├── giftsController.js
│   │   │   ├── cardsController.js
│   │   │   └── importController.js
│   │   ├── models/
│   │   │   ├── Person.js
│   │   │   ├── Household.js
│   │   │   ├── Event.js
│   │   │   ├── Gift.js
│   │   │   ├── Card.js
│   │   │   └── Relationship.js
│   │   ├── db/
│   │   │   ├── connection.js
│   │   │   └── migrations/
│   │   │       └── 001_initial_schema.sql
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
│
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .gitignore
├── README.md
└── DETAILED_PLAN.md (this file)
```

---

## Summary

### Database Tables
- **people**: Family members with household links
- **households**: Family groups with addresses
- **relationships**: Person-to-person relationships
- **events**: Holiday occasions (Christmas, New Year cards)
- **gifts**: Gifts given/received with giver/receiver links
- **cards**: Holiday card sending status

### Main Screens
- **Home**: Quick actions and stats
- **Log Gifts**: Forms for received/given gifts
- **Today's Gifts**: List and edit gifts
- **Household Summary**: Balance tracking by household
- **People/Households/Events**: Full CRUD management
- **Cards**: Status tracking and updates

### Import Endpoints
- **POST /api/import-gifts**: Bulk import with auto-create
- **POST /api/import-people**: Bulk import people/households
- Both return summary of created/updated records

### Key Operations
- **Correct mis-logged gift**: Tap gift in list → Edit form → Save
- **Merge households**: Household detail → "Merge" button → Select target → Confirm
- **Edit person's household**: Person detail → Edit → Change household dropdown → Save
- **Quick gift logging**: Home → "Log Gift Received" → Fill form → "Save & Add Another"

### Docker Setup
- `docker compose up -d` to start
- App available at `http://localhost:3001`
- Database persists in Docker volume
- Environment variables in docker-compose.yml

---

**Current Status**: Phase 1.1-1.9 Complete ✅

**Next Steps**: Phase 1.10 - Data Migration from Spreadsheets 📊
1. Pull down existing spreadsheets
2. Analyze and prepare data for import
3. Import people/households and historical gifts
4. Validate data integrity and relationships

