let sidenavInstance;

export function addEventListeners() {

  document.addEventListener('DOMContentLoaded', function() {
    const elems = document.querySelectorAll('.sidenav');
    const instances = M.Sidenav.init(elems,
    { edge: 'left', draggable: true, inDuration: 250, outDuration: 200,
      onOpenStart: null, onCloseStart: null, onOpenEnd: null,
      onCloseEnd: null, preventScrolling: true });
    sidenavInstance = instances[0];
    sidenavInstance.open();
  });

  // Add event listener for the chat form
  const chatInput = document.getElementById('chat-input');
  const chatSubmitFab = document.getElementById('chat-submit-fab');
  if (chatInput) {
    chatInput.addEventListener('keydown', handleChatKeyDown);
    chatInput.focus(); // Set initial focus on the chat input
  }

  if(chatSubmitFab){
    chatSubmitFab.addEventListener('click', handleFabClick);
  }

  function handleFabClick(){
    const questionInput = document.getElementById('chat-input');
    const question = questionInput.value.trim();
    questionInput.value = '';
    handleChatSubmit(question);
  }
}

function handleChatKeyDown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent a new line
      const questionInput = document.getElementById('chat-input');
      const question = questionInput.value.trim();
      questionInput.value = '';
      handleChatSubmit(question);
  }
}

async function handleChatSubmit(question) { // Remove the 'event' parameter
  if (question) {
    showWorking(`Asking: ${question} ...`);
    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question })
      });

      const responseHtml = await response.text();
      const offeringContainer = document.getElementById('offering');
      offeringContainer.innerHTML += `<div class='user-question'>${question}</div><div class='chat-response'>${responseHtml}</div>`; // Display the question and response
      hideWorking();
      setTimeout(scrollToBottom, 0); // Scroll to the bottom after the response is displayed
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  }
}

function closeSideBar() {
  if (sidenavInstance) {
    if (document.activeElement) {
      document.activeElement.blur(); // Remove focus before hiding.
    }
    sidenavInstance.close();
  }
}

function showWorking(message) {
  const working = document.getElementById('working-dialog');
  const workingMessage = document.getElementById('working-message');
  workingMessage.innerHTML = message;
  working.style.display = 'block';
}

function hideWorking() {
  const chatInput = document.getElementById('chat-input');
  chatInput.focus();
  const working = document.getElementById('working-dialog');
  working.style.display = 'none';
}

function scrollToBottom() {
  const offeringContainer = document.getElementById('offering');
  offeringContainer.scrollTop = offeringContainer.scrollHeight;
}

export async function displayTermSheet(cik, accessionNumber, title) {
  document.getElementById('title').innerHTML = title;
  try {
    closeSideBar();
    showWorking(`Reviewing ${title} ...`);

    const response = await fetch(`/fwp/${cik}/${accessionNumber}`);
    const responseText = await response.text();

    if (responseText) {
      hideWorking();
      const offeringContainer = document.getElementById('offering');
      offeringContainer.innerHTML = responseText; // Set innerHTML to display markdown

      // Wait for the DOM to update and the browser to render the response, then scroll
      setTimeout(scrollToBottom, 0);
    } else {
      console.error('No data received from the API.');
    }
  } catch (error) {
    console.error('Error fetching or displaying prospectus:', error);
  }
}

window.displayTermSheet = displayTermSheet;