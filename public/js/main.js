// Get references to DOM elements
const createUserBtn = document.getElementById("create-user");
const username = document.getElementById("username");
const allusersHtml = document.getElementById("allusers");
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const endCallBtn = document.getElementById("end-call-btn");
const socket = io(); // Initialize socket.io connection
let localStream; // Store the local media stream
let caller = []; // Store caller information

// Singleton for creating and managing a peer connection
const PeerConnection = (function () {
    let peerConnection; // Private peer connection instance

    // Function to create a new peer connection
    const createPeerConnection = () => {
        const config = {
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302' // Use Google's STUN server
                }
            ]
        };
        peerConnection = new RTCPeerConnection(config);

        // Add local media tracks to the peer connection
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        // Handle incoming remote media streams
        peerConnection.ontrack = function (event) {
            remoteVideo.srcObject = event.streams[0];
        };

        // Handle ICE candidates and send them to the signaling server
        peerConnection.onicecandidate = function (event) {
            if (event.candidate) {
                socket.emit("icecandidate", event.candidate);
            }
        };

        return peerConnection;
    };

    return {
        // Singleton pattern: return the same instance of peer connection
        getInstance: () => {
            if (!peerConnection) {
                peerConnection = createPeerConnection();
            }
            return peerConnection;
        }
    };
})();

// Handle the "Create User" button click event
createUserBtn.addEventListener("click", (e) => {
    if (username.value !== "") {
        const usernameContainer = document.querySelector(".username-input");
        socket.emit("join-user", username.value); // Notify the server of the new user
        usernameContainer.style.display = 'none'; // Hide the username input field
    }
});

// Handle the "End Call" button click event
endCallBtn.addEventListener("click", (e) => {
    socket.emit("call-ended", caller); // Notify the server that the call has ended
});

// Handle "joined" event to display the list of users
socket.on("joined", allusers => {
    console.log({ allusers });

    // Function to create the list of users in the UI
    const createUsersHtml = () => {
        allusersHtml.innerHTML = "";

        for (const user in allusers) {
            const li = document.createElement("li");
            li.textContent = `${user} ${user === username.value ? "(You)" : ""}`; // Highlight the current user

            if (user !== username.value) {
                const button = document.createElement("button");
                button.classList.add("call-btn");
                button.addEventListener("click", (e) => {
                    startCall(user); // Start a call when the button is clicked
                });
                const img = document.createElement("img");
                img.setAttribute("src", "/images/phone.png");
                img.setAttribute("width", 20);

                button.appendChild(img);
                li.appendChild(button);
            }

            allusersHtml.appendChild(li);
        }
    };

    createUsersHtml();
});

// Handle incoming call offers
socket.on("offer", async ({ from, to, offer }) => {
    const pc = PeerConnection.getInstance();
    await pc.setRemoteDescription(offer); // Set the received offer as the remote description
    const answer = await pc.createAnswer(); // Create an answer
    await pc.setLocalDescription(answer); // Set the local description
    socket.emit("answer", { from, to, answer: pc.localDescription }); // Send the answer back
    caller = [from, to]; // Update caller information
});

// Handle incoming call answers
socket.on("answer", async ({ from, to, answer }) => {
    const pc = PeerConnection.getInstance();
    await pc.setRemoteDescription(answer); // Set the received answer as the remote description
    endCallBtn.style.display = 'block'; // Show the "End Call" button
    caller = [from, to]; // Update caller information
});

// Handle incoming ICE candidates
socket.on("icecandidate", async candidate => {
    console.log({ candidate });
    const pc = PeerConnection.getInstance();
    await pc.addIceCandidate(new RTCIceCandidate(candidate)); // Add the ICE candidate to the peer connection
});

// Handle the end of a call
socket.on("end-call", ({ from, to }) => {
    endCallBtn.style.display = "block"; // Show the "End Call" button
});

// Handle call-ended event and end the call
socket.on("call-ended", (caller) => {
    endCall();
});

// Function to start a call
const startCall = async (user) => {
    console.log({ user });
    const pc = PeerConnection.getInstance();
    const offer = await pc.createOffer(); // Create an offer
    console.log({ offer });
    await pc.setLocalDescription(offer); // Set the local description
    socket.emit("offer", { from: username.value, to: user, offer: pc.localDescription }); // Send the offer
};

// Function to end a call
const endCall = () => {
    const pc = PeerConnection.getInstance();
    if (pc) {
        pc.close(); // Close the peer connection
        endCallBtn.style.display = 'none'; // Hide the "End Call" button
    }
};

// Initialize the app by starting the local video stream
const startMyVideo = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true }); // Get access to audio and video
        console.log({ stream });
        localStream = stream; // Save the local stream
        localVideo.srcObject = stream; // Display the local video
    } catch (error) {
        console.error("Error accessing media devices:", error);
    }
};

startMyVideo(); // Start the video stream
