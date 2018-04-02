﻿$(function ()
{
	$('#footer').append('<small><a href="' + chrome.extension.getURL("src/sf-ch-opt.html") + '" target="_blank">Fiók beállítások</a></small> ');
});

// Downloaded/Watched button handler
function toggleAPI(source)
{
	args = source.id.split(',');
	op = args[0];
	eid = args[1];
	sid = args[2];
	src = '';
	needCounterUpdate = false;

	// Determine needed operation and if successful the image to set the button to
	if (op == 'dl')
	{
		if (source.src.indexOf("undownloaded") == -1)
		{
			op = 'xdl';
			src = '../icons/undownloaded.png';
		}
		else
			src = '../icons/downloaded.png';
	}
	else if (op == 'w')
	{
		needCounterUpdate = true;
		if (source.src.indexOf("unwatched") == -1)
		{
			op = 'xw';
			src = '../icons/unwatched.png';
		}
		else
			src = '../icons/watched.png';
	}
	else
		return;

	// Send the request
	var req = new XMLHttpRequest();
	req.open("GET", 'https://sorfi.org/api/set/ep/' + eid + '/' + sid + '/' + op + '/' + localStorage.keypass, true);
	req.onreadystatechange = function ()
	{
		if (req.readyState != 4 || req.status != 200)
			return;

		source.src = src;

		// Message the background script to update the episode counter
		if (needCounterUpdate)
			chrome.runtime.sendMessage({
				action: 'requestUpdateCount',
				counterAdjust: op == 'w' ? -1 : 1
			});
	};
	req.send();
}

// Return a formatted date displayed for an episode
function formattedDate(data)
{
	var weekday = new Array(7);
	weekday[0] = "Vasárnap";
	weekday[1] = "Hétfő";
	weekday[2] = "Kedd";
	weekday[3] = "Szerda";
	weekday[4] = "Csütörtök";
	weekday[5] = "Péntek";
	weekday[6] = "Szombat";

	var date = new Date(data['eairtime'] * 1000);
	var m = date.getMonth() + 1;
	var d = date.getDate();
	var dn = weekday[date.getDay()];

	return m + '.' + d + '. ' + dn;
}

// Returns formatted HTML content for an episode
function formattedEpisode(data)
{
	function lpad(num)
	{
		var s = "0" + num;
		return s.substr(s.length - 2);
	}

	var ep = data;
	var series = ep['sdata'];

	if (ep['w'] == 1)
		return null;

	var muted = '';
	var pb = '';
	var hunsub = '';
	var downloaded = '';
	var watched = '';
	if (ep['inair'] == 1)
	{
		pb = '<a href="https://thepiratebay.org/search/' + encodeURI(series['stitle']) + '%20S' + lpad(ep['ese']) +
			'E' + lpad(ep['eep']) +
			'/0/99/0" target="_blank"><img src="../icons/pb.png" alt="P" title="Piratebay"/></a>';
		downloaded = '<img src="../icons/' + (ep['dl'] == 1 ? 'downloaded.png' : 'undownloaded.png') + '" alt="D" title="' +
			(ep['dl'] == 1 ? 'Letöltve' : 'Nincs letöltve') + '" class="lnkbtn" id="dl,' + ep['eid'] + ',' + ep['sid'] +
			'"/>';
		watched = '<img src="../icons/' + (ep['w'] == 1 ? 'watched.png' : 'unwatched.png') + '" alt="W" title="' +
			(ep['w'] == 1 ? 'Megnézve' : 'Nincs megnézve') + '" class="lnkbtn" id="w,' + ep['eid'] + ',' + ep['sid'] +
			'"/>';
		hunsub = ep['ehashunsub'] == 1 ?
			'<img src="../icons/sub.png" alt="Sub" title="Van magyar felirat">' :
			'<img src="../icons/nosub.png" alt="NSub" title="Nincs magyar felirat">';
	}
	else
		muted = ' text-muted';

	// Return full content
	return '<div class="rowspan' + muted + '">\
			<div class="datespan">\
			' + formattedDate(ep) + '\
			</div>\
			<div class="textspan">\
			<a href="http://sorfi.org/sorozat/' + series['sname'] + '" target="_blank" class="' + muted + '">' +
				series['stitle'] + ' ' + ep['ese'] + 'x' + ep['eep'] + '</a> <small class="muted">' + ep['etitle'] + '</small>\
			</div>\
			<div class="subspan">' + pb + hunsub + downloaded + watched + '</div>\
			</div>';
}

// Series data response handler function
function onResponse(req)
{
	// Request handler function
	if (req.readyState != 4)
		return;

	var sfdata = $('#sfdata');

	if (req.status != 200)
	{
		sfdata.html('<p>Hiba történt. Ha nem töltődik be az oldal, ellenőrizd a fiók adataid!</p>');
		return;
	}

	// Process JSON and fill HTML content
	var data = JSON.parse(req.responseText);
	sfdata.html('');
	for (var i = 0, len = data.length; i < len; i++)
	{
		var row = formattedEpisode(data[i]);
		if (row)
			sfdata.append(row);
	}

	// Sign up for image click events on all buttons
	for (let img of document.querySelectorAll('img.lnkbtn'))
		img.addEventListener('click', function () { toggleAPI(img); });
}

// Main function upon opening the dropdown window
function sendRequest()
{
	var req = new XMLHttpRequest();
	req.open("GET", 'https://sorfi.org/api/json/oview/' + localStorage.keypass, true);
	req.onreadystatechange = function () { onResponse(req); };
	req.send();
}
sendRequest();
