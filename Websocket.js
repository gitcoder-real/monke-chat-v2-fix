// Establish a WebSocket connection
const socket = new WebSocket("ws://localhost:3000");

// Handle WebSocket connection open event
socket.addEventListener("open", function (event) {
  console.log("WebSocket connection established.");
});

// Handle WebSocket message event
socket.addEventListener("message", function (event) {
  const newMessage = event.data;
  displayMessage(newMessage);
  output.scrollTop = output.scrollHeight;
});

// Handle WebSocket close event
socket.addEventListener("close", function (event) {
  console.log("WebSocket connection closed. Attempting to reconnect...");
  setTimeout(connectWebSocket, 2000);
});

// Handle WebSocket error event
socket.addEventListener("error", function (event) {
  console.error("WebSocket error:", event);
});
