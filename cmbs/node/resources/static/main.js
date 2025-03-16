let previousSelection = null;

export function addEventListeners() {
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize the autocomplete
    let elems = document.querySelectorAll('.autocomplete');
    const trusts = window.trusts;
    const autocompleteData = trusts.map(trust => {
      return {
        id: trust.cik,
        text: trust.trust
      };
    });
    let instances = M.Autocomplete.init(elems, {
      minLength: 0, // shows instantly
      isMultiSelect: false,
      data: autocompleteData,
      limit: 10,
      onSearch: (text, autocomplete) => {
        const filteredData = autocompleteData.filter(item => item.text.toLowerCase().includes(text.toLowerCase()));
        autocomplete.setMenuItems(filteredData);
      }
    });

    const autocompleteInstance = instances[0];
    // call the reviewOffering function when a CMBS trust is selected
    autocompleteInstance.el.addEventListener('change', function(event) {
      const selectedText = event.target.value;
      const trust = trusts.find(trust => trust.trust === selectedText);
      if (trust === previousSelection || !trust) {
        return;
      }
      previousSelection = trust;
      reviewOffering(trust.cik, trust.accession_number, trust.trust);
    });

    // Set focus to the autocomplete input
    const autocompleteInput = document.getElementById('autocomplete-input');
    autocompleteInput.focus();
    autocompleteInstance.open();
    autocompleteInstance.options.onSearch('', autocompleteInstance);
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
      const response = await fetch('/ai/chat', {
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

function showWorking(message) {
  document.getElementById('follow-up-questions').style.display = 'none';
  const working = document.getElementById('working-dialog');
  const workingMessage = document.getElementById('working-message');
  workingMessage.innerHTML = message;
  working.style.display = 'block';
}

function hideWorking() {
  document.getElementById('follow-up-questions').style.display = 'block';
  const chatInput = document.getElementById('chat-input');
  chatInput.focus();
  const working = document.getElementById('working-dialog');
  working.style.display = 'none';
}

function scrollToBottom() {
  const offeringContainer = document.getElementById('offering');
  offeringContainer.scrollTop = offeringContainer.scrollHeight;
}

export async function reviewOffering(cik, accessionNumber, title) {
  // document.getElementById('title').innerHTML = title;
  try {
    // Review the Term Sheet
    showWorking(`Reviewing ${title} ...`);

    const offeringContainer = document.getElementById('offering');
    let response = await fetch(`/ai/term-sheet/${cik}/${accessionNumber}`);
    let responseText = await response.text();

    if (responseText) {
      hideWorking();
      offeringContainer.innerHTML = '<h5>Term Sheet Summary</h5>';
      offeringContainer.innerHTML += responseText;

      // Wait for the DOM to update and the browser to render the response, then scroll
      setTimeout(scrollToBottom, 0);
    } else {
      console.error('No data received from the API.');
    }

    // Analyze the Assets from the latest EXH 102
    showWorking('Analyzing asset data from the latest EXH 102 ...');
    response = await fetch(`/ai/assets/${cik}`);
    responseText = await response.text();

    if (responseText) {
      hideWorking();
      offeringContainer.innerHTML += '<h5>Assets Analysis</h5>';
      offeringContainer.innerHTML += responseText;

      // Wait for the DOM to update and the browser to render the response, then scroll
      setTimeout(scrollToBottom, 0);
    } else {
      console.error('No data received from the API.');
    }

    // Analyze the Collateral from the latest EXH 102
    showWorking('Analyzing property data from the latest EXH 102 ...');
    response = await fetch(`/ai/collateral/${cik}`);
    responseText = await response.text();

    if (responseText) {
      hideWorking();
      offeringContainer.innerHTML += '<h5>Collateral Analysis</h5>';;
      offeringContainer.innerHTML += responseText;

      // Wait for the DOM to update and the browser to render the response, then scroll
      setTimeout(scrollToBottom, 0);
    } else {
      console.error('No data received from the API.');
    }

  } catch (error) {
    console.error('Error fetching or displaying prospectus:', error);
  }
}

window.reviewOffering = reviewOffering;