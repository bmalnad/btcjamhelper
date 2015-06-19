var notes = [];
var notes_totalnotes = 0;
var notes_yields = [];
var notes_asking = [];
var notes_remaining = [];
var notes_invested = [];
var totalfollowers = 0;
var totalfollowing = 0;
var followers_following_combined = [];
var watchedcount = 0;
var investments = [];
// var investments_totalinvestments = 0;
var investments_received = [];
var investments_remaining = [];
var investments_invested = [];

var payables = [];
var receivables = [];
var myloans = [];
var user = null;
var ng_currentlisting = null;

loadUserInfo();

function loadUserInfo(){
	try{

		document.addEventListener('BTCjamHelper_LoadUserInfo', function(e) {
			user = e.detail.user;
		},false);

		var injectAngularCode = '(' + function(){
			var angulardata = angular.element('body').scope().data;
			document.dispatchEvent(new CustomEvent('BTCjamHelper_LoadUserInfo', {detail: angulardata}));
		} + ')();';
		var script = document.createElement('script');
		script.textContent = injectAngularCode;
		(document.head||document.documentElement).appendChild(script);
		script.parentNode.removeChild(script);

		btchelper_init();
	}
	catch(exception){
		//getting user obj from angular didn't work, do it the hard way
		var userid = $("body").attr("ng-init").replace(/[^0-9]+/g, '');
		$.getJSON("https://btcjam.com/users/" + userid, function(obj){
			user = obj;
		});		

		console.log("BTCjam Helper Error: " + exception);
		btchelper_init();
	}
}

function btchelper_init(){

	$.extend( $.fn, {
	    within: function( pSelector ) {
	        return this.filter(function(){
	       		return $(this).closest( pSelector ).length;
	        });
	    }
	});

	loadBitcoinPrice();
	loadRatings();
//	loadNotes();
	enhanceRateUserScreen();
	enhancePaymentsScreen();
	enhanceTransactionScreen();
	enhanceListingScreen();
	enhanceNotesScreen();
	enhanceInvestmentsScreen();
	displayMenuBar();
	loadInvestments();
	loadPayables();
	loadReceivables();
	// loadFollowers();
	enhanceFollowersScreen();

	var removeInfoMessages = function(){
		$("#body > div:nth-child(1) > div > div > button > span").click();
	}
	setTimeout(removeInfoMessages, 3000);
}

function displayMenuBar(){

	//remove bullshit
	$('#body > div:nth-child(2) > div > ul > li').each(function(count, item){
		if($(item).find('a').text() == 'Overview'){
			$(item).remove();
		}
	});
	if($('#body > div:nth-child(2) > div > ul > li').text().indexOf("Reputation") == -1){
		$('#body > div:nth-child(2) > div > ul').append("<li id='helper_menu_add_reputation'><a href='/my_account/reputation'>Reputation</a></li>");
	}
	if($('#body > div:nth-child(2) > div > ul > li').text().indexOf("Investments") == -1){
		$('#body > div:nth-child(2) > div > ul').append("<li id='helper_menu_add_investments'><a href='/listing_investments'>Investments</a></li>");
	}
	if($('#body > div:nth-child(2) > div > ul > li').text().indexOf("Rate Users") == -1){
		$('#body > div:nth-child(2) > div > ul').append("<li id='helper_menu_add_rateusers'><a href='/reputations/new'>Rate Users</a></li>");		
	}
	if($('#body > div:nth-child(2) > div > ul > li').text().indexOf("Payments") == -1){
		$('#body > div:nth-child(2) > div > ul').append("<li id='helper_menu_add_payments'><a href='/my_account/payments'>Payments</a></li>");
	}
	if($('#body > div:nth-child(2) > div > ul > li').text().indexOf("Transactions") == -1){
		$('#body > div:nth-child(2) > div > ul').append("<li id='helper_menu_add_transactions'><a href='/transactions'>Transactions</a></li>");
	}

	$('#body > div:nth-child(2) > div > ul').append("<li id='helper_menu_add_followers'><a href='/followers'>Follow / Watch Users</a></li>");

	//adds missing "Get a Loan" or "Invest" button at top
	if($('#bs-example-navbar-collapse-1 > ul > li:nth-child(2) > a').text().indexOf("Loan") >= 0){
		$('<li><a class="btn btn-green navbar-btn hidden-xs" href="/listings">Invest</a></li>').insertAfter($('#bs-example-navbar-collapse-1 > ul > li:nth-child(2)'));
	}else{
		$('<li><a class="btn btn-green navbar-btn hidden-xs" href="/listings/new">Get a Loan</a></li>').insertAfter($('#bs-example-navbar-collapse-1 > ul > li:nth-child(2)'));
	}

	// var menuhtml = "<div class=\"row\"><div class=\"col-md-12\"><ul class=\"nav nav-pills\"><li class=\"active\"><a href=\"/\">Dashboard</a></li><li><a href=\"/my_account/credit_rating\">Credit Rating</a></li><li><a href=\"/my_account/reputation\">Reputation</a></li><li><a href=\"/listing_investments\">Investments</a></li><li><a href=\"/my_account/loans\">Loans</a></li><li><a href=\"/my_account/payments\">Payments</a></li><li><a href=\"/users/referrals\">Referrals</a></li><li><a href=\"/users/edit\">Settings</a></li></ul></div></div>";
	// if($(location).attr('href').indexOf('/listings/') > 0){
	// 	$("#body").first(".row").prepend(menuhtml);
	// }
}

function loadBitcoinPrice(){
	chrome.storage.local.get("exchange", function (obj) {

		switch(obj.exchange){
			case "bitstamp":
				var bitstamp_apiurl = "https://www.bitstamp.net/api/ticker/"; 

				$.getJSON(bitstamp_apiurl, function ( data ) {
					var btcprice = "Bitstamp Price: $<span id='btchelper_btcprice'></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Your Balance: ";
					if($("#btchelper_btcprice").length){
						$("#btchelper_btcprice").css("font-weight: bold")
					}else{
						$(".balance-data").within(".navbar").prepend(btcprice);
					}
					$("#btchelper_btcprice").text(data.last);
				});	
				break;
			case "coindesk":
				var coindesk_apiurl = "https://api.coindesk.com/v1/bpi/currentprice.json";
				$.getJSON(coindesk_apiurl, function ( data ) {
					var btcprice = "CoinDesk Price: $<span id='btchelper_btcprice'></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Your Balance: ";
					if($("#btchelper_btcprice").length){
						$("#btchelper_btcprice").css("font-weight: bold")
					}else{
						$(".balance-data").within(".navbar").prepend(btcprice);
					}
					$("#btchelper_btcprice").text(data.bpi.USD.rate);
				});
				break;
			case "coinbase":
				var coinbase_apiurl = "https://api.exchange.coinbase.com/products/BTC-USD/book";
				$.getJSON(coinbase_apiurl, function ( data ) {
					var btcprice = "Coinbase Price: $<span id='btchelper_btcprice'></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Your Balance: ";
					if($("#btchelper_btcprice").length){
						$("#btchelper_btcprice").css("font-weight: bold")
					}else{
						$(".balance-data").within(".navbar").prepend(btcprice);
					}
					$("#btchelper_btcprice").text(data.asks[0][0]);
				});
				break;
			case "btc-e":
				var btce_apiurl = "https://btc-e.com/api/3/ticker/btc_usd";
				$.getJSON(btce_apiurl, function ( data ) {
					var btcprice = "BTC-e Price: $<span id='btchelper_btcprice'></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Your Balance: ";
					if($("#btchelper_btcprice").length){
						$("#btchelper_btcprice").css("font-weight: bold")
					}else{
						$(".balance-data").within(".navbar").prepend(btcprice);
					}
					$("#btchelper_btcprice").text(data.btc_usd.last);
				});
				break;				
		}

	});

	setTimeout(loadBitcoinPrice, 60000);

}

