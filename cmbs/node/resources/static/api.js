import { showWorking, hideWorking, scrollToBottom } from './utils.js';
import { showProperties } from './maps.js'; // Import showProperties

export async function reviewOffering(cik, accessionNumber, title) {
  await showProperties(cik, title);
  // Uncomment the line below if you want to re-enable AI analysis
  await aiAnalysis(cik, accessionNumber, title);
}

export async function aiAnalysis(cik, accessionNumber, title) {
  try {
    showWorking(`Reviewing ${title} ...`);

    const collateralContainer = document.getElementById('collateral');

    showWorking('Analyzing property data from the latest EXH 102 ...');
    let response = await fetch(`/ai/collateral/${cik}`);
    let responseText = await response.text();

    if (responseText) {
      hideWorking();
      collateralContainer.innerHTML = '<h5>Collateral Analysis</h5>';
      collateralContainer.innerHTML += `<div class="card-panel">${responseText}</div>`;
      setTimeout(scrollToBottom, 0);
    } else {
      console.error('No data received from the API.');
    }

    showWorking('Analyzing asset data from the latest EXH 102 ...');
    response = await fetch(`/ai/assets/${cik}`);
    responseText = await response.text();

    if (responseText) {
      hideWorking();
      collateralContainer.innerHTML += '<h5>Assets Analysis</h5>';
      collateralContainer.innerHTML += `<div class="card-panel">${responseText}</div>`;
      setTimeout(scrollToBottom, 0);
    } else {
      console.error('No data received from the API.');
    }

  } catch (error) {
    console.error('Error fetching or displaying prospectus:', error);
  }
}