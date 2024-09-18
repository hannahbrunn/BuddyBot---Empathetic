// Define conversation flow with nested structure
const conversationFlow = [
  {
    question: "Hi, my name is BuddyBot! I am a companionship chatbot. How are you?",
    options: {
      "Good": {
        response: [
          "Great to hear that you're doing well!",
          "What did you do today?",
          "Anything exciting?"
        ],
        options: {
          "Exercise": {
            response: [
              "That's a great way to stay healthy!",
              "What kind of exercise do you do?"
            ],
            options: {
              "Running": {
                response: [
                  "Running is fantastic!",
                  "How often do you run?"
                ],
                options: {
                  "Every day": {
                    response: ["That's impressive! Keep up the great work!"]
                  },
                  "Few times a week": {
                    response: ["That's a good frequency. Running regularly keeps you fit!"]
                  }
                }
              }
            }
          },
          "Relax": {
            response: ["Relaxing is important! What did you do to relax?"]
          }
        }
      },
      "Bad": {
        response: ["I'm sorry to hear that. Is there anything I can do to help?"]
      },
      "Not Sure": {
        response: ["That's okay. Take your time."]
      }
    }
  },
  {
    question: "What’s your favorite hobby?",
    options: {
      "Reading": {
        response: ["Reading is wonderful! What type of books do you like?"]
      },
      "Gaming": {
        response: ["Gaming is fun! What games do you play?"]
      }
    }
  }
];

let currentStepIndex = 0;  // Track which question in the flow we're on
let currentOptions = conversationFlow[currentStepIndex].options;  // Start with first question's options

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

// Function to show a question and its options
function showQuestionAndOptions() {
  const currentStep = conversationFlow[currentStepIndex];
  const conversation = document.getElementById('conversation');
  const buttons = document.getElementById('buttons');

  // Display the question
  showMessagesSequentially([currentStep.question], () => {
    // Once the question is shown, show the options as buttons
    buttons.innerHTML = Object.keys(currentStep.options).map(option =>
      `<button class="chat-button" onclick="respond('${option}')">${option}</button>`
    ).join('');
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
    // Show the chatbot's response
    showMessagesSequentially(userResponse.response, () => {
      if (userResponse.options) {
        // If there are nested options, update currentOptions and display them
        currentOptions = userResponse.options;
        buttons.innerHTML = Object.keys(userResponse.options).map(option =>
          `<button class="chat-button" onclick="respond('${option}')">${option}</button>`
        ).join('');
      } else {
        // If no more nested options, move to the next question in the flow
        currentStepIndex++;
        if (currentStepIndex < conversationFlow.length) {
          currentOptions = conversationFlow[currentStepIndex].options;  // Update to next question's options
          showQuestionAndOptions();  // Show the next question
        } else {
          // End the conversation
          showMessagesSequentially(["Thanks for chatting!"]);
        }
      }
    });
  }
}

// Function to initialize chat on page load
function initializeChat() {
  currentStepIndex = 0;  // Reset to first question
  currentOptions = conversationFlow[currentStepIndex].options;  // Reset options to first question's options
  showQuestionAndOptions();  // Start with the first question
}

// Initialize chat on page load
window.onload = initializeChat;
