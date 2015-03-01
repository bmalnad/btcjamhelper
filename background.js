chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        console.log("This is a first install!");
        chrome.storage.local.set({
          exchange: 'coinbase',
          fixrateuserscreen: true,
          fixpaymentscreen: true
        }, function() {
        	console.log("BTCjam Helper default preferences set.");
        });

    }else if(details.reason == "update"){
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("BTCjam Helper updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
});




