const baseUrl = "https://sorfi.org/";
const counterUpdatesInMilliseconds = 600000; // 10 minutes
const subtitleCheckingInMilliseconds = 600000; // 10 minutes

// Prepare Local Storage
if (!localStorage.getItem("isInitialized"))
{
    localStorage.setItem("keypass", "0");
    localStorage.setItem("isInitialized", "true");
}

let ID = 0;
var lastAvailableCount = 0;

// Update Counter
function updateCounter(hint = 0)
{
	chrome.browserAction.setBadgeBackgroundColor({ color: "#e3423e" }); // Windows red
	// chrome.browserAction.setBadgeTextColor({ color: "#ffffff" }); // Firefox only: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/browserAction/setBadgeTextColor
	if (hint) {
        chrome.browserAction.setBadgeText({ text: (lastAvailableCount + hint).toString() });
    }

    const req = new XMLHttpRequest();
    req.open("GET", baseUrl + 'api/overview/' + localStorage.keypass, true);
	req.onreadystatechange = function () {
		if (req.readyState !== 4 || req.status !== 200) {
            return;
        }

		// Process JSON and get unwatched and released count
		let data = JSON.parse(req.responseText);
		let availableCount = 0;
		for (let i = 0, len = data.length; i < len; i++) {
            if (data[i]["isAired"] && !data[i]["markedAsWatched"]) {
                ++availableCount;
            }
        }

        lastAvailableCount = availableCount;
        if (availableCount > 0) {
            chrome.browserAction.setBadgeText({ text: availableCount.toString() });
        }
	};
	req.send();
}

function handleMessage(request, sender)
{
	if (request.action === "requestUpdateCount")
		updateCounter(request.counterAdjust);
}
chrome.runtime.onMessage.addListener(handleMessage); // Add a listener for incoming messages

updateCounter();
setInterval(updateCounter, counterUpdatesInMilliseconds);

// Subtitle checker from v3.0.0
let ID2 = 0;
let refTime = Math.round((new Date()).getTime() / 1000);

function showNotification(subtitle) {
    ID2++;

    const opts = {
        type: "basic",
        title: "Új sorozat felirat",
        message: `${subtitle["programmePrimaryTitle"]} ${subtitle["episodeSeason"]}×${subtitle["episodeNumber"]}`,
        iconUrl: "assets/sorfi_icon128.png",
        buttons: [{title: "Sorozat figyelő megnyitása"}],
        requireInteraction: true
    };

    chrome.notifications.create("id" + ID2, opts, creationCallback);
}

function creationCallback() {
    console.log("Új felirat ablak: "+ID2);
}

function notificationBtnClick(notID, iBtn) {
    chrome.tabs.create({ 'url': baseUrl });
}

function checkSubtitle() {
    setInterval(function() {
        const req2 = new XMLHttpRequest();
        req2.open("POST", `${baseUrl}api/subtitle/alert/${refTime}/${localStorage.getItem("keypass")}`, true);
        req2.onreadystatechange = function() {
            if (req2.readyState === 4) {
                if (req2.status === 200) {
                    if (req2.responseText.length >= 1) {
                        const subs = JSON.parse(req2.responseText);
                        for (let i = 0, len = subs.length; i < len; i++) {
                            showNotification(subs[i]);
                        }
                    }
                    refTime = Math.round((new Date()).getTime() / 1000);
                }
            }
        };
        req2.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        req2.send("referenceZone=" + encodeURI(Intl.DateTimeFormat().resolvedOptions().timeZone));
    }, subtitleCheckingInMilliseconds);
}

const subtitleChecking = JSON.parse(localStorage.getItem("subtitleChecking"));
if (subtitleChecking === true) {
    document.addEventListener("DOMContentLoaded", checkSubtitle);
    chrome.notifications.onButtonClicked.addListener(notificationBtnClick);
}
