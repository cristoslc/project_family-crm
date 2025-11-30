# Active Context

## Current Work Focus

**Status**: Planning Phase Complete

We have created a comprehensive implementation plan covering:
- Database schema design
- API specification
- UI/UX design
- Docker configuration
- Implementation phases

## Recent Changes

- Created detailed plan document (`DETAILED_PLAN.md`)
- Established memory bank structure
- Documented project brief, tech context, system patterns, and product context

## Next Steps

Ready to begin implementation:

1. **Phase 1.1: Project Setup**
   - Initialize React frontend
   - Initialize Express backend
   - Set up Docker configuration
   - Database connection setup

2. **Phase 1.2: Database**
   - Create schema migrations
   - Test database connectivity

3. **Phase 1.3-1.9**: Follow detailed plan phases

## Active Decisions

### Tech Stack
- **Selected**: React + Node.js/Express + PostgreSQL
- **Rationale**: Common stack, good Docker support, fast iteration

### Container Strategy
- **Selected**: Separate containers (app + db) with docker-compose
- **Rationale**: Clear separation, production-ready, still simple

### Authentication
- **Selected**: Simple API key (X-API-Key header)
- **Rationale**: Phase 1 experiment, single family, no complex auth needed

### Frontend Architecture
- **Selected**: React with hooks (no Redux/Context)
- **Rationale**: Simple state management sufficient for Phase 1

## Important Patterns

### Soft Deletes
- Use `active` boolean field instead of hard deletes
- Default `active = true`
- Filter queries exclude inactive by default

### Data Relationships
- People can exist without households (household_id nullable)
- Gifts can reference person OR household (not both required)
- Relationships are bidirectional (can query from either direction)

### Import Logic
- Auto-create people/households if they don't exist
- Match by name (case-insensitive, trimmed)
- Return summary of created/updated counts

## Learnings & Insights

### Mobile UX Priorities
- Speed of entry > perfect data
- Quick correction > prevention
- Large targets > compact UI
- Search > scrolling long lists

### Data Model Flexibility
- Allow gifts without event (default to current Christmas)
- Allow gifts with person OR household (not both)
- Support household-level and person-level tracking

### Docker-First Approach
- All development/testing happens in containers
- No local-only setup needed
- Production-ready from day one

## Current Considerations

### Future Enhancements (Not Phase 1)
- Email notifications
- Gift suggestions/recommendations
- Analytics dashboards
- Multi-year comparisons
- Photo attachments
- Undo/redo functionality

### Known Constraints
- Single family only (no multi-tenant)
- Simple auth (no password reset, email verification)
- No real-time sync (single user at a time expected)
- No offline mode (requires network connection)

