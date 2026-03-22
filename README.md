# Generic REST API

Developer-friendly dynamic REST API built with Express + MongoDB.

The API is generic: you can create any resource type by calling `/api/:resource`.

## Table of Contents
- Quick Start
- Base URL
- Authentication Header
- API Endpoints and Required Request Bodies
- Dynamic Resource Rules
- Data Model
- Common Dev Notes

## Quick Start
1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Server URL:

```text
http://localhost:3030
```

## Base URL
All examples use:

```text
http://localhost:3030
```

## Web Docs View (for deployed backend)
You can open API docs directly from the backend:

- `GET /docs` -> HTML documentation page rendered from README
- `GET /docs/raw` -> raw markdown text

Examples:

```text
https://your-backend-domain.com/docs
https://your-backend-domain.com/docs/raw
```

## Authentication Header
Protected routes require:

```text
X-Authorization: <accessToken>
```

You get `accessToken` from `POST /users/register` or `POST /users/login`.

## API Endpoints and Required Request Bodies

### 1) Register User
Endpoint:

```text
POST /users/register
```

Required body fields:
- `firstName` (string)
- `lastName` (string)
- `email` (string, valid email)
- `imageUrl` (string)
- `secretWord` (string)
- `password` (string)
- `rePass` (string, must equal password)

Body example:

```json
{
	"firstName": "John",
	"lastName": "Doe",
	"email": "john@example.com",
	"imageUrl": "https://example.com/avatar.jpg",
	"secretWord": "blue",
	"password": "123456",
	"rePass": "123456"
}
```

Success response example:

