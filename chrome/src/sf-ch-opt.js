// Save settings
window.addEventListener('load', function() {
    // Variables
    options.nptKp.value = localStorage.keypass;

    // Save settings
    options.nptKp.onchange = function() {
        localStorage.keypass = options.nptKp.value;
        $('.c-console').html('Automatikusan mentve.');
    };
});
