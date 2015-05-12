
pagesTracker = [];
pagesTracker.push('main_page');
var pushNotification;


var app = { 
		
	/*
	data: {
		pictureSource : '',
		destinationType : '',
		encodingType : '',
	},
	*/
		
	pictureSource : '',
	destinationType : '',
	encodingType : '',	
	backPage : '',
	currentPageId : '',
	currentPageWrapper : '',
	recentScrollPos : '',
	
	action : '',
	requestUrl : '',
	requestMethod : '',
	response : '',
	responseItemsNumber : '',
	pageNumber : '',
	itemsPerPage : 30,
	container : '', 
	template : '',
	statAction : '',
	
	
	profileGroupTemplate : '',
	profileLineTemplate : '',
	
	userId : '',
	gcmDeviceId : '',
	imageId : '',
	
		
	init: function(){
		navigator.splashscreen.hide();		
		app.ajaxSetup();		
		app.chooseMainPage();		
		//app.pushNotificationInit();
		document.addEventListener("backbutton", app.back, false);
		app.pictureSource = navigator.camera.PictureSourceType;
		app.destinationType = navigator.camera.DestinationType;
		app.encodingType = navigator.camera.EncodingType;		
	},

	ajaxSetup: function(){
		
		var user = window.localStorage.getItem("user");
		var pass = window.localStorage.getItem("pass");
		
		if(user == '' && pass == ''){
			user = 'nouser';
			pass = 'nopass';
		}
		
		$.ajaxSetup({			
			dataType: 'json',
			type: 'Get',
			timeout: 50000,
			beforeSend: function(xhr){
				xhr.setRequestHeader ("Authorization", "Basic " + btoa ( user + ":" + pass) );
			},		
			statusCode:{
				
				401: function(response, textStatus, xhr){
					
					app.stopLoading();
					app.showPage('login_page');
					app.printUsers();
					
					/*
					navigator.notification.alert(
						//'You entered incorrect data, please try again',
						response.status + ':' + textStatus,	
						'Notification',
						'Notification'
					);
					*/ 
				}
		
			},
			
			error: function(response, textStatus, errorThrown){
				app.stopLoading();				
				//alert(response.status + ':' + errorThrown );
			},
			
			complete: function(response, status, jqXHR){
				app.stopLoading();
			},
		});		
	},	
	
	startLoading: function(){
		navigator.notification.activityStart('Loading', 'Please wait...');
	},
	
	stopLoading: function(){
		navigator.notification.activityStop();
	},
	
	chooseMainPage: function(){
		
		pagesTracker = [];
		pagesTracker.push('main_page');		
		//app.startLoading();   
		
		$.ajax({ 
			url: 'http://m.dating4disabled.com/api/v1/user/login',			
			statusCode:{
				401: function(response, status, xhr){
					$('.appPage').hide();
					$("#login_page").show();  
					$('#back').hide();
					$('#contact').hide();
					$('#sign_up').show();
					app.printUsers();
					app.currentPageId = 'login_page';
					app.currentPageWrapper = $('#'+app.currentPageId);
				}
			},
			success: function(data, status){				
				//alert(data.userId);
				if(data.userId > 0){					
					$('.appPage').hide();
					$("#main_page").show();
					//app.showPage('main_page');
					$('#back').hide();
					$('#sign_up').hide();
					$('#contact').show();
					window.localStorage.setItem("userId", data.userId);
					app.currentPageId = 'main_page';
					app.currentPageWrapper = $('#'+app.currentPageId);
					app.checkNewMessages();
					app.pushNotificationInit();  
				}		
			}
		});		
	},
	
	sendAuthData: function(){
		
		var user = $("#authForm .email").val(); 
		var pass = $("#authForm .password").val();
		
		window.localStorage.setItem("user",user);
		window.localStorage.setItem("pass",pass);	
		
		$.ajax({				
			url: 'http://m.dating4disabled.com/api/v1/user/login',
			beforeSend: function(xhr){
				user = window.localStorage.getItem("user");
				pass = window.localStorage.getItem("pass");				
				xhr.setRequestHeader ("Authorization", "Basic " + btoa ( user + ":" + pass) );
			},
			success: function(data, status){				
				if(data.userId > 0){
					app.ajaxSetup();
					app.showPage('main_page');
					window.localStorage.setItem("userId", data.userId);					
					app.pushNotificationInit();
				}				
			}
		});
	},
	
	printUsers: function(){
		$.ajax({
			url: 'http://m.dating4disabled.com/api/v1/users/recently_visited/2',
			success: function(data, status){
				for ( var i = 0; i < data.users.length; i++) {
					$("#udp_"+i).find(".user_photo_wrap .user_photo").attr("src",data.users[i].mainImage);
					$("#udp_"+i).find("span").text(data.users[i].nickName);
					$("#udp_"+i).find(".address").text(data.users[i].city);
				}				
				//$(".user_data_preview").slideToggle("slow");
				$(".user_data_preview").show();			
			}
		});
	},
	
	contact: function(){		
		window.location.href = 'http://dating4disabled.com/contact.asp';		
	},
	
	
	pushNotificationInit: function(){
		
		
		try{ 
        	pushNotification = window.plugins.pushNotification;
        	if (device.platform == 'android' || device.platform == 'Android') {
				//alert('registering android'); 
            	pushNotification.register(app.regSuccessGCM, app.regErrorGCM, {"senderID":"48205136182","ecb":"app.onNotificationGCM"});		// required!
			}
        }
		catch(err){ 
			txt="There was an error on this page.\n\n"; 
			txt+="Error description: " + err.message + "\n\n"; 
			alert(txt); 
		} 
		
	},
	
	// handle GCM notifications for Android
    onNotificationGCM: function(e) {
    	//console.log('EVENT -> RECEIVED:' + e.event);        
        switch( e.event ){
            case 'registered':            
            	//alert("registered");
			if ( e.regid.length > 0 ){
				// Your GCM push server needs to know the regID before it can push to this device
				// here is where you might want to send it the regID for later use.
				//alert("REGISTERED -> REGID:" + e.regid); 
				app.gcmDeviceId = e.regid;
				app.persistGcmDeviceId();
			}
            break;
            
            case 'message':
            	// if this flag is set, this notification happened while we were in the foreground.
            	// you might want to play a sound to get the user's attention, throw up a dialog, etc.
            	if (e.foreground){
					// if the notification contains a soundname, play it.
					//var my_media = new Media("/android_asset/www/"+e.soundname);
					//my_media.play();
            		
            		if(app.currentPageId == 'messenger_page'){
            			app.getMessenger();            			
            		}
            		
            		
            		app.checkNewMessages();
            		
				}
				else
				{	// otherwise we were launched because the user touched a notification in the notification tray.
					/*
					if (e.coldstart)
						console.log('COLDSTART NOTIFICATION');						
					else
						console.log('--BACKGROUND NOTIFICATION--');
					*/
					app.getMessenger();
				}					
            	//console.log('MESSAGE -> MSG: ' + e.payload.message);
            	//console.log('MESSAGE -> MSGCNT: ' + e.payload.msgcnt);            	
            	//alert(e.payload.message);
            	
            	  
            	
            	
            break;
            
            case 'error':
            	//console.log('ERROR -> MSG:' + e.msg);
            break;
            
            default:
            	//console.log('EVENT -> Unknown, an event was received and we do not know what it is');
            break;
        }
    },
    
    persistGcmDeviceId: function(){
    	
    	$.ajax({				
			url: 'http://m.dating4disabled.com/api/v1/user/gcmDeviceId',
			type: 'Post',
			data: JSON.stringify({			
				gcmDeviceId: app.gcmDeviceId 
			}),
			success: function(data, status){				
				//alert(data.persisting);  				
			}
		});
    	
    },
    
    tokenHandler: function(result) {
        //console.log('success:'+ result);        
        // Your iOS push server needs to know the token before it can push to this device
        // here is where you might want to send it the token for later use.
    },
	
    regSuccessGCM: function (result) {
    	//alert('success:'+ result);     
    },
    
    regErrorGCM: function (error) {
    	//alert('error:'+ error);        
    },
	
	back: function(){
		
		$(window).unbind("scroll");
		pagesTracker.splice(pagesTracker.length-1,1);
		var prevPage = pagesTracker[pagesTracker.length-1];		
		//alert(prevPage);
		
		if(typeof prevPage === "undefined" || prevPage == "main_page")
			//app.showPage('main_page');
			app.chooseMainPage();
		else
			app.showPage(prevPage);
		
		if(app.currentPageId == 'users_list_page'){
			app.template = $('#userDataTemplate').html();
			window.scrollTo(0, app.recentScrollPos);
			app.setScrollEventHandler();
		}
	},
	
	showPage: function(page){		
		app.currentPageId = page;
		app.currentPageWrapper = $('#'+app.currentPageId);
		app.container = app.currentPageWrapper.find('.content_wrap');
		
		if(pagesTracker.indexOf(app.currentPageId) == -1){
			pagesTracker.push(app.currentPageId);
		}
		
		$('.appPage').hide();
		app.currentPageWrapper.show();
		
		if(app.currentPageId == 'main_page'){
			$('#back').hide();
			$('#sign_up').hide();
			$('#contact').show();			
		}
		else if(app.currentPageId == 'login_page'){
			$('#back').hide();
			$('#sign_up').show();
			$('#contact').hide(); 
		}		
		else{
			$('#back').show();
			$('#sign_up').hide();
			$('#contact').hide();  
		}
		
		$(window).unbind("scroll");
		
	},
	
	getOnlineNow: function(){
		app.showPage('users_list_page');		
		app.currentPageWrapper.find('.content_wrap').html('');
		app.template = $('#userDataTemplate').html();
		app.container = app.currentPageWrapper.find('.content_wrap');				
		app.action = 'getOnlineNow';
		app.pageNumber = 1;
		app.getUsers();  
	},
	
 
	getUsers: function(){
		app.startLoading();
		//alert(555);
		
		if(app.action == 'getOnlineNow'){					
			app.requestUrl = 'http://m.dating4disabled.com/api/v1/users/online/'+app.itemsPerPage+'/'+app.pageNumber;
		}	
		else if(app.action == 'getSearchResults'){
			var countryCode = $('#countries_list').val();
			var regionCode = $('.regionsList select').val();
			var ageFrom = $(".age_1 select").val();
			var ageTo = $(".age_2 select").val();
			var disabilityId = $('#health_list').val();			
			app.requestUrl = 'http://m.dating4disabled.com/api/v1/users/search/country:'+countryCode+'/region:'+regionCode+'/age:'+ageFrom+'-'+ageTo+'/disability:'+disabilityId+'/count:'+app.itemsPerPage+'/page:'+app.pageNumber;
		}	
		else if(app.action == 'getStatResults'){					
			app.requestUrl = 'http://m.dating4disabled.com/api/v1/user/statistics/'+app.statAction+'/count:'+app.itemsPerPage+'/page:'+app.pageNumber;
		}
		
		$.ajax({						
			url: app.requestUrl,
			timeout:10000,
			success: function(response, status){
				app.response = response;
				app.displayUsers();
			}
		});
	},
	
	
	displayUsers: function(){		
		for(var i in app.response.users.items){					
			var currentTemplate = app.template; 
			var user = app.response.users.items[i];
			
			currentTemplate = currentTemplate.replace("[USERNICK]",user.nickName);
			currentTemplate = currentTemplate.replace("[AGE]",user.age);
			currentTemplate = currentTemplate.replace("[COUNTRY]",user.country+',');
			currentTemplate = currentTemplate.replace("[CITY]",user.city);
			currentTemplate = currentTemplate.replace("[IMAGE]",user.mainImage);			
			currentTemplate = currentTemplate.replace(/\[USERNICK\]/g,user.nickName);										
			currentTemplate = currentTemplate.replace("[USER_ID]", user.id);	
			
			var aboutUser = '';
			if(typeof(user.about) === 'string'){   
				if(user.about.length > 90){
					aboutUser = user.about.substring(0,90)+'...';
				}
				else{
					aboutUser = user.about;
				}
			}					
			currentTemplate = currentTemplate.replace("[ABOUT]", aboutUser);			
			app.container.append(currentTemplate);			
			var currentUserNode = app.container.find(".user_data:last-child");			
			currentUserNode.find(".user_short_txt").attr("onclick","app.getUserProfile("+user.id+");");
			currentUserNode.find(".user_photo_wrap").attr("onclick","app.getUserProfile("+user.id+");");
			
			if(user.isNew == 1){						
				currentUserNode.find(".blue_star").show();
			}					
			if(user.isPaying == 1){						
				currentUserNode.find(".special3").show();
			}
			if(user.isOnline == 1){						
				currentUserNode.find(".on2").show();
			}
			
		}
		
		app.stopLoading();
		app.responseItemsNumber = app.response.users.itemsNumber;
		app.setScrollEventHandler();
	},	
	
	setScrollEventHandler: function(){
		$(window).scroll(function(){	
			app.recentScrollPos = $(this).scrollTop();
			if(app.recentScrollPos >= app.container.height()-500){						
				$(this).unbind("scroll");				
				if(app.responseItemsNumber == app.itemsPerPage){					
					app.pageNumber++;
					app.getUsers();
				}
			}
		});
	},
	
	getMyProfileData: function(){		
		app.startLoading();
		
		$("#upload_image").click(function(){		
			$("#statistics").hide();
			$("#uploadDiv").css({"background":"#fff"});
			$("#uploadDiv").show();
		});
		
		$("#manage_account").click(function(){		
			$("#statistics").show();			
			$("#uploadDiv").hide();
		});
	    
		/*
		$("#take_a_photo").click(function(){		
			app.capturePhoto(app.pictureSource.CAMERA, app.destinationType.DATA_URL);
		});
		
		$("#choose_from_library").click(function(){		
			app.capturePhoto(app.pictureSource.PHOTOLIBRARY, app.destinationType.FILE_URI);
		});
		*/
		
		
		
		var userId = window.localStorage.getItem("userId");
				
		$.ajax({
			url: 'http://m.dating4disabled.com/api/v1/user/profile/'+userId,						
			success: function(user, status, xhr){
				
				app.showPage('my_profile_page');
				app.container = app.currentPageWrapper.find('.myProfileWrap');
				
				app.container.find('.txt strong').html(user.nickName+', <span>'+user.age+'</span>');			
				app.container.find('.txt strong').siblings('span').text(user.country+', '+user.city); 
				app.container.find('.txt').append(user.about);			
				app.container.find('.user_pic img').attr("src",user.mainImage);
				
				if(user.isPaying){
					app.container.find(".special4").show();
				}				
				
				var addedToFriends = user.statistics.fav;  
				var contactedYou = user.statistics.contactedme;
				var contacted = user.statistics.contacted;
				var addedToBlackList = user.statistics.black;
				var addedYouToFriends = user.statistics.favedme;
				var lookedMe = user.statistics.lookedme;				
				
				app.container.find(".stat_side").eq(1).find(".items_wrap").eq(0).find(".stat_value").text(addedToFriends);    
				app.container.find(".stat_side").eq(0).find(".items_wrap").eq(1).find(".stat_value").text(contactedYou);
				app.container.find(".stat_side").eq(1).find(".items_wrap").eq(2).find(".stat_value").text(contacted);
				app.container.find(".stat_side").eq(1).find(".items_wrap").eq(1).find(".stat_value").text(addedToBlackList);
				app.container.find(".stat_side").eq(0).find(".items_wrap").eq(0).find(".stat_value").text(addedYouToFriends);				
				app.container.find(".stat_side").eq(0).find(".items_wrap").eq(2).find(".stat_value").text(lookedMe);
				
				app.stopLoading();				
			}
		});
	},	
	
	getStatUsers: function(statAction){		
		app.showPage('users_list_page');		
		app.currentPageWrapper.find('.content_wrap').html('');
		app.template = $('#userDataTemplate').html();
		app.container = app.currentPageWrapper.find('.content_wrap');
		app.pageNumber = 1;
		app.action = 'getStatResults';
		app.statAction = statAction;		
		app.getUsers();
	},
	
	getSearchForm: function(){				
		app.startLoading();
		app.showPage('search_form_page');
		$("#regions_wrap").hide();
		
		app.getCountries();
		app.getDisabilities();		
		
		var html = '<select>';
		for(var i = 18; i <= 80; i++){			
			html = html + '<option value="' + i + '"">' + i + '</option>';
		}		
		html = html + '</select>';		
		
		$(".age_1").html(html);				
		$(".age_1").trigger("create");
		
		var html = '<select>';
		var sel = '';
		for(var i = 19; i <= 80; i++){
			if(i == 40) sel = ' selected="selected"';
			else sel = '';
			html = html + '<option value="' + i + '"' + sel + '>' + i + '</option>';
		}
		html = html + '</select>';		
				
		$(".age_2").html(html);
		$(".age_2").trigger("create");
		
		app.stopLoading();
		
	},
	
	getDisabilities: function(){
		$.ajax({
			url: 'http://m.dating4disabled.com/api/v1/list/health',						
			success: function(list, status, xhr){							
				var html = '<option value="">All</option>'; 
				for(var i in list.items){					  
					var item = list.items[i];					
					html = html + '<option value="' + item.healthId + '">' + item.healthName + '</option>';
				}
				$("#health_list").html(html);
				$("#health_list").val($("#health_list").val()).selectmenu("refresh");
			}
		});
	},
	
	getSexPreference: function(){
		$.ajax({			
			url: 'http://m.dating4disabled.com/api/v1/list/sexPreference',						
			success: function(list, status, xhr){							
				var html = ''; 
				for(var i in list.items){					  
					var item = list.items[i];					
					html = html + '<option value="' + item.sexPrefId + '">' + item.sexPrefName + '</option>';
				}
				$("#sex_preference_list").html(html);				
				$("#sex_preference_list").val($("#sex_preference_list").val());
				$("#sex_preference_list").find("option[value='1']").insertBefore($("#sex_preference_list").find("option:eq(0)"));
				$("#sex_preference_list").val($("#sex_preference_list").find("option:first").val()).selectmenu("refresh");
				
			}
		
		});
	},
		
	getCountries: function(){
		$.ajax({
			url: 'http://m.dating4disabled.com/api/v1/list/countries',						
			success: function(list, status, xhr){							
				var html = ''; 
				for(var i in list.items){					  
					var item = list.items[i];					
					html = html + '<option value="' + item.countryCode + '">' + item.countryName + '</option>';
				}
								
				var countriesContainer = app.container.find("#countries_list");
				app.injectCountries(html, countriesContainer);
				app.getRegions(countriesContainer.val());
				countriesContainer.change(function(){
					app.getRegions($(this).val());
				});				
				
				if(app.currentPageId == 'register_page'){
					app.injectCountries(html, app.container.find("#countries_list2"));
				}			
			}
		});
		
	},
	
	injectCountries: function(html, container){
		container.html(html);
		container.trigger('create');
		container.find("option[value='US']").insertBefore(container.find("option:eq(0)"));
		container.find("option[value='CA']").insertBefore(container.find("option:eq(1)"));
		container.find("option[value='AU']").insertBefore(container.find("option:eq(2)"));
		container.find("option[value='GB']").insertBefore(container.find("option:eq(3)"));
		container.val(container.find("option:first").val()).selectmenu("refresh");
	},
	
	
	getRegions: function(countryCode){
		$.ajax({
			url: 'http://m.dating4disabled.com/api/v1/list/regions/'+countryCode,						
			success: function(list, status, xhr){							
				//var html = '<select>';
				var html = '<select name="regionCode"><option value="">All</option>';
								
				app.container.find("#regions_wrap").hide();
				app.container.find(".regionsList").html('');
				
				app.container.find("#cities_wrap").hide();
				app.container.find(".citiesList").html('');
				
				if(list.itemsNumber > 0){
					for(var i in list.items){					
						var item = list.items[i];					
						html = html + '<option value="' + item.regionCode + '">' + item.regionName + '</option>';
					}
					html = html + '</select>';
					app.container.find(".regionsList").html(html).trigger('create');				
					app.container.find("#regions_wrap").show();
					
					if(app.currentPageId == 'register_page'){
						app.container.find('.regionsList select').change(function(){
							app.getCities(app.container.find("#countries_list").val(),$(this).val());
						});
					}	
				}
				else{
					var html = '<input type="text" name="cityName" id="cityName" />';
					app.container.find(".citiesList").html(html);
					app.container.find("#cities_wrap").show();
				}
				
			}
		});
	},
	
	getCities: function(countryCode,regionCode){
		$.ajax({
			url: 'http://m.dating4disabled.com/api/v1/list/cities/'+countryCode+'/'+regionCode,						
			success: function(list, status, xhr){
				app.container.find("#cities_wrap").hide();				
				if(list.itemsNumber > 0){
					var html = '<select name="cityName"><option value="">All</option>';
					for(var i in list.items){					
						var item = list.items[i];					
						html = html + '<option value="' + item.cityName + '">' + item.cityName + '</option>';
					}
					html = html + '</select>';
					app.container.find(".citiesList").html(html).trigger('create');				
					app.container.find("#cities_wrap").show();				
				}
				else{
					if(countryCode != 'US'){   
						var html = '<input type="text" name="cityName" id="cityName" />';
						app.container.find(".citiesList").html(html);
						app.container.find("#cities_wrap").show();
					}
				}
			}
		});
	},
	
	sendRegData: function(){
		
		if(app.formIsValid()){
			
			var data = JSON.stringify(
					$('#regForm').serializeObject()
			);
			
			
			
			

			//alert(data);
			
			//app.showPage('test_test_page');
			//window.scrollTo(0,0);  
			
			
			$.ajax({
				url: 'http://m.dating4disabled.com/api/v1/user',
				//url: 'http://m.dating4disabled.com/api/insert.asp',
				type: 'Post',
				data: data,
				success: function(response){
					app.response = response;
					//alert( JSON.stringify(app.response));
					
					app.getRegStep();
					//app.showPage('test_test_page');					
					     
				}
			});
			
			
		}
		
	},	
		
	getRegStep: function(){
		//$('#test_test_page').show();
		app.showPage('upload_image_page');
		window.scrollTo(0,0);
	},
	
	formIsValid: function(){
		
		var email_pattern = new RegExp(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i);		
		
		/*
		if (!(email_pattern.test($('#userEmail').val()))) {
			alert("Invalid e-mail");
			$('#userEmail').focus();
			return false;
		}
		
		if ($('#userEmail').val() != $('#userEmail2').val()) {
			alert("Error in retyped email");
			$('#userEmail2').focus();
			return false;
		}
		
		if ($('#userPass').val().length < 4 || $('#userPass').val().length > 12) {
			alert("Invalid password (must be 4 to 12 characters)");
			$('#userPass').focus();
			return false;
		}
		
		if ($('#userPass').val() != $('#userPass2').val()) {
			alert("Error in retyped password");
			$('#userEmail2').focus();
			return false;
		}
		
		if($('#d').val().length == 0 || $('#m').val().length == 0 || $('#y').val().length == 0){
			alert('Invalid date of birth');
			return false;
		}
		
		
		if($('#confirm option:selected').val() != "yes"){
			alert('Please check confirmation box');
			return false;
		}
		*/
		
		return true;
	},
	
	search: function(pageNumber){
		app.showPage('users_list_page');		
		app.template = $('#userDataTemplate').html();
		app.container = app.currentPageWrapper.find('.content_wrap');
		app.container.html('');
		app.pageNumber = 1;
		app.action = 'getSearchResults';
		app.getUsers();
	},
	
	getUserProfile: function(userId){		
		
		app.ajaxSetup();
		app.startLoading();
				
		$.ajax({
			url: 'http://m.dating4disabled.com/api/v1/user/profile/'+userId,
			type: 'Get',
			success: function(user, status, xhr){
				//alert(user.userId);
				app.showPage('user_profile_page');
				window.scrollTo(0, 0);
				var detailsContainer = app.container.find('#user_details');
				
				app.container.find('#pic1, #pic2, #pic3').attr("src","");
				app.container.find(".special3, .blue_star, .on5, .pic_wrap").hide();
				app.container.find('.pic_wrap').addClass("left").removeClass("center");
				
				app.container.find('#pic1').parent('a').addClass("fancybox");
				app.container.find("h1 span").text(user.nickName);
				app.container.find('#pic1').attr("src",user.mainImage).parent('a').attr({"href":user.mainImage, "rel":"images_"+user.userId});
								
				if(user.mainImage == "http://m.dating4disabled.com/images/no_photo_female.jpg" 
				|| user.mainImage == "http://m.dating4disabled.com/images/no_photo_male.jpg"){
					app.container.find('#pic1').parent('a').removeClass("fancybox").attr("href","#");
				}
				
				app.container.find('.pic_wrap').eq(0).show();				
				app.container.find('.fancybox').fancybox();
				
				//alert(user.otherImages[0]);  
				//return;
				
				if(typeof user.otherImages[0] !== "undefined"){ 
					//alert(user.otherImages[0]);
					app.container
						.find('.pic_wrap').eq(1).show()
						.find("img").attr("src",user.otherImages[0])
						.parent('a')
						.attr({"href":user.otherImages[0], "rel":"images_"+user.userId});
				}else{
					app.container.find('.pic_wrap').eq(0).addClass("center").removeClass("left");
				}
				
				if(typeof user.otherImages[1] !== "undefined"){
					//alert(user.otherImages[1]);
					app.container.find('.pic_wrap').eq(2).show()
						.find("img").attr("src",user.otherImages[1])
						.parent('a').attr({"href":user.otherImages[1], "rel":"images_"+user.userId});
				}
								
				if(user.isPaying == 1){
					app.container.find(".special3").show();
				}
				
				if(user.isNew == 1){
					app.container.find(".blue_star").show();
				}				
				
				if(user.isOnline == 1){
					app.container.find(".on5").show();
				}
				
				app.profileGroupTemplate = $('#userProfileGroupTemplate').html();
				app.profileLineTemplate = $('#userProfileLineTemplate').html();
				var profileButtonsTemplate = $('#userProfileButtonsTemplate').html();
				
				
				
				profileButtonsTemplate = profileButtonsTemplate.replace(/\[USERNICK\]/g,user.nickName);									
				profileButtonsTemplate = profileButtonsTemplate.replace("[USER_ID]", user.userId);
				//profileButtonsTemplate.insertBefore(detailsContainer);
				
				var html = profileButtonsTemplate; 
				 				
				html = html + app.getProfileGroup("General Information");				
				html = html + app.getProfileLine("Nickname", user.nickName);
				html = html + app.getProfileLine("Age", user.age);
				html = html + app.getProfileLine("City", user.city);
				html = html + app.getProfileLine("Region", user.region);				
				html = html + app.getProfileLine("Country", user.country);				
				html = html + app.getProfileLine("Sexual Prefernce", user.sexPreference);				
				html = html + app.getProfileGroup("Background");
				html = html + app.getProfileLine("Relationship Status", user.maritalStatus);
				html = html + app.getProfileLine("Children", user.children);
				html = html + app.getProfileLine("I am looking for", user.lookingFor);
				html = html + app.getProfileLine("My Ethnicity", user.ethnity);
				html = html + app.getProfileLine("My Religion", user.religion);
				html = html + app.getProfileLine("My Education", user.education);
				html = html + app.getProfileLine("Country I was born in", user.birthCountry);
				html = html + app.getProfileLine("My Annual Income", user.income);
				html = html + app.getProfileLine("Occupation", user.occupation);				
				html = html + app.getProfileGroup("Physical appearance");				
				html = html + app.getProfileLine("Appearance", user.appearance);
				html = html + app.getProfileLine("Body Type", user.bodyType);				
				html = html + app.getProfileLine("Height", user.height);
				html = html + app.getProfileLine("Weight", user.weight);
				html = html + app.getProfileLine("Hair color", user.hairColor);
				html = html + app.getProfileLine("Hair style", user.hairLength);
				html = html + app.getProfileLine("Eye color", user.eyesColor);				
				html = html + app.getProfileGroup("Personality And Interests");				
				html = html + app.getProfileLine("My Hobbies", user.hobbies);
				html = html + app.getProfileLine("Drinking Habits", user.drinking);
				html = html + app.getProfileLine("Smoking Habits", user.smoking);				
				html = html + app.getProfileGroup("Disability Information");				
				html = html + app.getProfileLine("My Life Challenge", user.disability);
				html = html + app.getProfileLine("Mobility", user.mobility);			
				
				detailsContainer.html(html).trigger('create');
				
				app.stopLoading();				
			}
		});
	},
	
	
	getProfileGroup: function(groupName){
		var group = app.profileGroupTemplate;
		return group.replace("[GROUP_NAME]", groupName);
	},
	
	getProfileLine: function(lineName, lineValue){
		var line = app.profileLineTemplate;
		line = line.replace("[LINE_NAME]", lineName);
		line = line.replace("[LINE_VALUE]", lineValue);
		return line;
	},
	
	getMessenger: function(){		
		app.startLoading();
		
		$.ajax({
			url: 'http://m.dating4disabled.com/api/v1/user/contacts',									
			success: function(response){
				app.response = response;
				app.showPage('messenger_page');
				app.container = app.currentPageWrapper.find('.chats_wrap');
				app.container.html('');
				app.template = $('#messengerTemplate').html();
				
				for(var i in app.response.allChats){					
					var currentTemplate = app.template; 
					var chat = app.response.allChats[i];
					currentTemplate = currentTemplate.replace("[IMAGE]",chat.user.mainImage);
					currentTemplate = currentTemplate.replace(/\[USERNICK\]/g,chat.user.nickName);
					currentTemplate = currentTemplate.replace("[RECENT_MESSAGE]",chat.recentMessage.text);
					currentTemplate = currentTemplate.replace("[DATE]", chat.recentMessage.date);					
					currentTemplate = currentTemplate.replace("[USER_ID]", chat.user.userId);
					
					app.container.append(currentTemplate);
					
					var currentUserNode = app.container.find(":last-child");
					if(chat.newMessagesCount > 0){
						currentUserNode.find(".new_mes_count").html(chat.newMessagesCount).show();
					}
				}
				app.stopLoading();
			}
		});
	},
	
	getChat: function(chatWith, userNick){
		
		app.chatWith = chatWith;
		app.startLoading();
		
		$.ajax({
			url: 'http://m.dating4disabled.com/api/v1/user/chat/'+app.chatWith,									
			success: function(response){				
				app.response = response;
				app.showPage('chat_page');
				window.scrollTo(0, 0);
				app.container = app.currentPageWrapper.find('.chat_wrap');
				app.container.html('');
				app.template = $('#chatMessageTemplate').html();				
				app.currentPageWrapper.find('.content_wrap').find("h1 span").text(userNick);
				var html = app.buildChat();
				app.container.html(html);
				app.refreshChat();
				app.stopLoading();
			}
		});
	},
	
	buildChat: function(){
		var html = '';
		var k = 1;
		var appendToMessage = '';
		
		if(app.response.chat.abilityReadingMessages == 0){
			var appendToMessage = '<br /><span onclick="app.getSubscription();" class="ui-link">Click here to get subscription</span>';
		}
		
		
		for(var i in app.response.chat.items){					
			var currentTemplate = app.template; 
			var message = app.response.chat.items[i];
			
			//alert(message.text);
			
			if(app.chatWith == message.from){
				var messageType = "message_in";
				message.text = message.text + appendToMessage;
			} 
			else 
				var messageType = "message_out";
			
			if(from == message.from) k--;
			
			if(k % 2 == 0){
				messageFloat = "right";
				info = "info_right";
			} 
			else{
				messageFloat = "left";
				info = "info_left";
			}
			
			currentTemplate = currentTemplate.replace("[MESSAGE]", message.text);
			currentTemplate = currentTemplate.replace("[DATE]", message.date);
			currentTemplate = currentTemplate.replace("[TIME]", message.time);
			currentTemplate = currentTemplate.replace("[MESSAGE_TYPE]", messageType);
			currentTemplate = currentTemplate.replace("[MESSAGE_FLOAT]", messageFloat);
			currentTemplate = currentTemplate.replace("[INFO]", info);
			
			html = html + currentTemplate;
			
			var from = message.from;
			
			k++;
		}
		
		return html;
	},
	
	sendMessage: function(){		
		var message = $('#message').val();		
		if(message.length > 0){
			$('#message').val('');			
			$.ajax({
				url: 'http://m.dating4disabled.com/api/v1/user/chat/'+app.chatWith,
				type: 'Post',
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify({			
					message: message 
				}),
				success: function(response){
					app.response = response;
					var html = app.buildChat();
					app.container.html(html);
					app.refreshChat();
				}
			});
		
		}
	},
	
	
	refreshChat: function(){
		
		if(app.currentPageId == 'chat_page'){		
			$.ajax({
				url: 'http://m.dating4disabled.com/api/v1/user/chat/'+app.chatWith+'/refresh',
				type: 'Get',			
				success: function(response){
					app.response = response;
					if(app.response.chat != false){				
						var html = app.buildChat();
						app.container.html(html);						
					}
					//else alert(app.response.chat);
					
					setTimeout(app.refreshChat, 100);
				}
			});
		}
		
	},
	
	checkNewMessages: function(){
		$.ajax({
			url: 'http://m.dating4disabled.com/api/v1/user/newMessagesCount',
			type: 'Get',			
			success: function(response){
				app.response = response;				
				//alert(app.response.newMessagesCount);
				if(app.response.newMessagesCount > 0){
					var count = app.response.newMessagesCount;
					var width = $(document).width();				
					var pos = width/2 - 30;
					$('.new_mes_count2').html(count);
					$(".new_mes").css({"left":pos+"px"}).show();
				}
				else{
					$('.new_mes').hide();
				}
				setTimeout(app.checkNewMessages, 10000);
			}
		});
		
	},
	
	getSubscription: function(){
		app.showPage('subscription_page');
		$(".subscr_quest").unbind('click');
		$(".subscr_quest").click(function(){
			$(this).siblings(".subscr_text").slideToggle("slow");
			var span = $(this).find("span");
			if(span.text() == '+')
				span.text('-');
			else
				span.text('+');
		});
		
		$('input[type="radio"]').removeAttr("checked");
		
		$(".subscr").click(function(){
			$(".subscr_left").removeClass("subscr_sel");
			$(this).find("input").attr("checked","checked");
			$(this).find(".subscr_left").addClass("subscr_sel");
			
			
			
			setTimeout(function(){
				var product_id = $(".subscr_ch:checked").val();
				var nickName = '';
				window.location.href = 'https://www.2checkout.com/2co/buyer/purchase?sid=1400004&quantity=1&product_id='+product_id+'&userid='+app.userId+'&usernick='+nickName;			
			},100);
			
			
			
		});
		
		
	},
	
	confirmDeleteImage: function(imageId){
		app.imageId = imageId;		
		navigator.notification.confirm(
				'Delete this image?',  // message
		        app.deleteImageChoice,              // callback to invoke with index of button pressed		       
		        'Confirmation',            // title
		        'Confirm,Cancel'          // buttonLabels
		 );
	},
	
	deleteImageChoice: function(buttonPressedIndex){
		if(buttonPressedIndex == 1){
			app.deleteImage();
		}
	},
	
	deleteImage: function(){
		app.requestUrl = 'http://m.dating4disabled.com/api/v1/user/images/delete/' + app.imageId,
		app.requestMethod = 'Post';
		app.getUserImages();
	},
	
	displayUserImages: function(){
		app.requestUrl = 'http://m.dating4disabled.com/api/v1/user/images';
		app.requestMethod = 'Get';
		app.getUserImages();
	},
	
	getUserImages: function(){
		$('.imagesButtonsWrap').hide();
		$.ajax({
			url: app.requestUrl,
			type: app.requestMethod,			
			success: function(response){
								
				app.response = response;
				app.showPage('delete_images_page');
				app.container = app.currentPageWrapper.find('.imagesListWrap');
				app.container.html('');
				app.template = $('#editImageTemplate').html();
				window.scrollTo(0,0);
				
				if(app.response.images.itemsNumber < 4)
					$('.imagesButtonsWrap').show();
				
				for(var i in app.response.images.items){					
					var currentTemplate = app.template; 
					var image = app.response.images.items[i];					
					currentTemplate = currentTemplate.replace("[IMAGE]", image.url);
					currentTemplate = currentTemplate.replace("[IMAGE_ID]", image.id);
					app.container.append(currentTemplate);					
					var currentImageNode = app.container.find('.userImageWrap:last-child');
															
					if(image.isValid == 1)
						currentImageNode.find('.imageStatus').html("Approval").css({"color":"green"});
					else						
						currentImageNode.find('.imageStatus').html("Not Approval Yet").css({"color":"red"});					
					
				}
				
				app.container.trigger('create');
			}
		});
	},
	
	capturePhoto: function(sourceType, destinationType){
		// Take picture using device camera and retrieve image as base64-encoded string	
		var options = {
			quality: 100, 
			destinationType: app.destinationType.FILE_URI,
			sourceType: sourceType,
			encodingType: app.encodingType.JPEG,
			targetWidth: 200,
			targetHeight: 200,		
			saveToPhotoAlbum: false
		};
		
		navigator.camera.getPicture(app.onPhotoDataSuccess, app.onPhotoDataFail, options);
		
	},
	
	onPhotoDataSuccess: function(imageURI) {		
		/*
		$("#myNewPhoto").attr("src","data:image/jpeg;base64," + imageURI);
		$('#myNewPhoto').Jcrop({
			onChange: showPreview,
			onSelect: showPreview,
			aspectRatio: 1
		});
		*/
		app.uploadPhoto(imageURI); 
	},
	
	onPhotoDataFail: function() {
		
	},
	
	uploadPhoto: function(imageURI){
		var user = window.localStorage.getItem("user");
		var pass = window.localStorage.getItem("pass");		
		var options = new FileUploadOptions();
        options.fileKey="file";
        options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
        options.mimeType="image/jpeg";
        options.headers = {"Authorization": "Basic " + btoa ( user + ":" + pass)}; 
        
        var ft = new FileTransfer();
        ft.upload(
        	imageURI, 
        	encodeURI("http://m.dating4disabled.com/api/v1/user/image"), 
        	app.uploadSuccess, 
        	app.uploadFailure,
	        options
	    );
	},
	
	uploadSuccess: function(r){
		//console.log("Code = " + r.responseCode);
        //console.log("Response = " + r.response);
        //console.log("Sent = " + r.bytesSent);
        //alert(r.response);
		
		app.response = JSON.parse(r.response);
		if(app.response.status.code == 0){
			navigator.notification.confirm(
				app.response.status.message + '. Click on "Manage Images" button to delete some of them',  // message
		        app.manageImagesChoice,              // callback to invoke with index of button pressed		       
		        'Notification',            // title
		        'Manage Images,Cancel'          // buttonLabels
		    );
		}else if(app.response.status.code == 1){
			navigator.notification.alert(
				app.response.status.message,  // message
		        function(){},         // callback
		        'Notification',            // title
		        'Ok'                  // buttonName
		    );			
		}
		
		if(app.currentPageId == 'delete_images_page'){
			app.displayUserImages();
		}
		
	},
	
	manageImagesChoice: function(buttonPressedIndex){
		if(buttonPressedIndex == 1){
			app.displayUserImages();
		}
	},
	
	uploadFailure: function(error){
		 alert("An error has occurred. Please try again.");
	},
	
	
	register: function(){		
		app.showPage('register_page');		
		$('#birthDate').html(app.getBithDate()).trigger('create');
		app.getCountries();
		app.getSexPreference();
	},
	
	getBithDate: function(){
		var html;		
		html = '<div class="left">';
			html = html + '<select name="userBirthday_d" id="d">';
				html = html + '<option value="">D</option>';
				for (var i = 1; i <= 31; i++) {
					html = html + '<option value="' + i + '">' + i + '</option>';
				}		
			html = html + '</select>';		
		html = html + '</div>';
		
		html = html + '<div class="left">';
			html = html + '<select name="userBirthday_m" id="m">';
				html = html + '<option value="">M</option>';
				for (var i = 1; i <= 12; i++) {
					html = html + '<option value="' + i + '">' + i + '</option>';
				}		
			html = html + '</select>';		
		html = html + '</div>';
						
		var curYear = new Date().getFullYear();
		
		html = html + '<div class="left">';
			html = html + '<select name="userBirthday_y" id="y">';
				html = html + '<option value="">Y</option>';
				for (var i = curYear - 18; i >=1940 ; i--) {
					html = html + '<option value="' + i + '">' + i + '</option>';
				}		
			html = html + '</select>';	
		html = html + '</div>';
		
		return html;
	},
	
	
	
	
	dump: function(obj) {
	    var out = '';
	    for (var i in obj) {
	        out += i + ": " + obj[i] + "\n";
	    }
	    alert(out);
	}	
	
		
};


document.addEventListener("deviceready", app.init, false);

function showPreview(coords)
{
	var rx = 100 / coords.w;
	var ry = 100 / coords.h;

	$('#preview').css({
		width: Math.round(rx * 500) + 'px',
		height: Math.round(ry * 370) + 'px',
		marginLeft: '-' + Math.round(rx * coords.x) + 'px',
		marginTop: '-' + Math.round(ry * coords.y) + 'px'
	});
}

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};


