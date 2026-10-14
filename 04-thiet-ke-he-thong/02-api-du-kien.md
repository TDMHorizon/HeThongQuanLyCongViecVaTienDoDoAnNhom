# API dự kiến (REST)

Base: `/api`

## Auth
- `POST /auth/login`
- `POST /auth/logout` (nếu dùng blacklist/session; JWT thuần có thể bỏ)
- `GET /auth/me`

## Users (Admin)
- `GET /users`
- `POST /users`
- `PATCH /users/:id`
- `PATCH /users/:id/active`

## Projects & groups
- `GET /projects`
- `POST /projects`
- `GET /projects/:id`
- `PATCH /projects/:id`
- `PUT /projects/:id/members`
- `GET /projects/:id/dashboard`

## Milestones
- `GET /projects/:id/milestones`
- `POST /projects/:id/milestones`
- `PATCH /milestones/:id`
- `DELETE /milestones/:id`

## Tasks
- `GET /projects/:id/tasks`
- `POST /projects/:id/tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `PATCH /tasks/:id/progress`
- `POST /tasks/:id/lock-progress`
- `POST /tasks/:id/unlock-progress`

## Comments & files
- `GET /tasks/:id/comments`
- `POST /tasks/:id/comments`
- `POST /tasks/:id/attachments`
- `GET /attachments/:id/download`

## Notifications
- `GET /notifications`
- `PATCH /notifications/:id/read`
- `POST /notifications/remind` (GVHD gửi nhắc trực tiếp)

> Chi tiết body/response chốt khi implement; file này chỉ là danh mục endpoint.
