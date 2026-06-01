# Courses and Subjects

This document describes the newly added `Course` and `Subject` modules.

Backend endpoints:

- `POST /courses` - Create course (requires department id)
- `GET /courses` - List courses (supports pagination/filter)
- `GET /courses/:id` - Get course
- `PATCH /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

- `POST /subjects` - Create subject (optional course, assign teachers)
- `GET /subjects` - List subjects
- `GET /subjects/:id` - Get subject
- `PATCH /subjects/:id` - Update subject
- `DELETE /subjects/:id` - Delete subject

Frontend:

- `Courses` page: list/create/edit/delete courses, map to departments.
- `Subjects` page: list/create/edit/delete subjects, assign teachers and map to courses.

Notes:

- Backend services validate referenced Department/Course/Teacher existence and return 404 on missing references.
- Frontend pages use existing `departmentApi`, `coursesApi`, and `teachersApi` clients.
