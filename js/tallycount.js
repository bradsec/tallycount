var counts = {};
var countHistory = [];
var isDoneMode = false;

function initializeApp() {
  var savedCounts = localStorage.getItem("savedCounts");
  if (savedCounts) {
    counts = JSON.parse(savedCounts);
    updateCounters();
    document.getElementById("counter-creation-form").style.display = "none"; // Hide counter creation form

    // Check if there are counters in localStorage
    if (Object.keys(counts).length > 0) {
      // Show the extra buttons if there are counters
      document
        .querySelectorAll(".counter-extras")
        .forEach((el) => (el.style.display = "flex"));
    } else {
      // Hide the extra buttons if there are no counters
      document
        .querySelectorAll(".counter-extras")
        .forEach((el) => (el.style.display = "none"));
    }
  } else {
    document.getElementById("counter-creation-form").style.display = "block"; // Show counter creation form
    // Hide the extra buttons
    document
      .querySelectorAll(".counter-extras")
      .forEach((el) => (el.style.display = "none"));
  }

  // Load counter frequencies from local storage
  var loadedFrequencies = localStorage.getItem("counterFrequencies");
  if (loadedFrequencies) {
    counterFrequencies = JSON.parse(loadedFrequencies);
  }

  isDoneMode = localStorage.getItem("isDoneMode") === "true";
  loadClockVisibilityPreference(); // Call this function here to ensure proper loading
  loadSavedCounts();

  setToggles();
}


function setToggles() {
  // Load preferences
  var clockVisible = localStorage.getItem("clockVisible");
  var soundEnabled = localStorage.getItem("soundEnabled");

  // Set default preferences if they haven't been set yet
  if (soundEnabled === null) {
    soundEnabled = "true"; // Sound enabled by default
    localStorage.setItem("soundEnabled", soundEnabled);
  }
  if (clockVisible === null) {
    clockVisible = "false"; // Clock hidden by default
    localStorage.setItem("clockVisible", clockVisible);
  }

  // Set the checkboxes based on preferences
  document.getElementById("sound-enabled").checked = soundEnabled === "true";
  document.getElementById("show-time").checked = clockVisible === "true";
}

// Update the digital clock
function updateDigitalClock() {
  var digitalClock = document.getElementById("digital-clock");
  var currentTime = new Date();
  var hours = currentTime.getHours().toString().padStart(2, "0");
  var minutes = currentTime.getMinutes().toString().padStart(2, "0");
  var seconds = currentTime.getSeconds().toString().padStart(2, "0");
  digitalClock.textContent = hours + ":" + minutes + ":" + seconds;
}

// Object to hold counters and their respective frequencies
var counterFrequencies = {};

// Function to generate a random frequency for each counter
function assignFrequency(counterName) {
  // Define a range for the frequencies
  const minFrequency = 200; // Min frequency in Hertz
  const maxFrequency = 800; // Max frequency in Hertz
  // Assign a random frequency within the range
  counterFrequencies[counterName] =
    Math.random() * (maxFrequency - minFrequency) + minFrequency;
}

function addCounter() {
  var counterName = document.getElementById("counter-name").value.trim();
  if (counterName) {
    counts[counterName] = 0;
    assignFrequency(counterName); // Assign a frequency to this counter
    document.getElementById("counter-name").value = ""; // Clear the input
    updateCounters();
    // Update and save counter frequencies
    counterFrequencies[counterName] = counterFrequencies[counterName] || 0; // Initialize if not present
    localStorage.setItem(
      "counterFrequencies",
      JSON.stringify(counterFrequencies)
    );

    // Display the flash banner with the counter name
    const message = `Counter '${counterName}' added.`;
    displayFlashMessage(message, "info");
  } else {
    alert("Please enter a counter name.");
  }
}

function saveAndContinue() {
  if (Object.keys(counts).length === 0) {
    alert("Please add at least one counter.");
  } else {
    // Check if soundEnabled is already set, if not, set it to true
    var soundEnabled = localStorage.getItem("soundEnabled");
    if (soundEnabled === null) {
      soundEnabled = "true"; // Sound enabled by default
      localStorage.setItem("soundEnabled", soundEnabled);
    }

    saveCounts();
    document.getElementById("counter-creation-form").style.display = "none";

    // Show the extra buttons only if there are counters
    document
      .querySelectorAll(".counter-extras")
      .forEach(function (extraButton) {
        extraButton.style.display = "flex";
      });

    isDoneMode = true;
    localStorage.setItem("isDoneMode", isDoneMode);

    window.scroll({ top: 0, left: 0, behavior: "smooth" });
  }
}


// Save counts to local storage
function saveCounts() {
  localStorage.setItem("savedCounts", JSON.stringify(counts));
}

function increment(counterName) {
  if (isDoneMode) {
    counts[counterName]++;
    saveCounts();
    updateCounters();
    // Directly play sound if sound is enabled and there is a frequency for the counter.
    const soundEnabled = localStorage.getItem("soundEnabled") === "true";
    const frequency = counterFrequencies[counterName];
    if (soundEnabled && frequency) {
      // Call resumeAudioContext to ensure the audio context is active
      resumeAudioContext();
      // Play the sound with the frequency assigned to this counter
      playSound(frequency, 50, "square", 0.05);
    }
  }
}

