/*
 * Sorozat figyelő 10 | https://sorfi.org
 * (c) 2009-2022 Bence VÁNKOS | https://resist.hu
 *
 * Script of option page of browser extension
 */

// Initialize options page
const night = JSON.parse(localStorage.getItem('night'));
if (night === true) {
    document.querySelector("head").insertAdjacentHTML("afterbegin", `<link href="../css/sorfi-bootstrap-chrome-dark.css" rel="stylesheet">`);
} else {
    document.querySelector("head").insertAdjacentHTML("afterbegin", `<link href="../css/sorfi-bootstrap-chrome.css" rel="stylesheet">`);
}

// Save settings
window.addEventListener('load', function() {
    // Variables
    options.nptKp.value = localStorage.getItem("keypass");

    let night = JSON.parse(localStorage.getItem('night'));
    if (night === true) {
        document.getElementById("nptNight").checked = true;
    }

    let subtitleChecking = JSON.parse(localStorage.getItem('subtitleChecking'));
    if (subtitleChecking === true) {
        document.getElementById("nptSub").checked = true;
    }

    // Save settings
    options.nptKp.onchange = function() {
        localStorage.setItem("keypass", options.nptKp.value);
        document.getElementById("console").innerText = "API kulcs automatikusan mentésre került.";
    };
    
    options.nptNight.onchange = function() {
        localStorage.setItem("night", options.nptNight.checked);
        document.getElementById("console").innerText = "Téma beállítás automatikusan mentésre került.";
    };

    options.nptSub.onchange = function() {
        localStorage.setItem("subtitleChecking", options.nptSub.checked);
        document.getElementById("console").innerText = "Felirat értesítő beállítás automatikusan mentésre került.";
    };
});
