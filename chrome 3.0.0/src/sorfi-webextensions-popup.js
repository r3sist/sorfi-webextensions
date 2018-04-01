$(function(){
  $('#footer').append('<small><a href="'+chrome.extension.getURL("sf-ch-opt.html")+'" target="_blank">Fiók beállítások</a></small> ');
  $('#footer').append('<small> | <a href="http://sorfi.org/doc.php?md=apps" target="_blank">Információ</a></small>');
});

function sendRequest() {
    var req = new XMLHttpRequest();
      req.open("GET", 'https://sorfi.org/api/legacyjson/oview/'+localStorage.keypass, true);
      req.onreadystatechange = function() {
          if (req.readyState == 4) {
            $('#sfdata').append('<p class="text-danger">Szinkronizálás...</p>');
            if (req.status == 200) {

              var data = jQuery.parseJSON(req.responseText);
              $('#sfdata').html('');
    
              // JSON feldolgozása
              for (var i=0, len=data.length; i < len; i++) {        
                  if (data[i]['w'] == 0) {
                    var date = new Date(data[i]['airtime']*1000);
                    var now = new Date();
                    var y = date.getFullYear();
                    var m = date.getMonth() + 1;
                    var d = date.getDate();
                    var weekday=new Array(7);
                      weekday[0]="Vasárnap";
                      weekday[1]="Hétfő";
                      weekday[2]="Kedd";
                      weekday[3]="Szerda";
                      weekday[4]="Csütörtök";
                      weekday[5]="Péntek";
                      weekday[6]="Szombat";
                    var dn = weekday[date.getDay()];
                    
                    var muted = ' text-muted';
                    if (date <= now) {
                      muted = '';
                    }  
                    
                    var hunsub = '';
                    if (data[i]['hashunsub'] == 1) {
                      hunsub = '<img src="../assets/sorfi-webextensions-sub.png" alt="Van magyar felirat" title="Van magyar felirat">';
                    }
                    
                    // Blokk összeállítása
                    var row = '<div class="row'+muted+'">\
                      <div class="col-3">\
                        '+m+'.'+d+'. '+dn+'\
                      </div>\
                      <div class="col-7">\
                        <a href="https://sorfi.org/sorozat/' + data[i]['sname'] + '" target="_blank" class="' + muted + '">\
                        ' + data[i]['stitle'] + ' \
                        ' + data[i]['se'] + 'x' + data[i]['ep'] + '</a> <small class="muted">' + data[i]['etitle'] + '</small></div>\
                        <div class="col-2">'+hunsub+'</div>\
                    </div>';
                    
                    $('#sfdata').append(row);
                  }        
              } // /for
            } // /ifreq200
          }
        };
      req.send();
} 

sendRequest();