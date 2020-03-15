// Save settings
window.addEventListener('load', function() {
    // Variables
    options.nptKp.value = localStorage.keypass;
    var night = JSON.parse(localStorage.getItem('night'));
    if (night == true) {
        document.getElementById("nptNight").checked = true;
    }

    // Save settings
    options.nptKp.onchange = function() {
        localStorage.keypass = options.nptKp.value;
        $('.c-console').html('Automatikusan mentve.');
    };
    
    options.nptNight.onchange = function() {
        localStorage.night = options.nptNight.checked;
        $('.c-console').html('Automatikusan mentve.');
    };
});
