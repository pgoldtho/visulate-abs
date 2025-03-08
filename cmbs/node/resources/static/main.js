function closeSideBar() {
  if (sidenavInstance) {
    sidenavInstance.close();
  }
}

export async function displayTermSheet(cik, accessionNumber) {
  try {
    const response = await fetch(`/fwp/:cik/:accession_number`.replace(':cik', cik).replace(':accession_number', accessionNumber));
    const data = await response.json();

    if (data.length > 0) {
      const prospectusText = data[0].prospectus_text;
      const preElement = document.getElementById('offering')
      preElement.textContent = prospectusText;
      document.body.appendChild(preElement); // Or append to a specific container element
      closeSideBar();
    } else {
      console.error('No data received from the API.');
    }
  } catch (error) {
    console.error('Error fetching or displaying prospectus:', error);
  }
}

window.displayTermSheet = displayTermSheet;