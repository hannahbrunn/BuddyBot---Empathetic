let currentStepIndex = 0;  // Track which question in the flow we're on
let currentOptions = {};  // Store current options
let userName = '';  // Global variable to store user's name

// Define conversation flow
const ConversationFlow = [
  {
    question: "Hi, my name is BuddyBot. What is your name?",
    options: {}  // Name dynamically handled
  },
  {
    question: "",  // Placeholder for personalized question
    options: {
      "Great": { response: ["That is wonderful!",
                            "It's always nice when things go smoothly. I'm really happy for you!"] },
      "Good": { response: ["That is wonderful!",
                          "It's always nice when things go smoothly. I'm really happy for you!"] },
      "Okay": { response: ["An okay day is still progress.",
                          "I hope that you found something good in it."] },
      "Not good": { response: ["I'm very sorry to hear that.",
                               "Off days happen, but I'm here for you if you need anything."] }
    }
  },
  {
    question: "",  // Placeholder for activities question
    options: {
      "Sports or outdoor activities": { response: ["That seems like a nice activity.",
                                                   "Sports are a good way to get fresh air!"] },
      "Something creative like drawing or music": { response: ["That seems like a nice activity.",
                                                                "Creativity can be so rewarding!"] },
      "Entertaining myself (reading, watching movies, gaming)": { response: ["That sounds enjoyable!",
                                                                             "A good way to relax and unwind."] },
      "Learning new things or skills": { response: ["That's great!",
                                                      "Learning new things is always fulfilling!"] }
    }
  },
  {
    question: "",  // Placeholder for trip planning question
    options: {
      "Definitely more spontaneous!": { response: ["That sounds exciting!",
                                                    "Embracing spontaneity can make trips so much more adventurous!"] },
      "Not really sure": { response: ["That's totally okay!",
                                      "Sometimes it's hard to choose, and flexibility can be a great strength!"] },
      "Maybe a little bit of both": { response: ["A mix of both sounds perfect!",
                                                 "Having plans while staying open to spontaneity gives you the best of both worlds."] },
      "I need to plan everything": { response: ["That makes sense",
                                                "Careful planning can bring peace of mind and help everything go smoothly."] }
    }
  }
 ];
 
 

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

    // Proceed to the next question and update the flow with the user's name
    updateConversationFlow();

    // Proceed with the next question
    currentStepIndex++;
    currentOptions = ConversationFlow[currentStepIndex].options;
    showQuestionAndOptions();
  } else {
    alert('Please enter your name.');
  }
}

// Function to update the conversation flow with the user's name
function updateConversationFlow() {
  // Update questions with the user's name
  ConversationFlow[1].question = `Nice to meet you, ${userName}! How are you today?`;
  ConversationFlow[2].question = `Do you have any activities you do to enjoy your free time, ${userName}?`;
  ConversationFlow[3].question = `${userName}, when planning a trip, are you more spontaneous or do you prefer planning?`;
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

// Function to handle user responses and navigate through nested flows
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
    // Handle multiple responses for splitting into bubbles
    const responses = Array.isArray(userResponse.response) ? userResponse.response : [userResponse.response];

    // Show the chatbot's responses in sequence
    showMessagesSequentially(responses, () => {
      if (userResponse.options) {
        // If there are nested options, update currentOptions and display them
        currentOptions = userResponse.options;
        buttons.innerHTML = Object.keys(userResponse.options).map(option =>
          `<button class="chat-button" onclick="respond('${option}')">${option}</button>`
        ).join('');
      } else {
        // Move to the next question in the flow
        currentStepIndex++;
        if (currentStepIndex < ConversationFlow.length) {
          currentOptions = ConversationFlow[currentStepIndex].options;
          showQuestionAndOptions();
        } else {
          // End the conversation
          showMessagesSequentially(["Thanks for chatting!"]);
        }
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
        setTimeout(showNextMessage, 500); // Delay before the next message
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
    }
  }, 50); // Typing speed (50ms per character)
}

// Function to initialize chat on page load
function initializeChat() {
  currentStepIndex = 0;  // Reset to first question
  currentOptions = {};  // Reset options
  askUserName();  // Start by asking for the user's name
}

// Initialize chat on page load
window.onload = initializeChat;
