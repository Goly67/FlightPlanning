// Logout function with API call
function logout() {
    // Clear local storage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("isLoggedIn");

    // Call the logout API on your backend server
    fetch('https://loginapilogger.glitch.me/api/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include' // Include credentials like cookies if needed
    })
    .then(response => {
        if (response.ok) {
            window.location.href = 'https://goly67.github.io/FlightPlannerLogin/';
        } else {
            alert("Failed to log out. Please try again.");
        }
    })
    .catch(error => {
        console.error("Error logging out:", error);
        alert("An error occurred while logging out.");
    });
}

window.onload = function () {
  document.getElementById('callsign').focus();
  const savedUrl = localStorage.getItem('lastIframeUrl');
  document.getElementById('displayIframe');
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

function parseFlightData() {
  const data = document.getElementById("flightDataInput").value;

  const callsign = data.match(/Callsign:\s*(.+)/i)?.[1]?.trim();
  const aircraft = data.match(/Aircraft:\s*(.+)/i)?.[1]?.trim();
  const flightRule = data.match(/(?:VFR|IFR):\s*(\w+)/i)?.[1]?.trim(); // Adjusted regex to correctly capture IFR/VFR
  const departing = data.match(/(?:Departing|DEP):\s*(.+)/i)?.[1]?.trim();
  const arriving = data.match(/(?:Arriving|ARR):\s*(.+)/i)?.[1]?.trim();
  const cruisingLevel = data.match(/(?:CRZ FL|CFZ FL):\s*(.+)/i)?.[1]?.trim();

  // Set form values
  document.getElementById("callsign").value = callsign || "";
  document.getElementById("aircraft").value = aircraft || "";

  // If flightRule is found, set it in the form, otherwise set it to an empty string
  document.getElementById("flightRule").value = flightRule || "";

  // Map aircraft abbreviations to full names (if needed)
  const aircraftMapping = {
    "A220": "Airbus A220",
    "A320": "Airbus A320",
    "A330": "Airbus A330",
    "A330-300": "Airbus A330-300",
    "A350": "Airbus A350",
    "A350-900": "Airbus A350-900",
    "B717": "Boeing 717",
    "B727": "Boeing 727",
    "B737": "Boeing 737",
    "B757": "Boeing 757",
    "B787": "Boeing 787",
    "B777": "Boeing 777",
    "M350": "Piper M350",
    "HAWK T1": "Bae Systems Hawk T1",
    "TYPHOON": "Eurofighter Typhoon",
    "Q400": "Bombardier Dash 8-Q400",
    "150A": "Cessna 150A",
    "CITATION II": "Cessna Citation II",
    "F100": "Fokker 100",
    "G58": "Beechcraft Baron G58",
    "MD-11": "MD-11",
  };

  const aircraftDropdown = document.getElementById("aircraft");
  const aircraftOptions = Array.from(aircraftDropdown.options);

  if (aircraft) {
    const fullAircraftName = aircraftMapping[aircraft.toUpperCase()] || aircraft;
    const matchedOption = aircraftOptions.find(option =>
      option.value.toLowerCase() === fullAircraftName.toLowerCase()
    );

    if (matchedOption) {
      aircraftDropdown.value = matchedOption.value;
    } else {
      const newOption = new Option(fullAircraftName, fullAircraftName);
      aircraftDropdown.add(newOption);
      aircraftDropdown.value = fullAircraftName;
    }
  } else {
    aircraftDropdown.value = "";
  }

  document.getElementById("cruisingLevel").value = cruisingLevel || "";
  document.getElementById("departure").value = departing || "";
  document.getElementById("arrival").value = arriving || "";
}

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

// Store the last squawk code generated
let lastSquawk = "";

// Function to generate a random squawk code starting with "3"
function generateRandomSquawk() {
  // Create a random 3-digit number using only 0-7
  const randomPart = Array.from({ length: 3 }, () => Math.floor(Math.random() * 8)).join('');
  return "3" + randomPart; // Ensures the squawk starts with 3
}

// Function to ensure the new squawk code is different from the last one
function generateUniqueSquawk() {
  let newSquawk = generateRandomSquawk();
  // Check if the new squawk is the same as the last one
  while (newSquawk === lastSquawk) {
    newSquawk = generateRandomSquawk(); // Regenerate until it's different
  }
  lastSquawk = newSquawk; // Store the new squawk
  return newSquawk;
}

window.onload = function () {
  // Assuming you have an API that returns user info, including the username
  fetch('https://your-api-url.com/getUserInfo', {
    method: 'GET', // or 'POST' depending on your API
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token') // Or other auth mechanism
    }
  })
    .then(response => response.json())
    .then(data => {
      const username = data.username;  // Assuming the API returns { username: 'JohnDoe' }
      const welcomeMessageDiv = document.getElementById('welcomeMessage');

      if (username) {
        welcomeMessageDiv.textContent = `Welcome, ${username}`;
      } else {
        welcomeMessageDiv.textContent = `Welcome, Guest`;
      }
    })
    .catch(error => {
      console.error('Error fetching user info:', error);
      const welcomeMessageDiv = document.getElementById('welcomeMessage');
      welcomeMessageDiv.textContent = `Welcome, Guest`;
    });
};


// Automatically generate a squawk code and set it in the squawk input field when the page loads
document.getElementById('squawk').value = generateUniqueSquawk();
