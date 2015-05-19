      // Saves options to chrome.storage
function saveOptions() {
	var exchange = $('#exchange').val();
	var watchinterval = $('#watchinterval').val();
    // var removewarnings = $('#removewarnings').is(':checked') ? true : false;
    var fixrateuserscreen = $('#fixrateuserscreen').is(':checked') ? true : false;
    var fixpaymentscreen = $('#fixpaymentscreen').is(':checked') ? true : false;
    var notifynewlisting = $('#notifynewlisting').is(':checked') ? true : false;
    var fixfollowersscreen = $('#fixfollowersscreen').is(':checked') ? true : false;
    //stopaskingformoney
    var stopaskingformoney = $('#stopaskingformoney').is(':checked') ? true : false;
    
    chrome.storage.local.set({
		exchange: exchange,
		watchinterval: watchinterval,
		fixrateuserscreen: fixrateuserscreen,
		fixpaymentscreen: fixpaymentscreen,
		notifynewlisting: notifynewlisting,
		fixfollowersscreen: fixfollowersscreen,
        stopaskingformoney: stopaskingformoney

    }, function() {
		// Update status to let user know options were saved.
			$('#status').text('Options saved.');
			$('#status').css('display','block');

			chrome.runtime.sendMessage({
			    from:    'options',
			    subject: 'updateWatchInterval'
			});

		setTimeout(function() {
			$('#status').text('');
			$('#status').css('display','none');
		}, 2000);
    });
}

  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
function loadOptions() {
    chrome.storage.local.get({
      exchange: 'coindesk',
      watchinterval: '10000000',
      removewarnings: true, 
      fixrateuserscreen: true,
      fixpaymentscreen: true,
      notifynewlisting: true,
      fixfollowersscreen: true,
      stopaskingformoney: false
    }, function(options) {
      $('#exchange').val(options.exchange);
      $('#watchinterval').val(options.watchinterval);
      $('#fixrateuserscreen').prop('checked',options.fixrateuserscreen);
      $('#fixpaymentscreen').prop('checked',options.fixpaymentscreen);
      $('#notifynewlisting').prop('checked',options.notifynewlisting);
      $('#fixfollowersscreen').prop('checked',options.fixfollowersscreen);
      $('#stopaskingformoney').prop('checked',options.stopaskingformoney);
    });
}

document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('save').addEventListener('click', saveOptions);

// /* Once the DOM is ready... */
// window.addEventListener('DOMContentLoaded', function() {
//     /* ...query for the active tab... */
//     chrome.tabs.query({
//         active: true,
//         currentWindow: true
//     }, function(tabs) {
//         /* ...and send a request for the DOM info... */
//         chrome.tabs.sendMessage(
//                 tabs[0].id,
//                 {from: 'popup', subject: 'DOMInfo'},
//                 /* ...also specifying a callback to be called 
//                  *    from the receiving end (content script) */
//                 console.log('message sent from popup!'));
//     });
// });

$(document).ready(function(){
    $('body').on('click', 'a.donate', function(){
        chrome.tabs.create({url: $(this).attr('href')});
        return false;
    });
});