var ID = 0;
var refTime = Math.round((new Date()).getTime() / 1000);

function showNotification(stitle, ese, eep) {  
    ID++;
  
    var opts = {
        type : "basic",
        title: "Új magyar felirat",
        message: stitle+' '+ese+'×'+eep,
        iconUrl: "assets/sorfi-webextensions-icon128.png",
        buttons:[{title: "Sorozat figyelő megnyitása"}],
        requireInteraction: true
    };

    chrome.notifications.create("id" + ID, opts, creationCallback);
}

function creationCallback() {	
    console.log("Új felirat ablak: "+ID);
}

function notificationBtnClick(notID, iBtn) {
    chrome.tabs.create({ 'url': 'https://sorfi.org/' });
}

function checkSub() {
    setInterval(function() {
    console.log('checked');
    
    var req2 = new XMLHttpRequest();
    req2.open("GET", 'https://sorfi.org/api/legacyjson/subtitles/'+refTime+'/'+localStorage.keypass, true);
    req2.onreadystatechange = function() {
        if (req2.readyState == 4) {
          if (req2.status == 200) {
            if (req2.responseText.length >= 1) {                
                var subs = jQuery.parseJSON(req2.responseText);
                for (var i=0, len=subs.length; i < len; i++) {
                    showNotification(subs[i]['stitle'], subs[i]['ese'], subs[i]['eep']);                  
                }
            }
            refTime = Math.round((new Date()).getTime() / 1000);
          }
        }
    };
    req2.send();
  }, 1000*60*2);
}

document.addEventListener("DOMContentLoaded", checkSub);
document.addEventListener("DOMContentLoaded", function(){document.write('<script type="text/javascript" src="assets/jquery.min.js"><\/script>');});
chrome.notifications.onButtonClicked.addListener(notificationBtnClick); 