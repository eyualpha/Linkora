# Linkora Backend API

Linkora is an Express + MongoDB REST API for a lightweight social app. It handles user auth with email OTP verification, posts with image uploads (Cloudinary), likes, comments, and follow relationships. This README explains how it is built, how to run it locally, and the available endpoints.

## Stack

- Node.js, Express 5
- MongoDB with Mongoose
- JWT auth
- Multer + Cloudinary for media uploads (images)
- Nodemailer + Gmail for OTP delivery
- Helmet, CORS, body-parser for hardening and parsing

## Project layout

- `server/index.js` – App bootstrap, middleware, routing, error handler
- `server/configs/` – Env, MongoDB connection, Cloudinary, Nodemailer
- `server/routes/` – Route definitions by resource
- `server/controllers/` – Request handlers for auth, posts, comments, follows, users, likes
- `server/middlewares/` – JWT auth guard, upload pipeline
- `server/models/` – Mongoose schemas (user, post, comment, follow)

## Prerequisites

- Node.js 18+
- MongoDB instance URI
- Cloudinary account
- Gmail account with an App Password for SMTP

## Environment variables

Create `server/.env` with:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## Local setup

1. Install dependencies:
   ```bash
   cd server
   npm install
   ```
2. Add the `.env` file shown above under `server/`.
3. Start the API:
   ```bash
   npm run dev   # nodemon
   # or
   npm start
   ```
4. The server listens on `PORT` (default `5000`). Health check: `GET /` → `API is running...`.

## Runtime behavior

- CORS: allows `https://link-ora.vercel.app` and `http://localhost:5173` with credentials.
- Database: each request ensures a MongoDB connection is ready before proceeding.
- Auth: JWT Bearer tokens via `Authorization: Bearer <token>`; generated on login.
- Uploads: Multer + Cloudinary; only image MIME types are accepted, max 2 files per post/update, max 50 MB each.
- Errors: Centralized error handler returns `{ message }` with HTTP 500 on unhandled exceptions.

## Authentication flow

1. **Register** issues a 10-minute OTP emailed to the user; the account remains unverified until OTP is confirmed.
2. **Verify registration OTP** marks the account verified.
3. **Login** returns a JWT token only for verified users.
4. **Forgot / reset password** uses a separate OTP sent to email.

## Endpoints

Base URL prefix: `/api`

### Auth

| Method | Path                     | Auth | Body                                        | Purpose                                |
| ------ | ------------------------ | ---- | ------------------------------------------- | -------------------------------------- |
| POST   | `/auth/register`         | No   | fullname, username, email, password, gender | Create account + send registration OTP |
| POST   | `/auth/verify-otp`       | No   | userId, otp                                 | Verify registration OTP                |
| POST   | `/auth/login`            | No   | email, password                             | Login and receive JWT                  |
| POST   | `/auth/forgot-password`  | No   | email                                       | Send password-reset OTP                |
| POST   | `/auth/verify-reset-otp` | No   | email, otp                                  | Verify password-reset OTP              |
| POST   | `/auth/reset-password`   | No   | email, otp, newPassword                     | Set new password after OTP             |

### Users

| Method | Path                    | Auth   | Body / Form                                                                            | Purpose                        |
| ------ | ----------------------- | ------ | -------------------------------------------------------------------------------------- | ------------------------------ |
| PUT    | `/users/update-profile` | Bearer | Multipart form: `profilePicture?`, `coverPicture?`; fields: fullname?, bio?, username? | Update profile info and images |

### Posts

| Method | Path                  | Auth   | Body / Form                                                         | Purpose                              |
| ------ | --------------------- | ------ | ------------------------------------------------------------------- | ------------------------------------ |
| GET    | `/posts`              | Bearer | –                                                                   | List all posts (latest first)        |
| POST   | `/posts`              | Bearer | text?; up to 2 image files under `file`                             | Create a post (text and/or images)   |
| GET    | `/posts/:id`          | Bearer | –                                                                   | Get single post + comments           |
| PUT    | `/posts/:id`          | Bearer | text?, removeFiles? (public_id or url); up to 2 images under `file` | Update own post (max 2 images total) |
| DELETE | `/posts/:id`          | Bearer | –                                                                   | Delete own post and its comments     |
| PUT    | `/posts/like/:id`     | Bearer | –                                                                   | Toggle like on a post                |
| GET    | `/posts/user/:userId` | Bearer | –                                                                   | List posts by user                   |

### Comments

| Method | Path                | Auth   | Body    | Purpose                 |
| ------ | ------------------- | ------ | ------- | ----------------------- |
| POST   | `/comments/:postId` | Bearer | content | Add comment to a post   |
| GET    | `/comments/:postId` | No     | –       | List comments on a post |
| DELETE | `/comments/:id`     | Bearer | –       | Delete own comment      |

### Follows

| Method | Path                          | Auth   | Body | Purpose                                |
| ------ | ----------------------------- | ------ | ---- | -------------------------------------- |
| POST   | `/follows/follow/:userId`     | Bearer | –    | Follow a user                          |
| POST   | `/follows/unfollow/:userId`   | Bearer | –    | Unfollow a user                        |
| GET    | `/follows/status/:userId`     | Bearer | –    | Check if current user follows `userId` |
| GET    | `/follows/:userId/followers`  | Bearer | –    | List followers of `userId`             |
| GET    | `/follows/:userId/followings` | Bearer | –    | List accounts `userId` follows         |

## Sample requests

- Register:
  ```bash
  curl -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"fullname":"Ada Lovelace","username":"adal","email":"ada@example.com","password":"pass1234","gender":"female"}'
  ```
- Login:
  ```bash
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"ada@example.com","password":"pass1234"}'
  ```
- Create post with two images:
  ```bash
  curl -X POST http://localhost:5000/api/posts \
    -H "Authorization: Bearer $TOKEN" \
    -F "text=Hello world" \
    -F "file=@/path/to/img1.jpg" \
    -F "file=@/path/to/img2.jpg"
  ```

## Notes

- Only image uploads are allowed; other MIME types are rejected.
- Posts are limited to 2 images; updates that exceed this cap are rejected.
- Follow actions prevent following yourself and duplicate follows.
- Comment and post deletes require ownership; verification is enforced server-side.

## Deployment

The project is Vercel-ready: `index.js` exports the Express app when `process.env.VERCEL` is set. You can deploy the `server/` directory as a Vercel serverless function set; ensure all environment variables are configured in Vercel.

## Contact

For questions or collaboration, reach out at: eyuashenafi533@gmail.com
