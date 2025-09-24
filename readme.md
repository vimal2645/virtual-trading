Virtual Trader Platform
A virtual trading platform to practice trading with virtual money in a safe environment.
Includes a React frontend (client) and Node.js/Express backend (server) with MongoDB.

Project Structure

virtual-trader/
├── client/         # React frontend
├── server/         # Node.js backend
├── README.md       # This file
├── .gitignore      # Root gitignore
├── client/.gitignore
└── server/.gitignore
Prerequisites
Node.js (v16 or above) and npm installed

MongoDB Atlas account for cloud database (or local MongoDB)

Git (for cloning and version control)

Setup & Running Locally
Backend (server)
Go to server folder:


cd server
Install dependencies:


npm install
Create a .env file in server/ with the following (replace placeholders):


PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
Start the backend server:


npm run dev
The backend runs at http://localhost:5000 by default.

Frontend (client)
Go to client folder:


cd client
Install dependencies:


npm install
Create a .env file in client/ with backend URL:


VITE_API_URL=http://localhost:5000
Start the development frontend server:


npm run dev