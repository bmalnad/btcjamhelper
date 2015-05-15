// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

//Called when the user clicks on the browser action.
// chrome.browserAction.onClicked.addListener(function(tab) {
// 	chrome.tabs.executeScript(null,{
// 		file: 'jquery-2.1.1.min.js'
// 	});
// 	chrome.tabs.executeScript(null,{
// 		file: 'oauth2.js'
// 	});
// 	chrome.tabs.executeScript(null,{
// 		file: 'functions.js'
// 	});
// 	chrome.tabs.executeScript({
// 		code: 'btchelper_init();'
// 	});
//     chrome.tabs.insertCSS(tab.id, {
//         file: "helper.css"
//     });
// });

// chrome.runtime.onMessage.addListener(
//    function(request, sender, sendResponse)
//    {
//       if (request.Action === "GetToken")
//       {
//          chrome.identity.getAuthToken({'interactive': true}, function(token)
//          {
//             console.log("token:"+token);
//             sendResponse({Result: token});
//          });
//    }
// });

// chrome.browserAction.onClicked.addListener(function(tab) {

// console.log("bg");

// 	chrome.identity.launchWebAuthFlow(
// 		{'url': 'https://btcjam.com/oauth/authorize', 'interactive': true},
//   		function(redirect_url) { console.log(url) });
// });