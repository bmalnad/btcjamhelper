      // Saves options to chrome.storage
      function saveOptions() {
        var exchange = $('#exchange').val();
        var removewarnings = $('#removewarnings').is(':checked') ? true : false;
        var fixrateuserscreen = $('#fixrateuserscreen').is(':checked') ? true : false;
        var fixpaymentscreen = $('#fixpaymentscreen').is(':checked') ? true : false;
      //  var likesColor = document.getElementById('like').checked;
        chrome.storage.local.set({
          exchange: exchange,
          removewarnings: removewarnings,
          fixrateuserscreen: fixrateuserscreen,
          fixpaymentscreen: fixpaymentscreen
        }, function() {
          // Update status to let user know options were saved.
            $('#status').text('Options saved.');
          setTimeout(function() {
            $('#status').text('');
          }, 2000);
        });
      }

      // Restores select box and checkbox state using the preferences
      // stored in chrome.storage.
      function loadOptions() {
        // Use default value color = 'red' and likesColor = true.
        chrome.storage.local.get({
          exchange: 'coindesk',
          removewarnings: false, 
          fixrateuserscreen: false,
          fixpaymentscreen: false
        }, function(options) {
          $('#exchange').val(options.exchange);
          $('#removewarnings').prop('checked',options.removewarnings);
          $('#fixrateuserscreen').prop('checked',options.fixrateuserscreen);
          $('#fixpaymentscreen').prop('checked',options.fixpaymentscreen);
        });
      }

      document.addEventListener('DOMContentLoaded', loadOptions);
      document.getElementById('save').addEventListener('click', saveOptions);

      $(document).ready(function(){
         $('body').on('click', 'a.donate', function(){
           chrome.tabs.create({url: $(this).attr('href')});
           return false;
         });
      });