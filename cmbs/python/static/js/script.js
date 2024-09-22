document.addEventListener('DOMContentLoaded', function() {
  fetch('/static/data/documents.json')
      .then(response => response.json())
      .then(data => populateDropdown(data))
      .catch(error => console.error('Error loading the documents:', error));
});

function populateDropdown(data) {
  const select = document.getElementById('document-select');
  data.forEach(doc => {
      const option = new Option(doc.name, `${doc.cik}:${doc.accession_number}`);
      select.add(option);
  });
}
