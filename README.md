# Voluntary Ambulance Services(VAS) Backend

## Overview

This project is a full-stack web application built using React.js for the frontend and Node.js/Express for the backend. It is designed to facilitate transportation assistance by the volunteers for patients with non-urgent cases. The application has two login controls, one for the volunteer providing service and the other for patient requesting assistance.This project includes features such as volunteer and patient registration, logging in, viewing assistance requests, and managing user accounts.

## Features

- Registration and Authentication: Users(Both Patient and Volunteer) can register, log in, and manage their profiles.
- Requests: View past, current, and future assistance requests
- Map integration for ride requests
- User account management
- Help and FAQ sections
- Responsive Design: Works seamlessly on mobile and desktop devices.

## Technologies

- **Frontend:** React.js, Bootstrap
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT)
- **Google Maps API Integration**
- **Toast Notifications:** For feedback and error handling

## Prerequisites 

Before running this project locally, ensure to have the following installed:
 
- Node.js
- MongoDB
- A Google Maps API key

## Installation

### Clone the repository
```bash
git clone https://github.com/PreethamVenkatesh/VASBackend.git
cd VASBACKEND
```
#### Install dependencies
- For Backend
```bash
npm install
```
- For Frontend
```bash
npm install
```
### Environment Variables
Create a `.env` file in the `backend` directory and add the following:

MONGODB_URL= mongodb+srv://manasa4960:e1SNlu1jrWAaPzL7@cluster0.cykplsz.mongodb.net/VASLiftAssist?retryWrites=true&w=majority&appName=Cluster0


## Start the Application

```bash
# Start the backend server
cd backend
npm start
 
The server will run at `http://localhost:8888`

# Start the frontend application
cd frontend
npm start

The application will be running on 'http://localhost:3000'
```

## API Endpoints

### Customer Routes
- 'POST/api/custregister': Customer registration
- 'POST/api/custlogin': Customer login
- 'GET/api/custdetails': Fetch Customer details
- 'PUT/api/custupdate': Updates customer details
- 'POST/api/userlocation': Submit customer location
- 'GET/userlocations': Fetch customer location
- 'POST/api/futurelocation': Book a future ride
- 'GET/api/futurebookings': Fetch future ride bookings
- 'GET/api/booking-status/:customerEmailId': Fetch booking confirmation
- 'GET/api/volunteer-location/:email': Fetch volunteer location
- 'POST/api/booking/:bookingId/rating': Submit a booking rating and feedback

### Volunteer Routes
- 'POST/api/signup': Volunteer signup
- 'POST/api/login': Volunteer login
- 'POST/api/verify-vehicle': Volunteer vehicle verification
- 'GET/api/user': Fetch volunteer user details
- 'POST/api/verify-email': Volunteer email address verification
- 'PUT/api/update-profile': Udpate volunteer details
- 'GET/api/locations/:emailId': Fetch volunteer's booking details
- 'POST/api/update-availability': Update volunteer's availability
- 'POST/api/update-status': Update volunteer's status
- 'POST/api/update-location': Update volunteer's location
- 'POST/api/update-booking-status': Update volunteer's booking status
- 'POST/api/update-ride-status': Update volunteer's ride status
- 'GET/api/verify-volunteer/:allocatedVolunteerEmail': Fetch allocated volunteer's details through email address
- 'POST/api/upload-profile-picture': Upload profile picture
- 'GET/api/completed-rides': Fetch completed rides

## Project Structure

```
VASBACKEND/
├── backend/             # Backend API (Node.js, Express)
├── frontend/            # Frontend Application (React.js)
├── .env                 # Environment file
├── README.md            # Project documentation
└── package.json         # Project dependencies
```

## File Structure
 
```
VASBACKEND/
│
├── controllers/        # Controller logic for various resources
├── middleWare/         # Custom middleware (e.g., CORS)
├── models/             # Mongoose schemas for database entities
├── routes/             # Route handlers for API endpoints
├── uploads/            # Directory for storing uploaded images
├── config/             # Environment configuration (e.g., database connection)
├── db/                 # Database connection logic
├── .env                # Environment variable file
├── app.js              # Main application setup
├── server.js           # Entry point for starting the server
└── README.md           # Project documentation
```

## Contributing
 
Contributions are welcome! Please fork the repository and submit a pull request.
 
## Contact
 
For any questions or inquiries, please contact:
 
- emailId - manasa4960@gmail.com/ preethamvenkky@gmail.com