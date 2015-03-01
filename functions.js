var notes = [];
var notes_totalnotes = 0;
var notes_yields = [];
var notes_asking = [];
var notes_remaining = [];
var notes_invested = [];


var investments = [];
var investments_totalinvestments = 0;
var investments_received = [];
var investments_remaining = [];
var investments_invested = [];

var payables = [];
var receivables = [];

var myloans = [];

btchelper_init();

function btchelper_init(){

	$.extend( jQuery.fn, {
	    within: function( pSelector ) {
	        return this.filter(function()
{	            return $(this).closest( pSelector ).length;
	        });
	    }
	});

	loadBitcoinPrice();
//	loadNotes();
	enhanceRateUserScreen();
	enhancePaymentsScreen();
	enhanceTransactionScreen();
	enhanceListingScreen();
//	enhanceNotesScreen();
	enhanceInvestmentsScreen();
	displayMenuBar();
	loadInvestments();
	loadPayables();
	loadReceivables();

	var removeInfoMessages = function(){
		$("#body > div:nth-child(1) > div > div > button > span").click();
	}
	setTimeout(removeInfoMessages, 3000);
}

function displayMenuBar(){

	if($('#body > div:nth-child(2) > div > ul > li').text().indexOf("Investments") == -1){
		$('#body > div:nth-child(2) > div > ul').append("<li><a href='/listing_investments'>Investments</a></li>");
	}
	if($('#body > div:nth-child(2) > div > ul > li').text().indexOf("Rate Users") == -1){
		$('#body > div:nth-child(2) > div > ul').append("<li><a href='/reputations/new'>Rate Users</a></li>");		
	}
	if($('#body > div:nth-child(2) > div > ul > li').text().indexOf("Payments") == -1){
		$('#body > div:nth-child(2) > div > ul').append("<li><a href='/my_account/payments'>Payments</a></li>");
	}
	if($('#body > div:nth-child(2) > div > ul > li').text().indexOf("Transactions") == -1){
		$('#body > div:nth-child(2) > div > ul').append("<li><a href='/transactions'>Transactions</a></li>");
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
			$("#payments_calendar").css("display","none");
			$("#body > div:nth-child(6)").css("display","none");
			$("#body > div:nth-child(8)").css("display","none")
			$("#my_payments-table").css("display", "none");

			$("#body > div:nth-child(4) > div.col-md-9").append("<ul class='nav nav-tabs'>  <li id='helper_overdue_tab' role='presentation' class='active helper_tab'><a class='helper_tab_a' href='#'>Overdue Receivables</a></li>  <li id='helper_pending_tab' class='helper_tab' role='presentation'><a class='helper_tab_a' href='#'>Pending Receivables</a></li>  <li id='helper_defaulted_tab' class='helper_tab' role='presentation'><a class='helper_tab_a' href='#'>Defaulted Receivables</a></li></ul><div id='helper_payments' class='row' style='background-color: #ffffff; padding: 4px;'></div>");
			//<a href='#' id='helper_toggle_overdue' style='color: #ffffff;font-weight: bold!important; font-size: 14px;'>Overdue Receivables</a> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
			//<a href='#' id='helper_toggle_pending' style='color: #000000;font-weight: bold!important; font-size: 14px;'>Pending Receivables</a> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
			//<a href='#' id='helper_toggle_defaulted' style='color: #000000;font-weight: bold!important; font-size: 14px;'>Defaulted Receivables</a> &nbsp;&nbsp;&nbsp;
			$("#helper_payments").append("<table id='helper_overdue_payments_table' class='table table-striped table-bordered tablesorter'><thead id='helper_overdue_payments_table_head'><tr><th colspan='5' style=' padding: 8px; font-weight: bold; font-size: 14px; background-color: #DC143C; color: #ffffff'><a href='#' class='btn btn-default' id='helper_overdue_7'> < 7 Days</a> <a href='#' class='btn btn-default' id='helper_overdue_15'> < 15 Days</a> <a href='#' class='btn btn-default' id='helper_overdue_30'> < 30 Days</a> <a class='btn btn-default' id='helper_overdue_60'> < 60 Days</a>  <a class='btn btn-default' id='helper_overdue_all'>All</a>  <a style='float: right;' download='btcjam_overdue_payments.xls' class='btn btn-default' id='helper_export_overdue'>Export to Excel</a> </th></tr><tr id='helper_overdue_payments_table_header_2nd_row'><th width='10%'>Due Date</th><th width='10%'>Borrower</th><th>Loan</th><th width='10%'>Payment #</th><th>Amount</th></tr></thead><tbody id='helper_overdue_payments_table_body'><tr><td colspan=5>Loading overdue receivables...</td></tr></tbody></table><table id='helper_pending_payments_table' class='table table-striped table-bordered tablesorter'><thead><tr><th colspan='5' style=' padding: 8px; font-weight: bold; font-size: 14px; background-color: #008000; color: #000000'><a class='btn btn-default' id='helper_pending_7'>Next 7 Days</a>  <a class='btn btn-default' id='helper_pending_15'>Next 15 Days</a>  <a class='btn btn-default' id='helper_pending_30'>Next 30 Days</a> <a class='btn btn-default' id='helper_pending_60'>Next 60 Days</a> <a class='btn btn-default' id='helper_pending_all'>All</a> <a style='float: right;' download='btcjam_pending_payments.xls' class='btn btn-default' id='helper_export_pending'>Export to Excel</a> </th></tr><tr id='helper_pending_payments_table_header_2nd_row'><th width='10%'>Due Date</th><th width='10%'>Borrower</th><th>Loan</th><th width='10%'>Payment #</th><th>Amount</th></tr></thead><tbody id='helper_pending_payments_table_body'><tr><td colspan=5>Loading pending receivables...</td></tr></tbody></table><table id='helper_defaulted_payments_table' class='table table-striped table-bordered tablesorter'><thead><tr><th colspan='5' style=' padding: 8px; font-weight: bold; font-size: 14px; background-color: #778899; color: #000000'> <a class='btn btn-default' id='helper_defaulted_all'>All</a> <a style='float: right;' download='btcjam_defaulted_payments.xls' class='btn btn-default' id='helper_export_defaulted'>Export to Excel</a></th></tr><tr id='helper_defaulted_payments_table_header_2nd_row'><th width='10%'>Loan Date</th><th width='10%'>Borrower</th><th width='60%'>Loan <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></th><th width='10%'>Invested</th><th width='10%'>Remaining</th></tr></thead><tbody id='helper_defaulted_payments_table_body'><tr><td colspan=5>Loading defaulted receivables...</td></tr></tbody></table>");

			$("#helper_overdue_payments_table").css('display','table');
			$("#helper_pending_payments_table").css('display','none');
			$("#helper_defaulted_payments_table").css('display','none');

			$("#helper_overdue_payments_table").tablesorter();
			$("#helper_pending_payments_table").tablesorter();
			$("#helper_defaulted_payments_table").tablesorter();

			$('#update_sort').click(function(){
				$("#helper_overdue_payments_table").trigger('update');
				$("#helper_pending_payments_table").trigger('update');
				$("#helper_defaulted_payments_table").trigger('update');				
			});

			$("#helper_overdue_tab").click(function(){
				$("#helper_overdue_tab").addClass('active');
				$("#helper_defaulted_tab").removeClass('active');
				$("#helper_pending_tab").removeClass('active');

				$("#helper_overdue_payments_table").css('display','table');
				$("#helper_pending_payments_table").css('display','none');
				$("#helper_defaulted_payments_table").css('display','none');
			});

			$("#helper_pending_tab").click(function(){
				$("#helper_overdue_tab").removeClass('active');
				$("#helper_defaulted_tab").removeClass('active');
				$("#helper_pending_tab").addClass('active');

				$("#helper_overdue_payments_table").css('display','none');
				$("#helper_pending_payments_table").css('display','table');
				$("#helper_defaulted_payments_table").css('display','none');
			});

			$("#helper_defaulted_tab").click(function(){
				$("#helper_overdue_tab").removeClass('active');
				$("#helper_defaulted_tab").addClass('active');
				$("#helper_pending_tab").removeClass('active');

				$("#helper_overdue_payments_table").css('display','none');
				$("#helper_pending_payments_table").css('display','none');
				$("#helper_defaulted_payments_table").css('display','table');
			});


			// $("#helper_toggle_overdue").click(function(){
			// 	$("#helper_overdue_payments_table").toggle();
			// 	$("#helper_overdue_payments_table_header_2nd_row").toggle();
			// });
			$('#helper_overdue_7').addClass('helper_payments_button btn-sm').click(function(){
				populatePayments("overdue", 7);
				togglePaymentButtons(this);
			});
			$('#helper_overdue_15').addClass('helper_payments_button btn-sm').click(function(){
				populatePayments("overdue", 15);
				togglePaymentButtons(this);
			});
			$('#helper_overdue_30').addClass('helper_payments_button btn-sm').click(function(){
				populatePayments("overdue", 30);
				togglePaymentButtons(this);
			});
			$('#helper_overdue_60').addClass('helper_payments_button btn-sm').click(function(){
				populatePayments("overdue", 60);
				togglePaymentButtons(this);
			});
			$('#helper_overdue_all').addClass('helper_payments_button btn-sm').click(function(){
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
			$('#helper_pending_7').addClass('helper_payments_button btn-sm').click(function(){
				populatePayments("pending", 7);
				togglePaymentButtons(this);
			});
			$('#helper_pending_15').addClass('helper_payments_button btn-sm').click(function(){
				populatePayments("pending", 15);
				togglePaymentButtons(this);
			});
			$('#helper_pending_30').addClass('helper_payments_button btn-sm').click(function(){
				populatePayments("pending", 30);
				togglePaymentButtons(this);
			});
			$('#helper_pending_60').addClass('helper_payments_button btn-sm').click(function(){
				populatePayments("pending", 60);
				togglePaymentButtons(this);
			});
			$('#helper_pending_all').addClass('helper_payments_button btn-sm').click(function(){
				populatePayments("pending", 3650);
				togglePaymentButtons(this);
			});
			$("#helper_export_pending").addClass('helper_payments_button btn-sm').click(function(event){
				event.stopPropagation();
				$("#helper_pending_payments_table_body").prepend("<tr style='display: none;'><td width='10%'>Due Date</td><td width='10%'>Borrower</td><td>Loan</td><td width='10%'>Payment #</td><td>Amount</td></tr>");
				ExcellentExport.excel(document.getElementById('helper_export_pending'), 'helper_pending_payments_table_body', 'Pending Payments');
			});


			$('#helper_defaulted_all').addClass('helper_payments_button btn-sm').click(function(){
				populatePayments("defaulted", 3650);
				togglePaymentButtons(this);
			});
			$("#helper_export_defaulted").addClass('helper_payments_button btn-sm').click(function(event){
				event.stopPropagation();
				$("#helper_defaulted_payments_table_body").prepend("<tr style='display: none;'><td>Loan Date</td><td>Borrower</td><td>Loan</td><td>Invested</td><td>Remaining</td></tr>");
				ExcellentExport.excel(document.getElementById('helper_export_defaulted'), 'helper_defaulted_payments_table_body', 'Defaulted Payments');
			});
			
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
		}

		var populateImagesAfterPaymentsAreReady = function(){

			chrome.storage.local.get({stored_investment_data: 'empty'}, function(data) {
				$("[id^='helper_user_img']").each(function(i, div){
					var userhref = $(div).find('a').attr('href');
					if(!$(div).find("img").length){
						$(data.stored_investment_data).each(function(count, investment){
						 	if(investment[0].indexOf(userhref) >= 0){
								imgstring = investment[0].substring(investment[0].indexOf("<img"));
								imgstring = imgstring.substring(0, imgstring.indexOf(">") + 1);
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
	   		switch(whichpayments){
	   			case 'all':
	   				$("#helper_overdue_payments_table_body").find("tr").remove();
	   				$("#helper_pending_payments_table_body").find("tr").remove();
	   				$("#helper_defaulted_payments_table_body").find("tr").remove();
	   				update_default = true;
	   				update_pending = true;
	   				update_overdue = true;
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

	   		if(update_default){
				chrome.storage.local.get({stored_investment_data: 'empty'}, function(data) {
					$(data.stored_investment_data).each(function(count, investment){
						if(investment[3].indexOf('defaulted') >= 0){
							imgstring = investment[0].substring(investment[0].indexOf("<img"));
							imgstring = imgstring.substring(0, imgstring.indexOf(">") + 1);
							$("#helper_defaulted_payments_table_body").append("<tr><td>"+investment[5]+"</td><td><a href='"+$(investment[0]).find('a').attr('href')+"'>"+$(investment[0]).find('.media-heading').text()+"</a>"+imgstring+"</td><td>"+investment[1]+"</td><td>"+investment[2].substring(0, investment[2].indexOf(' <br/>'))+"</td><td>"+investment[4]+"</td></tr>");						}
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

					$.each(data.stored_receivables_data, function(count, payment){		
						var paymentdate = Date.parseExact(payment[0], 'yyyy-MM-dd');
						var userid = $($.parseHTML(payment[1])).attr('href').substring(7);
						if(update_pending && paymentdate.isAfter(today) && paymentdate.isBefore(pendingmaxdate)){
							$("#helper_pending_payments_table_body").append("<tr><td>"+payment[0]+"</td><td><div id='helper_user_img_"+userid+"'>"+payment[1]+"</div></td><td>"+payment[2]+"</td><td>"+payment[3]+"</td><td>"+payment[4]+"</td></tr>");				
						}
						if(update_overdue && paymentdate.isBefore(today) && paymentdate.isAfter(overduemaxdate)){
							$("#helper_overdue_payments_table_body").prepend("<tr><td>"+payment[0]+"</td><td><div id='helper_user_img_"+userid+"'>"+payment[1]+"</div></td><td>"+payment[2]+"</td><td>"+payment[3]+"</td><td>"+payment[4]+"</td></tr>");
						}
					});	

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

		$('.dt-payment').parent().parent().css("width","280px");

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
			loadLoans();
			chrome.storage.local.get({stored_investment_data: 'empty'}, function(data) {

				$("#body > div:nth-child(4)").css("display","none");
				$("#body > div:nth-child(5)").css("display","none");
				$("#body").append("<div id='helper_rateuserstitle' class='row' style='background-color: #f9f9f9; padding: 8px;'><span style='font-weight: bold; font-size: 14px;'>Rate Your Borrowers</span><span style='background-color: #f9f9f9; padding: 8px; font-weight: normal; font-size: 11px;'>&nbsp; <em>Note: BTCjam rounds the amounts in this table to 5 decimal places (invested) or 6 decimal places (received).<em></span></div>");
				$("#body").append("<div id='helper_rateusers' class='row' style='padding: 4px; background-color: #ffffff'></div>");
				$("#helper_rateusers").append("<table class='table table-striped table-bordered'><thead><tr><th width='10%'>Borrower</th><th>Invested</th><th>Received</th><th>Loan Name - Repayment Status</th><th>Leave Rating</th></tr></thead><tbody id='borrowers_table'>");
				var lenders = [];
				$("#reputation_to_user_id > option").each(function() {
					borrowerid = this.value; 
					if(borrowerid.length > 0){
						var borrower_loan_count = 0;
						var imageappended = false;
						$.each(data.stored_investment_data, function(count, investment){
							if(investment[0].indexOf(borrowerid) >= 0){
								borrower_loan_count++;
								if(!imageappended){
									imgstring = investment[0].substring(investment[0].indexOf("<img"));
									imgstring = imgstring.substring(0, imgstring.indexOf(">") + 1);
									username = investment[0].substring(investment[0].indexOf("<p class='media-heading'>"));
									username = username.substring(26, username.indexOf("</p>"));
									var rating_html = "<a href='#' id='helper_rateuserbutton_"+borrowerid+"' data-username='"+username+"' data-borrowerid='"+borrowerid+"' class='btn btn-primary ratingbutton' data-controls-modal='modal-window' data-toggle='modal' data-target='#helper_ratingModal' role='button'>Rate "+username+"</a>";

									$("#borrowers_table").append("<tr><td><a href='https://btcjam.com/users/"+borrowerid+"' target='_blank'>"+imgstring+""+username+"</a></td><td><div id='"+borrowerid+"_investedamounts'></td><td><div id='"+borrowerid+"_receivedamounts'></td><td><div id='"+borrowerid+"_loans'></div></td><td>"+rating_html+"</td></tr>")	
									imageappended = true;								
								}
								$("#"+borrowerid+"_investedamounts").append(investment[2].substring(0, investment[2].indexOf("<br/>") -1) + "<br />");
								$("#"+borrowerid+"_receivedamounts").append(investment[2].substring(investment[2].indexOf("<br/>")+5) + "<br />");
								$("#"+borrowerid+"_loans").append(investment[1]);

								var loanstatus = investment[3].substring(investment[3].lastIndexOf("</div>") + 6).trim();//, investment[3].lastIndexOf("</li>"));
								loanstatus = loanstatus.trim().substring(0, loanstatus.indexOf("<"));
								var statuscolor = "#008000";
								if(loanstatus.toLowerCase().indexOf("repaid") >= 0){
									statuscolor = '#000000';
								}
								if(loanstatus.toLowerCase().indexOf("late") >= 0){
									statuscolor = '#ff0000';
								}

								$("#"+borrowerid+"_loans").append(" <span style='text-transform: capitalize; font-weight: bold; color: "+statuscolor+"'> - "+loanstatus+"</span><br>");
							}
						});					
						if(borrower_loan_count == 0){
							lenders.push(this);
						}
					}
				});
				$("#helper_rateusers").append("</tbody></table>");

				$("#body").append("<div class='modal fade' id='helper_ratingModal' tabindex='-1' role='dialog' aria-labelledby='helper_ratingModal' aria-hidden='true'><div class='modal-dialog'><div class='modal-content'><div class='modal-header'><button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button><h3 class='modal-title' style='text-align: left;' id='helper_modaltitle'>Rate </h3><h4 id='helper_rating_warning' class='helper_warning_text'></h4></div><div class='modal-body'><h5>Rating: <span id='helper_rating_value' class='helper_range_display'>0</span></h5><br /> <input type=range min=-10 max=10 value=0 id=helper_rating step=1 list=ratingscale><div class='row'><span class='helper_rangemin'>-10</span><span class='helper_rangemax'>10</span></div><datalist id=ratingscale><option>-10</option><option>-9</option><option>-8</option><option>-7</option><option>-6</option><option>-5</option><option>-4</option><option>-3</option><option>-2</option><option>-1</option><option>0</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option></datalist><br /><br /><h5>Comments:</h5><textarea id='helper_comments' class='form-control'></textarea></div><div class='modal-footer'><button type='button' id='helper_modal_close' class='btn btn-default' data-dismiss='modal'>Close</button><button type='button' class='btn btn-primary' id='helper_submitrating'>Submit Rating</button></div></div></div></div>");


				$("#helper_rating").on("change", function(){
					$("#helper_rating_value").text(this.value);
				});
				$("#helper_submitrating").click(function(){
					$("#reputation_value").val($("#helper_rating").val());
					$("#reputation_message").val($("#helper_comments").val());
					if($("#reputation_message").val() == ""){
						$("#helper_rating_warning").text("Please enter a comment.");
					}
					else{
						$("[name='commit']").click();
					}
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
				$(".ratingbutton").click(function(){
					$("#helper_rating").val("0");
					$("#helper_rating_value").text("0");
					$("#helper_comments").val("");
					$("#helper_rating_warning").text("");
					$("#helper_modaltitle").text("Rate " + $(this).attr("data-username"));
					$("#reputation_to_user_id").val($(this).attr("data-borrowerid"));				
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
							if($(row).find("td:nth-child(1)").text().indexOf('Payment Made') >= 0 || $(row).find("td:nth-child(1)").text().indexOf('Loan Deposit') >= 0 || $(row).find("td:nth-child(1)").text().indexOf('Reimbursement') >= 0){
								$("<td>Me</td>").insertAfter($(row).find("td:nth-child(1)"));
							}else{
								$(data.stored_investment_data).each(function(count, investment){
								 	if(investment[1].indexOf(listingid) >= 0){
										imgstring = investment[0].substring(investment[0].indexOf("<img"));
										imgstring = imgstring.substring(0, imgstring.indexOf(">") + 1);
										username = investment[0].substring(investment[0].indexOf("<p class='media-heading'>"));
										username = username.substring(26, username.indexOf("</p>"));

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

		var userelement = $(".user-img").parent().parent();
		var user = $(userelement).text().trim().substring(0, $(userelement).text().trim().indexOf("\n"));

		var totalinvested = parseFloat(0);

		//remove "investment successfully created"
		$("#body > div:nth-child(2) > div > div > button > span").click();

		chrome.storage.sync.get("removewarnings", function (obj) {
			if(obj.removewarnings){
				var removeInterestRateWarnings = function(){
					if($(".alert.alert-danger").length){
						$(".alert.alert-danger").css("display","none");
					}else{
						setTimeout(removeInterestRateWarnings, 500);
					}
				}
				removeInterestRateWarnings();				
			}
		});

		var user_loansfundinginprogress = 0;
		var user_loansrepaid = 0;
		var user_loansactive = 0;
		var user_loansoverdue = 0;
		var user_latepayments = '';

		//risk factors
		var loadriskfactors = function(){
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
				$("#helperalert").append("<br><br><span style='font-weight: bold;'>Loan/Payment History:</span><br><br><table class='table table-bordered table-striped' width='100%'><thead><tr><th width='20%' style='text-align: center;'>Overdue Payments</th><th width='20%' style='text-align: center;'>Late Payments Made</th><th width='20%' style='text-align: center;'>Active Loans</th><th width='20%' style='text-align: center;'>Funding in Progress</th><th width='20%' style='text-align: center;'>Repaid Loans</th></tr></thead><tbody><tr><td class='big_number'>"+user_loansoverdue+"</td><td class='big_number'>"+user_latepayments+"</td><td class='big_number'>"+user_loansactive+"</td><td class='big_number'>"+user_loansfundinginprogress+"</td><td class='big_number'>"+user_loansrepaid+"</td></tr></tbody></table><span style='font-weight: bold;'>Negative Ratings:</span><br><br><table class='table table-bordered table-striped' width='100%'><thead><tr><th>Rater</th><th>Rating</th><th>Comment</th></tr></thead><tbody id='user_negativeratingstablebody'></tbody></table>");
				$("#user_latepaymenttotal").append(user_latepayments);

				//negative ratings
				var user_hasnegativeratings = false;
				$(data).find("#reputation-table > tbody > tr").each(function (count, row){
					if($(row).find('td:nth-child(2)').text().indexOf('-') >= 0){
						user_hasnegativeratings = true;
						$('#user_negativeratingstablebody').append("<tr>"+$(row).find('td:nth-child(1)').prop('outerHTML')+$(row).find('td:nth-child(2)').prop('outerHTML')+$(row).find('td:nth-child(3)').prop('outerHTML')+"</tr>");
					}				
				});
				if(!user_hasnegativeratings){
					$('#user_negativeratingstablebody').append("<tr><td colspan=3>"+$(".user-img-listing").parent().next('p').children('a').text()+" has not received any negative ratings!</td></tr>");
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
		$.get($(location).attr('href'), function( src ) {
			$(src).find("#listing_investments-table > tbody > tr").each(function() {
				$(this).find("td").each(function() {
					if($(this).text().trim() == user){
						totalinvested = totalinvested + parseFloat($(this).next().text().trim().substring(1));				
					}
				});
			});		
			if($("#btchelper_totalinvested").length){
				$("#btchelper_totalinvested").text(totalinvested.toFixed(8));
			}else{
				$(".widgetlight.listingsummary").append("<div id='helperalert' class='helperalert'><strong>Total you have invested in this loan: BTC <span id='btchelper_totalinvested'>"+ totalinvested.toFixed(8) + "</span> </strong></div>");			
			}
		});

		var enhanceInvestModal = function(){
			if($("#listing_investment_amount").length){
				$("#modal-invest-body > div > div.row > div > div > div.col-sm-5.col-sm-offset-1 > div").append("<div class='text-center link'><a id='invest_balance' href='#'>Invest All</a> &nbsp;<a id='invest_half' href='#'>[1/2]</a> &nbsp;<a id='invest_ratingminimum' href='#'>[0.02]</a></div>");
				$("#modal-invest-body > div > div.row > div > div > div:nth-child(3) > div").append("<div class='text-center'><a id='invest_lefttobefunded' href='#'>Invest this amount</a></div>");

				$("#invest_balance").click(function(){
					$("#listing_investment_amount").val($("#modal-invest-body > div > div.row > div > div > div.col-sm-5.col-sm-offset-1 > div > div.amount-value.text-center").text().trim().substring(2));					
				});
				$("#invest_half").click(function(){
					$("#listing_investment_amount").val(($("#modal-invest-body > div > div.row > div > div > div.col-sm-5.col-sm-offset-1 > div > div.amount-value.text-center").text().trim().substring(2) / 2).toFixed(8));					
				});
				$("#invest_ratingminimum").click(function(){
					$("#listing_investment_amount").val("0.02000001");					
				});
				
				$("#invest_lefttobefunded").click(function(){
					$("#listing_investment_amount").val($("#modal-invest-body > div > div.row > div > div > div:nth-child(3) > div > div.amount-value.text-center").text().trim().substring(2));
				});
			}
			else{
				setTimeout(enhanceInvestModal, 500);
			}
		}

		$(".btn.btn-large.btn-primary").click(function() {
			setTimeout(enhanceInvestModal, 500);
		});

		$(".btn.btn-large.btn-success").click(function() {
			setTimeout(enhanceInvestModal, 500);
		});


//		console.log(document.location.href);

		// var calculatelistingprofit = function(){
		//     if(investments_remaining.length > 0){
		//     	console.log(investments);
		//     }
		//     else {
		//         setTimeout(calculatelistingprofit, 500); // check again in 1/2 a second
		//     }
		// }

		// calculatelistingprofit();
	}
}

function loadNotes(){
	var notes_url = "https://btcjam.com/notes/allnotes.json?sEcho=1&iColumns=8&sColumns=&iDisplayStart=0&iDisplayLength=5000&mDataProp_0=0&mDataProp_1=1&mDataProp_2=2&mDataProp_3=3&mDataProp_4=4&mDataProp_5=5&mDataProp_6=6&mDataProp_7=7&sSearch=&bRegex=false&sSearch_0=&bRegex_0=false&bSearchable_0=true&sSearch_1=&bRegex_1=false&bSearchable_1=true&sSearch_2=&bRegex_2=false&bSearchable_2=true&sSearch_3=&bRegex_3=false&bSearchable_3=true&sSearch_4=&bRegex_4=false&bSearchable_4=true&sSearch_5=&bRegex_5=false&bSearchable_5=true&sSearch_6=&bRegex_6=false&bSearchable_6=true&sSearch_7=&bRegex_7=false&bSearchable_7=true&iSortCol_0=0&sSortDir_0=desc&iSortingCols=1&bSortable_0=true&bSortable_1=true&bSortable_2=true&bSortable_3=false&bSortable_4=false&bSortable_5=true&bSortable_6=false&bSortable_7=false";

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
		loadNotes();
		var enhancenotes = function(){
		    if(notes_yields.length > 0){
				notes_yields.sort(function(a,b) {
					return b.percentage - a.percentage;
				});
		    }
		    else {
		        setTimeout(enhancenotes, 100); // check again in 0.10 seconds
		    }
		}
		enhancenotes();
	}
}

function loadInvestments(){
	var investments_url = "https://btcjam.com/listing_investments.json?iDisplayStart=0&iDisplayLength=1000";
	$.getJSON(investments_url , function( data ) {
		investments_totalinvestments = data.iTotalRecords;
		$.each(data.aaData, function(count, investmentdata){
			investments.push(investmentdata);

			investment = [];
			investment["key"] = count;
			investment["remaining"] = investmentdata[4].substring(1); 
			investments_remaining.push(investment);

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
	
		$('#body > div:nth-child(5)').css('display','none');

		loadInvestments();

		var enhanceinvestments = function(){
		    if(investments_remaining.length > 0){

				investments_remaining.sort(function(a,b) {
					return b.remaining - a.remaining;
				});

				// var helperdt = $("#my_investments-table").dataTable();
				// helperdt.clear();

				//console.log(investments_remaining);

		    }
		    else {
		        setTimeout(enhanceinvestments, 100); // check again in 0.10 seconds
		    }
		}

		// enhanceinvestments();
	}

}
 
function descending( a, b ) {
    return b - a;
}
function ascending( a, b ) {
    return a - b;
}