function enhancePaymentsScreen(){
	if($(location).attr('href').indexOf('/my_account/payments') > 0){

		var makePaymentsPretty = function(){
			begForMoney();

			$("#payments_calendar").css("display","none");
			$("#body > div:nth-child(6)").css("display","none");
			$("#body > div:nth-child(8)").css("display","none")
			$("#my_payments-table").css("display", "none");

			$("#body > div:nth-child(4) > div.col-md-9").append("<ul class='nav nav-tabs'> <li id='helper_payables_tab' role='presentation' class='helper_tab'><a class='helper_tab_a' href='#'>Payables</a></li> <li id='helper_overdue_tab' role='presentation' class='active helper_tab'><a class='helper_tab_a' href='#'>Overdue Receivables</a></li>  <li id='helper_pending_tab' class='helper_tab' role='presentation'><a class='helper_tab_a' href='#'>Pending Receivables</a></li>  <li id='helper_defaulted_tab' class='helper_tab' role='presentation'><a class='helper_tab_a' href='#'>Defaulted Receivables</a></li></ul><div id='helper_payments' class='row' style='background-color: #ffffff; padding: 4px;'></div>");
			$("#helper_payments").append("<table id='helper_payables_table' class='table table-striped table-bordered tablesorter'><thead id='helper_payables_table_head'><tr><th colspan='5' style=' padding: 8px; font-weight: bold; font-size: 14px; background-color: #0068c0; color: #ffffff'> <a href='#' class='btn btn-default' id='helper_payables_7'>Next 7 Days</a> <a href='#' class='btn btn-default' id='helper_payables_15'>Next 15 Days</a> <a href='#' class='btn btn-default' id='helper_payables_30'>Next 30 Days</a> <a href='#' class='btn btn-default' id='helper_payables_60'>Next 60 Days</a> <a href='#' class='btn btn-default' id='helper_payables_all'>All</a><a style='float: right;' download='btcjam_payables.xls' class='btn btn-default' id='helper_export_payables'>Export to Excel</a></th></tr><tr id='helper_payables_table_header_2nd_row'><th width='10%'>Due Date</th><th>Loan</th><th>Payment #</th><th width='10%'>Amount</th><th width='10%'>Paid</th></tr></thead></thead><tbody id='helper_payables_table_body'><tr><td colspan=5>Loading payables...</td></tr></tbody></table><table id='helper_overdue_payments_table' class='table table-striped table-bordered tablesorter'><thead id='helper_overdue_payments_table_head'><tr><th colspan='5' style=' padding: 8px; font-weight: bold; font-size: 14px; background-color: #DC143C; color: #ffffff'><a href='#' class='btn btn-default' id='helper_overdue_7'> < 7 Days</a> <a href='#' class='btn btn-default' id='helper_overdue_15'> < 15 Days</a> <a href='#' class='btn btn-default' id='helper_overdue_30'> < 30 Days</a> <a class='btn btn-default' id='helper_overdue_60'> < 60 Days</a>  <a class='btn btn-default' id='helper_overdue_all'>All</a>  <a style='float: right;' download='btcjam_overdue_payments.xls' class='btn btn-default' id='helper_export_overdue'>Export to Excel</a> </th></tr><tr id='helper_overdue_payments_table_header_2nd_row'><th width='10%'>Due Date</th><th width='10%'>Borrower</th><th>Loan</th><th width='10%'>Payment #</th><th>Amount</th></tr></thead><tbody id='helper_overdue_payments_table_body'><tr><td colspan=5>Loading overdue receivables...</td></tr></tbody><tfoot id='helper_overdue_payments_table_foot'></tfoot></table><table id='helper_pending_payments_table' class='table table-striped table-bordered tablesorter'><thead id='helper_pending_payments_table_head'><tr><th colspan='5' style=' padding: 8px; font-weight: bold; font-size: 14px; background-color: #008000; color: #000000'> <a class='btn btn-default' id='helper_pending_7'>Next 7 Days</a>  <a class='btn btn-default' id='helper_pending_15'>Next 15 Days</a>  <a class='btn btn-default' id='helper_pending_30'>Next 30 Days</a> <a class='btn btn-default' id='helper_pending_60'>Next 60 Days</a> <a class='btn btn-default' id='helper_pending_all'>All</a> <a style='float: right;' download='btcjam_pending_payments.xls' class='btn btn-default' id='helper_export_pending'>Export to Excel</a> </th></tr><tr id='helper_pending_payments_table_header_2nd_row'><th width='10%'>Due Date</th><th width='10%'>Borrower</th><th>Loan</th><th width='10%'>Payment #</th><th>Amount</th></tr></thead><tbody id='helper_pending_payments_table_body'><tr><td colspan=5>Loading pending receivables...</td></tr><tfoot id='helper_pending_payments_table_foot'></tfoot></tbody></table><table id='helper_defaulted_payments_table' class='table table-striped table-bordered tablesorter'><thead id='helper_defaulted_payments_table_head'><tr><th colspan='5' style=' padding: 8px; font-weight: bold; font-size: 14px; background-color: #778899; color: #000000'> <a class='btn btn-default' id='helper_defaulted_all'>All</a> <a style='float: right;' download='btcjam_defaulted_payments.xls' class='btn btn-default' id='helper_export_defaulted'>Export to Excel</a></th></tr><tr id='helper_defaulted_payments_table_header_2nd_row'><th width='10%'>Loan Date</th><th width='10%'>Borrower</th><th width='60%'>Loan <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></th><th width='10%'>Invested</th><th width='10%'>Remaining</th></tr></thead><tbody id='helper_defaulted_payments_table_body'><tr><td colspan=5>Loading defaulted receivables...</td></tr></tbody><tfoot id='helper_defaulted_payments_table_foot'></tfoot></table>");

			$("#helper_payables_table").css('display','none');
			$("#helper_overdue_payments_table").css('display','table');
			$("#helper_pending_payments_table").css('display','none');
			$("#helper_defaulted_payments_table").css('display','none');

			$("#helper_payables_table").tablesorter();
			$("#helper_overdue_payments_table").tablesorter();
			$("#helper_pending_payments_table").tablesorter();
			$("#helper_defaulted_payments_table").tablesorter();

			$("#helper_payables_tab").click(function(event){
				event.preventDefault();
				event.stopPropagation();
				$("#helper_overdue_tab").removeClass('active');
				$("#helper_defaulted_tab").removeClass('active');
				$("#helper_pending_tab").removeClass('active');
				$("#helper_payables_tab").addClass('active');
				$("#helper_overdue_payments_table").css('display','none');
				$("#helper_pending_payments_table").css('display','none');
				$("#helper_defaulted_payments_table").css('display','none');
				$("#helper_payables_table").css('display','table');
			});

			$("#helper_overdue_tab").click(function(event){
				event.preventDefault();
				event.stopPropagation();
				$("#helper_overdue_tab").addClass('active');
				$("#helper_defaulted_tab").removeClass('active');
				$("#helper_pending_tab").removeClass('active');
				$("#helper_payables_tab").removeClass('active');
				$("#helper_overdue_payments_table").css('display','table');
				$("#helper_pending_payments_table").css('display','none');
				$("#helper_defaulted_payments_table").css('display','none');
				$("#helper_payables_table").css('display','none');
			});

			$("#helper_pending_tab").click(function(event){
				event.preventDefault();
				event.stopPropagation();
				$("#helper_overdue_tab").removeClass('active');
				$("#helper_defaulted_tab").removeClass('active');
				$("#helper_pending_tab").addClass('active');
				$("#helper_payables_tab").removeClass('active');
				$("#helper_overdue_payments_table").css('display','none');
				$("#helper_pending_payments_table").css('display','table');
				$("#helper_defaulted_payments_table").css('display','none');
				$("#helper_payables_table").css('display','none');
			});

			$("#helper_defaulted_tab").click(function(event){
				event.preventDefault();
				event.stopPropagation();
				$("#helper_overdue_tab").removeClass('active');
				$("#helper_defaulted_tab").addClass('active');
				$("#helper_pending_tab").removeClass('active');
				$("#helper_payables_tab").removeClass('active');
				$("#helper_overdue_payments_table").css('display','none');
				$("#helper_pending_payments_table").css('display','none');
				$("#helper_defaulted_payments_table").css('display','table');
				$("#helper_payables_table").css('display','none');
			});

			$('#helper_payables_7').addClass('helper_payments_button btn-sm').click(function(event){
				event.preventDefault();
				event.stopPropagation();
				populatePayments("payables", 7);
				togglePaymentButtons(this);				
			});
			$('#helper_payables_15').addClass('helper_payments_button btn-sm').click(function(event){
				event.preventDefault();
				event.stopPropagation();
				populatePayments("payables", 15);
				togglePaymentButtons(this);				
			});
			$('#helper_payables_30').addClass('helper_payments_button btn-sm').click(function(event){
				event.preventDefault();
				event.stopPropagation();
				populatePayments("payables", 30);
				togglePaymentButtons(this);				
			});
			$('#helper_payables_60').addClass('helper_payments_button btn-sm').click(function(event){
				event.preventDefault();
				event.stopPropagation();
				populatePayments("payables", 60);
				togglePaymentButtons(this);				
			});
			$('#helper_payables_all').addClass('helper_payments_button btn-sm').click(function(event){
				event.preventDefault();
				event.stopPropagation();
				populatePayments("payables", 3650);
				togglePaymentButtons(this);				
			});
			$("#helper_export_payables").addClass('helper_payments_button btn-sm').click(function(event){
				event.stopPropagation();
				$("#helper_payables_table_body").prepend("<tr style='display: none;'><td>Due Date</td><td>Loan</td><td>Payment #</td><td>Amount</td><td>Paid</td></tr>");
				ExcellentExport.excel(document.getElementById('helper_export_payables'), 'helper_payables_table_body', 'Payables');
			});

			$('#helper_overdue_7').addClass('helper_payments_button btn-sm').click(function(event){
				event.preventDefault();
				event.stopPropagation();
				populatePayments("overdue", 7);
				togglePaymentButtons(this);
			});
			$('#helper_overdue_15').addClass('helper_payments_button btn-sm').click(function(event){
				event.preventDefault();
				event.stopPropagation();
				populatePayments("overdue", 15);
				togglePaymentButtons(this);
			});
			$('#helper_overdue_30').addClass('helper_payments_button btn-sm').click(function(event){
				event.preventDefault();
				event.stopPropagation();
				populatePayments("overdue", 30);
				togglePaymentButtons(this);
			});
			$('#helper_overdue_60').addClass('helper_payments_button btn-sm').click(function(event){
				event.preventDefault();
				event.stopPropagation();
				populatePayments("overdue", 60);
				togglePaymentButtons(this);
			});
			$('#helper_overdue_all').addClass('helper_payments_button btn-sm').click(function(event){
				event.preventDefault();
				event.stopPropagation();
				populatePayments("overdue", 3650);
				togglePaymentButtons(this);
			});
			$("#helper_export_overdue").addClass('helper_payments_button btn-sm').click(function(event){
				event.stopPropagation();
				$("#helper_overdue_payments_table_body").prepend("<tr style='display: none;'><td width='10%'>Due Date</td><td width='10%'>Borrower</td><td>Loan</td><td width='10%'>Payment #</td><td>Amount</td></tr>");
				ExcellentExport.excel(document.getElementById('helper_export_overdue'), 'helper_overdue_payments_table_body', 'Overdue Payments');
			});

			// $("#helper_toggle_pending").click(function(){
			// 	$("#helper_pending_payments_table").toggle();
			// 	$("#helper_pending_payments_table_header_2nd_row").toggle();
			// });
			// $('#helper_pending_1').addClass('helper_payments_button btn-sm').click(function(event){
			// 	event.preventDefault();
			// 	event.stopPropagation();
			// 	populatePayments("pending", 1);
			// 	togglePaymentButtons(this);
			// });
			$('#helper_pending_7').addClass('helper_payments_button btn-sm').click(function(event){
				event.preventDefault();
				event.stopPropagation();
				populatePayments("pending", 7);
				togglePaymentButtons(this);
			});
			$('#helper_pending_15').addClass('helper_payments_button btn-sm').click(function(event){
				event.preventDefault();
				event.stopPropagation();
				populatePayments("pending", 15);
				togglePaymentButtons(this);
			});
			$('#helper_pending_30').addClass('helper_payments_button btn-sm').click(function(event){
				event.preventDefault();
				event.stopPropagation();
				populatePayments("pending", 30);
				togglePaymentButtons(this);
			});
			$('#helper_pending_60').addClass('helper_payments_button btn-sm').click(function(event){
				event.preventDefault();
				event.stopPropagation();
				populatePayments("pending", 60);
				togglePaymentButtons(this);
			});
			$('#helper_pending_all').addClass('helper_payments_button btn-sm').click(function(event){
				event.preventDefault();
				populatePayments("pending", 3650);
				togglePaymentButtons(this);
			});
			$("#helper_export_pending").addClass('helper_payments_button btn-sm').click(function(event){
				event.stopPropagation();
				$("#helper_pending_payments_table_body").prepend("<tr style='display: none;'><td width='10%'>Due Date</td><td width='10%'>Borrower</td><td>Loan</td><td width='10%'>Payment #</td><td>Amount</td></tr>");
				ExcellentExport.excel(document.getElementById('helper_export_pending'), 'helper_pending_payments_table_body', 'Pending Payments');
			});


			$('#helper_defaulted_all').addClass('helper_payments_button btn-sm').click(function(event){
				event.preventDefault();
				event.stopPropagation();
				populatePayments("defaulted", 3650);
				togglePaymentButtons(this);
			});
			$("#helper_export_defaulted").addClass('helper_payments_button btn-sm').click(function(event){
				event.stopPropagation();
				$("#helper_defaulted_payments_table_body").prepend("<tr style='display: none;'><td>Loan Date</td><td>Borrower</td><td>Loan</td><td>Invested</td><td>Remaining</td></tr>");
				ExcellentExport.excel(document.getElementById('helper_export_defaulted'), 'helper_defaulted_payments_table_body', 'Defaulted Payments');
			});
			
			$('#helper_payables_7').addClass('active');
			$('#helper_overdue_7').addClass('active');
			$('#helper_pending_7').addClass('active');
			$('#helper_defaulted_all').addClass('active');

			var togglePaymentButtons = function(obj){
				$(".helper_payments_button").removeClass('active');
				$(obj).addClass('active');
			}



			var populatePaymentsWhenValid = function(){
				if(typeof populatePayments == 'undefined'){
					setTimeout(function(){
						populatePaymentsWhenValid();
					},100);
				}else{
					populatePayments('all', 7);
				}
			}
			populatePaymentsWhenValid();
		}

		var fixpaymentscreen = function(){
			chrome.storage.local.get("fixpaymentscreen", function (obj) {
				if(obj.fixpaymentscreen){
					makePaymentsPretty();
				}
			});
		}
		fixpaymentscreen();

		var updatesort = function(){
			$("#helper_overdue_payments_table").trigger('update');
			$("#helper_pending_payments_table").trigger('update');
			$("#helper_defaulted_payments_table").trigger('update');		
			$("#helper_payables_table").trigger('update');		
		}

		var populateImagesAfterPaymentsAreReady = function(){

			chrome.storage.local.get({stored_investment_data: 'empty'}, function(data) {
				$("[id^='helper_user_img']").each(function(i, div){
					var userid = $(div).find('a').attr('href').substring($(div).find('a').attr('href').lastIndexOf("/")+1);
					if(!$(div).find("img").length){
						$(data.stored_investment_data).each(function(count, investment){
						 	if(investment.user_id == userid){
								imgstring = "<img class='media-object avatar-notes' src='"+investment.user_avatar+"'/>";
								$(div).append(imgstring);
						 		return false;
						 	}
					 	});						
					}
				});
				updatesort();
				//setTimeout(updatesort, 2000);
			});

		}

		var populatePayments = function(whichpayments, howmanydays){
			whichpayments = typeof whichpayments !== 'undefined' ? whichpayments : 'all';
	   		howmanydays = typeof howmanydays !== 'undefined' ? howmanydays : 7;

	   		var update_overdue = false;
	   		var update_pending = false;
	   		var update_default = false;
	   		var update_payables = false;
	   		switch(whichpayments){
	   			case 'all':
	   				$("#helper_overdue_payments_table_body").find("tr").remove();
	   				$("#helper_pending_payments_table_body").find("tr").remove();
	   				$("#helper_defaulted_payments_table_body").find("tr").remove();
	   				$("#helper_payables_table_body").find("tr").remove();
	   				update_payables = true;
	   				update_default = true;
	   				update_pending = true;
	   				update_overdue = true;
	   				break;
	   			case 'payables':
	   				$("#helper_payables_table_body").find("tr").remove();
	   				update_payables = true;
	   				break;
	   			case 'overdue':
	   				$("#helper_overdue_payments_table_body").find("tr").remove();
	   				update_overdue = true;
	   				break;
	   			case 'pending':
	   				$("#helper_pending_payments_table_body").find("tr").remove();
	   				update_pending = true;
	   				break;
	   			case 'defaulted':
	   				$("#helper_defaulted_payments_table_body").find("tr").remove();
	   				update_default = true;
	   				break;
	   		}


	   // 			chrome.storage.local.get({stored_investment_data: 'empty'}, function(data) {
				// 	$(data.stored_investment_data).each(function(count, investment){
				// 		if(investment.payment_state.toLowerCase().indexOf('in progress') > 0){
				// 			console.log(investment);
				// 		}
				// 	});				
				// });

	   		if(update_default){
				chrome.storage.local.get({stored_investment_data: 'empty'}, function(data) {
					var default_totalinvested = 0.00000000;
					var default_totalremaining = 0.00000000;
					var funding_in_progress_total_receivable = 0.00000000;
					$(data.stored_investment_data).each(function(count, investment){
						if(investment.payment_state.toLowerCase().indexOf('defaulted') >= 0){
							imgstring = "<img class='media-object avatar-notes' src='"+investment.user_avatar+"'>";
							$("#helper_defaulted_payments_table_body").append("<tr><td>"+investment.closing_date.substring(0,10)+"</td><td><a href='https://btcjam.com/users/"+investment.user_id+"'>"+investment.user_name+"</a>"+imgstring+"</td><td><a target='_blank' href='https://btcjam.com/listings/"+investment.id+"'>"+investment.title+"</a></td><td>฿"+parseFloat(investment.amount).toFixed(8)+"</td><td>฿"+parseFloat(investment.amount_left).toFixed(8)+"</td></tr>");
							default_totalinvested += parseFloat(investment.amount);
							default_totalremaining += parseFloat(investment.amount_left);
						}
						if(investment.payment_state.toLowerCase().indexOf('in progress')){
							funding_in_progress_total_receivable += parseFloat(investment.amount_left);
						}
				 	});
				 	if(default_totalinvested > 0){
				 		$("#helper_defaulted_total_top_row").remove();
				 		$("#helper_defaulted_total_bottom_row").remove();
						$("#helper_defaulted_payments_table_head").append("<tr id='helper_defaulted_total_top_row'><td colspan='3'><div class='helper_table_total_label'>Total:</div></td><td><div class='helper_table_total'>฿"+parseFloat(default_totalinvested).toFixed(8)+"</div></td><td><div class='helper_table_total'>฿"+parseFloat(default_totalremaining).toFixed(8)+"</div></td></tr>");
						$("#helper_defaulted_payments_table_foot").append("<tr id='helper_defaulted_total_bottom_row'><td colspan='3'><div class='helper_table_total_label'>Total:</div></td><td><div class='helper_table_total'>฿"+parseFloat(default_totalinvested).toFixed(8)+"</div></td><td><div class='helper_table_total'>฿"+parseFloat(default_totalremaining).toFixed(8)+"</div></td></tr>");
				 	}
				 	if(funding_in_progress_total_receivable > 0){
				 		$("#body > div:nth-child(4) > div.col-md-3 > div:nth-child(3) > dl").append('<dt class="dt-payment" style="width:117px">Funding in Progress</dt><dd style="margin-left:120px">฿'+ funding_in_progress_total_receivable.toFixed(4) +'&nbsp;</dd>');
				 	}
				});
	   		}

	   		if(update_payables){
				chrome.storage.local.get({stored_payables_data: 'empty'}, function(data) {
					$(data.stored_payables_data).each(function(count, payable){
						$("#helper_payables_table_body").append("<tr><td>"+payable[0]+"</td><td>"+payable[2]+"</td><td>"+payable[3]+"</td><td>"+payable[4]+"</td><td>"+payable[5]+"</td></tr>");						
				 	});
				});	   			
	   		}

			chrome.storage.local.get({stored_receivables_data: 'empty'}, function(data) {
				if(data != 'empty'){
					function payment_date_ascending(a,b) {
					  if (a[0] < b[0])
					     return -1;
					  if (a[0] > b[0])
					    return 1;
					  return 0;
					}

					data.stored_receivables_data.sort(payment_date_ascending);
	
					var today = Date.today();
					var overduemaxdate = Date.today().addDays(howmanydays * -1);
					var pendingmaxdate = Date.today().addDays(howmanydays);
					var pending_total_amount = 0.00000000;
					var overdue_total_amount = 0.00000000;

					$.each(data.stored_receivables_data, function(count, payment){		
						var paymentdate = Date.parseExact(payment[0], 'yyyy-MM-dd');
						var userid = $($.parseHTML(payment[1])).attr('href').substring(7);

						if((update_pending && Date.equals(paymentdate, today))||(update_pending && paymentdate.isAfter(today) && paymentdate.isBefore(pendingmaxdate))){
							$("#helper_pending_payments_table_body").append("<tr><td>"+payment[0]+"</td><td><div id='helper_user_img_"+userid+"'>"+payment[1]+"</div></td><td>"+payment[2]+"</td><td>"+payment[3]+"</td><td>"+payment[4]+"</td></tr>");
							pending_total_amount += parseFloat(payment[4].replace(/[^0-9.]+/g, ''));											
						}
						if(update_overdue && paymentdate.isBefore(today) && paymentdate.isAfter(overduemaxdate)){
							$("#helper_overdue_payments_table_body").prepend("<tr><td>"+payment[0]+"</td><td><div id='helper_user_img_"+userid+"'>"+payment[1]+"</div></td><td>"+payment[2]+"</td><td>"+payment[3]+"</td><td>"+payment[4]+"</td></tr>");
							overdue_total_amount += parseFloat(payment[4].replace(/[^0-9.]+/g, ''));											
						}
					});	
					if(pending_total_amount > 0){
				 		$("#helper_pending_total_top_row").remove();
				 		$("#helper_pending_total_bottom_row").remove();
						$("#helper_pending_payments_table_head").append("<tr id='helper_pending_total_top_row'><th colspan='4'><div class='helper_table_total_label'> Total:</div></th><th><div class='helper_table_total'>฿"+pending_total_amount.toFixed(8)+"</div></th></tr>");	
						$("#helper_pending_payments_table_foot").append("<tr id='helper_pending_total_bottom_row'><th colspan='4'><div class='helper_table_total_label'> Total:</div></th><th><div class='helper_table_total'>฿"+pending_total_amount.toFixed(8)+"</div></th></tr>");	
					}
					if(overdue_total_amount > 0){
				 		$("#helper_overdue_total_top_row").remove();
				 		$("#helper_overdue_total_bottom_row").remove();
						$("#helper_overdue_payments_table_head").append("<tr id='helper_overdue_total_top_row'><th colspan='4'><div class='helper_table_total_label'> Total:</div></th><th><div class='helper_table_total'>฿"+overdue_total_amount.toFixed(8)+"</div></th></tr>");	
						$("#helper_overdue_payments_table_foot").append("<tr id='helper_overdue_total_bottom_row'><th colspan='4'><div class='helper_table_total_label'> Total:</div></th><th><div class='helper_table_total'>฿"+overdue_total_amount.toFixed(8)+"</div></th></tr>");	
					}

					if($("#helper_payables_table_body").find('tr').length == 0){
						if(howmanydays < 3650){
							$("#helper_payables_table_body").append("<tr><td colspan=5>You have no payments due in the next "+ howmanydays +" days.</td></tr>");
						}else{
							$("#helper_payables_table_body").append("<tr><td colspan=5>You have no payments due.</td></tr>");
						}
					}
					if($("#helper_overdue_payments_table_body").find('tr').length == 0){
						if(howmanydays < 3650){
							$("#helper_overdue_payments_table_body").append("<tr><td colspan=5>You have no overdue receivables from the past "+ howmanydays +" days.</td></tr>");
						}else{
							$("#helper_overdue_payments_table_body").append("<tr><td colspan=5>You have no overdue receivables.</td></tr>");
						}
					}
					if($("#helper_pending_payments_table_body").find('tr').length == 0){
						if(howmanydays < 3650){
							$("#helper_pending_payments_table_body").append("<tr><td colspan=5>You have no pending receivables due in the next "+ howmanydays +" days.</td></tr>");
						}else{
							$("#helper_pending_payments_table_body").append("<tr><td colspan=5>You have no pending receivables.</td></tr>");
						}
					}
					if($("#helper_defaulted_payments_table_body").find('tr').length == 0){
						$("#helper_defaulted_payments_table_body").append("<tr><td colspan=5>You have no defaulted receivables!</td></tr>");
					}


					populateImagesAfterPaymentsAreReady();				
				}
				else{
					setTimeout(function() {
						populatePayments(whichpayments, howmanydays)
					}, 100);
				}
			});				
		}
		$('.dt-payment').parent().parent().css("width","296px");

		var enhancepayments = function(){
			if($("#btchelper_btcprice").text().trim().length > 0){

				$('.dt-payment').each(function(i, obj) {
					
					payablehtml = "&nbsp;&nbsp;&nbsp;<span id='btchelper_payables_"+i+"'>$</span>";
					payablebtc = ($(obj).next("dd").text().trim().substring(1, $(obj).next("dd").text().trim().indexOf(".") + 4));
					price = ($("#btchelper_btcprice").text().trim() * 1);		
					payabledollars = ((payablebtc * price).toFixed(2));

					if($("#btchelper_payables_9").length){
						$("#btchelper_payables_"+i).text("$" + payabledollars);
					}else{
						$(obj).next("dd").append(payablehtml);
						$("#btchelper_payables_"+i).text("$" + payabledollars);
					}
					
				});
			}
			else{
				setTimeout(enhancepayments, 100);
			}
		}
		enhancepayments();
	}
}

