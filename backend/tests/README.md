# Family CRM API Test Suite

Comprehensive test suite for the Family CRM API endpoints.

## Prerequisites

1. The application must be running via Docker:
   ```bash
   docker compose up -d
   ```

2. The API should be accessible at `http://localhost:3001`

3. Install test dependencies:
   ```bash
   cd backend
   npm install
   ```

## Running Tests

You can run tests in several ways:

### Option 1: Using npm (recommended)
```bash
cd backend
npm test
```

### Option 2: Directly with node
```bash
cd backend
node tests/run-tests.js
```

### Option 3: Using the convenience script
```bash
cd backend
./tests/test.sh
```

### Option 4: As an executable (if Node is in PATH)
```bash
cd backend
./tests/run-tests.js
```

## Environment Variables

You can customize the test configuration with environment variables:

- `API_BASE`: API base URL (default: `http://localhost:3001/api`)
- `API_KEY`: API key for authentication (default: `change-me-in-production`)

Example:
```bash
API_BASE=http://localhost:3001/api API_KEY=my-secret-key npm test
```

## Test Coverage

The test suite covers:

### ✅ Health & Authentication
- Health check endpoint
- API key authentication
- Unauthorized access handling

### ✅ People CRUD
- Create person
- Get all people
- Get person by ID
- Update person
- Soft delete person

### ✅ Households CRUD
- Create household
- Get all households
- Get household by ID
- Update household
- Merge households

### ✅ Events CRUD
- Create event
- Get all events
- Get event by ID
- Update event

### ✅ Gifts CRUD
- Create gift (inbound)
- Create gift (outbound)
- Get all gifts
- Get gift by ID
- Update gift
- Filter gifts by direction

### ✅ Cards CRUD
- Create card
- Get all cards
- Get card by ID
- Update card

### ✅ Import APIs
- Import people
- Import gifts

## Test Results

The test suite provides:
- ✅ Pass/fail status for each test
- 📊 Summary statistics
- ❌ Detailed error messages for failures

Example output:
```
📊 Test Summary:
✅ Passed: 30
❌ Failed: 0
📈 Total:  30
```

## Notes

- Tests create real data in the database (test data)
- Tests are designed to be idempotent where possible
- Some tests depend on data created in previous tests
- The test suite cleans up by using soft deletes

## Troubleshooting

### Tests fail with connection errors
- Ensure Docker containers are running: `docker compose ps`
- Check API is accessible: `curl http://localhost:3001/api/health`

### Tests fail with authentication errors
- Verify API_KEY matches the one in `docker-compose.yml`
- Check the API key is set correctly in the environment

### Tests fail with database errors
- Check database container is healthy: `docker compose ps`
- Review application logs: `docker compose logs app`

