Volunteer Management Backend
This is the backend for the Volunteer Management project. The backend is built using Node.js, Express, MongoDB (via Mongoose), and other tools for handling authentication, notifications, volunteer event management, and more. It also includes support for JWT-based authentication and integrates seamlessly with the front-end React.js app.

Table of Contents
Installation
Environment Variables
Project Structure
Scripts
API Endpoints
Technologies Used
Testing
Installation
Prerequisites
Node.js (v14+)
MongoDB (either locally or via MongoDB Atlas)
Steps to Install
Clone the repository:

bash
git clone (https://github.com/Joyboy713/volunteer_project_backend/branches)
cd volunteer_project_backend

Install dependencies:
bash
npm install

Set up environment variables:
Create a .env file in the root directory and add the required environment variables (see Environment Variables).

Run the application: For development:
bash
npm run dev

For production:
bash
npm start

Environment Variables:
The backend requires some environment variables to run. These should be placed in a .env file in the project root.
makefile
MONGO_URI=<your-mongodb-connection-string>
PORT=5000
JWT_SECRET=<your-jwt-secret-key>

Project Structure
bash
volunteer_project_backend/
├── src/                         # Main application source code
│   ├── controllers/             # Business logic and controllers
│   │   ├── eventController.js
│   │   ├── loginController.js
│   │   ├── userProfileManagementController.js
│   ├── data/                    # JSON files used in the project (example: for testing or seed data)
│   │   ├── notifications.json   # Notification data
│   │   ├── volunteerHistory.json
│   ├── Middleware/              # Middleware for request processing
│   │   ├── authmiddleware.js    # JWT authentication middleware
│   ├── models/                  # Mongoose schema definitions (MongoDB models)
│   │   ├── Event.js             # Event schema
│   │   ├── NotificationModel.js # Notification schema
│   │   ├── User.js              # User schema
│   │   ├── VolunteerHistory.js  # Volunteer history schema
│   ├── routes/                  # API routes for the app
│   │   ├── eventRoutes.js       # Routes for events
│   │   ├── login.js             # Routes for login
│   │   ├── notificationRoute.js # Routes for notifications
│   │   ├── userProfileManagement.js  # Routes for user profile management
│   │   ├── userRoutes.js        # Routes for user-related operations
│   │   ├── volunteerHistory.js  # Routes for volunteer history
│   │   ├── volunteerMatch.js    # Routes for volunteer matching
├── test/                        # Unit and integration tests for the application
│   ├── assignVolunteerToEvent.test.js  # Unit tests for assigning volunteers to events
│   ├── eventController.test.js         # Unit tests for eventController
│   ├── login.test.js                  # Unit tests for login route
│   ├── notification.test.js           # Unit tests for notification route
│   ├── userProfileManager.test.js     # Unit tests for user profile management
│   ├── userregistrationform.test.js   # Unit tests for user registration form
│   ├── userRoutes.test.js             # Unit tests for user routes
│   ├── volunteerHistory.test.js       # Unit tests for volunteer history
│   ├── volunteerMatch.test.js         # Unit tests for volunteer matching
├── uploads/                    # Folder for uploads (e.g., profile pictures or other files)
│   ├── ...                     # Any uploaded files will be saved here
├── .env                         # Environment variables (MONGO_URI, JWT_SECRET, etc.)
├── .gitignore                   # Files/folders to ignore in version control
├── babel.config.cjs             # Babel configuration for Jest testing
├── package.json                 # Project metadata and dependencies
├── package-lock.json            # Lock file for exact dependency versions
├── server.js                    # Main server entry point

Scripts
The project includes the following npm scripts:
npm run dev: Runs the application in development mode using nodemon.
npm start: Runs the application in production mode.
npm test: Runs the test suite using jest.
API Endpoints
The backend provides various RESTful API endpoints:

Users
POST /api/users/login: Log in a user using email and password.
POST /api/users/register: Register a new user.
Notifications
GET /api/users/notifications: Get notifications for the logged-in user.
POST /api/users/notifications: Create a new notification.
Volunteer History
GET /api/volunteerHistory: Retrieve volunteer history for users.
Events (Example)
GET /api/events: Retrieve a list of all events.
Technologies Used
Node.js: JavaScript runtime for server-side programming.
Express.js: Web framework for Node.js.
MongoDB: NoSQL database.
Mongoose: ODM library for MongoDB.
JWT (jsonwebtoken): JSON Web Tokens for authentication and authorization.
bcrypt: For password hashing.
multer: For file uploading.
Nodemailer: For sending emails.
CORS: Middleware to enable CORS.
dotenv: Environment variables management.
Jest: For unit and integration testing.
Supertest: For testing HTTP endpoints.

Testing
The project includes a basic setup for testing using Jest and Supertest.
To run tests:
bash
npm test
Example Test Setup
You can find test cases in the src/test/ folder. The tests are written using jest and focus on API functionality.

Contact
For any questions or feedback, feel free to reach out to the project maintainer:

Name: Xavier A Mares, Tan Huy Tran, Shinelle Rose Barretto, Widyan Mohammed Hussien
message.txt
6 KB