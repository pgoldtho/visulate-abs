export function showWorking(message) {
  document.getElementById('follow-up-questions').style.display = 'none';
  const working = document.getElementById('working-dialog');
  const workingMessage = document.getElementById('working-message');
  workingMessage.innerHTML = message;
  working.style.display = 'block';
}

export function hideWorking() {
  document.getElementById('follow-up-questions').style.display = 'block';
  const chatInput = document.getElementById('chat-input');
  chatInput.focus();
  const working = document.getElementById('working-dialog');
  working.style.display = 'none';
}

export function scrollToBottom() {
  const offeringContainer = document.getElementById('offering');
  offeringContainer.scrollTop = offeringContainer.scrollHeight;
}

export function formatCurrency(value) {
  if (value == null || value === '') return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

export function formatNumber(value) {
  if (value == null || value === '') return 'N/A';
  return new Intl.NumberFormat('en-US').format(value);
}

export function extractDate(isoString) {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}