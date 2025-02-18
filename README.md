# Video Calling Web Application

## Overview
This is a real-time video calling web application built using HTML, CSS, JavaScript, and Socket.IO. The project enables users to initiate and join video calls directly through their web browser without the need for external plugins.

## Features
- One-on-one video calling
- Real-time communication using WebRTC
- Socket.IO for signaling between peers
- Simple and user-friendly UI
- Secure and efficient connection handling

## Technologies Used
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **WebRTC:** For real-time audio and video streaming
- **Socket.IO:** For establishing and managing peer connections

## Installation
To run the application locally, follow these steps:

1. Clone the repository:
   ```sh
   git clone https://github.com/Tuhin054/Video-Calling-Web-Application.git
   ```
2. Navigate to the project directory:
   ```sh
   cd Video-Calling-Web-Application
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Start the server:
   ```sh
   node server.js
   ```
5. Open the application in your browser:
   ```
   http://localhost:3000
   ```

## Usage
- Open the application in your browser.
- Share the generated room ID with the person you want to call.
- Once the other user joins using the same room ID, the video call will start.

## Future Enhancements
- Group video calling feature
- Chat functionality during calls
- Improved UI/UX
- Authentication for users

## Contributing
Feel free to fork the repository and submit pull requests for improvements and bug fixes.

## License
This project is open-source and available under the [MIT License](LICENSE).

