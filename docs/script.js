window.onload = function() {
  document.getElementById('callsign').focus();
  const savedUrl = localStorage.getItem('lastIframeUrl');
  document.getElementById('displayIframe').src = savedUrl ? savedUrl : '';
  document.getElementById('squawk').value = generateRandomSquawk();

  // Check if the compass should be visible on load
  checkCompassVisibility();
};


document.getElementById('flightPlanForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const departure = document.getElementById('departure').value;
  const arrival = document.getElementById('arrival').value;
  const squawk = document.getElementById('squawk').value;
  const cruisingLevel = document.getElementById('cruisingLevel').value;

  if (!departure || !arrival || !squawk || !cruisingLevel) {
      alert("Departure, Arrival, Squawk, and Cruising Level are required fields!");
      return;  // Don't submit if any of these fields are empty
  }

  const formData = {
      id: Date.now(),
      callsign: document.getElementById('callsign').value,
      aircraft: document.getElementById('aircraft').value,
      flightRule: document.getElementById('flightRule').value,
      cruisingLevel: document.getElementById('cruisingLevel').value,
      departure: departure,
      arrival: arrival,
      sid: document.getElementById('sid').value || 'Radar vectors',
      squawk: squawk
  };

  // Declare flightPlans inside the event listener
  let flightPlans = JSON.parse(localStorage.getItem('flightPlans')) || [];
  flightPlans.push(formData);
  localStorage.setItem('flightPlans', JSON.stringify(flightPlans));

  // Dispatch a custom event to notify other pages about the new flight plan
  const event = new Event('flightPlanUpdated');
  window.dispatchEvent(event);

  // Optionally clear the form after submission
  document.getElementById('flightPlanForm').reset();
});

document.getElementById('aircraft').addEventListener('input', function (e) {
  document.getElementById('flightRule').focus(); // Move focus to the next field
});

document.getElementById('flightRule').addEventListener('input', function (e) {
  document.getElementById('cruisingLevel').focus(); // Move focus to the next field
});

function handleUpDownKeys(e) {
  if (e.key === 'ArrowUp') {
    // Logic to move to the previous input field
    const currentElement = e.target;
    const allInputs = document.querySelectorAll('input');
    const currentIndex = Array.from(allInputs).indexOf(currentElement);
    if (currentIndex > 0) {
      allInputs[currentIndex - 1].focus();
    }
  } else if (e.key === 'ArrowDown') {
    // Logic to move to the next input field
    const currentElement = e.target;
    const allInputs = document.querySelectorAll('input');
    const currentIndex = Array.from(allInputs).indexOf(currentElement);
    if (currentIndex < allInputs.length - 1) {
      allInputs[currentIndex + 1].focus();
    }
  }
}

// Add event listener for up and down arrow keys to all input fields
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('keyup', handleUpDownKeys);
});

// Load existing flight plans from local storage
function loadFlightPlans() {
  return JSON.parse(localStorage.getItem('flightPlans')) || [];
}

// Save flight plans to local storage
function saveFlightPlans(flightPlans) {
  localStorage.setItem('flightPlans', JSON.stringify(flightPlans));
}

// Load flight plans on page load
let flightPlans = loadFlightPlans();


document.getElementById('flightPlanForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // ... (your existing form submission logic)

  // Update the flightPlans array and save to local storage
  flightPlans.push(formData);
  saveFlightPlans(flightPlans);
});


// Function to update the flight plans when a new plan is created
window.addEventListener('flightPlanUpdated', function () {
  flightPlans = loadFlightPlans(); // Reload flight plans after the update
});

// Function to check if the Google Sheets iframe should be reloaded
function checkForUpdates() {
  // Get the iframe element
  const iframe = document.getElementById('flightPlanIframe');
  
  // Get the current timestamp for the iframe URL
  const currentUrl = iframe.src.split('?')[0]; // Strip any query parameters
  const newUrl = currentUrl + "?t=" + new Date().getTime(); // Add a timestamp to force reload

  // Fetch the sheet to check if there are any updates (You can also use an API if available)
  fetch(newUrl)
      .then(response => {
          if (response.ok) {
              // If the fetch is successful, reload the iframe with a new timestamp
              iframe.src = newUrl; // This will refresh the iframe
          }
      })
      .catch(error => {
          console.error('Error fetching the Google Sheet:', error);
      });
}

// Set an interval to check for updates every 30 seconds (adjust as needed)
setInterval(checkForUpdates, 30000); // 30000 milliseconds = 30 seconds

// Function to check visibility of the compass based on the iframe URL
function checkCompassVisibility() {
  const iframe = document.getElementById('displayIframe');
  const compassContainer = document.querySelector('.compass-container');

  if (iframe.src.includes('dev.project-flight.com')) {
    compassContainer.style.display = 'block'; // Show compass
  } else {
    compassContainer.style.display = 'none'; // Hide compass
  }
}

function loadUrl(url) {
  const iframe = document.getElementById('displayIframe');
  iframe.src = url; // Set the iframe source to the selected URL
  localStorage.setItem('lastIframeUrl', url); // Save URL to localStorage

  // Check compass visibility after loading the new URL
  iframe.onload = checkCompassVisibility; // Check after the iframe has loaded
}

// Function to generate a random squawk code starting with "3"
function generateRandomSquawk() {
  // Create a random 3-digit number using only 0-7
  const randomPart = Array.from({ length: 3 }, () => Math.floor(Math.random() * 8)).join('');
  return "3" + randomPart; // Ensures the squawk starts with 3
}

// Automatically generate a squawk code and set it in the squawk input field when the page loads
document.getElementById('squawk').value = generateRandomSquawk();