function displayFlashMessage(message, type) {
  const flashBanner = document.getElementById("flash-banner");
  const flashBannerContainer = document.querySelector(
    ".flash-banner-container"
  );

  // Remove existing color classes
  flashBannerContainer.classList.remove(
    "flash-banner-success",
    "flash-banner-danger",
    "flash-banner-warning",
    "flash-banner-info"
  );

  // Add the class for the specified type
  switch (type) {
    case "danger":
      flashBannerContainer.classList.add("flash-banner-danger");
      break;
    case "warning":
      flashBannerContainer.classList.add("flash-banner-warning");
      break;
    case "success":
      flashBannerContainer.classList.add("flash-banner-success");
      break;
    case "info":
      flashBannerContainer.classList.add("flash-banner-info");
      break;
    default:
      flashBannerContainer.classList.add("flash-banner-success"); // Default to green if no type is specified
  }

  // Set the message and show the banner
  flashBanner.textContent = message;
  flashBannerContainer.style.display = "block";

  // Hide the banner after a delay
  setTimeout(function () {
    flashBannerContainer.style.display = "none";
  }, 2000); // Adjust the duration as needed
}

function resetApplication() {
  if (
    confirm(
      "Are you sure you want to reset the application? This will erase all counters and saved counts."
    )
  ) {
    // Clear local storage items
    localStorage.clear();

    // Reset counters and UI elements
    counts = {};
    counterFrequencies = {};
    countHistory = [];
    isDoneMode = false;

    // Reset form and UI elements to their default states
    document.getElementById("counter-creation-form").style.display = "block";
    document.getElementById("counters").innerHTML = "";
    document
      .querySelectorAll(".counter-extras")
      .forEach((el) => (el.style.display = "none"));
    document.getElementById("digital-clock").style.display = "none";
    document.getElementById("counter-name").value = "";
    document.getElementById("saved-counts").value = "";

    // Set the local storage items to their default values
    localStorage.setItem("soundEnabled", "true");
    localStorage.setItem("clockVisible", "false");
    localStorage.setItem("isDoneMode", "false");

    setToggles();
    displayFlashMessage("Application reset.", "success");
    window.scroll({ top: 0, left: 0, behavior: "smooth" });
  } else {
    displayFlashMessage("Reset cancelled.", "warning");
  }
}

// Load saved counts from local storage
function loadSavedCounts() {
  var savedCountHistory = localStorage.getItem("countHistory");
  if (savedCountHistory) {
    countHistory = JSON.parse(savedCountHistory);
    updateSavedCountsDisplay();
  }
}

function saveCurrentCount() {
  if (areAllCountsZero()) {
    // Exit the function without saving if all counts are zero
    return;
  }
  var currentTime = new Date();
  countHistory.push({
    counts: { ...counts },
    time: currentTime.toLocaleString(), // Includes date and time
  });
  saveCountsToLocalStorage();
  updateSavedCountsDisplay();
  resetCurrentCount();
  displayFlashMessage("Count saved.", "green");
}

// Function to check if all counts are zero
function areAllCountsZero() {
  return Object.values(counts).every((count) => count === 0);
}

// Function to reset the current counters to zero
function resetCurrentCount() {
  Object.keys(counts).forEach(function (type) {
    counts[type] = 0;
  });
  saveCounts();
  updateCounters();
}

// Function to confirm clearing all counts with the user
function confirmClearAllCounts() {
  if (confirm("Are you sure you want to clear all saved counts?")) {
    clearAllCounts();
  }
}

function clearAllCounts() {
  countHistory = [];
  clearCountsFromLocalStorage();
  updateSavedCountsDisplay();
  displayFlashMessage("All saved counts cleared.", "success");
}

// Function to save the count history to local storage
function saveCountsToLocalStorage() {
  localStorage.setItem("countHistory", JSON.stringify(countHistory));
}

// Function to clear counts from local storage
function clearCountsFromLocalStorage() {
  localStorage.removeItem("countHistory");
}

function updateSavedCountsDisplay() {
  var savedCountsTextarea = document.getElementById("saved-counts");
  var savedCountsText = countHistory
    .map(function (entry) {
      return entry.time + ": " + JSON.stringify(entry.counts);
    })
    .join("\n"); // Create a text representation of saved counts
  savedCountsTextarea.value = savedCountsText; // Set the text into the textarea
}

// Function to copy saved counts to clipboard
// Fallback function for copying text to clipboard
function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Workaround for some mobile device copy to clipboard issues
  // Ensure the textarea element is not visible.
  textArea.style.position = "fixed";
  textArea.style.top = 0;
  textArea.style.left = 0;
  textArea.style.width = "2em";
  textArea.style.height = "2em";
  textArea.style.padding = 0;
  textArea.style.border = "none";
  textArea.style.outline = "none";
  textArea.style.boxShadow = "none";
  textArea.style.background = "transparent";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand("copy");
    var msg = successful ? "successful" : "unsuccessful";
    console.log("Fallback: Copying text command was " + msg);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}

