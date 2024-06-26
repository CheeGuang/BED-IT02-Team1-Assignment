document.addEventListener("DOMContentLoaded", function () {
  const chatbotContainer = document.createElement("div");
  chatbotContainer.innerHTML = `
    <button id="open-chatbot" class="chatbot-button">
      <img src="./images/HealthBuddy.png" alt="Chatbot" />
    </button>
    <div id="chatbot-container" class="chatbot-container">
      <div id="chatbot-header" class="chatbot-header">
        <img src="./images/HealthBuddy.png" alt="HealthBuddy" class="chatbot-icon" />
        <span class="chatbot-title">Health Buddy</span>
        <button id="close-chatbot" class="close-chatbot">&times;</button>
      </div>
      <div id="chatbot-body" class="chatbot-body">
        <div id="chatbot-messages" class="chatbot-messages"></div>
        <div id="chatbot-input-container" class="chatbot-input-container">
          <input type="text" id="chatbot-input" class="form-control" placeholder="Type a message..." />
          <button id="send-message" class="btn btn-dark">Send</button>
        </div>
      </div>
      <div class="chatbot-footer">
        Powered by OpenAI
      </div>
    </div>
  `;

  document.body.appendChild(chatbotContainer);

  const chatbotInterface = document.getElementById("chatbot-container");
  const openChatbotButton = document.getElementById("open-chatbot");
  const closeChatbotButton = document.getElementById("close-chatbot");
  const sendMessageButton = document.getElementById("send-message");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotMessages = document.getElementById("chatbot-messages");

  let welcomeMessageShown = false;
  let chatSessionId = null;

  openChatbotButton.addEventListener("click", function () {
    chatbotInterface.style.display = "flex";
    openChatbotButton.style.display = "none";
    if (!welcomeMessageShown) {
      initializeChatbot();
      welcomeMessageShown = true;
    }
  });

  closeChatbotButton.addEventListener("click", function () {
    chatbotInterface.style.display = "none";
    openChatbotButton.style.display = "block";
  });

  sendMessageButton.addEventListener("click", function () {
    const message = chatbotInput.value.trim();
    if (message) {
      addMessage("user", message);
      chatbotInput.value = "";
      sendToChatGPT(message);
    }
  });

  function addMessage(sender, message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chatbot-message ${sender}`;
    messageDiv.innerText = message;
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  async function initializeChatbot() {
    const response = await fetch(
      `${window.location.origin}/api/chatbot/initialize`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patientId: 1 }), // Replace with actual patient ID
      }
    );

    const data = await response.json();
    chatSessionId = data.chatSessionId;

    addMessage(
      "bot",
      "Hello! I am Health Buddy. I am here to answer any queries you have. How can I assist you today? If you are feeling severely sick, please consult a doctor immediately."
    );
  }

  async function sendToChatGPT(message) {
    const response = await fetch(
      `${window.location.origin}/api/chatbot/send-message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatSessionId, patientId: 1, message }), // Replace with actual patient ID
      }
    );

    const data = await response.json();
    const reply = data.response.trim();
    addMessage("bot", reply);
  }
});
