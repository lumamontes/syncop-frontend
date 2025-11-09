# Syncop API - Financial Management Backend

A Kotlin-based Spring Boot REST API for financial management, following MVC architecture pattern.

## Tech Stack

- **Kotlin 1.9.23**
- **Java 17**
- **Spring Boot 3.5.7**
- **MySQL 8.0**
- **Flyway** (Database migrations)
- **Docker** (Containerization)

## Project Structure

The project follows MVC (Model-View-Controller) architecture:

```
src/main/kotlin/com/syncop_api/demo/
├── common/              # Common utilities
│   ├── exception/       # Exception handlers
│   └── response/        # API response wrappers
├── config/              # Configuration classes
├── controller/          # REST Controllers (HTTP layer)
├── service/             # Business logic layer
├── repository/          # Data access layer (JPA repositories)
├── entity/              # Database entities (JPA)
└── dto/                 # Data Transfer Objects
    ├── user/
    ├── account/
    ├── transaction/
    ├── category/
    ├── budget/
    ├── budgetitem/
    ├── goal/
    ├── goalcontribution/
    ├── recurringtransaction/
    ├── bill/
    ├── accounttype/
    ├── transactionstatus/
    └── institution/
```

## Architecture Pattern

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Repositories**: Manage data access (JPA)
- **Entities**: Represent database tables
- **DTOs**: Transfer data between layers

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. All endpoints require authentication except:
- `POST /api/auth/login` - User login
- `POST /api/users` - User registration

### Authentication Flow

1. **Register a new user:**
   ```bash
   POST /api/users
   {
     "email": "user@example.com",
     "username": "username",
     "password": "password123"
   }
   ```

2. **Login to get JWT token:**
   ```bash
   POST /api/auth/login
   {
     "username": "username",  # or email
     "password": "password123"
   }
   ```

   Response:
   ```json
   {
     "success": true,
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "type": "Bearer",
       "userId": 1,
       "username": "username",
       "email": "user@example.com"
     }
   }
   ```

3. **Use the token in subsequent requests:**
   ```bash
   Authorization: Bearer <your-token>
   ```

### Authorization

- Users can only access their own data (accounts, transactions, etc.)
- The `userId` in request bodies is automatically set from the authenticated user
- Users can only view/update/delete their own resources

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (public)

### Users
- `POST /api/users` - Create user (public - registration)
- `GET /api/users/me` - Get current user profile (authenticated)
- `GET /api/users/{id}` - Get user by ID (authenticated - own profile only)
- `PUT /api/users/{id}` - Update user (authenticated - own profile only)
- `DELETE /api/users/{id}` - Delete user (authenticated - own account only)

### Accounts
- `POST /api/accounts` - Create account (authenticated - auto-assigned to current user)
- `GET /api/accounts/{id}` - Get account by ID (authenticated - own accounts only)
- `GET /api/accounts` - Get all accounts for current user (authenticated)
- `PUT /api/accounts/{id}` - Update account (authenticated - own accounts only)
- `DELETE /api/accounts/{id}` - Delete account (authenticated - own accounts only)

### Transactions
- `POST /api/transactions` - Create transaction (authenticated - auto-assigned to current user)
- `GET /api/transactions/{id}` - Get transaction by ID (authenticated - own transactions only)
- `GET /api/transactions?accountId={accountId}` - Get transactions by account (authenticated - own transactions only)
- `GET /api/transactions` - Get all transactions for current user (authenticated)
- `PUT /api/transactions/{id}` - Update transaction (authenticated - own transactions only)
- `DELETE /api/transactions/{id}` - Delete transaction (authenticated - own transactions only)

### Categories
- `POST /api/categories` - Create category (authenticated - user categories)
- `GET /api/categories` - Get user's categories + system categories (authenticated)
- `GET /api/categories?type=INCOME|EXPENSE|TRANSFER` - Filter categories by type (authenticated)
- `GET /api/categories/system` - Get system categories (authenticated)
- `GET /api/categories/{id}` - Get category by ID (authenticated)
- `PUT /api/categories/{id}` - Update category (authenticated - own categories only)
- `DELETE /api/categories/{id}` - Delete category (authenticated - own categories only)

### Account Types (Reference Data - Read Only)
- `GET /api/account-types` - Get all account types (authenticated)
- `GET /api/account-types?activeOnly=true` - Get active account types only (authenticated)
- `GET /api/account-types/{id}` - Get account type by ID (authenticated)
- `GET /api/account-types/code/{typeCode}` - Get account type by code (authenticated)

### Transaction Status (Reference Data - Read Only)
- `GET /api/transaction-statuses` - Get all transaction statuses (authenticated)
- `GET /api/transaction-statuses/{id}` - Get transaction status by ID (authenticated)
- `GET /api/transaction-statuses/code/{statusCode}` - Get transaction status by code (authenticated)

### Budgets
- `POST /api/budgets` - Create budget (authenticated - auto-assigned to current user)
- `GET /api/budgets` - Get all budgets for current user (authenticated)
- `GET /api/budgets?activeOnly=true` - Get active budgets only (authenticated)
- `GET /api/budgets/{id}` - Get budget by ID (authenticated - own budgets only)
- `PUT /api/budgets/{id}` - Update budget (authenticated - own budgets only)
- `DELETE /api/budgets/{id}` - Delete budget (authenticated - own budgets only)

### Budget Items
- `POST /api/budgets/{budgetId}/items` - Create budget item (authenticated - own budgets only)
- `GET /api/budgets/{budgetId}/items` - Get all items for a budget (authenticated - own budgets only)
- `GET /api/budgets/{budgetId}/items/{id}` - Get budget item by ID (authenticated)
- `PUT /api/budgets/{budgetId}/items/{id}` - Update budget item (authenticated - own budgets only)
- `DELETE /api/budgets/{budgetId}/items/{id}` - Delete budget item (authenticated - own budgets only)