function enhanceRateUserScreen(){
	var makeRateUserScreenPretty = function(){
		if($(location).attr('href').indexOf('/references') > 0){
			if($("#flash_notice").text().trim() == "Reputation was successfully created."){
				window.location = "https://btcjam.com/reputations/new";
			}
		}
		if($(location).attr('href').indexOf('/reputations/new') > 0){
			$('#body > div:nth-child(2) > div > ul > li').removeClass('active');
			$('#helper_menu_add_rateusers').addClass('active');
			loadLoans();
			chrome.storage.local.get({stored_investment_data: 'empty'}, function(data){
				var borrowerswithpositiveratings = [];
				var positiveratingandoverdue = [];
				var borrowerswithpositiveratings_html = "";

				chrome.storage.local.get({stored_ratings_data: 'empty'}, function(ratingsdata){
					$.each(ratingsdata.stored_ratings_data, function(count, rating){
						if(parseInt(rating.rating) > 0){
							borrowerswithpositiveratings.push(rating.to);
						}
					});

					$("#body > div:nth-child(4)").css("display","none");
					$("#body > div:nth-child(5)").css("display","none");
					// $("#body").append("<div id='helper_positiveoverdue' class='row' style='background-color: #f9f9f9; padding: 8px;'><span class='helper_warning_text' style='font-size: 14px'>Warning! The following borrowers are overdue and have a positive rating from you:</span><span id='helper_positiveoverdue_list'></span></div>");					
					$("#body").append("<div id='helper_rateuserstitle' class='row' style='background-color: #f9f9f9; padding: 8px;'><span style='font-weight: bold; font-size: 14px;'>Rate Your Borrowers</span><span style='background-color: #f9f9f9; padding: 8px; font-weight: normal; font-size: 11px;'>&nbsp; </span></div>");
					$("#body").append("<div id='helper_rateusers' class='row' style='padding: 4px; background-color: #ffffff'></div>");
					$("#helper_rateusers").append("<table class='table table-striped table-bordered'><thead><tr><th width='10%'>Borrower</th><th>Invested</th><th>Received</th><th>Payments</th><th nowrap>Status</th><th>Loan Name</th><th>Leave Rating</th></tr></thead><tbody id='borrowers_table'>");
					var lenders = [];
					$("#reputation_to_user_id > option").each(function() {
						borrowerid = this.value; 
						if(borrowerid.length > 0){
							var borrower_loan_count = 0;
							var imageappended = false;
							$.each(data.stored_investment_data, function(count, investment){
								if(positiveratingandoverdue.indexOf(investment.user_name) < 0){
									if( (investment.payment_state.toLowerCase().indexOf("late") >= 0) || (investment.payment_state.toLowerCase().indexOf("defaulted") >= 0) ){
										if(borrowerswithpositiveratings.indexOf(investment.user_name) >= 0){
											positiveratingandoverdue.push(investment.user_name);
											borrowerswithpositiveratings_html += "<div class='helper_follower' style='overflow: inherit; width: 100px;'><div class='helper_follower_img_box'><img class='avatar-notes' src=\""+investment.user_avatar+"\">"+""+investment.user_name+"</div></div>";

											$.each(ratingsdata.stored_ratings_data, function(count, rating){
												if(rating.to == investment.user_name){
													borrowerswithpositiveratings_html += "<span style='display: none'>"+rating.removelink+"</span>";
												}
											});
										}
									}										
								}

								if(investment.user_id == borrowerid){
									borrower_loan_count++;
									if(!imageappended){
										imgstring = "<img class='media-object avatar-notes' src=\""+investment.user_avatar+"\">";
										username = investment.user_name;
										var rating_html = "<a href='#' id='helper_rateuserbutton_"+borrowerid+"' data-username='"+username+"' data-borrowerid='"+borrowerid+"' class='btn btn-primary ratingbutton' data-controls-modal='modal-window' data-toggle='modal' data-target='#helper_ratingModal' role='button'>Rate "+username+"</a>";
										$("#borrowers_table").append("<tr><td><a href='https://btcjam.com/users/"+borrowerid+"' target='_blank'>"+imgstring+""+username+"</a></td><td><div id='"+borrowerid+"_investedamounts'></td><td><div id='"+borrowerid+"_receivedamounts'></td><td><div id='"+borrowerid+"_paymentsmade'></td><td nowrap><div id='"+borrowerid+"_repaymentstatus'></div></td><td><div id='"+borrowerid+"_loans'></div></td><td>"+rating_html+"</td></tr>")	
										imageappended = true;								
									}
									$("#"+borrowerid+"_investedamounts").append("฿" + parseFloat(investment.amount).toFixed(8) + "<br />");
									$("#"+borrowerid+"_receivedamounts").append("฿" + parseFloat(investment.amount_received).toFixed(8) + "<br />");
									$("#"+borrowerid+"_paymentsmade").append(investment.payments_made + " / " + investment.number_of_payments + "<br />");
									$("#"+borrowerid+"_loans").append("<a href='https://btcjam.com/listings/"+investment.id+"' target='_blank'>"+investment.title+"</a><br>");

									var loanstatus = investment.payment_state;
									var statuscolor = "#008000";
									if(loanstatus.toLowerCase().indexOf("repaid") >= 0){
										statuscolor = '#000000';
									}
									if(loanstatus.toLowerCase().indexOf("late") >= 0){
										statuscolor = '#ff0000';
									}
									$("#"+borrowerid+"_repaymentstatus").append(" <span style='text-transform: capitalize; font-weight: bold; color: "+statuscolor+"'>"+loanstatus+"</span><br>");
								}
							});					
							if(borrower_loan_count == 0){
								lenders.push(this);
							}
						}
					});
		
					$("#helper_rateusers").append("</tbody></table>");
					$("#body").append("<div class='modal fade' id='helper_ratingModal' tabindex='-1' role='dialog' aria-labelledby='helper_ratingModal' aria-hidden='true'><div class='modal-dialog'><div class='modal-content'><div class='modal-header'><button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button><h3 class='modal-title' style='text-align: left;' id='helper_modaltitle'>Rate </h3><h4 id='helper_rating_warning' class='helper_warning_text'></h4></div><div class='modal-body'><h5>Rating: <span id='helper_rating_value' class='helper_range_display'>0</span></h5><br /> <input type=range min=-10 max=10 value=0 id=helper_rating step=1 list=ratingscale><div class='row'><span class='helper_rangemin'>-10</span><span class='helper_rangemax'>10</span></div><datalist id=ratingscale><option>-10</option><option>-9</option><option>-8</option><option>-7</option><option>-6</option><option>-5</option><option>-4</option><option>-3</option><option>-2</option><option>-1</option><option>0</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option></datalist><br /><br /><h5>Comments:</h5><textarea id='helper_comments' class='form-control'></textarea></div><div class='modal-footer'><button type='button' id='helper_modal_close' class='btn btn-default' data-dismiss='modal'>Close</button><button type='button' class='btn btn-primary' id='helper_submitrating'>Submit Rating</button></div></div></div></div>");
					$("#body").append("<div class='modal fade' id='helper_ratingModalWarning' tabindex='-1' role='dialog' aria-labelledby='helper_ratingModalWarning' aria-hidden='true'><div class='modal-dialog'><div class='modal-content'><div class='modal-header'><button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button><h4 class='modal-title' style='text-align: left; font-size: 18px; font-weight: bold;' id='helper_warningmodaltitle'>You have overdue borrowers with positive ratings!</h4></div><div class='modal-body'>The borrowers shown below are currently overdue, but still have a positive rating from you.  If you click 'Remove Positive Ratings', the borrowers will reappear in the list below so you can update the rating you gave them.<div class='row'><div class='col-sm-12' id='helper_overdue_warning_borrowers'></div></div></div><div class='modal-footer'><button type='button' id='helper_modal_close' class='btn btn-default' data-dismiss='modal'>Cancel</button><button type='button' class='btn btn-primary' id='helper_removeratings'>Remove Positive Ratings</button></div></div></div></div>");
					$("#body").append("<a href='#' id='helper_warning_button' class='btn btn-primary ratingbutton' style='display: none;' data-controls-modal='modal-window' data-toggle='modal' data-target='#helper_ratingModalWarning' role='button'> </a>");

					if(positiveratingandoverdue.length > 0){
						$("#helper_overdue_warning_borrowers").append(borrowerswithpositiveratings_html);								
						var warnUserAboutRating = function(){
							$("#helper_warning_button")[0].click();
						}
						setTimeout(warnUserAboutRating, 1000);
					}

					$("#helper_rating").on("change", function(){
						$("#helper_rating_value").text(this.value);
					});
					$("#helper_submitrating").click(function(event){
						// event.preventDefault();
						// event.stopPropagation();
						$("#reputation_value").val($("#helper_rating").val());
						$("#reputation_message").val($("#helper_comments").val());
						if($("#reputation_message").val() == ""){
							$("#helper_rating_warning").text("Please enter a comment.");
						}
						else{
							$("[name='commit']").click();
						}
					});

					$("#helper_removeratings").click(function(event){
						// event.preventDefault();
						// event.stopPropagation();
						$('#helper_ratingModalWarning').find('[data-method="delete"]').each(function(){
							//$(this).removeAttr('data-confirm');
							$.post( this.href, { _method: "delete", authenticity_token: $("meta[name=csrf-token]").attr("content") } );
							console.log("rating removed!");
						});
						$('#helper_modal_close')[0].click();
						var refresh = function(){
							location.reload();
						}
						setTimeout(refresh, 2000);
					});

					if(lenders.length > 0){
						$("#body").append("<div id='helper_rateinvestorstitle' class='row' style='background-color: #f9f9f9; padding: 8px; font-weight: bold; font-size: 14px;'>Rate Your Investors</div>");
						$("#body").append("<div id='helper_rateinvestors' class='row' style='background-color: #ffffff'></div>");
						$("#helper_rateinvestors").append("<table width='100%' class='table table-striped table-bordered'><thead><tr><th width='10%'>Investor</th><th width='10%'>Invested</th><th width='60%'>Loan</th><th width='20%'>Leave Rating</th></tr></thead><tbody id='investors_table'>");
						$(lenders).each(function() {
							var investorid = this.value;
							var imgstring = "img goes here";
							$.ajax({url: "https://btcjam.com/users/" + investorid}).done(function(data){
								var imgstring = $(data).find(".img-rounded.user-img-profile").attr("src");
								if(imgstring.indexOf("/assets/unknow")>=0){
									imgstring = "https://btcjam.com" + imgstring;
								}
								//imgstring = $(data).find(".user-img-profile").attr("src")+"'> "+$(data).find(".user-img-profile").attr("alt").substring($(data).find(".user-img-profile").attr("alt").indexOf(" - ") + 3);
								$("#helper_investor_image_"+investorid).append("<img class=\"media-object avatar-notes\" width=\"48\" src=\""+imgstring+"\" alt=\"28005 stringio.thumb\">");
							});					
							var rating_html = "<a href='#' id='helper_rateuserbutton_"+investorid+"' data-username='"+this.text+"' data-borrowerid='"+investorid+"' class='btn btn-primary ratingbutton' data-controls-modal='modal-window' data-toggle='modal' data-target='#helper_ratingModal' role='button'>Rate "+this.text+"</a>";

							$("#investors_table").append("<tr><td><a href='https://btcjam.com/users/"+investorid+"' target='_blank'><div id='helper_investor_image_"+investorid+"'></div> "+this.text+"</a></td><td><div id='helper_investor_amounts_"+investorid+"'></div></td><td><div id='helper_investor_loans_"+investorid+"'></td><td>"+rating_html+"</td><td></td></tr>");	
						});

						var populateLoanData = function(){
							// console.log("populating loan data");
							chrome.storage.local.get({stored_loan_data: 'empty'}, function(data) {
								$(lenders).each(function(){
									var lenderid = this.value;
									$.each(data.stored_loan_data, function(count, loan){
										$.each(loan.investments, function(i, investment){
											if(lenderid == investment.investorid){
												$('#helper_investor_amounts_'+lenderid).append(investment.amount + "<br>");
												$('#helper_investor_loans_'+lenderid).append("<a href='"+loan.url+"'>"+loan.name+"</a><br>");
											}
										});
									});							
								});
							});						
						}
						setTimeout(populateLoanData, 3500);

						$("#helper_rateinvestors").append("</tbody></table>");
					}
				
					$(".ratingbutton").click(function(event){
						// event.preventDefault();
						// event.stopPropagation();
						$("#helper_rating").val("0");
						$("#helper_rating_value").text("0");
						$("#helper_comments").val("");
						$("#helper_rating_warning").text("");
						$("#helper_modaltitle").text("Rate " + $(this).attr("data-username"));
						$("#reputation_to_user_id").val($(this).attr("data-borrowerid"));
					});

				});

			});
		}
	}
	var fixrateuserscreen = function(){
		chrome.storage.local.get("fixrateuserscreen", function (obj) {
			if(obj.fixrateuserscreen){
				makeRateUserScreenPretty();
			}
		});
	}
	fixrateuserscreen();
}

