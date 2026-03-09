# Dish Management Specification

## Purpose

Define the requirements for managing individual dishes in the Chef Lidia application, including text data and image uploads with client-side compression.

## Requirements

### Requirement: Database Extension

The system MUST support storing a price for each dish.

#### Scenario: Price Field Availability
- GIVEN the database schema
- WHEN a dish is created or queried
- THEN there MUST be a `price` field available (e.g., numeric or text depending on currency handling needs).

### Requirement: Client-Side Image Compression

The system MUST compress images selected by the user before uploading them to Supabase Storage.

#### Scenario: Optimizing Large Images
- GIVEN an authenticated user on the Dish creation/edition form
- WHEN the user selects an image file larger than the optimal size (e.g., > 1MB)
- THEN the system MUST compress the image locally in the browser
- AND the resulting file MUST be significantly smaller without losing acceptable visual quality.

### Requirement: Client-to-Storage Upload

The system MUST upload the compressed image directly from the browser to Supabase Storage.

#### Scenario: Direct Secure Upload
- GIVEN a compressed image ready in the browser
- WHEN the upload process begins
- THEN the system MUST use the authenticated Supabase browser client to upload the file to the `dish-images` bucket
- AND retrieve the public URL of the uploaded image.

### Requirement: Create Dish

The system MUST allow authenticated users to create a new dish with its text details and associated image URL.

#### Scenario: Complete Dish Creation
- GIVEN an authenticated user
- WHEN the user completes the Dish form (name, description, price, category, is_fixed) and the image upload completes successfully
- AND submits the Astro Action
- THEN the system MUST save the dish to the database with the `image_url`
- AND associate it with the user's `user_id`.

### Requirement: List Dishes

The system MUST display a list of all dishes belonging to the authenticated user.

#### Scenario: View User Dishes
- GIVEN an authenticated user
- WHEN the user navigates to the Dishes Management view
- THEN the system MUST retrieve and display only the dishes where `user_id` matches the user's ID.

### Requirement: Edit Dish

The system MUST allow authenticated users to modify the details of an existing dish they own.

#### Scenario: Update Dish Details
- GIVEN an authenticated user viewing a specific dish
- WHEN the user updates details (e.g., changing from "Carta Fija" to "Menú del Día", or changing price) and submits
- THEN the system MUST update the dish in the database.

### Requirement: Delete Dish

The system MUST allow authenticated users to delete a dish they own.

#### Scenario: Remove Dish
- GIVEN an authenticated user viewing their dishes
- WHEN the user deletes a dish
- THEN the system MUST remove the dish from the database.
