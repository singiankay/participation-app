# API Documentation

## Base URL

- **Production**: `https://participation-app.vercel.app`
- **Local Development**: `http://localhost:3000`

## Authentication

### API Key Authentication

For external API requests, include the `X-API-Key` header:

```bash
curl -H "X-API-Key: your-api-key" \
     https://participation-app.vercel.app/api/participants
```

### Same-Origin Requests

Frontend requests from the same domain are automatically authenticated and don't require an API key.

## Rate Limiting

All endpoints are protected by rate limiting:

- **GET requests**: 30 requests per minute
- **POST/PUT/DELETE requests**: 5 requests per minute

Rate limit headers are included in responses:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Timestamp when the rate limit resets

## CORS

Cross-Origin Resource Sharing is configured for:

- **Allowed Origins**: `https://participation-app.vercel.app` (configurable via `ALLOWED_ORIGINS`)
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Credentials**: Supported

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": ["Detailed error messages"]
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid API key)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Endpoints

### 1. Get All Participants

**GET** `/api/participants`

Retrieve all participants

#### Response

```json
[
  {
    "id": "clx1234567890",
    "firstName": "John",
    "lastName": "Doe",
    "participation": 85
  },
  {
    "id": "clx0987654321",
    "firstName": "Jane",
    "lastName": "Smith",
    "participation": 92
  }
]
```

#### Response Headers

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 2024-01-15T10:30:00.000Z
```

### 2. Create Participant

**POST** `/api/participants`

Create a new participant.

#### Request Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "participation": 85
}
```

#### Validation Rules

- **firstName**:
  - Required, string
  - 2-50 characters
  - Only letters and spaces
- **lastName**:
  - Required, string
  - 2-50 characters
  - Only letters and spaces
- **participation**:
  - Required, number
  - 0-100 (percentage)
  - Total participation cannot exceed 100%

#### Response

```json
{
  "id": "clx1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "participation": 85
}
```

#### Error Examples

**Validation Error (400)**:

```json
{
  "error": "Validation failed",
  "details": [
    "First name must be at least 2 characters long",
    "Participation must be at least 0%"
  ]
}
```

**Name Uniqueness Error (400)**:

```json
{
  "error": "Validation failed",
  "details": ["A participant with this name already exists"]
}
```

**Participation Total Error (400)**:

```json
{
  "error": "Participation validation failed",
  "details": ["Total participation cannot exceed 100%"]
}
```

### 3. Get Single Participant

**GET** `/api/participants/{id}`

Retrieve a specific participant by ID.

#### Response

```json
{
  "id": "clx1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "participation": 85
}
```

#### Error Response (404)

```json
{
  "error": "Participant not found"
}
```

### 4. Update Participant

**PUT** `/api/participants/{id}`

Update an existing participant.

#### Request Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "participation": 90
}
```

#### Validation Rules

- **firstName**:
  - Required, string
  - 2-32 characters
  - Only letters and spaces
- **lastName**:
  - Required, string
  - 2-32 characters
  - Only letters and spaces
- **participation**:
  - Required, number
  - 0-100 (percentage)
  - Total participation cannot exceed 100%

#### Response

```json
{
  "id": "clx1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "participation": 90
}
```

#### Error Response (404)

```json
{
  "error": "Participant not found"
}
```

### 5. Delete Participant

**DELETE** `/api/participants/{id}`

Delete a participant.

#### Response

```json
{
  "message": "Participant deleted successfully"
}
```

#### Error Response (404)

```json
{
  "error": "Participant not found"
}
```

## Data Models

### Participant

```typescript
interface Participant {
  id: string; // Unique identifier (CUID)
  firstName: string; // 2-50 characters, letters and spaces only
  lastName: string; // 2-50 characters, letters and spaces only
  participation: number; // 0-100, percentage value
}
```

### Create Participant Request

```typescript
interface CreateParticipantRequest {
  firstName: string; // Required, 2-50 characters
  lastName: string; // Required, 2-50 characters
  participation: number; // Required, 0-100
}
```

### Update Participant Request

```typescript
interface UpdateParticipantRequest {
  firstName: string; // Required, 2-32 characters
  lastName: string; // Required, 2-32 characters
  participation: number; // Required, 0-100
}
```

## Business Rules

### Participation Validation

- **Individual Limit**: Each participant's participation must be between 0-100%
- **Total Limit**: The sum of all participants' participation cannot exceed 100%
- **Uniqueness**: No two participants can have the same first and last name combination

### Name Validation

- **Characters**: Only letters and spaces allowed
- **Length**:
  - Create: 2-50 characters
  - Update: 2-32 characters
- **Case**: Preserved as provided
