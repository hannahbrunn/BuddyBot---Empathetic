let currentStepIndex = 0;  // Track which question in the flow we're on
let currentOptions = {};  // Store current options
let userName = '';  // Global variable to store user's name
let conversationData = {}; // Initialize conversationData
let typingEnabled = true; // Boolean to enable/disable typing animation

// Function to load the conversation flow
async function loadConversationData() {
    try {
        const response = await fetch("conversation chat/chat.json");
        if (!response.ok) throw new Error("Network response was not ok");

        const jsonData = await response.json();

        // Parse and replace {Username} in responses
        for (const id in jsonData) {
            if (jsonData.hasOwnProperty(id)) {
                jsonData[id].question = jsonData[id].question.replace(/{Username}/g, userName);
            }
        }

        // Store the parsed conversation data
        conversationData = jsonData;
        console.log("Conversation data loaded:", conversationData);

    } catch (error) {
        console.error("Failed to load conversation data:", error);
    }
}

// Ask for the username
function askUserName() {
    const conversation = document.getElementById('conversation');
    const buttons = document.getElementById('buttons');

    const introductionMessages = [
        "Hi, my name is BuddyBot.",
        "I will ask questions to get to know you better.",
        "What would you like me to call you?",
        "Please enter your nickname and not your real name."
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
async function saveUserName() {
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
        await loadConversationData(); // Load conversation data
        currentStepIndex = 0; // Reset step index
        currentOptions = conversationData["1"].options; // Start from the first question
        showQuestionAndOptions();
    } else {
        alert('Please enter your name.');
    }
}

// Show the current question and its options
function showQuestionAndOptions() {
    const currentStep = conversationData[(currentStepIndex + 1).toString()]; // Ensure correct ID
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
        // Show chatbot response
        const responseText = userResponse.response;
        showMessagesSequentially([responseText], () => {
            if (userResponse.nextId === null) {
                // End the conversation if nextId is null
                showMessagesSequentially(["Thanks for chatting!"], () => {
                    buttons.innerHTML = '';  // Clear buttons if needed
                });
            } else {
                // Move to the next question in the flow
                currentStepIndex = parseInt(userResponse.nextId) - 1;
                if (currentStepIndex < Object.keys(conversationData).length) {
                    currentOptions = conversationData[(currentStepIndex + 1).toString()].options; // Get new options
                    showQuestionAndOptions();
                } else {
                    // Fallback to end conversation
                    showMessagesSequentially(["Thanks for chatting!"], () => {
                        buttons.innerHTML = '';  // Clear buttons if needed
                    });
                }
            }
        });
    } else {
        console.error(`No response found for input: "${userInput}"`);
        showMessagesSequentially(["I'm sorry, I didn't understand that."], () => {
            showQuestionAndOptions(); // Show options again after misunderstanding
        });
    }
}


// Function to show multiple messages in sequence with typing animation
function showMessagesSequentially(messages, callback) {
    const conversation = document.getElementById('conversation');
    let index = 0;

    function showNextMessage() {
        if (index < messages.length) {
            const messageParts = splitMessage(messages[index]);
            let partIndex = 0;

            function showNextPart() {
                if (partIndex < messageParts.length) {
                    const bubble = document.createElement('div');
                    bubble.classList.add('message', 'chatbot');
                    bubble.innerHTML = `<img src="chatbot-profile.jpg" alt="Chatbot" class="chatbot-img"><div class="bubble"></div>`;
                    conversation.appendChild(bubble);

                    const bubbleText = bubble.querySelector('.bubble');

                    if (typingEnabled) {
                        // Typing effect with a delay after each part
                        typeMessage(bubbleText, messageParts[partIndex], () => {
                            partIndex++;
                            setTimeout(showNextPart, 500); // Delay after each sentence/part
                        });
                    } else {
                        // Display message immediately if typing is disabled
                        bubbleText.innerHTML = messageParts[partIndex];
                        partIndex++;
                        setTimeout(showNextPart, 500); // Delay after each sentence/part
                    }
                } else {
                    index++;
                    setTimeout(showNextMessage, 50); // Delay between complete messages
                }
            }

            showNextPart();
        } else if (callback) {
            callback();
        }
    }

    showNextMessage();
}



// Helper function to split messages into bubbles based on punctuation
function splitMessage(message) {
    return message.split(/(?<=[.!?])/).map(part => part.trim()).filter(part => part); // Splits by punctuation and trims
}

// Helper function for typing effect
function typeMessage(element, message, callback) {
    let index = 0;
    const typingInterval = 50; // Typing speed (50ms per character)

    const interval = setInterval(() => {
        element.innerHTML += message.charAt(index);
        index++;
        if (index === message.length) {
            clearInterval(interval);
            if (callback) callback();
        }
    }, typingInterval);
}

// Start the conversation by asking for the user's name
askUserName();