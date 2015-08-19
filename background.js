chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        console.log("Thank you for using BTCjamHelper!");
        var thisVersion = chrome.runtime.getManifest().version;
        chrome.storage.local.set({
        exchange: 'coindesk',
        watchinterval: 15,
        fixrateuserscreen: true,
        fixpaymentscreen: true,
        fixfollowersscreen: true,
        stopaskingformoney: false
        }, function() {
        	console.log("BTCjam Helper default preferences set.");
            notifyUserSimple({title: "BTCjamHelper Extension", icon: "icon_128.png", body: "Version "+ thisVersion +" installed successfully."});
        });

    }else if(details.reason == "update"){
        var thisVersion = chrome.runtime.getManifest().version;
        chrome.storage.local.set({
        exchange: 'coindesk',
        watchinterval: 15,
        fixrateuserscreen: true,
        fixpaymentscreen: true,
        fixfollowersscreen: true,
        stopaskingformoney: false
        }, function() {
            notifyUserSimple({title: "BTCjamHelper Extension", icon: "icon_128.png", body: "Upgraded to version "+ thisVersion +"."});
        });
    }
});


chrome.storage.local.get("watchinterval", function (obj) {
    if((typeof(obj.watchinterval) == 'undefined') || (parseInt(obj.watchinterval) == 0)){
        // console.log("not checking watched users");
    }else{
        // console.log("checking watched users every " + obj.watchinterval + " minutes");
        chrome.alarms.create("checkWatchedUsers", {periodInMinutes:parseInt(obj.watchinterval)});     
    }
});
 
chrome.runtime.onMessage.addListener(function(msg, sender) {
    switch(msg.from){
        case 'options':
            if (msg.subject === 'updateWatchInterval') {
                chrome.alarms.get('checkWatchedUsers', function(alarm){
                    chrome.storage.local.get("watchinterval", function(data){
                        if(alarm.periodInMinutes != parseInt(data.watchinterval)){
                            chrome.alarms.clear("checkWatchedUsers", function(){
                                chrome.alarms.create("checkWatchedUsers", {periodInMinutes:parseInt(data.watchinterval)});
                            });
                        }
                    });
                });
            }
            break;
        case 'helper':
            if(msg.subject === 'sendDemoNotification'){
                notifyUserSimple({title: "BTCjamHelper Extension", icon: "icon_128.png", body: "You will get a notification just like this when a loan or note is listed for any watched user!"});
            }
            break;
    }
});

chrome.alarms.onAlarm.addListener(function(alarm){
    console.log(alarm.name + " called at " + new Date(parseFloat(alarm.scheduledTime)));
    switch(alarm.name){
        case 'checkWatchedUsers':
            checkWatchedUsers();
            break;
        // case 'reloadNoteData':
        //     reloadNoteData();
        //     break;
    }
});

function checkWatchedUsers(){
    var loadWatchedUsers = function(){
        chrome.storage.local.get({"already_notified_loans": []}, function(data){

            var alreadynotifiedloans = data.already_notified_loans;

            chrome.storage.local.get("watched_users", function (data) {
                $(data.watched_users).each(function(count, watched){
                    $.ajax({url:"https://btcjam.com/users/" + watched.id}).done(function(data){
                        $(data).find("#my_loans-table > tbody > tr").each(function (count, row){
                            var loanstatus = $(row).find('td:nth-child(7)').text().trim();
                            var href = $(row).find('td:nth-child(1) > a').attr("href");
                            var loanid = href.substring(10, href.indexOf('-'));
                            if(alreadynotifiedloans.indexOf(loanid) == -1){
                                switch(loanstatus){
                                    case 'Funding in progress':
                                        notifyUser({title: "BTCjamHelper Alert", icon: "icon_128.png", body: watched.name+" has a new loan listing!", buttontitle: 'View Listing', url: 'https://btcjam.com'+$(row).find('td:nth-child(1) > a').attr("href")});
                                        alreadynotifiedloans.push(loanid);
                                        chrome.storage.local.set({already_notified_loans: alreadynotifiedloans});                                    
                                        break;
                                    case 'Overdue':
                                    case 'Active':
                                    case 'Repaid':
                                        break;
                                }                                
                            }
                        });
                    });
                    
                    chrome.storage.local.get({"already_notified_notes": []}, function(data){
                        var alreadynotifiednotes = data.already_notified_notes;

                        var notes_url = "https://btcjam.com/notes?" + btoa(watched.name.replace("...",""));
                        var search_url = "https://btcjam.com/notes/allnotes.json?sEcho=4&iColumns=8&sColumns=&iDisplayStart=0&iDisplayLength=100&sSearch=" + watched.name.replace("...","");
                        $.getJSON(search_url).done(function(data){
                            if(data.aaData.length > 0){
                                var notifiedaboutuser = false;
                                $(data.aaData).each(function(count, note){
                                    var noteid = $(note[7]).attr('href').substring(7, $(note[7]).attr('href').indexOf('/confirm_buy'));
                                    if(alreadynotifiednotes.indexOf(noteid) == -1){
                                        console.log("not yet notified of note " + noteid);
                                        if(!notifiedaboutuser){
                                            console.log("new note for "+watched.name+" : " + notes_url);
                                            notifyUser({title: "BTCjamHelper Alert", icon: "icon_128.png", body: watched.name.replace("...","")+" has notes available for sale!", buttontitle: 'View Notes', url: notes_url});
                                        }
                                        notifiedaboutuser = true;
                                        alreadynotifiednotes.push(noteid);
                                        chrome.storage.local.set({already_notified_notes: alreadynotifiednotes});  
                                    }else{
                                        console.log("already notifed of note " + noteid);
                                    }                                    
                                });
                            }
                        });
                    });
                });
            });                     
        });
    }
    loadWatchedUsers();
}

function notifyUserSimple(message){
    chrome.notifications.create(message.title + Date.now(),{
        type: 'basic',
        iconUrl: message.icon,
        title: message.title,
        message: message.body,
        priority: 2
    },function(obj){
    });
}

function notifyUser(message){
    var id = "helper_notification_"+Date.now()+"_url_"+message.url;
    chrome.notifications.create(id,{
        type: 'basic',
        iconUrl: message.icon,
        title: message.title,
        message: message.body,
        buttons: [{ title: message.buttontitle }],
        isClickable: true,
        priority: 2
    },function(obj){
    });
}

chrome.notifications.onClosed.addListener(function(notificationid, byuser){
    chrome.notifications.clear(notificationid);
});

chrome.notifications.onButtonClicked.addListener(function(id, idx){
    console.log("going to: " + id.substring(id.indexOf('_url_') + 5));
    chrome.tabs.create({url: id.substring(id.indexOf('_url_') + 5)});
});
