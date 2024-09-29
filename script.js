let currentStepIndex = 0;  // Track which question in the flow we're on
let currentOptions = {};  // Store current options
let userName = '';  // Global variable to store user's name
let ConversationFlow = []; // Initialize ConversationFlow
let autoScrollEnabled = true; // Control for auto-scrolling

// Load the questions from the CSV file
async function loadQuestions() {
  const response = await fetch("neutral_responses.csv"); // Update with your CSV file path
  const text = await response.text();
  
  const rows = text.split('\n').map(row => row.split(';')); // Change delimiter to your preferred one
  
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const question = row[0].replace(/{Username}/g, userName); // Replace placeholder
    const options = {};
    let hasResponse = false; // Flag to check if there are responses
    
    for (let i = 1; i < row.length; i += 2) {
      if (row[i] && row[i + 1]) {
        options[row[i]] = { response: [row[i + 1]] }; // Each option and response
        hasResponse = true; // Mark as having a response
      }
    }

    if (hasResponse) {
      ConversationFlow.push({ question, options });
    } else {
      console.error(`Question "${question}" does not have any responses.`);
      ConversationFlow.push({ question, options: { "No response available": { response: ["I'm sorry, but there's no response available."] } } });
    }
  }
}

// Testing paths (Separate from actual chat flow)
async function testAllPaths() {
  await loadQuestions(); // Ensure questions are loaded
  
  let currentStepIndex = 0;
  let pathsExplored = 0;

  while (currentStepIndex < ConversationFlow.length) {
    const currentStep = ConversationFlow[currentStepIndex];
    const options = currentStep.options;

    if (Object.keys(options).length === 0) {
      console.error(`No options available for question at index ${currentStepIndex}: "${currentStep.question}"`);
      break;
    }

    // Simulate choosing each option
    for (const option in options) {
      console.log(`Question: "${currentStep.question}"`);
      console.log(`User selects: "${option}"`);

      const response = options[option].response;

      response.forEach((res) => {
        console.log(`Chatbot responds: "${res}"`);
      });

      pathsExplored++;
    }

    currentStepIndex++; // Move to the next question
  }

  if (currentStepIndex === ConversationFlow.length) {
    console.log(`All paths successfully explored. Total paths explored: ${pathsExplored}`);
  } else {
    console.error(`Stopped at question index: ${currentStepIndex}. Something went wrong.`);
  }
}

// Ask for the username
function askUserName() {
  const conversation = document.getElementById('conversation');
  const buttons = document.getElementById('buttons');

  const introductionMessages = [
    "Hi, my name is BuddyBot.",
    "I will ask questions to get to know you better.",
    "What would you like me to call you?"
  ];

  // Show the introduction messages sequentially
  showMessagesSequentially(introductionMessages, () => {
    const nameInputHtml = `
      <div class="message user">
        <input type="text" id="userNameInput" placeholder="Enter your name" class="name-input" onkeydown="checkEnter(event)">
      </div>
      <button class="chat-button" onclick="saveUserName()">Submit</button>
    `;
    buttons.innerHTML = nameInputHtml;
  });
}

function checkEnter(event) {
  if (event.key === 'Enter') {
    saveUserName(); // Call the saveUserName function when Enter is pressed
  }
}





// Save the username and continue with the flow
function saveUserName() {
  const nameInput = document.getElementById('userNameInput');
  userName = nameInput.value.trim();

  if (userName) {
    const conversation = document.getElementById('conversation');
    conversation.innerHTML += `
      <div class="message user">
        <div class="bubble">${userName}</div>
      </div>
    `;

    const buttons = document.getElementById('buttons');
    buttons.innerHTML = '';  // Clear the buttons

    // After saving the name, load the questions and start the conversation
    loadQuestions().then(() => {
      currentOptions = ConversationFlow[currentStepIndex].options;
      showQuestionAndOptions();
    });
  } else {
    alert('Please enter your name.');
  }
}

// Show the current question and its options
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

// Handle the user's response
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
    // Get chatbot responses and split them based on punctuation
    const responses = userResponse.response.flatMap(response => response.split(/(?<=[.!?])\s+/)); // Split on punctuation followed by space

    // Show the chatbot's responses in sequence
    showMessagesSequentially(responses, () => {
      // Move to the next question in the flow
      currentStepIndex++;
      
      if (currentStepIndex < ConversationFlow.length) {
        currentOptions = ConversationFlow[currentStepIndex].options;
        showQuestionAndOptions();
      } else {
        // **End the conversation** by showing "Thanks for chatting!"
        showMessagesSequentially(["Thanks for chatting!"], () => {
          buttons.innerHTML = '';  // Clear buttons if needed
        });
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
      const bubble = document.createElement('div');
      bubble.classList.add('message', 'chatbot');
      bubble.innerHTML = `<img src="chatbot-profile.jpg" alt="Chatbot" class="chatbot-img"><div class="bubble"></div>`;
      conversation.appendChild(bubble);

      const bubbleText = bubble.querySelector('.bubble');
      
      // Typing effect
      typeMessage(bubbleText, messages[index], () => {
        index++;
        setTimeout(showNextMessage, 500);
      });
    } else if (callback) {
      callback();
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
      if (callback) callback();
      scrollToBottom();
    }
  }, 50); // Typing speed (50ms per character)
}

// Function to scroll to the bottom of the page
function scrollToBottom() {
  if (autoScrollEnabled) {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  }
}

// Function to check if the user scrolled up in the chatbox or window
function checkScrollPosition() {
  const chatBox = document.getElementById('conversation');
  
  const isChatBoxAtBottom = chatBox.scrollHeight - chatBox.clientHeight <= chatBox.scrollTop + 1;
  const isWindowAtBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1;
  
  autoScrollEnabled = isChatBoxAtBottom && isWindowAtBottom;
}

// Add event listeners for scroll checking
document.getElementById('conversation').addEventListener('scroll', checkScrollPosition);
window.addEventListener('scroll', checkScrollPosition);

// Function to initialize chat on page load
async function initializeChat() {
  askUserName();  // Start by asking for the user's name
  //runTestPaths(); // Call this to test paths as well
}



// Run testAllPaths separately if needed
function runTestPaths() {
  testAllPaths();  // You can run this manually to check paths
}

// Initialize chat on page load
window.onload = initializeChat
