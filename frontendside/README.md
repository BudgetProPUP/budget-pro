-Dashboard
Log in page stays as is ( no revisions)
Forgot password now is aligned with the login UI
Date and time in the dashboard is now on the top of the nav bar beside the user profile
Sub tab (monthly, quarterly, yearly) stays as is, its responsive once you clicked it
Budget cards (dashboards) no revisions but i add in Total Budget a “As of now”
Graphs in the dashboard now use a line graph instead of a bar graph for better comparison.
The budget forecasting module graph is now present the actual spending vs. the budget proposal
The pie graph is moved to the budget per category card, and the full detailed information will show once the user clicks the view button 

--Budget proposals
Rejection comments: Add a field to specify why a proposal was rejected (category-specific free-text).
Approval metadata:
Track who approved/rejected the proposal.
Auto-generate timestamp (date + time with seconds).
Search function: Improve implementation (avoid repeated API calls).
Additional info: Include more details in proposals (e.g., vendor dropdowns/checkboxes if applicable).
Subject will be removed
The view/review buttons is now uniform in terms of size and font
The approval status pop-up will be added to the “budget proposal” page, making it scrollable
The reference number is now ticket ID
Add sub category

-Proposal history
Proposal ID to Ticket ID 
Proposal row should be “category”
Add subcategory row

-Ledger View
Reference ID is now ticket ID
The date shown in the ledger view is now the date of the approved proposal
Remove description, change into sub-subcategory
The account row will be changed once consulted with the thesis adviser
The search bar is now show “search” only
Remove the export button

-BudgetAllocation
Fix table
Add Pagination
Fix all Layout

-Budget Variance Report
Fix table

-Expense Tracking (to be consulted)
Auto-generate dates (make field read-only).
Mandatory fields: Vendor, employee, and category must be included when adding expenses.
Reference ID is now Ticket ID
Type row to category
Add subcategory row
Remove description
Remove accomplished row

-Expense History
Fix table
Add Pagination
Fix all Layout