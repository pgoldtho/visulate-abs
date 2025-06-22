import { showWorking, hideWorking, scrollToBottom } from './utils.js';

function handleChatKeyDown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    const questionInput = document.getElementById('chat-input');
    const question = questionInput.value.trim();
    questionInput.value = '';
    handleChatSubmit(question);
  }
}

function handleFabClick() {
  const questionInput = document.getElementById('chat-input');
  const question = questionInput.value.trim();
  questionInput.value = '';
  handleChatSubmit(question);
}

async function handleChatSubmit(question) {
  if (question) {
    showWorking(`Asking: ${question} ...`);
    try {
      const response = await fetch('/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question })
      });

      const responseHtml = await response.text();
      const offeringContainer = document.getElementById('offering');
      offeringContainer.innerHTML += `<div class='user-question'>${question}</div><div class='chat-response'>${responseHtml}</div>`;
      hideWorking();
      setTimeout(scrollToBottom, 0);
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  }
}

export function initializeChatListeners() {
  const chatInput = document.getElementById('chat-input');
  const chatSubmitFab = document.getElementById('chat-submit-fab');
  if (chatInput) {
    chatInput.addEventListener('keydown', handleChatKeyDown);
    chatInput.focus();
  }

  if (chatSubmitFab) {
    chatSubmitFab.addEventListener('click', handleFabClick);
  }
}