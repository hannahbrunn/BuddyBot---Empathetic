// Define conversation flow with multiple options
const conversationFlow = {
    "Hi": {
      "response": [
        "Hi! My name is BuddyBot!",
        "I’m an artificial intelligence chatbot who enjoys talking to people. I am so excited to meet you!",
        "How is your day going?"
      ],
      "options": ["Good", "Bad", "Not Sure"]
    },
    "Good": {
      "response": ["Oh! I’m so happy to hear that, thank you for letting me know!",
      "What are your plans today?"],
      "options": ["Work", "Relax", "Exercise"]
    },
    "Bad": {
      "response": "I'm sorry to hear that. Why?",
      "options": ["Tired", "Stressed", "Unwell"]
    },
    "Not Sure": {
      "response": "No worries. Take your time to think about it.",
      "options": ["Okay", "Maybe Later", "I Need Help"]
    },
  };
  
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
    }, 10); // Typing speed (__ms per character)
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
  
  // Function to initialize chat
  function initializeChat() {
    const conversation = document.getElementById('conversation');
    const buttons = document.getElementById('buttons');
  
    // Clear existing content
    conversation.innerHTML = '';
    buttons.innerHTML = '';
  
    // Get the first key from the conversationFlow object
    const initialKey = Object.keys(conversationFlow)[0];
  
    // Show the initial messages in sequence
    showMessagesSequentially(conversationFlow[initialKey].response, () => {
      // Once the messages are done, show the buttons
      buttons.innerHTML = conversationFlow[initialKey].options.map(option => 
        `<button class="chat-button" onclick="respond('${option}')">${option}</button>`
      ).join('');
    });
  }
  
  // Function to handle the chatbot's response and display options
  function respond(userInput) {
    const conversation = document.getElementById('conversation');
    const buttons = document.getElementById('buttons');
  
    // Add user response to the chat
    conversation.innerHTML += `
      <div class="message user">
        <div class="bubble">${userInput}</div>
      </div>
    `;
  
    // Get chatbot's next response and options
    const botResponse = conversationFlow[userInput].response;
    const options = conversationFlow[userInput].options;
  
    // Clear buttons
    buttons.innerHTML = '';
  
    if (Array.isArray(botResponse)) {
      // If response is an array (multiple parts), show them sequentially
      showMessagesSequentially(botResponse, () => {
        // Show buttons after messages
        if (options.length > 0) {
          buttons.innerHTML = options.map(option => 
            `<button class="chat-button" onclick="respond('${option}')">${option}</button>`
          ).join('');
        }
      });
    } else {
      // Single message response
      showMessagesSequentially([botResponse], () => {
        // Show buttons after the message
        if (options.length > 0) {
          buttons.innerHTML = options.map(option => 
            `<button class="chat-button" onclick="respond('${option}')">${option}</button>`
          ).join('');
        }
      });
    }
  }
  
  // Initialize chat on page load
  window.onload = initializeChat;