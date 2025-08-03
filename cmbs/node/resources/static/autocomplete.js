import { reviewOffering } from './api.js'; // Import reviewOffering

let previousSelection = null;

export function initializeAutocomplete() {
  let elems = document.querySelectorAll('.autocomplete');
  const trusts = window.trusts; // Assuming window.trusts is still globally available or passed in
  const autocompleteData = trusts.map(trust => {
    return {
      id: trust.cik,
      text: trust.trust
    };
  });

  let instances = M.Autocomplete.init(elems, {
    minLength: 0,
    isMultiSelect: false,
    data: autocompleteData,
    limit: 10,
    onSearch: (text, autocomplete) => {
      const filteredData = autocompleteData.filter(item => item.text.toLowerCase().includes(text.toLowerCase()));
      autocomplete.setMenuItems(filteredData);
    }
  });

  const autocompleteInstance = instances[0];

  autocompleteInstance.el.addEventListener('change', function(event) {
    const selectedText = event.target.value;
    const trust = trusts.find(trust => trust.trust === selectedText);
    if (trust === previousSelection || !trust) {
      return;
    }
    previousSelection = trust;
    reviewOffering(trust.cik, trust.accession_number, trust.trust);
    // Clear the AI Analysis for the previous selection
    const collateralContainer = document.getElementById('collateral');
    collateralContainer.innerHTML = '';

    // Set the "Offering Details" tab active
    const offeringTab = document.querySelector('a[href="#offering"]');
    if (offeringTab) {
      offeringTab.click();
    }
  });

  const autocompleteInput = document.getElementById('autocomplete-input');
  autocompleteInput.focus();
  autocompleteInstance.open();
  autocompleteInstance.options.onSearch('', autocompleteInstance);
}