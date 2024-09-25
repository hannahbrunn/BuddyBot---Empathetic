let currentStepIndex = 0;  // Track which question in the flow we're on
let currentOptions = {};  // Store current options
let userName = '';  // Global variable to store user's name
let ConversationFlow = []; // Initialize ConversationFlow
let autoScrollEnabled = true; // Control for auto-scrolling

// Function to load and parse TSV data
async function loadTSV() {
  const response = await fetch('questions.tsv'); // Update with your TSV file path
  const text = await response.text();
  
  const rows = text.split('\n').map(row => row.split('\t'));
  rows.forEach((row, index) => {
    if (index > 0) { // Skip header row
      const question = row[0].replace(/{userName}/g, userName); // Replace placeholder
      const options = {};
      for (let i = 1; i < row.length; i += 2) {
        if (row[i] && row[i + 1]) {
          options[row[i]] = { response: [row[i + 1]] }; // Each option and response
        }
      }
      ConversationFlow.push({ question, options });
    }
  });
}

// Function to ask for the user's name and move to the next question
function askUserName() {
  const conversation = document.getElementById('conversation');
  const buttons = document.getElementById('buttons');

  const nameInputHtml = `
    <div class="message user">
      <input type="text" id="userNameInput" placeholder="Enter your name" class="name-input">
    </div>
    <button class="chat-button" onclick="saveUserName()">Submit</button>
  `;

  conversation.innerHTML += `
    <div class="message chatbot">
      <img src="chatbot-profile.jpg" alt="Chatbot" class="chatbot-img">
      <div class="bubble">Hi, my name is BuddyBot! What's your name?</div>
    </div>
  `;
  
  buttons.innerHTML = nameInputHtml;
}

// Function to save the user's name and update the conversation flow
function saveUserName() {
  const nameInput = document.getElementById('userNameInput');
  userName = nameInput.value.trim();  // Trim any extra spaces

  if (userName) {
    // Add the user's name as a message in the conversation
    const conversation = document.getElementById('conversation');
    conversation.innerHTML += `
      <div class="message user">
        <div class="bubble">${userName}</div>
      </div>
    `;

    // Remove the input box and submit button
    const buttons = document.getElementById('buttons');
    buttons.innerHTML = '';  // Clear the buttons container

    // Load the TSV data and proceed to the first question
    loadTSV().then(() => {
      // Proceed with the first question
      currentOptions = ConversationFlow[currentStepIndex].options;
      showQuestionAndOptions();
    });
  } else {
    alert('Please enter your name.');
  }
}

// Function to show a question and its options
function showQuestionAndOptions() {
  const currentStep = ConversationFlow[currentStepIndex];
  const conversation = document.getElementById('conversation');
  const buttons = document.getElementById('buttons');

  // Display the question
  showMessagesSequentially([currentStep.question], () => {
    // Once the question is shown, show the options as buttons if available
    if (Object.keys(currentStep.options).length > 0) {
      buttons.innerHTML = Object.keys(currentStep.options).map(option =>
        `<button class="chat-button" onclick="respond('${option}')">${option}</button>`
      ).join('');
    }
  });
}

// Function to respond to user input
function respond(userInput) {
  const conversation = document.getElementById('conversation');
  const buttons = document.getElementById('buttons');

  // Get the current options based on the user input
  const userResponse = currentOptions[userInput];

  // Add the user's response to the chat
  conversation.innerHTML += `
      <div class="message user">
          <div class="bubble">${userInput}</div>
      </div>
  `;

  // Clear buttons
  buttons.innerHTML = '';

  if (userResponse) {
      // Get chatbot responses and join them into a single string
      const responses = userResponse.response.flatMap(response => response.split(/(?<=[.!?])\s+/)); // Split on punctuation followed by space

      // Show the chatbot's responses in sequence
      showMessagesSequentially(responses, () => {
          // Move to the next question in the flow
          currentStepIndex++;
          if (currentStepIndex < ConversationFlow.length) {
              currentOptions = ConversationFlow[currentStepIndex].options;
              showQuestionAndOptions();
          } else {
              // End the conversation
              showMessagesSequentially(["Thanks for chatting!"]);
          }
      });
  }
}

// Function to show multiple messages in sequence with typing animation
function showMessagesSequentially(messages, callback) {
  const conversation = document.getElementById('conversation');
  
  let index = 0;

  function showNextMessage() {
      if (index < messages.length) {
          // Create new bubble for the message part
          const bubble = document.createElement('div');
          bubble.classList.add('message', 'chatbot');
          bubble.innerHTML = `<img src="chatbot-profile.jpg" alt="Chatbot" class="chatbot-img"><div class="bubble"></div>`;
          conversation.appendChild(bubble);

          // Get the bubble div and type the message into it
          const bubbleText = bubble.querySelector('.bubble');
          
          // Typing effect
          typeMessage(bubbleText, messages[index], () => {
              index++;
              // Delay before the next message only after the current one finishes typing
              setTimeout(showNextMessage, 500); // Optional: Adjust delay time as needed
          });
      } else if (callback) {
          callback(); // When all messages are done, show buttons
      }
  }

  showNextMessage();
}

// Helper function for typing effect
function typeMessage(element, message, callback) {
  let index = 0;
  const interval = setInterval(() => {
    element.innerHTML += message.charAt(index);
    index++;
    if (index === message.length) {
      clearInterval(interval);
      if (callback) callback();  // Proceed after message finishes typing
      scrollToBottom(); // Scroll down when a message is fully displayed
    }
  }, 50); // Typing speed (50ms per character)
}

// Function to scroll the entire window to the bottom
function scrollToBottom() {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth' // Smooth scroll effect
  });
}

// Add an event listener to detect user scrolling
window.addEventListener('scroll', () => {
  const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight;
  autoScrollEnabled = isAtBottom; // Disable auto-scroll if user scrolls up
});

// Function to initialize chat on page load
function initializeChat() {
  currentStepIndex = 0;  // Reset to first question
  currentOptions = {};  // Reset options
  askUserName();  // Start by asking for the user's name

  // Start auto-scrolling every second
  setInterval(() => {
    if (autoScrollEnabled) {
      scrollToBottom(); // Scroll to bottom only if enabled
    }
  }, 100); // Change the interval as needed
}

// Initialize chat on page load
window.onload = initializeChat;
