// Move the WebSocket connection code to a separate JavaScript file
// so it can be loaded separately and executed by the browser.
document.addEventListener("DOMContentLoaded", function () {
  const output = document.getElementById("output");
  const usernameInput = document.getElementById("username");
  const messageInput = document.getElementById("message");
  const sendBtn = document.getElementById("send-btn");
  let messageCount = 0;
  let lastMessageTime = null;
  let spamWarningTimeout = null;

  // Check if username is already stored in localStorage
  const storedUsername = localStorage.getItem("username");
  if (storedUsername) {
    usernameInput.value = storedUsername;
  }

  // Check if messages are already stored in localStorage
  const storedMessages = localStorage.getItem("messages");
  if (storedMessages) {
    output.innerHTML = storedMessages;
  }

  // Send message through WebSocket
  function sendMessage() {
    const username = usernameInput.value.trim();
    let message = messageInput.value.trim();

    if (username === "" || message === "") {
      return;
    }

    if (message.startsWith("//info")) {
      message = message.replace("//info", "").trim();
      const infoMessage = `<p class="info-message">${message}</p>`;
      displayMessage(infoMessage);
      socket.send(infoMessage);
    } else if (message === "//clear") {
      output.innerHTML = "";
      localStorage.removeItem("messages");
      socket.send(message);
    } else if (message.startsWith("?color")) {
      const colorMessage = message.replace("?color", "").trim();
      const colorRegex = /(\w+)\s+(.*)/;
      const match = colorMessage.match(colorRegex);

      if (match && match[1] && match[2]) {
        const color = match[1];
        const text = match[2];
        const coloredMessage = `<p style="color: ${color}">${text}</p>`;
        displayMessage(coloredMessage);
        socket.send(coloredMessage);
      }
    } else if (message.startsWith("//remove")) {
      const removeMessage = message.replace("//remove", "").trim();
      const messageElements = output.getElementsByTagName("p");
      const messagesToRemove = [];

      for (let i = 0; i < messageElements.length; i++) {
        const messageText = messageElements[i].textContent;

        if (messageText.includes(removeMessage)) {
          messagesToRemove.push(messageElements[i]);
        }
      }

      messagesToRemove.forEach(function (messageElement) {
        messageElement.remove();
      });

      socket.send(message);
    } else {
      const timestamp = new Date().toLocaleString();
      const newMessage = `<p><strong>${username}:</strong> ${message} <span class="timestamp">| ${timestamp}</span></p>`;
      displayMessage(newMessage);

      const currentMessageTime = new Date().getTime();
      if (lastMessageTime && currentMessageTime - lastMessageTime < 10000) {
        messageCount++;
        if (messageCount > 5) {
          displaySpamWarning();
          socket.send(`<p class="spam-warning">Spam warning!</p>`);
        }
      } else {
        messageCount = 1;
        clearTimeout(spamWarningTimeout);
      }
      lastMessageTime = currentMessageTime;

      socket.send(newMessage);
    }

    messageInput.value = "";
  }

  // Display the received message
  function displayMessage(message) {
    output.innerHTML += message;
    localStorage.setItem("messages", output.innerHTML);
  }
  
  // Display spam warning
  function displaySpamWarning() {
    const spamWarning = `<p class="spam-warning">Spam warning!</p>`;
    displayMessage(spamWarning);
  }

  // Send button click event
  sendBtn.addEventListener("click", function () {
    sendMessage();
  });

  // Enter key press event
  messageInput.addEventListener("keydown", function (event) {
    if (event.keyCode === 13) {
      sendMessage();
    }
  });

  // Save username in localStorage on input change
  usernameInput.addEventListener("input", function () {
    const username = usernameInput.value.trim();
    localStorage.setItem("username", username);
  });

  // Listen for changes in localStorage from other tabs
  window.addEventListener("storage", function (event) {
    if (event.key === "messages" && event.newValue !== output.innerHTML) {
      output.innerHTML = event.newValue;
      output.scrollTop = output.scrollHeight;
    }
  });
});