### Goals
- `POST /api/goals` - Create goal (authenticated - auto-assigned to current user)
- `GET /api/goals` - Get all goals for current user (authenticated)
- `GET /api/goals?activeOnly=true` - Get active goals only (authenticated)
- `GET /api/goals/{id}` - Get goal by ID (authenticated - own goals only)
- `PUT /api/goals/{id}` - Update goal (authenticated - own goals only)
- `DELETE /api/goals/{id}` - Delete goal (authenticated - own goals only)

### Goal Contributions
- `POST /api/goals/{goalId}/contributions` - Add contribution to goal (authenticated - own goals only)
- `GET /api/goals/{goalId}/contributions` - Get all contributions for a goal (authenticated - own goals only)
- `GET /api/goals/{goalId}/contributions/{id}` - Get contribution by ID (authenticated)
- `DELETE /api/goals/{goalId}/contributions/{id}` - Delete contribution (authenticated - own goals only)

### Recurring Transactions
- `POST /api/recurring-transactions` - Create recurring transaction (authenticated - auto-assigned to current user)
- `GET /api/recurring-transactions` - Get all recurring transactions for current user (authenticated)
- `GET /api/recurring-transactions?activeOnly=true` - Get active recurring transactions only (authenticated)
- `GET /api/recurring-transactions/{id}` - Get recurring transaction by ID (authenticated - own only)
- `PUT /api/recurring-transactions/{id}` - Update recurring transaction (authenticated - own only)
- `DELETE /api/recurring-transactions/{id}` - Delete recurring transaction (authenticated - own only)

### Bills
- `POST /api/bills` - Create bill (authenticated - auto-assigned to current user)
- `GET /api/bills` - Get all bills for current user (authenticated)
- `GET /api/bills?status=PENDING|PAID|OVERDUE|CANCELLED` - Filter bills by status (authenticated)
- `GET /api/bills/overdue` - Get overdue bills (authenticated)
- `GET /api/bills/{id}` - Get bill by ID (authenticated - own bills only)
- `PUT /api/bills/{id}` - Update bill (authenticated - own bills only, auto-updates status)
- `DELETE /api/bills/{id}` - Delete bill (authenticated - own bills only)

### Institutions (Reference Data - Read Only)
- `GET /api/institutions` - Get all institutions (authenticated)
- `GET /api/institutions?activeOnly=true` - Get active institutions only (authenticated)
- `GET /api/institutions/{id}` - Get institution by ID (authenticated)
- `GET /api/institutions/code/{institutionCode}` - Get institution by code (authenticated)
- `GET /api/institutions/country/{countryCode}` - Get institutions by country code (authenticated)

## Running the Application

### Prerequisites
- Java 17
- Docker and Docker Compose
- Gradle (or use Gradle wrapper)

### Using Docker Compose (Recommended)

1. Start the database and application:
```bash
cd demo
docker-compose up -d
```

2. The API will be available at `http://localhost:8080`

3. To stop:
```bash
docker-compose down
```

### Running Locally

1. Start MySQL database:
```bash
docker-compose up -d mysql
```

2. Run the application:
```bash
./gradlew bootRun
```

Or using the wrapper:
```bash
./gradlew bootRun
```

### Database Migrations

Flyway automatically runs migrations on application startup. Migration files are located in:
```
src/main/resources/db/migration/
```

The initial schema is in `V1__database.sql`.

## Configuration

Configuration is managed through `application.properties` and environment variables:

- Database connection: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
- Server port: `SERVER_PORT` (default: 8080)
- Flyway: `SPRING_FLYWAY_ENABLED` (default: true)
- JWT Secret: `JWT_SECRET` (default: change in production!)
- JWT Expiration: `JWT_EXPIRATION` (default: 86400000ms = 24 hours)

## Development

### Building the Project

```bash
./gradlew build
```

### Running Tests

```bash
./gradlew test
```

## Database Schema

See `docs/database.md` for the complete database schema documentation.

## API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Optional success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "timestamp": "2024-01-01T12:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Error message",
  "path": "/api/endpoint",
  "details": {
    "field": "Validation error message"
  }
}
```

## Request/Response Examples

### Create Account
```bash
POST /api/accounts
Authorization: Bearer <token>
Content-Type: application/json

{
  "accountTypeId": 1,
  "accountName": "My Checking Account",
  "currencyCode": "USD",
  "currentBalance": 1000.00,
  "availableBalance": 1000.00
}
```

### Create Transaction
```bash
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "accountId": 1,
  "categoryId": 5,
  "transactionType": "DEBIT",
  "amount": 50.00,
  "transactionDate": "2024-01-15",
  "description": "Grocery shopping",
  "merchantName": "Supermarket"
}
```

### Create Budget
```bash
POST /api/budgets
Authorization: Bearer <token>
Content-Type: application/json

{
  "budgetName": "January 2024 Budget",
  "periodType": "MONTHLY",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "totalAmount": 3000.00,
  "currencyCode": "USD"
}
```

### Create Goal
```bash
POST /api/goals
Authorization: Bearer <token>
Content-Type: application/json

{
  "goalName": "Emergency Fund",
  "goalType": "EMERGENCY_FUND",
  "targetAmount": 10000.00,
  "targetDate": "2024-12-31",
  "currencyCode": "USD"
}
```

## Next Steps

- Add pagination and filtering for list endpoints
- Implement role-based access control (admin, user roles)
- Add refresh token mechanism
- Implement caching for reference data
- Add API documentation (Swagger/OpenAPI)
- Add unit and integration tests
- Add rate limiting
- Implement file uploads for transaction attachments

