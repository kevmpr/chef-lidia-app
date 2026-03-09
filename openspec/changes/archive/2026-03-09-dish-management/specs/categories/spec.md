# Category Management Specification

## Purpose

Define the requirements for managing menu categories (e.g., "Entradas", "Bebidas") within the intended Chef Lidia application. Categories group dishes together.

## Requirements

### Requirement: Create Category

The system MUST allow authenticated users to create a new category.

#### Scenario: Successful Category Creation
- GIVEN an authenticated user on the Category Management view
- WHEN the user submits a new category name
- THEN the system MUST save the category to the database
- AND associate the category with the current user's `user_id`
- AND display the new category in the list.

### Requirement: List Categories

The system MUST display a list of all categories belonging to the authenticated user.

#### Scenario: View User Categories
- GIVEN an authenticated user
- WHEN the user navigates to the Category Management view
- THEN the system MUST retrieve and display only the categories where `user_id` matches the user's ID.

### Requirement: Edit Category

The system MUST allow authenticated users to modify the name of an existing category they own.

#### Scenario: Successful Category Name Update
- GIVEN an authenticated user viewing their categories
- WHEN the user edits the name of a category and submits
- THEN the system MUST update the category name in the database
- AND reflect the changes in the UI.

### Requirement: Delete Category

The system MUST allow authenticated users to delete a category they own.

#### Scenario: Successful Category Deletion
- GIVEN an authenticated user viewing their categories
- WHEN the user deletes a category
- THEN the system MUST remove the category from the database
- AND (implicitly via Supabase setup) set `category_id` to NULL for any dishes that belonged to it.