function copySavedCounts() {
  // Check if there are saved counts to copy
  if (countHistory.length === 0) {
    displayFlashMessage("No saved counts to copy.", "warning");
    return; // Exit the function if there is nothing to copy
  }

  const savedCountsTextarea = document.getElementById("saved-counts");
  const savedCountsText = savedCountsTextarea.value; // Use the text from the textarea

  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(savedCountsText);
    displayFlashMessage("Saved counts copied to clipboard.", "green"); // Replaced alert with flash message
    // Select the text in the textarea to provide visual feedback
    savedCountsTextarea.focus();
    savedCountsTextarea.select();
  } else {
    navigator.clipboard
      .writeText(savedCountsText)
      .then(() => {
        displayFlashMessage("Saved counts copied to clipboard.", "green"); // Replaced alert with flash message
        // Select the text in the textarea to provide visual feedback
        savedCountsTextarea.focus();
        savedCountsTextarea.select();
      })
      .catch((err) => {
        // Fallback for iOS devices that do not support clipboard API
        fallbackCopyTextToClipboard(savedCountsText);
        console.error("Error copying counts to clipboard: ", err);
        displayFlashMessage("Error copying counts to clipboard.", "red"); // Show error in flash message
      });
  }
}

// Function to update the counter display
function updateCounters() {
  var countersContainer = document.getElementById("counters");
  countersContainer.innerHTML = ""; // Clear the counters container
  Object.keys(counts).forEach(function (counter) {
    // Create a counter div for each counter that is clickable and includes a data-counter-name attribute
    countersContainer.innerHTML += `<div class="counter" data-counter-name="${counter}" onclick="increment('${counter}')">
            <div class="counter-name">${
              counter.charAt(0).toUpperCase() + counter.slice(1)
            }</div>
            <div id="${counter}-count" class="counts">${counts[counter]}</div>
        </div>`;
  });
}

function setupTouchListeners() {
  // Add event listeners for touchend and touchcancel to remove the 'pressed' class
  document
    .getElementById("counters")
    .addEventListener("touchend", function (event) {
      if (event.target.classList.contains("counter")) {
        event.target.classList.remove("pressed");
      }
    });

  document
    .getElementById("counters")
    .addEventListener("touchcancel", function (event) {
      if (event.target.classList.contains("counter")) {
        event.target.classList.remove("pressed");
      }
    });
}

function toggleDigitalClock() {
  const digitalClock = document.getElementById("digital-clock");
  const showTimeCheckbox = document.getElementById("show-time");

  digitalClock.style.display = showTimeCheckbox.checked ? "block" : "none";
  localStorage.setItem("clockVisible", showTimeCheckbox.checked.toString());
}

// Function to load the user's preference from localStorage
function loadClockVisibilityPreference() {
  const digitalClock = document.getElementById("digital-clock");
  const clockVisible = localStorage.getItem("clockVisible");

  // Check if the preference is set to 'true' (visible) or 'false' (hidden)
  if (clockVisible === "true") {
    digitalClock.style.display = "block";
  } else {
    digitalClock.style.display = "none";
  }
}

// Initialize AudioContext for sound effects
var audioCtx;

// Function to create and play sound, ensuring compatibility with iOS devices
function playSound(frequency, duration, _type, volume) {
  // Check if sound is enabled before trying to play it
  const soundEnabled = localStorage.getItem("soundEnabled") === "true";
  if (!soundEnabled) return;

  // Create an oscillator and gain node
  var osc = audioCtx.createOscillator();
  var gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.type = _type;
  osc.frequency.setValueAtTime(frequency, audioCtx.currentTime); // Set frequency immediately
  gain.gain.setValueAtTime(volume, audioCtx.currentTime); // Set volume immediately

  // Start and stop the oscillator
  osc.start();
  osc.stop(audioCtx.currentTime + duration / 1000); // Stop after 'duration' milliseconds
}

function toggleSound() {
  var checkbox = document.getElementById("sound-enabled");
  localStorage.setItem("soundEnabled", checkbox.checked.toString());
}

// Function to resume the AudioContext or create it if it doesn't exist
function resumeAudioContext() {
  // Check if the AudioContext is already created, and if not, create it
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Resume the audio context in case it's suspended
  if (audioCtx.state === "suspended") {
    audioCtx.resume().then(() => {
      console.log("Playback resumed successfully");
    });
  }
}

document.body.addEventListener("touchend", resumeAudioContext);

// Function to update the button text for both "Enable Sound" and "Show Time" buttons
function updateButtonText(buttonId, enabled) {
  const button = document.getElementById(buttonId);
  if (buttonId === "sound-toggle-text") {
    button.textContent = enabled ? "Disable Sound" : "Enable Sound";
  } else if (buttonId === "toggle-clock-button") {
    button.textContent = enabled ? "Hide Time" : "Show Time";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  setInterval(updateDigitalClock, 1000);
  document
    .getElementById("show-time")
    .addEventListener("change", toggleDigitalClock);
  document
    .getElementById("sound-enabled")
    .addEventListener("change", toggleSound);
  toggleSound();
  setupTouchListeners();
});
