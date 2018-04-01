function restoreOptions() {

  // options.nptUid.value = localStorage.uid;
  options.nptKp.value = localStorage.keypass;
  // options.nptSub.checked = JSON.parse(localStorage.disableSub);
  
 
  options.nptKp.onchange = function() {
    localStorage.keypass = options.nptKp.value;
  };
  
  // options.nptSub.onchange = function() {
    // localStorage.disableSub = options.nptSub.checked;
  // };
}

document.addEventListener("DOMContentLoaded", restoreOptions);
