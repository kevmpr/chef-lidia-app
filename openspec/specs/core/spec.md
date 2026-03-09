# Core Infrastructure Specification

## Purpose
Define the foundational infrastructure requirements for the "Chef Lidia y Familia" application, including the UI framework, styling, and database structure.

## Requirements

### Requirement: UI Framework Configuration

The system MUST use Astro as the foundational SSR framework and Tailwind CSS for styling.

#### Scenario: Base Application Rendering
- GIVEN a properly configured development environment
- WHEN the root application URL is accessed
- THEN the system MUST render the initial page using Astro
- AND apply Tailwind CSS utility classes correctly.

### Requirement: Interactive Components (Islands)

The system MUST support interactive components (Islands) using Svelte or React, housed in a dedicated `src/components/islands/` directory, to provide smooth, app-like interactions where needed.

#### Scenario: Interactive Component Rendering
- GIVEN a page utilizing an interactive island component (e.g., for image upload)
- WHEN the page loads
- THEN the interactive component MUST hydrate on the client according to its directive (e.g., `client:load`)
- AND respond to user interactions without requiring a full page reload.

### Requirement: Database Schema Initialization

The system MUST initialize the Supabase database with the core operational tables (`categories`, `dishes`, `menu_schedules`).

#### Scenario: Schema Verification
- GIVEN a configured Supabase project
- WHEN the initial SQL migrations are applied
- THEN the `categories`, `dishes`, and `menu_schedules` tables MUST exist with their defined relationships (Foreign Keys).

### Requirement: Client-Side Image Compression Strategy

The system SHOULD prepare the architecture to support client-side image compression before uploading visual assets (dish photos) to Supabase Storage.

#### Scenario: Image Pre-processing Logic
- GIVEN an interactive island component for image upload
- WHEN a user selects an image
- THEN the system SHOULD have utility functions available within the frontend architecture to compress the image before the upload request is sent to Supabase.
