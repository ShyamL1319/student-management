---
name: manual-testing
description: Steps and scenarios for verifying backend and frontend changes through manual testing.
---

# Manual Testing & Verification Guide

This skill outlines the standard manual testing scenarios to execute after making changes to the application (specifically frontend-backend integrations like the Student Dashboard) to ensure all components function as expected.

## Testing Prerequisites
1. Ensure the backend and database are running:
   ```bash
   # In backend/ directory
   npm run start:dev
   ```
2. Ensure the frontend server is running:
   ```bash
   # In frontend/ directory
   npm run dev
   ```
3. Verify that the database is seeded:
   If testing fresh configurations, seed the database with test profiles using:
   ```bash
   # In backend/ directory
   node init-db.js
   ```

---

## Testing Scenarios

### Scenario 1: Authentication & Role-Based Access Control (RBAC)
- **Goal:** Verify that logging in with a specific role loads the correct dashboard.
- **Steps:**
  1. Open the browser and go to `http://localhost:5173/login`.
  2. Log in using student credentials (e.g. `student1@school.com` / `password123` or seeded credentials).
  3. Verify that you are redirected to `/dashboard`.
  4. Inspect the top welcome banner role tag and verify it says `STUDENT`.
  5. Try to navigate manually to an admin route like `/users` or `/fee-collections`.
- **Expected Result:**
  - Student is logged in and redirected to the Student Dashboard view.
  - Attempting to access admin routes results in a redirect to dashboard / access denied notice (enforced by `ProtectedRoute` route guards).

### Scenario 2: Student Profile Card & Summary Stats Card Verification
- **Goal:** Verify that the student profile and numeric stat metrics render real-time database values.
- **Steps:**
  1. Look at the hero banner on the dashboard.
  2. Inspect the Name, ID, Class-Section, and Academic Year. Compare these with the database record for that student.
  3. Look at the stat cards for:
     - **Attendance** percentage (e.g. `92%`).
     - **Current GPA** (e.g. `3.8`).
     - **Pending** assignments count.
     - **Completed** assignments count.
     - **Upcoming Exams** count.
     - **Subjects Enrolled** count.
     - **Today's Classes** count.
- **Expected Result:**
  - Student details match the db user record.
  - Calculations for GPA, attendance rates, and assignment counts are correct and no static `MOCK_STUDENT` fallbacks are shown.

### Scenario 3: Timetable & Live Classes Integration
- **Goal:** Verify today's class schedule and the "LIVE" status check.
- **Steps:**
  1. Locate the **Today's Schedule** panel.
  2. Check if the listed classes, subject names, teachers, time intervals, and room numbers match today's day of week in the `timetables` database collection.
  3. Change the time of a timetable slot to overlap with the current time in the database.
  4. Refresh the page and verify that the slot shows a **LIVE** chip and a **Join** button.
  5. Verify that clicking **Join** triggers navigation or open video actions.
- **Expected Result:**
  - Schedule matches the day.
  - Active slot highlights correctly as LIVE.

### Scenario 4: Assignment Tabs (Pending / Submitted / Graded)
- **Goal:** Verify assignment filtering and status rendering.
- **Steps:**
  1. Go to the **Assignment Center**.
  2. Click the **Pending** tab. Verify that pending assignments are listed and show correct priority colors (red for high, yellow for medium, green for low).
  3. Click the **Submitted** tab. Verify submitted items display.
  4. Click the **Graded** tab. Verify that graded assignments are shown and display their correct grades (e.g., `A`, `B`).
- **Expected Result:**
  - List filters correctly based on the selected tab status.
  - Grades and priorities match database submission values.

### Scenario 5: Exams & Countdowns
- **Goal:** Verify upcoming exams list.
- **Steps:**
  1. Check the **Upcoming Exams** block.
  2. Verify that exams are sorted by countdown days remaining.
  3. Check the progress bar on the exam card: it should increase as the exam date approaches.
- **Expected Result:**
  - Countdown is calculated correctly relative to current date.
  - Exams with zero countdown or past dates are excluded.

### Scenario 6: Attendance Breakdown & Warnings
- **Goal:** Verify subject-wise attendance percentages and threshold warning indicators.
- **Steps:**
  1. Scroll to **Attendance Management**.
  2. Verify that each enrolled subject is listed with correct attended/total numbers and percentage.
  3. If attendance is `< 75%`, verify that the card turns light red and shows a warning icon.
  4. If attendance is between `75%` and `85%`, verify that it shows caution styling (yellow outline).
- **Expected Result:**
  - Visual indicators change dynamically based on the percentage values.

### Scenario 7: Fees & Payment Status
- **Goal:** Verify dynamic invoice summary, dues alert, and history list.
- **Steps:**
  1. Locate **Fees & Payments** card.
  2. Verify the Paid and Outstanding amounts match invoices.
  3. If outstanding is `> 0`, verify that a warning Alert displays with the correct due date.
  4. Verify that the history list renders all past invoices with correct statuses (paid/pending) and amounts.
- **Expected Result:**
  - Calculations are mathematically correct.
  - Currency values are formatted properly.

### Scenario 8: Announcements, Achievements, and Rank
- **Goal:** Verify that notifications map to announcements and rank displays correctly.
- **Steps:**
  1. Check **Announcements & Notices**. Verify the list matches in-app notifications.
  2. Check **Achievements & Rewards**. Verify badges display conditionally (e.g. perfect attendance badge shows only if attendance is `>= 95%`).
  3. Inspect the Class Rank badge. Verify it displays `Class Rank: #X` and matching percentile summary calculated dynamically.
- **Expected Result:**
  - Badges render conditionally.
  - Rank matches class evaluation scores.

### Scenario 9: Communications & Messaging
- **Goal:** Verify recent message indicators.
- **Steps:**
  1. Look at the **Communication** section.
  2. Verify the sender initials, name, message snippet, and unread count bubble match the message documents.
- **Expected Result:**
  - Message summary lists recent chats.

### Scenario 10: Empty State Handlers
- **Goal:** Verify clean fallback states when there is no data in the database.
- **Steps:**
  1. Seed a new student in the database who has no timetables, no exams, no assignments, no notifications, and no fee invoices.
  2. Log in as this new student.
  3. Verify that:
     - Today's schedule displays: *"No classes scheduled for today."*
     - GPA Growth shows: *"No GPA history available."*
     - Subject scores show: *"No subject scores available."*
     - Assignments tabs show: *"No assignments found in this category."*
     - Upcoming Exams shows: *"No upcoming exams scheduled."*
     - Subject Attendance shows: *"No subject attendance breakdown records found."*
     - Fees History shows: *"No fee invoices or records found."*
     - Learning Resources shows: *"No learning resources available."*
     - Announcements shows: *"No announcements or notices."*
     - Achievements shows: *"No achievements unlocked yet."*
     - Class Rank shows: *"Class rank will update after term evaluations."*
     - Communications shows: *"No recent messages."*
- **Expected Result:**
  - No errors or page crashes.
  - Centered placeholder text displays neatly for each empty section instead of blank white cards.
