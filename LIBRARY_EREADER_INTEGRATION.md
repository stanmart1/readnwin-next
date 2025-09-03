# Library-EReader Integration Documentation

## Overview

This document describes the complete integration between the admin book management system, user library, and ereader functionality. The system allows admins to assign books to users, and users can access and read these books through their library dashboard.

## Integration Flow

### 1. Admin Book Assignment
- **Location**: Admin Dashboard → Book Management → User Library Management
- **Process**: Admin selects user and assigns books (ebook, physical, or hybrid)
- **API**: `POST /api/admin/users/[userId]/library`
- **Database**: Creates entries in `book_assignments` and `user_library` tables

### 2. User Library Display
- **Location**: User Dashboard → Library Tab (`/dashboard?tab=library`)
- **Process**: Displays all books (purchased + assigned) with appropriate actions
- **API**: `GET /api/dashboard/library`
- **Features**: 
  - Shows book format (ebook/physical/hybrid)
  - Displays read buttons for ebooks/hybrid books
  - Shows "Physical Book" for non-readable books

### 3. EReader Access
- **Location**: Reading Page (`/reading/[bookId]`)
- **Process**: Verifies user access and opens ereader for readable books
- **API**: `GET /api/dashboard/library` (for access verification)
- **Features**:
  - Access control based on user library
  - Format validation (ebook/hybrid only)
  - Error handling for physical books

## Database Schema

### book_assignments Table
```sql
CREATE TABLE book_assignments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  book_id INTEGER NOT NULL REFERENCES books(id),
  assigned_by INTEGER NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  reason TEXT,
  removed_at TIMESTAMP,
  removed_by INTEGER REFERENCES users(id),
  UNIQUE(user_id, book_id)
);
```