function enhanceTransactionScreen(){
	if($(location).attr('href').indexOf('/transactions') > 0){
		// $('[name="alltransactions_length"]').change(function(event){
		// 	event.stopPropagation();
		// 	enhanceTransactionScreen();
		// });

		$("#body > div:nth-child(4) > div.col-md-3").css("display","none");
		$("#body > div:nth-child(4) > div.col-md-9").toggleClass("col-md-9 col-md-12");
		chrome.storage.local.get({stored_investment_data: 'empty'}, function(data) {
			var enhancetransactions = function(){
				if($("#btchelper_btcprice").text().trim().length > 0){
					price = ($("#btchelper_btcprice").text().trim() * 1);
					$('td').each(function(i, obj) {
					transactionhtml = "&nbsp;&nbsp;&nbsp;<span id='btchelper_transactions_"+i+"'>$</span>";
						if($(obj).text().trim().indexOf("BTC ") >= 0){
							if($("#btchelper_transactions_"+i).length){
								transactionbitcoin = $(obj).text().trim().substring($(obj).text().trim().indexOf("BTC ") + 4, $(obj).text().trim().indexOf("$"));
								transactiondollars = ((transactionbitcoin * price).toFixed(5));
								$("#btchelper_transactions_"+i).text("$" + transactiondollars);
							}else{
								transactionbitcoin = $(obj).text().trim().substring($(obj).text().trim().indexOf("BTC ") + 4);
								transactiondollars = ((transactionbitcoin * price).toFixed(5));
								$(obj).append(transactionhtml);
								if($(obj).text().indexOf("-") < 0){
									$(obj).prepend("&nbsp;");
								}
								$("#btchelper_transactions_"+i).text("$" + transactiondollars);
							}
						}
					});			
					$("<th>User</th>").insertAfter("#alltransactions > thead > tr > th:nth-child(1)");

					$("#alltransactions > tbody > tr").each(function(){
						var row = this;
						if($(row).has("br")){
							var link = $(row).find("td:nth-child(2)").find("a")[0];
							if(typeof link !== 'undefined'){
								link = link.toString();	
							}else{
								link = "";
							}
							var listingid = link.substring(link.indexOf("/listings/") + 10, link.indexOf("-"));
							if($(row).find("td:nth-child(1)").text().indexOf('Payment Made') >= 0 || $(row).find("td:nth-child(1)").text().indexOf('Loan Deposit') >= 0 || $(row).find("td:nth-child(1)").text().indexOf('Reimbursement') >= 0 || $(row).find("td:nth-child(1)").text().indexOf('Note Payment') >= 0){
								$("<td>Me</td>").insertAfter($(row).find("td:nth-child(1)"));
							}else{
								$(data.stored_investment_data).each(function(count, investment){
								 	if(investment.id == listingid){
										imgstring = "<img class='media-object avatar-notes' src='"+investment.user_avatar+"'>";
										username = "<p class='media-heading'>"+investment.user_name+"</p>";

								 		$("<td>"+imgstring+username+"</td>").insertAfter($(row).find("td:nth-child(1)"));
								 		return false;
								 	}
							 	});								
							}
							//$(this).nth-child(1).append("<td>User Name Goes Here</td>");
						}
					});

				}
				else{
					setTimeout(enhancetransactions, 100);
				}
			}
			enhancetransactions();
		});
	}
}

