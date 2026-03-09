# Authentication Specification

## Purpose
Define the requirements for user authentication in the "Chef Lidia y Familia" application, specifically focusing on Google OAuth via Supabase.

## Requirements

### Requirement: Google OAuth Login

The system MUST allow users to authenticate using their Google accounts via Supabase.

#### Scenario: Successful Google Login
- GIVEN an unauthenticated user on the login screen
- WHEN the user clicks the "Ingresar con Google" button
- AND completes the Google OAuth flow successfully
- THEN the system MUST redirect the user to the dashboard (`/`)
- AND the system MUST establish an authenticated session.

#### Scenario: Authentication Persistence
- GIVEN an authenticated user
- WHEN the user closes and reopens the application
- THEN the system SHOULD maintain the user's logged-in state without requiring them to sign in again.

### Requirement: Protected Routes

The system MUST protect internal application routes (e.g., dashboard, planning, dishes management) from unauthenticated access.

#### Scenario: Unauthorized Access Attempt
- GIVEN an unauthenticated user
- WHEN the user attempts to directly access a protected route (e.g., `/platos`)
- THEN the system MUST redirect the user to the login screen.
