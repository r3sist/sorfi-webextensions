// Prepare Local Storage
if (!localStorage.isInitialized)
{
	localStorage.keypass = 0;
	localStorage.isInitialized = true;
}

var ID = 0;
var lastAvailableCount = 0;

// Update Counter
function updateCount(hint = 0)
{
	chrome.browserAction.setBadgeBackgroundColor({ color: "#e3423e" });
	// chrome.browserAction.setBadgeTextColor({ color: "#ffffff" }); // Firefox only: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/browserAction/setBadgeTextColor
	if (hint)
		chrome.browserAction.setBadgeText({ text: (lastAvailableCount + hint).toString() });

	var req = new XMLHttpRequest();
	req.open("GET", 'https://sorfi.org/api/json/oview/' + localStorage.keypass, true);
	req.onreadystatechange = function ()
	{
		if (req.readyState != 4 || req.status != 200)
			return;

		// Process JSON and get unwatched and released count
		var data = JSON.parse(req.responseText);
		var availableCount = 0;
		for (var i = 0, len = data.length; i < len; i++)
			if (data[i]['w'] != 1 && data[i]['inair'] == 1)
				++availableCount;

		lastAvailableCount = availableCount;
		chrome.browserAction.setBadgeText({ text: availableCount.toString() });
	};
	req.send();
}

function handleMessage(request, sender)
{
	if (request.action == "requestUpdateCount")
		updateCount(request.counterAdjust);
}
chrome.runtime.onMessage.addListener(handleMessage); // Add a listener for incoming messages

updateCount();
setInterval(updateCount, 60000 * 30); // Updates the counter every 30 minutes



// Subtitle checker from v3.0.0
var ID2 = 0;
var refTime = Math.round((new Date()).getTime() / 1000);

function showNotification(stitle, ese, eep) {
    ID2++;

    var opts = {
        type : "basic",
        title: "Új magyar felirat",
        message: stitle+' '+ese+'×'+eep,
        iconUrl: "assets/sorfi_icon128.png",
        buttons:[{title: "Sorozat figyelő megnyitása"}],
        requireInteraction: true
    };

    chrome.notifications.create("id" + ID2, opts, creationCallback);
}

function creationCallback() {
    console.log("Új felirat ablak: "+ID2);
}

function notificationBtnClick(notID, iBtn) {
    chrome.tabs.create({ 'url': 'https://sorfi.org/' });
}

function checkSub() {
    setInterval(function() {
        var req2 = new XMLHttpRequest();
        req2.open("GET", 'https://sorfi.org/api/legacyjson/subtitles/'+refTime+'/'+localStorage.keypass, true);
        req2.onreadystatechange = function() {
            if (req2.readyState == 4) {
                if (req2.status == 200) {
                    if (req2.responseText.length >= 1) {
                        var subs = JSON.parse(req2.responseText);
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
chrome.notifications.onButtonClicked.addListener(notificationBtnClick);