```json
{
	"_id": "65f0f0f0f0f0f0f0f0f0f0f0",
	"email": "john@example.com",
	"firstName": "John",
	"lastName": "Doe",
	"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2) Login User
Endpoint:

```text
POST /users/login
```

Required body fields:
- `email` (string)
- `password` (string)

Body example:

```json
{
	"email": "john@example.com",
	"password": "123456"
}
```

Success response example:

```json
{
	"_id": "65f0f0f0f0f0f0f0f0f0f0f0",
	"email": "john@example.com",
	"firstName": "John",
	"lastName": "Doe",
	"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Error response example:

```json
{
	"message": "Invalid email or password!"
}
```

### 3) Logout User
Endpoint:

```text
GET /users/logout
```

Required body: none.
Required header: `X-Authorization`.

Success response example:

```json
{}
```

### 4) Email Check
Endpoint:

```text
POST /users/email-test
```

Required body fields:
- `email` (object containing field `email`)

Body example (matches current controller logic):

```json
{
	"email": {
		"email": "john@example.com"
	}
}
```

Success response example (user exists):

```json
{
	"_id": "65f0f0f0f0f0f0f0f0f0f0f0",
	"firstName": "John",
	"lastName": "Doe",
	"email": "john@example.com",
	"imageUrl": "https://example.com/avatar.jpg",
	"savedResources": [],
	"secretWord": "blue"
}
```

Error response example (user missing):

```json
{
	"message": "User not found!"
}
```

### 5) Reset Password
Endpoint:

```text
POST /users/reset
```

Required body fields:
- `password` (string)
- `rePass` (string)
- `userId` (string, Mongo ObjectId)

Body example:

```json
{
	"password": "newPassword123",
	"rePass": "newPassword123",
	"userId": "65f0f0f0f0f0f0f0f0f0f0f0"
}
```

Success response example:

```json
{
	"message": "Password successfully reset!"
}
```

### 6) Get User By Id
Endpoint:

```text
GET /users/:userId
```

Required body: none.

Success response example:

```json
{
	"_id": "65f0f0f0f0f0f0f0f0f0f0f0",
	"firstName": "John",
	"lastName": "Doe",
	"email": "john@example.com",
	"imageUrl": "https://example.com/avatar.jpg",
	"savedResources": [
		{
			"_id": "65f0f0f0f0f0f0f0f0f0f001",
			"resource": "posts",
			"payload": {
				"title": "Saved post"
			},
			"createdAt": "2026-03-22T10:00:00.000Z",
			"updatedAt": "2026-03-22T10:00:00.000Z"
		}
	],
	"secretWord": "blue"
}
```

### 7) Update User
Endpoint:

```text
PATCH /users/update/:userId
```

Required header: `X-Authorization`.

Body:
- Any user fields you want to update.
- At least one field should be provided.

Body example:

```json
{
	"firstName": "Jane",
	"lastName": "Smith",
	"imageUrl": "https://example.com/new-avatar.jpg"
}
```

Success response example:

```json
{
	"_id": "65f0f0f0f0f0f0f0f0f0f0f0",
	"firstName": "Jane",
	"lastName": "Smith",
	"email": "john@example.com",
	"imageUrl": "https://example.com/new-avatar.jpg",
	"savedResources": [],
	"secretWord": "blue"
}
```

### 8) Delete User
Endpoint:

```text
DELETE /users/delete/:userId
```

Required body: none.
Required header: `X-Authorization`.

Success response example:

```json
{
	"_id": "65f0f0f0f0f0f0f0f0f0f0f0",
	"firstName": "Jane",
	"lastName": "Smith",
	"email": "john@example.com",
	"imageUrl": "https://example.com/new-avatar.jpg"
}
```

### 9) Unsave Resources For User
Endpoint:

```text
POST /users/unsave/:userId
```

Required header: `X-Authorization`.

Required body:
- Array of objects that contain `_id`.

Body example:

```json
[
	{ "_id": "65f0f0f0f0f0f0f0f0f0f001" },
	{ "_id": "65f0f0f0f0f0f0f0f0f0f002" }
]
```

Success response example:

```json
[
	"65f0f0f0f0f0f0f0f0f0f001",
	"65f0f0f0f0f0f0f0f0f0f002"
]
```

### 10) Create Dynamic Resource
Endpoint:

```text
POST /api/:resource
```

Required header: `X-Authorization`.

Body fields:
- `payload` (required, object)
- `_ownerId` (optional, string Mongo ObjectId)

Body example:

```json
{
	"payload": {
		"title": "My First Post",
		"content": "Hello world",
		"tags": ["intro", "welcome"]
	},
	"_ownerId": "65f0f0f0f0f0f0f0f0f0f0f0"
}
```

Success response example:

```json
{
	"_id": "65f0f0f0f0f0f0f0f0f0f100",
	"resource": "posts",
	"payload": {
		"title": "My First Post",
		"content": "Hello world",
		"tags": ["intro", "welcome"]
	},
	"_ownerId": "65f0f0f0f0f0f0f0f0f0f0f0",
	"createdAt": "2026-03-22T10:10:00.000Z",
	"updatedAt": "2026-03-22T10:10:00.000Z"
}
```

### 11) Get All Dynamic Resources
Endpoint:

```text
GET /api/:resource
```

Required body: none.

Optional query params:
- `ownerId` (filter by owner)

Example:

```text
GET /api/posts?ownerId=65f0f0f0f0f0f0f0f0f0f0f0
```

Success response example:

```json
[
	{
		"_id": "65f0f0f0f0f0f0f0f0f0f101",
		"resource": "posts",
		"payload": {
			"title": "Post A",
			"status": "draft"
		},
		"_ownerId": "65f0f0f0f0f0f0f0f0f0f0f0",
		"createdAt": "2026-03-22T10:20:00.000Z",
		"updatedAt": "2026-03-22T10:20:00.000Z"
	}
]
```

### 12) Get Dynamic Resource By Id
Endpoint:

```text
GET /api/:resource/:id
```

Required body: none.

Success response example:

```json
{
	"_id": "65f0f0f0f0f0f0f0f0f0f101",
	"resource": "posts",
	"payload": {
		"title": "Post A",
		"status": "draft"
	},
	"_ownerId": "65f0f0f0f0f0f0f0f0f0f0f0",
	"createdAt": "2026-03-22T10:20:00.000Z",
	"updatedAt": "2026-03-22T10:20:00.000Z"
}
```

Error response example (not found):

```json
{
	"message": "Record not found."
}
```

### 13) Update Dynamic Resource
Endpoint:

```text
PUT /api/:resource/:id
```

Required header: `X-Authorization`.

Body fields:
- `payload` (required, object)

Body example:

```json
{
	"payload": {
		"title": "Updated title",
		"status": "published"
	}
}
```

Success response example:

```json
{
	"_id": "65f0f0f0f0f0f0f0f0f0f101",
	"resource": "posts",
	"payload": {
		"title": "Updated title",
		"status": "published"
	},
	"_ownerId": "65f0f0f0f0f0f0f0f0f0f0f0",
	"createdAt": "2026-03-22T10:20:00.000Z",
	"updatedAt": "2026-03-22T10:25:00.000Z"
}
```

### 14) Delete Dynamic Resource
Endpoint:

```text
DELETE /api/:resource/:id
```

Required body: none.
Required header: `X-Authorization`.

Success response example:

```json
{
	"_id": "65f0f0f0f0f0f0f0f0f0f101",
	"resource": "posts",
	"payload": {
		"title": "Updated title",
		"status": "published"
	},
	"_ownerId": "65f0f0f0f0f0f0f0f0f0f0f0",
	"createdAt": "2026-03-22T10:20:00.000Z",
	"updatedAt": "2026-03-22T10:25:00.000Z"
}
```

## Dynamic Resource Rules
- Resource name supports: letters, numbers, `_`, `-`
- Examples: `posts`, `orders`, `users_meta`, `audit-log`

## Data Model

### User
- `firstName`: String
- `lastName`: String
- `email`: String
- `imageUrl`: String
- `password`: String (hashed)
- `savedResources`: ObjectId[]
- `secretWord`: String

### Resource
- `resource`: String (normalized lower-case)
- `payload`: Mixed (any JSON)
- `_ownerId`: ObjectId (optional)
- `createdAt`: Date
- `updatedAt`: Date

## Common Dev Notes
- For JSON requests, always send header:

```text
Content-Type: application/json
```

- Login/register response returns `accessToken`; use it in `X-Authorization` for protected endpoints.
- API currently supports owner filtering only (`ownerId`) on list endpoint.
