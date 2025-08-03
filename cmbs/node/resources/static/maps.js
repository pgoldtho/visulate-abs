import { showWorking, hideWorking, formatCurrency, formatNumber, extractDate } from './utils.js';

const Maps_API_KEY = window.MAPS_API_KEY;
let selectedMarker = null;
let selectedPin = null;
let map;
let markers = [];
let pins = [];
let propertiesData = [];
let collapsible;


// Function to dynamically load the Google Maps API script
export function loadGoogleMapsScript() {
  return new Promise((resolve, reject) => {
    if (typeof google === 'object' && typeof google.maps === 'object') {
      resolve(); // Google Maps API is already loaded
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${Maps_API_KEY}&libraries=marker,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function setLocationVisible(visible = true) {
  const locationMapDiv = document.getElementById("location-map");
  const locationPanoDiv = document.getElementById("location-pano");
  const clearSelectionBtn = document.getElementById('clear-selection-btn');
  if (visible) {
    locationMapDiv.style.display = 'block';
    locationPanoDiv.style.display = 'block';
    clearSelectionBtn.style.display = 'block';
  } else {
    locationMapDiv.style.display = 'none';
    locationPanoDiv.style.display = 'none';
    clearSelectionBtn.style.display = 'none';
  }
}

/**
 * Clears the currently selected property pin and hides/clears detail divs.
 */
function clearPropertySelection() {
  if (selectedMarker && selectedPin) {
    // Reset previous selection's visual state
    selectedPin.background = '#f00';
    selectedMarker.content = selectedPin.element;
  }

  // Clear tracking variables
  selectedMarker = null;
  selectedPin = null;

  // Close any open collapsible item
  if (collapsible) {
    const activeItem = document.querySelector('#property-list > li.active');
    if (activeItem) {
      const index = Array.from(activeItem.parentElement.children).indexOf(activeItem);
      collapsible.close(index);
    }
  }

  const locationMapDiv = document.getElementById("location-map");
  if (locationMapDiv) {
    locationMapDiv.innerHTML = ''; // Clear map content
  }

  const locationPanoDiv = document.getElementById("location-pano");
  if (locationPanoDiv) {
    locationPanoDiv.innerHTML = ''; // Clear Street View content
  }
  setLocationVisible(false); // Hide the location map and Street View
}

async function selectAndShowProperty(index) {
  const marker = markers[index];
  const pin = pins[index];
  const property = propertiesData[index];

  // If the clicked item is already the selected one, deselect it
  if (marker === selectedMarker) {
    clearPropertySelection();
    return; // Exit early as we've deselected
  }

  clearPropertySelection(); // Clear previous selection before highlighting new one

  // Highlight pin
  pin.background = '#2196f3';
  marker.content = pin.element;
  selectedMarker = marker;
  selectedPin = pin;

  // Center map on the new selection
  map.setCenter(marker.position);

  // Open the corresponding collapsible and scroll it into view
  if (collapsible) {
    collapsible.open(index);
    const listItem = document.getElementById('property-list').children[index];
    if (listItem) {
      listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // Show Street View and local map
  setLocationVisible();
  const address = `${property.property_name}, ${property.location}`;

  try {
    const geocodeResp = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${Maps_API_KEY}`
    );
    const geocodeData = await geocodeResp.json();

    if (geocodeData.status === "OK" && geocodeData.results.length > 0) {
      const originalLocation = geocodeData.results[0].geometry.location;
      const streetViewService = new google.maps.StreetViewService();
      const radius = 50;

      streetViewService.getPanorama({ location: originalLocation, preference: google.maps.StreetViewPreference.NEAREST, radius: radius, source: google.maps.StreetViewSource.OUTDOOR },
        (data, status) => {
          const map2 = new google.maps.Map(document.getElementById("location-map"), { center: originalLocation, zoom: 16 });
          if (status === google.maps.StreetViewStatus.OK && data.location) {
            const panoLocation = data.location.latLng;
            const heading = google.maps.geometry.spherical.computeHeading(panoLocation, originalLocation);
            const panorama = new google.maps.StreetViewPanorama(document.getElementById("location-pano"), { position: panoLocation, pov: { heading: heading, pitch: 10 }, zoom: 1 });
            map2.setStreetView(panorama);
          } else {
            document.getElementById("location-pano").innerHTML = "<p>Street View not available for this location.</p>";
            new google.maps.Marker({ position: originalLocation, map: map2, title: "Geocoded Location" });
          }
        }
      );
    } else {
      document.getElementById("location-map").innerHTML = "<p>Could not geocode address.</p>";
      document.getElementById("location-pano").innerHTML = "";
    }
  } catch (error) {
    console.error("Error during geocoding or Street View lookup:", error);
    document.getElementById("location-map").innerHTML = "<p>An error occurred.</p>";
    document.getElementById("location-pano").innerHTML = "";
  }
}

export async function showProperties(cik, title) {
  try {
    showWorking(`Reviewing ${title} ...`);

    const propertyContainer = document.getElementById('properties');
    const offeringContainer = document.getElementById('offering');

    let response = await fetch(`/properties/${cik}`);
    const data = await response.json();
    const termSheetData = data.termSheet || [];
    propertiesData = data.properties || [];


    if (propertiesData && propertiesData.length > 0) {
      hideWorking();
      // Sort properties by asset_number for consistent ordering
      propertiesData.sort((a, b) => {
        const assetA = String(a.asset_number || '');
        const assetB = String(b.asset_number || '');
        return assetA.localeCompare(assetB, undefined, { numeric: true, sensitivity: 'base' });
      });

      // Reset state from any previous view
      markers = [];
      pins = [];
      selectedMarker = null;
      selectedPin = null;

      offeringContainer.innerHTML = `
        ${termSheetData.length > 0 ? `
        <h5>Term Sheet</h5>
        <div id="term-sheet-list">
          ${termSheetData.map(ts => `
              ${ts.summary ? `<div>${ts.summary}</div>` : ''}
          `).join('')}
        </div>
        ` : ''}
      `;

      propertyContainer.innerHTML = `
        <h5>Property Data</h5>
        <div id="map"></div>
        <div id="location-map" style="display: none;"></div>
        <div id="location-pano" style="display: none;"></div>
        <button id="clear-selection-btn" style="display: none;" class="btn darken-1" style="margin-top: 10px; margin-bottom: 20px;">
        <i class="material-icons left">clear</i>Clear Property Selection</button>
        <ul id="property-list" class="collapsible"></ul>
      `;

      const propertyListEl = document.getElementById('property-list');
      propertiesData.forEach(property => {
        const li = document.createElement('li');
        li.innerHTML = `
          <div class="collapsible-header"><strong>Asset ${property.asset_number}:  ${property.property_name} - ${property.location}</strong></div>
          <div class="collapsible-body"><div style="padding: 20px;">
            <p><strong>City:</strong> ${property.city}</p>
            <p><strong>Property Type:</strong> ${property.property_type || 'N/A'}</p>
            <p><strong>Year Built:</strong> ${property.year_built || 'N/A'} </p>
            <p><strong>Last Renovated:</strong> ${property.year_last_renovated || 'N/A'}</p>
            <p><strong>Net Rentable Sq Ft:</strong> ${formatNumber(property.net_rentable_square_feet)}</p>
            <p><strong>Largest Tenant:</strong> ${property.largest_tenant || 'N/A'} (${formatNumber(property.square_feet_largest_tenant)} Sq Ft), lease expires ${extractDate(property.lease_expiration_largest_tenant_date)} </p>
            <p><strong>Second Largest Tenant:</strong> ${property.second_largest_tenant || 'N/A'} (${formatNumber(property.square_feet_second_largest_tenant)} Sq Ft), lease expires ${extractDate(property.lease_expiration_second_largest_tenant_date)} </p>
            <p><strong>Third Largest Tenant:</strong> ${property.third_largest_tenant || 'N/A'} (${formatNumber(property.square_feet_third_largest_tenant)} Sq Ft), lease expires ${extractDate(property.lease_expiration_third_largest_tenant_date)}</p>
            <p><strong>Defeased Status:</strong> ${property.defeased_status || 'N/A'}</p>
            <p><strong>Property Status:</strong> ${property.property_status || 'N/A'}</p>
            <p><strong>Current Occupancy (%):</strong> ${(property.most_recent_physical_occupancy_percentage ?? 'N/A') * 100}</p>
            <p><strong>Occupancy at Securitization (%):</strong> ${(property.physical_occupancy_securitization_percentage ?? 'N/A') * 100}</p>
            <p><strong>Valuation Amount:</strong> ${formatCurrency(property.valuation_securitization_amount)}</p>
            <p><strong>Revenue:</strong> ${formatCurrency(property.revenue_securitization_amount)}</p>
            <p><strong>Operating Expenses:</strong> ${formatCurrency(property.operating_expenses_securitization_amount)}</p>
            <p><strong>Net Operating Income:</strong> ${formatCurrency(property.noi_securitization_amount)}</p>
            <p><strong>Debt Service Coverage Ratio (NOI):</strong> ${property.dsc_noi_securitization_percentage || 'N/A'}</p>
            <p><strong>Debt Service Coverage Ratio (Net Cash Flow):</strong> ${property.dsc_net_cash_flow_securitization_percentage || 'N/A'}</p>
          </div></div>`;
        propertyListEl.appendChild(li);
      });

      await loadGoogleMapsScript();

      map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 39.8283, lng: -98.5795 },
        zoom: 4,
        mapId: 'PROPERTY_DISTRIBUTION_MAP',
        zoomControl: true,
      });

      // Add click listener to the map itself to deselect all properties
      map.addListener('click', (mapsMouseEvent) => {
        // Only clear if the click was not on a marker.
        // The mapsMouseEvent object for a map click typically won't have a marker target.
        // This implicitly handles clicking on the map background.
        if (selectedMarker) { // Only clear if something is currently selected
            clearPropertySelection();
        }
      });

      // Initialize collapsible and set up its event handler
      collapsible = M.Collapsible.init(propertyListEl, {
        onOpenStart: (el) => {
          const index = Array.from(el.parentElement.children).indexOf(el);
          // Check if this was a user click on the list and not a programmatic open
          if (markers[index] !== selectedMarker) {
            selectAndShowProperty(index);
          }
        }
      });

      // Add event listener for the "Clear Selection" button
      document.getElementById('clear-selection-btn').addEventListener('click', clearPropertySelection);



      propertiesData.forEach((property, index) => {
        const lat = parseFloat(property.latitude);
        const lng = parseFloat(property.longitude);

        if (isNaN(lat) || isNaN(lng)) {
          return;
        }

        const pin = new google.maps.marker.PinElement({
          glyph: String(property.property_type || '').substring(0, 2),
          glyphColor: '#fff',
          background: '#f00'
        });

        pins.push(pin);

        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: lat, lng: lng },
          map: map,
          title: `${property.property_type}: ${property.property_name}`,
          content: pin.element,
        });

        markers.push(marker);

        const infoWindow = new google.maps.InfoWindow({
          content: `<strong>${property.property_type}: ${property.property_name}</strong>`,
        });

        marker.addListener('mouseover', () => {
          infoWindow.open(map, marker);
        });

        marker.addListener('mouseout', () => {
          infoWindow.close();
        });

        marker.addListener('click', () => {
          selectAndShowProperty(index);
        });
      });

    } else {
      console.error('No data received from the API.');
    }

  } catch (error) {
    console.error('Error fetching or displaying prospectus:', error);
  }
}