### user_library Table (Enhanced)
```sql
ALTER TABLE user_library 
ADD COLUMN access_type VARCHAR(20) DEFAULT 'purchased',
ADD COLUMN status VARCHAR(20) DEFAULT 'active',
ADD COLUMN added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

## Key Components

### 1. LibrarySection.tsx
- **Purpose**: Main library display component
- **Features**: 
  - Grid/list view toggle
  - Filter by reading status
  - Format-aware action buttons
  - Progress tracking
- **Integration**: Uses centralized image path resolver

### 2. LibrarySyncService
- **Purpose**: Handles book assignments and library synchronization
- **Methods**:
  - `assignBookToUser()` - Admin book assignment
  - `removeBookFromUser()` - Remove book access
  - `syncAssignmentsToLibrary()` - Fix sync issues
  - `verifyUserLibrary()` - Library integrity check

### 3. Reading Page
- **Purpose**: EReader access control and initialization
- **Features**:
  - Library-based access verification
  - Format validation
  - Error handling with helpful messages
  - Automatic redirection for unauthorized access

### 4. Dashboard Library API
- **Purpose**: Unified library data for frontend
- **Features**:
  - Combines purchased and assigned books
  - Removes duplicates (purchased takes precedence)
  - Includes reading progress data
  - Proper error handling

## Book Format Handling

### Ebook Format
- **Display**: Blue "Digital" badge
- **Action**: "Start Reading" / "Continue Reading" button
- **Behavior**: Opens ereader when clicked
- **Access**: Available via `/reading/[bookId]`

### Physical Format
- **Display**: Amber "Physical" badge
- **Action**: Grayed out "Physical Book" button
- **Behavior**: No reading action available
- **Access**: Shows helpful error message if accessed directly

### Hybrid Format
- **Display**: Blue "Digital" badge (treated as ebook)
- **Action**: "Start Reading" / "Continue Reading" button
- **Behavior**: Opens ereader for digital version
- **Access**: Available via `/reading/[bookId]`

## API Endpoints

### Library Management
- `GET /api/dashboard/library` - Get user's complete library
- `POST /api/dashboard/library` - Add book to library
- `GET /api/admin/users/[id]/library` - Get user library (admin)
- `POST /api/admin/users/[id]/library` - Assign book to user (admin)
- `DELETE /api/admin/users/[id]/library` - Remove book from user (admin)

### Bulk Operations
- `POST /api/admin/users/library/bulk-assign` - Bulk assign books to users

### Reading Access
- `GET /api/books/[id]` - Get book details
- `GET /api/reading/progress` - Get reading progress

## Setup and Verification

### 1. Database Setup
```bash
node scripts/setup-book-assignments.js
```
This script:
- Creates `book_assignments` table
- Adds necessary columns to `user_library`
- Creates indexes for performance
- Syncs existing assignments

### 2. Integration Testing
```bash
node scripts/test-library-ereader-integration.js
```
This script:
- Tests complete assignment flow
- Verifies library integration
- Checks ereader access
- Validates API endpoints

## User Experience Flow

### For Users
1. **Library Access**: Visit `/dashboard?tab=library`
2. **View Books**: See all assigned and purchased books
3. **Read Books**: Click "Start Reading" on ebooks/hybrid books
4. **Physical Books**: See "Physical Book" indicator for non-digital books

### For Admins
1. **User Management**: Access admin dashboard
2. **Book Assignment**: Select user and assign books
3. **Bulk Operations**: Assign multiple books to multiple users
4. **Monitoring**: View assignment logs and user libraries

## Error Handling

### Access Denied
- **Scenario**: User tries to read unassigned book
- **Response**: Clear error message with suggestions
- **Action**: Redirect to library or book details

### Physical Book Access
- **Scenario**: User tries to read physical-only book
- **Response**: Explanation about physical books
- **Action**: Option to leave review instead

### Missing Book Files
- **Scenario**: Ebook assigned but file missing
- **Response**: Technical error with support contact
- **Action**: Fallback to book details page

## Security Considerations

### Access Control
- Library API checks user authentication
- Reading page verifies book ownership
- Admin endpoints require proper permissions
- No direct file access without verification

### Data Validation
- Book format validation before ereader access
- User ID validation in all operations
- Sanitized logging for audit trails
- SQL injection prevention

## Performance Optimizations

### Database
- Indexes on frequently queried columns
- Efficient joins in library queries
- Batch operations for bulk assignments
- Proper transaction handling

### Frontend
- Lazy loading of book covers
- Efficient state management
- Optimized re-renders
- Image caching and fallbacks

## Troubleshooting

### Books Not Appearing in Library
1. Check `book_assignments` table for active assignments
2. Verify `user_library` sync with assignments
3. Run sync script: `LibrarySyncService.syncAssignmentsToLibrary()`

### Cannot Read Assigned Books
1. Verify book format is 'ebook' or 'hybrid'
2. Check user has active library entry
3. Ensure ebook file exists and is accessible
4. Verify reading page access control logic

### Assignment Failures
1. Check admin permissions
2. Verify book and user exist
3. Look for duplicate assignment conflicts
4. Review audit logs for detailed errors

## Future Enhancements

### Planned Features
- Expiring book assignments
- Reading time limits
- Offline reading capabilities
- Enhanced progress tracking
- Social reading features

### Technical Improvements
- CDN integration for book files
- Advanced caching strategies
- Real-time sync notifications
- Enhanced error recovery
- Performance monitoring

## Files Modified/Created

### Core Integration Files
- `app/dashboard/LibrarySection.tsx` - Enhanced library display
- `app/reading/[bookId]/page.tsx` - Access control and ereader integration
- `app/api/dashboard/library/route.ts` - Unified library API
- `utils/library-sync-service.ts` - Assignment and sync logic

### Admin Management Files
- `app/admin/UserLibraryManagement.tsx` - Admin assignment interface
- `app/api/admin/users/[id]/library/route.ts` - Individual user library API
- `app/api/admin/users/library/bulk-assign/route.ts` - Bulk assignment API

### Setup and Testing Files
- `scripts/setup-book-assignments.js` - Database setup script
- `scripts/test-library-ereader-integration.js` - Integration test script

This integration ensures a seamless flow from admin book assignment to user reading experience, with proper access control, error handling, and performance optimization.