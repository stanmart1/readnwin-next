# Manual Verification Guide - Book Delete Functionality

## Prerequisites
1. Development server running (`npm run dev`)
2. Admin user logged in
3. Access to admin dashboard

## Test Steps

### 1. Single Book Delete Test

#### Step 1: Navigate to Book Management
- Go to `http://localhost:3000/admin`
- Click on "Book Management" in the sidebar
- Verify you can see the list of books

#### Step 2: Test Single Delete
- Find a book you want to delete (preferably a test book)
- Click the "Delete" button (trash icon) next to the book
- Verify the confirmation modal appears with:
  - Book title in the warning message
  - List of data that will be deleted
  - Cancel and Delete buttons

#### Step 3: Confirm Deletion
- Click "Delete Book" button
- Verify loading spinner appears
- Wait for success message: "Book deleted successfully"
- Verify book disappears from the list

#### Step 4: Verify Database Cleanup
- Check browser console for deletion logs
- Verify no errors in network tab
- Book should be completely removed from the system

### 2. Bulk Book Delete Test

#### Step 1: Select Multiple Books
- Use checkboxes to select 2-3 books
- Verify "X books selected" message appears
- Verify "Delete Selected" button appears in bulk actions bar

#### Step 2: Test Bulk Delete
- Click "Delete Selected" button
- Verify confirmation dialog appears with correct count
- Click "OK" to confirm

#### Step 3: Monitor Progress
- Verify loading state with "Deleting..." text
- Wait for success message
- Verify all selected books disappear from list

#### Step 4: Verify Results
- Check that only selected books were deleted
- Other books should remain in the list
- Verify no errors in console

### 3. Security Test

#### Step 1: Test Unauthorized Access
- Open a new incognito/private window
- Try to access `http://localhost:3000/admin/books`
- Should redirect to login page

#### Step 2: Test Non-Admin User
- Login with a regular user account
- Try to access admin book management
- Should show permission denied or redirect

### 4. Edge Case Tests

#### Test 1: Delete Book with Orders
- Find a book that has been ordered
- Try to delete it
- Should delete successfully and clean up order items

#### Test 2: Delete Book with Reviews
- Find a book with customer reviews
- Delete the book
- Verify reviews are also deleted

#### Test 3: Delete Book in Cart
- Add a book to cart as a regular user
- As admin, delete that book
- Verify book is removed from user's cart

## Expected Results

### ✅ Success Indicators
- Delete buttons work without errors
- Confirmation modals appear correctly
- Loading states show during operations
- Success messages appear after deletion
- Books disappear from the list
- No console errors
- Database cleanup is complete

### ❌ Failure Indicators
- Delete buttons don't respond
- Confirmation modals don't appear
- Loading states don't show
- Error messages appear
- Books remain in list after deletion
- Console errors
- Database inconsistencies

## Browser Console Monitoring

Watch for these log messages during testing:

```
🔍 Attempting to delete book {id}...
✅ Successfully deleted book "{title}" (ID: {id})
✅ Audit event logged
```

## Network Tab Monitoring

Check these API calls:
- `DELETE /api/admin/books/{id}` - Single delete
- `DELETE /api/admin/books?ids=1,2,3` - Bulk delete
- `GET /api/admin/books` - Refresh after deletion

## Database Verification (Optional)

If you have database access, verify:
```sql
-- Check if book is completely removed
SELECT * FROM books WHERE id = {deleted_book_id};

-- Check related tables are cleaned up
SELECT * FROM order_items WHERE book_id = {deleted_book_id};
SELECT * FROM book_reviews WHERE book_id = {deleted_book_id};
SELECT * FROM cart_items WHERE book_id = {deleted_book_id};
SELECT * FROM user_library WHERE book_id = {deleted_book_id};
```

All queries should return no results for a successfully deleted book.

## Troubleshooting

### Common Issues

1. **Delete button not working**
   - Check if user has admin permissions
   - Verify authentication is active
   - Check browser console for errors

2. **Confirmation modal not appearing**
   - Check for JavaScript errors
   - Verify React components are loading
   - Check network connectivity

3. **Books not disappearing after deletion**
   - Check API response in network tab
   - Verify database connection
   - Check for foreign key constraint errors

4. **Bulk delete not working**
   - Verify books are properly selected
   - Check API endpoint is correct
   - Monitor network requests

### Debug Steps

1. Open browser developer tools
2. Go to Console tab
3. Go to Network tab
4. Perform delete operations
5. Check for errors in both tabs
6. Verify API responses are successful

## Success Criteria

The book delete functionality is working correctly if:

✅ Single book delete works with confirmation
✅ Bulk book delete works with confirmation  
✅ Books are completely removed from database
✅ Related data is properly cleaned up
✅ Security checks prevent unauthorized access
✅ User interface provides clear feedback
✅ No errors in browser console
✅ No errors in network requests

If all criteria are met, the delete functionality is **fully operational**. 