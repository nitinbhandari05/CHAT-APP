# Chat App

A real-time MERN chat app with Socket.IO, live notifications, typing indicators, online presence, message search, attachments, and a WhatsApp-style frontend.

## Features

- Email or username login
- 1:1 chat creation
- Real-time messaging
- Typing indicator
- Online user tracking
- Live notifications
- Search users to start chats
- File/image attachment support through data URLs
- Dark/light theme toggle
- Password change and logout

## Tech Stack

- Node.js
- Express
- MongoDB / Mongoose
- Socket.IO
- Vanilla HTML/CSS/JS frontend

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file:

```env
PORT=5051
MONGO_URI=mongodb://127.0.0.1:27017/MyChatApp
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=10d
```

3. Start MongoDB locally.

4. Run the app:

```bash
npm run dev
```

5. Open the app in your browser:

```text
http://localhost:5051
```

## API Routes

- `POST /api/v1/users/register`
- `POST /api/v1/users/login`
- `GET /api/v1/users/current-user`
- `GET /api/v1/users/search?q=...`
- `POST /api/v1/users/change-password`
- `POST /api/v1/users/logout`
- `POST /api/v1/chats/1-1`
- `GET /api/v1/chats`
- `POST /api/v1/messages/send`
- `GET /api/v1/messages/:chatId`
- `GET /api/v1/notifications`
- `PUT /api/v1/notifications/:id`

## Deploy Notes

- Set `NODE_ENV=production`
- Configure `MONGO_URI` for your hosted MongoDB instance
- Set `CORS_ORIGIN` to your deployed frontend URL
- Use `npm start` as the production command
- Make sure your deployment platform exposes the `PORT` environment variable

## Socket Events

- `setup`
- `connected`
- `online users`
- `join chat`
- `typing`
- `stop typing`
- `new message`
- `message received`
- `notification received`
- `notification read`