function enhanceListingScreen(){
	if($(location).attr('href').indexOf('/listings/') > 0){

		document.addEventListener('BTCjamHelper_LoadAgularData', function(e) {
			ng_currentlisting = e.detail;
		},false);

		var injectAngularCode = '(' + function(){
			var angulardata = angular.element('[ng-controller=ListingsShowController]').scope().data.listing;
			console.log(angulardata);
			document.dispatchEvent(new CustomEvent('BTCjamHelper_LoadAgularData', {detail: angulardata}));
		} + ')();';
		var script = document.createElement('script');
		script.textContent = injectAngularCode;
		(document.head||document.documentElement).appendChild(script);
		script.parentNode.removeChild(script);			

		var totalinvested = parseFloat(0);

		//remove "investment successfully created"
		$("#body > div:nth-child(2) > div > div > button > span").click();

		var user_loansfundinginprogress = 0;
		var user_loansrepaid = 0;
		var user_loansactive = 0;
		var user_loansoverdue = 0;
		var user_latepayments = '';

		//risk factors
		var loadriskfactors = function(){
			var borrowername = $(".user-img-listing").parent().next('p').children('a').text();
			$.get($(".user-img-listing").parent().next('p').children('a').attr('href'), function(data){
				$(data).find("#my_loans-table > tbody > tr").each(function (count, row){
					var loanstatus = $(row).find('td:nth-child(7)').text().trim();
					switch(loanstatus){
						case 'Overdue':
							user_loansoverdue++;
							break;
						case 'Funding in progress':
							user_loansfundinginprogress++;
							break;
						case 'Active':
							user_loansactive++;
							break;
						case 'Repaid':
							user_loansrepaid++;
							break;
					}
				});

				user_latepayments = $(data).find("#body > div:nth-child(2) > div > div:nth-child(1) > div > div > div > div:nth-child(1) > div > div > div.col-md-9 > div:nth-child(1) > div:nth-child(2) > dl > dd:nth-child(3)").text();
				user_latepayments = user_latepayments.match(/\d+/g)[0];

				// $(".widgetlight.listingsummary").prepend("<div class='helperalert_chart'><span style='font-size: 14px; font-weight: bold;'>Loan Statistics for "+$(".user-img-listing").parent().next('p').children('a').text()+": </span><br><br><table class='table table-bordered table-striped' width='100%'><thead><tr><th style='text-align: center;'>Active Loans</th><th style='text-align: center;'>Overdue Loans</th><th style='text-align: center;'>Repaid Loans</th><th style='text-align: center;'>Funding in Progress Loans</th><th style='text-align: center;'>Late Payments</th></tr></thead><tbody><tr><td class='big_number'>"+user_loansactive+"</td><td class='big_number'>"+user_loansoverdue+"</td><td class='big_number'>"+user_loansrepaid+"</td><td class='big_number'>"+user_loansfundinginprogress+"</td><td class='big_number'>"+user_latepayments+"</td></tr></tbody></table></div>");
				$("#helperalert").append("<br><br><span style='font-weight: bold;'>Loan/Payment History for "+borrowername+":</span><br><br><table id='helper_payment_history_table' class='table table-bordered table-striped' width='100%'><thead><tr><th width='20%' style='text-align: center;'>Overdue Payments</th><th width='20%' style='text-align: center;'>Late Payments Made</th><th width='20%' style='text-align: center;'>Active Loans</th><th width='20%' style='text-align: center;'>Funding in Progress</th><th width='20%' style='text-align: center;'>Repaid Loans</th></tr></thead><tbody><tr><td class='big_number'>"+user_loansoverdue+"</td><td class='big_number'>"+user_latepayments+"</td><td class='big_number'>"+user_loansactive+"</td><td class='big_number'>"+user_loansfundinginprogress+"</td><td class='big_number'>"+user_loansrepaid+"</td></tr></tbody></table><span style='font-weight: bold;'>Negative Ratings:</span><br><br><table class='table table-bordered table-striped' width='100%'><thead><tr><th>Rater</th><th>Rating</th><th>Comment</th></tr></thead><tbody id='user_negativeratingstablebody'></tbody></table>");
				$("#user_latepaymenttotal").append(user_latepayments);
							
				if($(data).text().indexOf('Personal References')){
					//has personal references - see if they are overdue
					try{
						var overduereferences = $(data).find("#body > div:nth-child(2) > div > div:nth-child(3) > div > div > div > table > tbody > tr > td:nth-child(1)").text().match(/overdue/g).length;
						if(overduereferences == 1){
							$("<span style='font-weight: bold; color:#ff0000;'>Warning! "+borrowername+" has a "+overduereferences+" personal reference with overdue loans. </span><br><br>").insertAfter("#helper_payment_history_table");
						}else{
							$("<span style='font-weight: bold; color:#ff0000;'>Warning! "+borrowername+" has "+overduereferences+" personal references with overdue loans. </span><br><br>").insertAfter("#helper_payment_history_table");
						}
					}catch(exception){
						// no references
						//console.log(exception);
					}
				}

				//negative ratings
				var user_hasnegativeratings = false;
				$(data).find("#reputation-table > tbody > tr").each(function (count, row){
					if($(row).find('td:nth-child(2)').text().indexOf('-') >= 0){
						user_hasnegativeratings = true;
						$('#user_negativeratingstablebody').append("<tr>"+$(row).find('td:nth-child(1)').prop('outerHTML')+$(row).find('td:nth-child(2)').prop('outerHTML')+$(row).find('td:nth-child(3)').prop('outerHTML')+"</tr>");
					}				
				});
				if(!user_hasnegativeratings){
					$('#user_negativeratingstablebody').append("<tr><td colspan=3>"+borrowername+" has not received any negative ratings!</td></tr>");
				}

			});			
		}
		var safetoloadriskfactors = function(){
			if($('#helperalert').length > 0){
				loadriskfactors();
			}else{
				setTimeout(safetoloadriskfactors, 250);
			}
		};
		safetoloadriskfactors();

		//total invested
		chrome.storage.local.get({stored_investment_data: 'empty'}, function(data) {
			var listingid = $(location).attr('href').substring($(location).attr('href').lastIndexOf('/') + 1);
			listingid = listingid.indexOf('-') >= 0 ? listingid.substring(0, listingid.indexOf('-')) : listingid;
			$(data.stored_investment_data).each(function(count, investment){
				if(investment.id == listingid){
					totalinvested = totalinvested + parseFloat(investment.amount);
				}
		 	});
			if($("#btchelper_totalinvested").length){
				$("#btchelper_totalinvested").text(totalinvested.toFixed(8));

			} else{
				try {
					profit = calculatePotentialProfit(totalinvested, parseFloat(ng_currentlisting.max_rate_per_period), parseFloat(ng_currentlisting.number_of_payments));
					profitStatement = "<strong>Potential Return: ฿" + profit.total +"</strong>&nbsp;&nbsp;&nbsp;<small><em>Assumes all payments are made, and BTC price remains constant (fiat linked loans)</em></small>";
					console.log(ng_currentlisting);

				} catch(exception){
					profitStatement = "<strong>Potential Return: ERROR</strong>&nbsp;&nbsp;&nbsp;<small><em>(BTCjam Helper experienced an error calculating this value)</em></small>";
					console.log(exception);
				}
				$(".widgetlight.listingsummary").append("<div id='helperalert' class='helperalert'><strong>Total invested: ฿<span id='btchelper_totalinvested'>"+ totalinvested.toFixed(8) + "</span></strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+profitStatement + "</div>");	
			}
		});

		var enhanceInvestModal = function(){
			if($("input[name=amount]").length){
				$("#helper_invest_links_div_left").remove();
				$("#helper_invest_links_div_right").remove();
				$("#invest-funds-modal > div.modal-container > div.modal-dialog > div > div.modal-body.center > div > div.row > div > div > div.col-sm-5.col-sm-offset-1 > div").append("<div id='helper_invest_links_div_left' class='text-center link'><a id='helper_invest_balance' href='#'>Invest All</a> &nbsp;<a id='helper_invest_half' href='#'>[1/2]</a> &nbsp;<a id='helper_invest_ratingminimum' href='#'>[0.02]</a></div>");
				$("#invest-funds-modal > div.modal-container > div.modal-dialog > div > div.modal-body.center > div > div.row > div > div > div:nth-child(3) > div").append("<div class='text-center' id='helper_invest_links_div_right'><a id='helper_invest_lefttobefunded' href='#'>Invest this amount</a></div>");

				$("#helper_invest_balance").click(function(event){
					event.preventDefault();
					event.stopPropagation();
					var balanceamount = user.balance.btc;
					$("input[name=amount]").val("");
					$("input[name=amount]").sendkeys(balanceamount);
				});
				$("#helper_invest_half").click(function(event){
					event.preventDefault();
					event.stopPropagation();
					var balanceamount = user.balance.btc;
					$("input[name=amount]").val("");
					$("input[name=amount]").sendkeys((balanceamount / 2).toFixed(8));
				});
				$("#helper_invest_ratingminimum").click(function(event){
					event.preventDefault();
					event.stopPropagation();
					$("input[name=amount]").val("");
					$("input[name=amount]").sendkeys("0.02000001");
				});

				if(ng_currentlisting != null){
					var investToBeFunded = function(){
						$("#helper_invest_lefttobefunded").click(function(event){
							event.preventDefault();
							event.stopPropagation();
							var tobefundedamount = ng_currentlisting.amount_left.toFixed(8);
							$("input[name=amount]").val("");
							$("input[name=amount]").sendkeys(tobefundedamount);
						});											
					}
					investToBeFunded();
				}
				else{
					setTimeout(investToBeFunded, 1000);
				}
			}
			else{
				setTimeout(enhanceInvestModal, 1000);
			}
		}

		$(".btn.btn-large.btn-primary").click(function(event) {
			event.preventDefault();
			event.stopPropagation();
			setTimeout(enhanceInvestModal, 500);
		});

		$(".btn.btn-large.btn-success").click(function(event) {
			event.preventDefault();
			event.stopPropagation();
			setTimeout(enhanceInvestModal, 500);
		});

	}
}


function loadNotes(){
	var notes_url = "https://btcjam.com/notes/allnotes.json?sEcho=3&iColumns=8&sColumns=&iDisplayStart=0&iDisplayLength=500&mDataProp_0=0&mDataProp_1=1&mDataProp_2=2&mDataProp_3=3&mDataProp_4=4&mDataProp_5=5&mDataProp_6=6&mDataProp_7=7&sSearch=&bRegex=false&sSearch_0=&bRegex_0=false&bSearchable_0=true&sSearch_1=&bRegex_1=false&bSearchable_1=true&sSearch_2=&bRegex_2=false&bSearchable_2=true&sSearch_3=&bRegex_3=false&bSearchable_3=true&sSearch_4=&bRegex_4=false&bSearchable_4=true&sSearch_5=&bRegex_5=false&bSearchable_5=true&sSearch_6=&bRegex_6=false&bSearchable_6=true&sSearch_7=&bRegex_7=false&bSearchable_7=true&iSortCol_0=0&sSortDir_0=desc&iSortingCols=1&bSortable_0=true&bSortable_1=true&bSortable_2=true&bSortable_3=false&bSortable_4=false&bSortable_5=true&bSortable_6=true&bSortable_7=false&userid=&_=1430852495041";
	$.getJSON(notes_url , function( data ) {
		notes_totalnotes = data.iTotalRecords;
		$.each(data.aaData, function(note, notedata){
			notes.push(notedata);
			yield = [];
			yield["key"] = note;
			yield["percentage"] = notedata[6].trim().substring(0,notedata[6].trim().indexOf("%")); 
			notes_yields.push(yield);
			// notes_remaining.push(notedata[5].trim());
			// notes_asking.push(notedata[4].trim());
		});		
	});
}


function enhanceNotesScreen(){
	if($(location).attr('href').indexOf('/notes') > 0){
		console.log("notes");

		var injection = '(' + function(){
			var fixYieldForFundingNotes = function(){
				$("#allnotes > tbody > tr").each(function(count, row){
					var yieldtext = $(row).find("td:nth-child(7)").text();
					if(yieldtext == 'N/A'){
						var noteyield = 0.00;				
						var amountremaining = parseFloat($(row).find("td:nth-child(5)").text().match(/\d+(?:\.\d{1,6})?$/)[0]);
						var askingprice = parseFloat($(row).find("td:nth-child(6)").text().match(/\d+(?:\.\d{1,6})?$/)[0]);
						noteyield = ((amountremaining - askingprice) / askingprice) * 100;
						$(row).find("td:nth-child(7)").append("<br>("+noteyield.toFixed(2) + "%)");
					}
					if(yieldtext.indexOf('-') >= 0){
						$(row).find("td:nth-child(8) > a").removeClass("btn-primary").addClass("btn-danger").text("NO!");
						$(row).find("td:nth-child(7)").css('color','red').css('font-weight', 'bold');
					}
				});
			}
			fixYieldForFundingNotes();
			$('#allnotes')
    		    .on( 'draw.dt',  function () { fixYieldForFundingNotes(); } )
        		// .on( 'search.dt', function () { fixYieldForFundingNotes(); } )
        		// .on( 'page.dt',   function () { fixYieldForFundingNotes(); } )
        		.dataTable();
		} + ')();';
		runInPageContext(injection, 0);

		var searchnotes = function(){
			var injectNotesCode = '(' + function(){
				$.fn.dataTableExt.oApi.fnReloadAjax = function ( oSettings, sNewSource, fnCallback, bStandingRedraw )
				{
				    // DataTables 1.10 compatibility - if 1.10 then `versionCheck` exists.
				    // 1.10's API has ajax reloading built in, so we use those abilities
				    // directly.
				    if ( $.fn.dataTable.versionCheck ) {
				        var api = new $.fn.dataTable.Api( oSettings );
				        if ( sNewSource ) {
				            api.ajax.url( sNewSource ).load( fnCallback, !bStandingRedraw );
				        }
				        else {
				            api.ajax.reload( fnCallback, !bStandingRedraw );
				        }
				        return;
				    }
				    if ( sNewSource !== undefined && sNewSource !== null ) {
				        oSettings.sAjaxSource = sNewSource;
				    }
				    // Server-side processing should just call fnDraw
				    if ( oSettings.oFeatures.bServerSide ) {
				        this.fnDraw();
				        return;
				    }
				    this.oApi._fnProcessingDisplay( oSettings, true );
				    var that = this;
				    var iStart = oSettings._iDisplayStart;
				    var aData = [];
				    this.oApi._fnServerParams( oSettings, aData );
				    oSettings.fnServerData.call( oSettings.oInstance, oSettings.sAjaxSource, aData, function(json) {
				        /* Clear the old information from the table */
				        that.oApi._fnClearTable( oSettings );
				        /* Got the data - add it to the table */
				        var aData =  (oSettings.sAjaxDataProp !== "") ?
				            that.oApi._fnGetObjectDataFn( oSettings.sAjaxDataProp )( json ) : json;
				        for ( var i=0 ; i<aData.length ; i++ )
				        {
				            that.oApi._fnAddData( oSettings, aData[i] );
				        }
				        oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
				        that.fnDraw();
				        if ( bStandingRedraw === true )
				        {
				            oSettings._iDisplayStart = iStart;
				            that.oApi._fnCalculateEnd( oSettings );
				            that.fnDraw( false );
				        }
				        that.oApi._fnProcessingDisplay( oSettings, false );				 
				        /* Callback user function - for event handlers etc */
				        if ( typeof fnCallback == 'function' && fnCallback !== null )
				        {
				            fnCallback( oSettings );
				        }
				    }, oSettings );
				};

				var dt = $("#allnotes").dataTable();
				dt.fnDestroy();
				dt = $("#allnotes").dataTable();
				var searchtext = atob(window.location.search.substring(1));
				var asrc = "notes/allnotes.json?sEcho=4&iColumns=8&sColumns=&iDisplayStart=0&iDisplayLength=100&sSearch=" + searchtext;
				dt.fnReloadAjax(asrc);				
				$("#body > div:nth-child(7) > div > div > h3").text("Sell Orders for \"" + searchtext + "\"");
				$("#body > div:nth-child(7) > div > div > h3").append("&nbsp;&nbsp;-&nbsp;&nbsp;<strong><a href='notes'>Show All Notes</a></strong>");
			} + ')();';
			var script = document.createElement('script');
			script.textContent = injectNotesCode;
			(document.head||document.documentElement).appendChild(script);
			script.parentNode.removeChild(script);
		}
		if(window.location.search.length > 1){
			setTimeout(searchnotes, 1000);
		}
	}
}

function runInPageContext(injectcode, delay){
	var delaythis = function(){
		var script = document.createElement('script');
		script.textContent = injectcode;
		(document.head||document.documentElement).appendChild(script);
		script.parentNode.removeChild(script);			
	}
	setTimeout(delaythis, delay);
}


function loadInvestments(){
	var investments_url = "https://btcjam.com/listing_investments.json?dir=desc&for_user=true&page=0&records=1000&sorting=1";
	$.getJSON(investments_url , function( data ) {
		$.each(data, function(count, investmentdata){
			investment = {};
			investment["id"] = investmentdata.listing.id;
			investment["title"] = investmentdata.listing.title;
			investment["amount"] = investmentdata.amount;
			investment["amount_left"] = investmentdata.amount_left;
			investment["amount_received"] = investmentdata.amount_received;
			investment["payment_state"] = investmentdata.payment_state;
			investment["payments_made"] = investmentdata.payments_made;
			investment["number_of_payments"] = investmentdata.listing.number_of_payments;
			investment["closing_date"] = investmentdata.created_at;
			investment["status"] = investmentdata.listing.listing_status.name;
			investment["user_name"] = investmentdata.listing.user.alias;
			investment["user_id"] = investmentdata.listing.user.id;
			investment["user_avatar"] = investmentdata.listing.user.avatar_thumb_url;
			investments.push(investment);
		});		
		chrome.storage.local.set({
			stored_investment_data: investments
		});
 	});
}

function loadLoans(){
	var loadedloanlist = false;
	var loadedloans = false;
	var loadedloaninvestments = false;

	$.when($.ajax({ url: 'https://btcjam.com/my_account/loans' }).done(function(data){		
		$.when($(data).find('#my_loans-table').find('tr').each(function(count, row){			
			var loanurl = $(row).find('a').attr('href');
			var loanname = $(row).find('a').text();
			if(typeof loanurl != 'undefined'){
				var loan = {};
				loan.investments = [];
				loan.url = loanurl;
				loan.name = loanname;
				$.when($.ajax({url: loanurl}).done(function(data){
					var investmentcount = 0;
					$(data).find('#listing_investments-table').find('tr').each(function(count, row){
						investmentcount++;
						var investorlink = $(row).find('a').attr('href');
						if(typeof investorlink != 'undefined'){
							var investorid = investorlink.substring(investorlink.indexOf('/users/') + 7);
							var amountinvested = $(row).find('span').text().trim();
							var investment = {};
							investment.investorid = investorid;
							investment.amount = amountinvested;
							loan.investments.push(investment);
						}
					});
				})).then(function(){
					loadedloaninvestments = true;
				});
				myloans.push(loan);
			}
		})).then(function(){
			loadedloans = true;
		});
 	}).then(function(){
 		loadedloanlist = true;
 	}));

	var doneloadingloans = function(){
		if(loadedloanlist && loadedloans && loadedloaninvestments){
			// console.log("done loading loans!");
	 		chrome.storage.local.set({
				stored_loan_data: myloans
			});			
		}
		else{
			// console.log("not done loading loans");
			setTimeout(doneloadingloans, 500);
		}
	}
	doneloadingloans();
}


function enhanceFollowersScreen(){
	var fixfollowersscreen = function(){
		chrome.storage.local.get("fixfollowersscreen", function (obj) {
			if(obj.fixfollowersscreen){
				makeFollowersScreenPretty();
			}
		});
	}
	fixfollowersscreen();

	var makeFollowersScreenPretty = function(){
		if($(location).attr('href').indexOf('/followers') > 0){
			begForMoney();

			$('#helper_menu_add_followers').addClass('active');
			
			totalfollowers = parseInt($("#body > div:nth-child(4) > div > div > div.col-md-3 > div > div.row.profile-numbers.border-top > div:nth-child(1) > div > div:nth-child(2) > p").text().trim());
			totalfollowing = parseInt($("#body > div:nth-child(4) > div > div > div.col-md-3 > div > div.row.profile-numbers.border-top > div:nth-child(2) > div > div:nth-child(2) > p").text().trim());

			$('#body > div:nth-child(4) > div > div > div.col-md-3').css("display","none");
			$('#body > div:nth-child(4) > div > div > div:nth-child(2)').css("display","none");
			$('#body > div:nth-child(4) > div > div > div:nth-child(3)').css("display","none");
			$("#body").append("<div class='modal fade' id='helper_alert_toomanywatched' tabindex='-1' role='dialog' aria-labelledby='helper_alert_toomanywatched' aria-hidden='true'><div class='modal-dialog'><div class='modal-content'><div class='modal-header'><button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button><h4 class='modal-title' style='text-align: left; font-size: 18px; font-weight: bold;' id='helper_warningmodaltitle'>You are already watching 10 users!</h4></div><div class='modal-body'>BTCjam Helper currently only allows watching 10 users.  If you wish to watch another user, you will have to remove one from your watched list first. </div><div class='modal-footer'><button type='button' id='helper_modal_close' class='btn btn-primary' data-dismiss='modal'>Okay</button></div></div></div></div>");	
			$("#body").append("<div class='modal fade' id='helper_ratingModalWarning' tabindex='-1' role='dialog' aria-labelledby='helper_ratingModalWarning' aria-hidden='true'><div class='modal-dialog'><div class='modal-content'><div class='modal-header'><button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button><h4 class='modal-title' style='text-align: left; font-size: 18px; font-weight: bold;' id='helper_warningmodaltitle'>You have overdue borrowers with positive ratings!</h4></div><div class='modal-body'>The borrowers shown below are currently overdue, but still have a positive rating from you.  If you click 'Remove Positive Ratings', the borrowers will reappear in the list below so you can update the rating you gave them.<div class='row'><div class='col-sm-12' id='helper_overdue_warning_borrowers'></div></div></div><div class='modal-footer'><button type='button' id='helper_modal_close' class='btn btn-default' data-dismiss='modal'>Cancel</button><button type='button' class='btn btn-primary' id='helper_removeratings'>Remove Positive Ratings</button></div></div></div></div>");
			
			$("<div id='helper_followersrow' class='row'><div id='helper_followerscontainer' class='col-md-12 dashboard-left'><ul class='nav nav-tabs'><li id='helper_followers_tab' role='presentation' class='helper_tab'><a class='helper_tab_a' href='#'>My Followers</a></li><li id='helper_following_tab' role='presentation' class='helper_tab'><a class='helper_tab_a' href='#'>People I Follow</a></li><li id='helper_search_tab' role='presentation' class='helper_tab active'><a class='helper_tab_a' href='#'>Search / Watch Users</a></li></ul><div id='helper_followers' style='display: none' class='col-md-12 widgetlight'><div class='helper_follower_header'>You have <span id='helper_follower_count'>0</span> followers.</div></div><div class='col-md-12 widgetlight' style='display: none;' id='helper_following'><div class='helper_follower_header'>You are following <span id='helper_following_count'>0</span> users.</div></div><div class='col-md-12 widgetlight' style='display: inline; min-height: 500px;' id='helper_search'><div class='helper_follower_header' style='border-bottom: none;'><input id='helper_follower_searchbox' type='search' class='form-control' style='margin-bottom: 12px; width: 300px; float: left;' placeholder='Search your followers/following...'> </div><div id='helper_results_holder' class='col-md-12' style='padding-left: 0px; padding-right: 0px;'><div id='helper_results_follower' class='col-md-6'><div class='helper_follower_header'>Search Results</div></div><div id='helper_results_following' class='col-md-6'><div class='helper_follower_header'>Watching<span class='helper_explanation'>Get notified when a loan or note is created, even if you are browsing other sites!</span></div><div class='row' style='margin-left: 12px;' id='helper_watching_row_1'></div><div class='row' style='margin-left: 12px;' id='helper_watching_row_2'></div></div></div></div></div>").insertAfter('#body > div:nth-child(4)');	
			$("#helper_follower_count").text(totalfollowers);
			$("#helper_following_count").text(totalfollowing);
			$("#helper_followers_tab").click(function(event){
				event.preventDefault();
				event.stopPropagation();
				$("#helper_following_tab").removeClass('active');
				$("#helper_followers_tab").addClass('active');
				$("#helper_search_tab").removeClass('active');
				$("#helper_followers").css('display','inline');
				$("#helper_following").css('display','none');
				$("#helper_search").css('display','none');
			});
			$("#helper_following_tab").click(function(event){
				event.preventDefault();				
				event.stopPropagation();
				$("#helper_followers_tab").removeClass('active');
				$("#helper_following_tab").addClass('active');
				$("#helper_search_tab").removeClass('active');
				$("#helper_followers").css('display','none');
				$("#helper_following").css('display','inline');
				$("#helper_search").css('display','none');
			});
			$("#helper_search_tab").click(function(event){
				event.preventDefault();
				event.stopPropagation();
				$("#helper_followers_tab").removeClass('active');
				$("#helper_following_tab").removeClass('active');
				$("#helper_search_tab").addClass('active');
				$("#helper_followers").css('display','none');
				$("#helper_following").css('display','none');
				$("#helper_search").css('display','inline');
			});

			var helperWatchUserHandler = function(userid){
				if(watchedcount >= 10){
					var injectModalShow = '(' + function(){
						$("#helper_alert_toomanywatched").modal('show');
					} + ')();';
					var script = document.createElement('script');
					script.textContent = injectModalShow;
					(document.head||document.documentElement).appendChild(script);
					script.parentNode.removeChild(script);

				}else{
					$("#helper_results_follower").find("[helper-watch-link-id]").each(function(count, link){
						if($(link).attr("helper-watch-link-id") == userid){
							var clone = $(link).parent().parent().clone();
							$(clone).find("span").attr("class","helper_ban_icon glyphicon-eye-close");
							$(clone).find(".helper_watch_link").attr("class","helper_unwatch_link");
							$(clone).find(".helper_unwatch_link").removeAttr("helper-watch-link-id");
							$(clone).find(".helper_unwatch_link").attr("helper-unwatch-link-id", userid);
							var row = watchedcount <= 4 ? '1' : '2';
							$("#helper_watching_row_" + row).append(clone);
							$("[helper-unwatch-link-id='"+userid+"']").click(function(event){
								event.preventDefault();
								helperUnwatchUserHandler(userid);
							});
							chrome.storage.local.get({watched_users: []}, function(data){
								var watchedusers = data.watched_users;
								var watched = {};
								$(followers_following_combined).each(function(count, follower){
									if(Object.keys(watched).length > 0){
										return false;
									}
									if(follower.id == userid){
										watched.id = userid;
										watched.name = follower.name;
										watched.image = follower.image;
										watchedusers.push(watched);
									}
								});
								watchedcount += 1;
								chrome.storage.local.set({ watched_users : watchedusers});	
							});
						}
					});					
				}
			}

			var helperUnwatchUserHandler = function(userid){
				$("#helper_results_following").find("[helper-unwatch-link-id]").each(function(count, link){
					// console.log(link);
					if($(link).attr("helper-unwatch-link-id") == userid){
						$(link).parent().parent().remove();
						chrome.storage.local.get({watched_users: []}, function(data){
							var watchedusers = [];
							$(data.watched_users).each(function(count, watcheduser){
								if(watcheduser.id != userid){
									watchedusers.push(watcheduser);
								}
							});
							watchedcount -= 1;
							chrome.storage.local.set({ watched_users : watchedusers});	
						});
					}
				});
			}

			$("#helper_follower_searchbox").keyup(function(){
				$("#helper_results_follower").find(".helper_follower").remove();
				var searchtext = $("#helper_follower_searchbox").val().toLowerCase();
				var results = [];
				if(searchtext.length >= 1){
					$(followers_following_combined).each(function(count, follower){
						var alreadyadded = false;
						if(follower.name.toLowerCase().indexOf(searchtext) >= 0){
							$(results).each(function(count, result){
								if(result.name == follower.name){
									alreadyadded = true;
								}
							});
							if(!alreadyadded){
								results.push(follower);
							}	
						}
					});

					results.sort(dynamicSort("name"));
					$(results).each(function(count, follower){
						// if(follower.type == 'follower'){
							$("#helper_results_follower").append("<div class='helper_follower'><div class='helper_follower_img_box'><a href='https://btcjam.com/users/"+follower.id+"'><img class='helper_follower_img' src='"+follower.image+"'><a href='#' class='helper_watch_link' helper-watch-link-id='"+follower.id+"'><span class='helper_ban_icon glyphicon-eye-open'></span></a></a></div><div class='helper_follower_name'>"+follower.name+"</div></div>");
							$("[helper-watch-link-id='"+follower.id+"']").click(function(event){
								event.preventDefault();				
								event.stopPropagation();
								helperWatchUserHandler(follower.id);
							});
						// }
						// else{
						// 	$("#helper_results_following").append("<div class='helper_follower'><div class='helper_follower_img_box'><a href='https://btcjam.com/users/"+follower.id+"'><img class='helper_follower_img' src='"+follower.image+"'></a></div><div class='helper_follower_name' style='margin-left: -4x;'>"+follower.name+"</div></div>");
						// }
					});				
				}
			});

			var loadedfollowers = false;
			var loading = false; 
			var checkFollowerCount = function(){
				chrome.storage.local.get({"followers": []}, function (obj) {

					if(obj.followers.length == totalfollowers){
						obj.followers.sort(dynamicSort("name"));
						obj.followers.sort(dynamicSort("name"));
						$("#helper_beachball").css("display","none");
						$(obj.followers).each(function(count, follower){
							if(follower.blocked){
							 	$("#helper_followers").append("<div class='helper_follower'><div class='helper_follower_img_box'><a href='https://btcjam.com/users/"+follower.id+"'><img class='helper_follower_img helper_follower_blocked' style='background-image: url("+follower.image+");'></a><a class='helper_block_unblock_link' data-remote='true' rel='nofollow' data-method='put' href='/followers/"+follower.id+"/unblock'><span class='helper_ban_icon glyphicon-ok-circle'></span></a></div><div class='helper_follower_name'>"+follower.name+"</div></div>");
							}else{
							 	$("#helper_followers").append("<div class='helper_follower'><div class='helper_follower_img_box'><a href='https://btcjam.com/users/"+follower.id+"'><img class='helper_follower_img' src='"+follower.image+"'></a><a class='helper_block_unblock_link' data-remote='true' rel='nofollow' data-method='put' href='/followers/"+follower.id+"/block'><span class='helper_ban_icon glyphicon-ban-circle'></span></a></div><div class='helper_follower_name' style='margin-left: -4x;'>"+follower.name+"</div></div>");
							}
							follower.type = "follower"; 
							followers_following_combined.push(follower);
					 	});
						setBlockLinkClickHandler();
					}
					else{
						if(!loadedfollowers){
							$("#helper_followers").append("<div id='helper_beachball'>Loading Followers...</div>");
							loadFollowers();
							loading = true;
							loadedfollowers = true;
						}else{
							$("#helper_beachball").append(".");
						}
						setTimeout(checkFollowerCount, 1000);
					}
				});
			}
			checkFollowerCount();

			var loadedFollowing = false;
			var checkFollowingCount = function(){
				chrome.storage.local.get({"following": []}, function (obj) {
					if(obj.following.length == totalfollowing){

						obj.following.sort(dynamicSort("name"));
						obj.following.sort(dynamicSort("name"));
						$("#helper_following_beachball").css("display","none");

						$(obj.following).each(function(count, follower){
						 	$("#helper_following").append("<div class='helper_follower'><div class='helper_follower_img_box'><a href='https://btcjam.com/users/"+follower.id+"'><img class='helper_follower_img' src='"+follower.image+"'></a><a class='helper_block_unblock_link' data-remote='true' rel='nofollow' data-method='put' href='/followers/"+follower.id+"/unfollow'><span class='helper_ban_icon glyphicon-remove'></span></a></div><div class='helper_follower_name' style='margin-left: -2px'>"+follower.name+"</div></div>");
							follower.type = "following"; 
						 	followers_following_combined.push(follower);
					 	});
					}
					else{
						console.log("should be loading following");
						if($('#helper_following').find('#helper_following_beachball').length == 0){
							$("#helper_following").append("<div id='helper_following_beachball'>Loading Following...</div>");
						}
						if(loading){
							//loadFollowers() already called
							$("#helper_following_beachball").append(".");
						}else{
							loadFollowers();
							loading = true;
							loadedfollowing = true;
						}
						setTimeout(checkFollowingCount, 1000);
					}
					setBlockLinkClickHandler();
				});
			}
			checkFollowingCount();

			var loadWatchedUsers = function(){
				watchedcount = 0;
				chrome.storage.local.get({"watched_users": []}, function (data) {
					$(data.watched_users).each(function(count, watched){
						watchedcount += 1;
						var row = watchedcount <= 5 ? '1' : '2';
						$("#helper_watching_row_" + row).append("<div class='helper_follower'><div class='helper_follower_img_box'><a href='https://btcjam.com/users/"+watched.id+"'><img class='helper_follower_img' src='"+watched.image+"'></a><a href='#' class='helper_unwatch_link' helper-unwatch-link-id='"+watched.id+"'><span class='helper_ban_icon glyphicon-eye-close'></span></a></div><div class='helper_follower_name'>"+watched.name+"</div></div>");
						$("[helper-unwatch-link-id='"+watched.id+"']").click(function(event){
							event.preventDefault();				
							// event.stopPropagation();							
							helperUnwatchUserHandler(watched.id);
						});
				 	});
				 	$("#helper_results_following").append('<div class="row" style="font-size: 13px; margin-left: 16px; margin-right: 12px;">You can watch up to 10 users at once. If Chrome is open, BTCjam Helper will <a href="#" id="helper_demo_notify">notify you</a> when a loan or note is listed for any watched user. You can set the time interval by clicking on the BTCjam Helper extension icon <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wUEARg6Les3oQAAAzVJREFUOMtlk01oHGUAhp9v5pudnexuuml2NX8VTVJL9SD1F0SlxIPoRQSpB8WbIBjxJFo8FEEsPQnFNmjFggjq1d4kEGuJVGgQE2Oakob8NN1sNpvd7OzuzHwz33weNHjwOb/vy3t5BP9ijEEIgalc7PXbraeErSZsKxpD+aTB/u2k488Ucvnf7Ee+2T/IAkiAePH9f8rtb9/cXl04W8jtDcm0g44kQtWxkxhLtz7crXiVdOOTj4QQl7evfcDAs+cQB2vh2qdv7+8uTZX6Ffg1EvoRiYKwSapCLGGho5BGcj89Dzw/WTw+ecEYgxRCYGrn3qgtX5+6x6sSVXM4h0bJlI6BbkJ3C+NXCas1uvUO7r19NBaufK5WT3eFEJeFWX63sL21drMs7w5FaQ/Z8jGsgXFSf4MkFijl4DV+JY1jWjshrZ0AO+Oi87lK78jR47K5s/5EtntnKMoXEE4JqyAIm3Vk4VFsq0gGl043RldnMGkKQhLHhqTaHGyKrSelUcnJtKNo1muUH+7DbC9AaKHKfRhdIdi4Rv/Yg7QPj9O6+SepNiAM0hHErWhCivzRsfZmDVtmSVsVIq1Iwght5sjmXaRpEm7OcfeWjxUYDIbcIY10wE/EqEydERPtt5FORJCHNI6JgwSRbKDbHvsVBcYhmztM0g6RlsZxPWTBoWB7SOVvrshCH5ZICdohSaBItEMaxoBAJ4LC8H145RLbl+Zp/eFTfrlM6b1Rag13xUqjtRlb18mYGpYFUdsQKYkQWbzSIAMnnqZ3pIjHX9gGtK9RYY6OOEKjbX6SMbk5I63N3n55RFgJtt1DZzcg6wm8okZ36+yemSYNUrpLXQTQvb7H5uRsEvxeOSMAbn/3wmtOvP69dHP0DbqoWGJbGjdnE3dtll+ZJWkoBP9HmuQthLz0w/wXz+QHS85X7vAJMiJP1InQhSMkeyHFUxIdQnB1iWjtDsA8MH3gEj+ffxGAtR9fOrVz9dWNYHXKNOc/M2p32uwtfmlUd9bsrX9tFp97SN0AcwPOHzwQ/+l8FiFO88uFiXzRix/L9AyfNKkZt7KuMI5c6ajGtHn9ysdEegK4+Lgx7wD8DUDWq7077IbfAAAAAElFTkSuQmCC"/></div>');
				 	$("#helper_demo_notify").click(function(event){
				 		event.preventDefault();
						chrome.runtime.sendMessage({
						    from:    'helper',
						    subject: 'sendDemoNotification'
						});
				 	});
				});			
			}
			loadWatchedUsers();

			var setBlockLinkClickHandler = function(){
				$('.helper_block_unblock_link').click(function(event){
					// event.preventDefault();				
					// event.stopPropagation();
					console.log('block-unblock link clicked');
					chrome.storage.local.set({
						following: ''
					});
					chrome.storage.local.set({
						followers: ''
					});

					var refresh = function(){
						location.reload();
					}
					setTimeout(refresh, 1000);
				});
			}

			var setWatchLinkHandler = function(){
				$('.helper_watch_link').click(function(event){
					event.preventDefault();
					event.stopPropagation();
				});
			}
		}
	}
}


function loadFollowers(){
	var totalusers = 0;
	var pages = 0;
	var following = [];
	var followers = [];
	followers_following_combined = [];

	$.get("https://btcjam.com/followers", function(data){
		totalusers = $(data).find("#body > div:nth-child(4) > div > div > div.col-md-3 > div > div.row.profile-numbers.border-top > div:nth-child(2) > div > div:nth-child(2) > p").text().trim();
		pages = Math.ceil(totalusers / 10);		

		for(i=1; i<=pages; i++){
			$.get("https://btcjam.com/followers?following=" + i, function(data){
				$(data).find(".unfollow").each(function (count, user){
					var userlink = $(user).parent().find('.follower-alias > a');
					var userimage = $(user).parent().find('.follower-picture > a > img');
					var userdata = {};
					userdata.id = userlink.attr('href').substring(userlink.attr('href').lastIndexOf('/') + 1);
					userdata.name = userlink.text().trim();
					userdata.image = userimage.attr('src');
					userdata.blocked = false;
					following.push(userdata);
					followers_following_combined.push(userdata);
				});

				chrome.storage.local.set({
					following: following
				});
			});		
		}

		totalusers = $(data).find("#body > div:nth-child(4) > div > div > div.col-md-3 > div > div.row.profile-numbers.border-top > div:nth-child(1) > div > div:nth-child(2) > p").text().trim();
		pages = Math.ceil(totalusers / 10);		
		for(i=1; i<=pages; i++){
			$.get("https://btcjam.com/followers?follower=" + i, function(data){
				$(data).find(".user-blocking").each(function (count, user){
					var userlink = $(user).parent().find('.follower-alias > a');
					var userimage = $(user).parent().find('.follower-picture > a > img');
					var userdata = {};
					userdata.id = userlink.attr('href').substring(userlink.attr('href').lastIndexOf('/') + 1);
					userdata.name = userlink.text().trim();
					userdata.image = userimage.attr('src');
					userdata.blocked = $(user).hasClass('user-unblock') ? true : false;
					followers.push(userdata);
					followers_following_combined.push(userdata);
				});

				chrome.storage.local.set({
					followers: followers
				});
			});		
		}

	});
}

function loadRatings(){

	var ratings_url = "https://btcjam.com/reputations";
	var ratings = [];

	$.get(ratings_url, function(data){
		$(data).find("#my_reputation-table > tbody > tr").each(function(count, rating){
			if($(rating).find("td:nth-child(1)").text() == user.alias){
				//user left this rating for another user
				var ratingdata = {};
				ratingdata.from = $(rating).find("td:nth-child(1)").text();
				ratingdata.to = $(rating).find("td:nth-child(2)").text();
				ratingdata.date = $(rating).find("td:nth-child(3)").text();
				ratingdata.rating = $(rating).find("td:nth-child(4)").text();
				ratingdata.comment = $(rating).find("td:nth-child(5)").text();
				ratingdata.removelink = $(rating).find("td:nth-child(6)").html();
				ratings.push(ratingdata);
			}
		});
		if(ratings.length > 0){
			chrome.storage.local.set({
				stored_ratings_data: ratings
			});
		}
	});

}

function loadPayables(){
	var payments_url = "https://btcjam.com/my_account/payments.json?pmt_types=payables&iDisplayStart=0&iDisplayLength=1000";
	$.getJSON(payments_url , function( data ) {

		$.each(data.aaData, function(count, paymentdata){
			payables.push(paymentdata);
		});		
		chrome.storage.local.set({
			stored_payables_data: payables
		});
 	});
}


function loadReceivables(){
	var receivables_url = "https://btcjam.com/my_account/payments.json?pmt_type=receivables&iDisplayStart=0&iDisplayLength=1000";
	$.getJSON(receivables_url , function( data ) {

		$.each(data.aaData, function(count, receivable){
			receivables.push(receivable);
		});		
		chrome.storage.local.set({
			stored_receivables_data: receivables
		});
 	});
}

function enhanceInvestmentsScreen(){
	if($(location).attr('href').indexOf('/listing_investments') > 0){
		// $('#investments-page > div:nth-child(1)').css('display','none');
	}

}



function begForMoney(){
	chrome.storage.local.get({stopaskingformoney: false}, function (obj) {
		if(obj.stopaskingformoney == false){
			var randomnumber = getRandomInt(1,100);
			if(randomnumber > 95 || randomnumber < 5){
				$("#body").append("<a href='#' id='helper_beg_button' class='btn btn-primary ratingbutton' style='display: none;' data-controls-modal='modal-window' data-toggle='modal' data-target='#helper_begformoney' role='button'> </a>");
				$("#body").append("<div class='modal fade' id='helper_begformoney' tabindex='-1' role='dialog' aria-labelledby='helper_begformoney' aria-hidden='true'><div class='modal-dialog'><div class='modal-content'><div class='modal-header'><button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button><h4 class='modal-title' style='text-align: left; font-size: 18px; font-weight: bold;' id='helper_warningmodaltitle'>Thank you for using BTCjam Helper!</h4></div><div class='modal-body'>Remember how sad this screen looked before you started using BTCjam helper? <span style='font-size: 28px;'>&#9786;</span> <br><br>If you're enjoying using BTCjam Helper, please consider donating to help offset the costs of developing and maintaining it.  Bitcoin can be sent to: <a class=\"donate\" href=\"bitcoin:1CQBSCqmZJNi3EABVs4TBcCHbi3Jd9E7fG?amount=1000000\">1CQBSCqmZJNi3EABVs4TBcCHbi3Jd9E7fG</a>. Thank you for your support!<div class='row'><div class='col-sm-12' id='helper_overdue_warning_borrowers'></div></div></div><div class='modal-footer'><button type='button' id='helper_modal_close' class='btn btn-primary' data-dismiss='modal'>Okay</button></div></div></div>");
				$("#helper_beg_button")[0].click();
			}
		}
	});
}

function calculatePotentialProfit(invested, rate, payments){
	invested = parseFloat(invested);
	rate = parseFloat(rate) / 100;
	payments = parseFloat(payments);
	// (0.0265×(1 + 0.0265)^13) ÷ (((1+0.0265)^13)−1) × 0.03

	var result = {};
	result.invested = invested;
	result.rate = rate;
	result.payments = payments;
	result.total = 0.00000000;
	result.profit = 0.00000000;

	if(invested == 0){
		return result;
	}

	result.total = parseFloat(((rate * Math.pow((1 + rate),payments)) / (Math.pow((1 + rate),payments) - 1)) * invested * payments).toFixed(8);
	result.profit = parseFloat(result.total - invested).toFixed(8);

	return result;
}

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property].toLowerCase() < b[property].toLowerCase()) ? -1 : (a[property].toLowerCase() > b[property].toLowerCase()) ? 1 : 0;
        return result * sortOrder;
    }
}

function descending( a, b ) {
    return b - a;
}
function ascending( a, b ) {
    return a - b;
}

function getRandomInt(min, max){
	return Math.floor(Math.random() * (max - min)) + min;
}
