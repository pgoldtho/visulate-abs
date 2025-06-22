import { initializeAutocomplete } from './autocomplete.js';
import { initializeChatListeners } from './chat.js';
import { reviewOffering } from './api.js'; // Expose reviewOffering globally if needed by M.Autocomplete or other external scripts

// Expose reviewOffering globally if M.Autocomplete's internal mechanism
// (e.g., event listeners not directly connected to the exported function)
// still expects it on `window`. If you can configure M.Autocomplete
// to directly call the imported `reviewOffering`, then `window.reviewOffering`
// might not be necessary.
window.reviewOffering = reviewOffering;

document.addEventListener('DOMContentLoaded', function() {
  initializeAutocomplete();
  initializeChatListeners();
  const tabsElement = document.querySelector('.tabs');
  if (tabsElement) { // check if the element exists
    const instance = M.Tabs.init(tabsElement);
    // store the instance to programmatically switch tabs later:
    // window.myTabsInstance = instance;
  }

});