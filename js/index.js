
pagesTracker = [];
pagesTracker.push('main_page');
var pushNotification;





var app = { 
	
	apiUrl : 'http://m.ricosybellas.com/api/v1',
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
	searchFuncsMainCall: '',
	sort: '',
	
	profileGroupTemplate : '',
	profileLineTemplate : '',
	profileLineTemplate2 : '',
	
	userId : '',
	gcmDeviceId : '',
	imageId : '',
	positionSaved : false,
	logged: false,
	exit: false,
	countMes: 0,
	
		
	init: function(){
		//navigator.splashscreen.hide();		
		app.ajaxSetup();		
		app.chooseMainPage();		
		app.pictureSource = navigator.camera.PictureSourceType;
		app.destinationType = navigator.camera.DestinationType;
		app.encodingType = navigator.camera.EncodingType;
		$('#login_page').css({'height':(($('#header').width()*1.6)-$('#header').height())+'px'});		
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
				//alert(user + ':' + pass);
				xhr.setRequestHeader ("Authorization", "Basic " + btoa ( user + ":" + pass) );
			},		
			statusCode:{
				
				401: function(response, textStatus, xhr){
					
					app.stopLoading();
					app.showPage('login_page');
					document.removeEventListener("backbutton", app.back, false);
					//app.printUsers();
					
					if(app.exit===false){
						navigator.notification.alert(							
							'La información de ingresos es incorrecta, por favor inténtalo de nuevo',
							//response.status + ':' + textStatus,	
							'Notification',
							'Notification'
						);
					}
					 
				}
		
			},
			
			error: function(response, textStatus, errorThrown){
				app.stopLoading();				
				//alert(response.status + ':' + errorThrown );
			},
			
			complete: function(response, status, jqXHR){
				//alert(response.status);
				app.stopLoading();
			},
		});		
	},
	
	logout:function(){
		
		app.startLoading();
		clearTimeout(newMesssages);		
		pagesTracker = [];
		pagesTracker.push('login_page');
		app.exit = true;
		
		$.ajax({				
			url: app.apiUrl + '/user/logout',			
			success: function(data, status){	
				//alert(JSON.stringify(data));
				if(data.logout == 1){					
					app.logged = false;					
					app.positionSaved = false;
					window.localStorage.setItem("userId", "");
					window.localStorage.setItem("user", "");
					window.localStorage.setItem("pass", "");
					app.UIHandler();
					app.ajaxSetup();
					app.stopLoading();
				}				
			}
		});
	},
	
	UIHandler: function(){
		
		document.removeEventListener("backbutton", app.back, false);
		
		if(app.logged === false){
			var userInput = window.localStorage.getItem("userInput");			 
			$('#user_input').find('input').val(userInput);
			$('.appPage').hide();
			$('.new_mes').hide();
			$("#login_page").show();  
			$('#back').hide();
			$('#logout').hide();
			$('#contact').hide();
			$('#sign_up').show();
			//app.printUsers();
			app.currentPageId = 'login_page';
			app.currentPageWrapper = $('#'+app.currentPageId);
		}
		else{
			$('.appPage').hide();
			$("#main_page").show();					
			$('#back').hide();
			$('#logout').show();
			$('#sign_up').hide();
			//$('#contact').show();								 
			app.currentPageId = 'main_page';
			app.currentPageWrapper = $('#'+app.currentPageId);
			
		}
	},
	
	loggedUserInit: function(){
		app.searchFuncsMainCall = true;
		app.setBannerDestination();
		app.checkNewMessages();					
		//app.pushNotificationInit();
		app.sendUserPosition();
	},
	
	startLoading: function(){
		navigator.notification.activityStart(
				'Carga', 
				'Por favor, espere...');
	},
	
	stopLoading: function(){
		navigator.notification.activityStop();
	},	
	
	chooseMainPage: function(){
		
		pagesTracker = [];
		pagesTracker.push('main_page');	
		app.startLoading();
		app.exit = false;
	
		$.ajax({ 
			url: app.apiUrl + '/user/login',
			error: function(response){				
				//alert(JSON.stringify(response));
			},
			statusCode:{
				401: function(response, status, xhr){
					app.logged = false;
					app.UIHandler();						
				}
			},
			success: function(data, status){
				//alert(JSON.stringify(data));
				if(data.userId > 0){
					app.logged = true;
					window.localStorage.setItem("userId", data.userId);
					app.UIHandler();
					app.loggedUserInit();
					$(window).unbind("scroll");
					window.scrollTo(0, 0);
				}		
			}
		});		
	},
	
	setBannerDestination: function(){
		$.ajax({				
			url: app.apiUrl + '/user/banner',			
			success: function(response, status){
				app.response = response;
				//alert(JSON.stringify(app.response));   
				$('#bannerLink').attr("onclick",app.response.banner.func);
				if(app.response.banner.src!==''){
					$('#why_subscr').find('button').hide();
					if($('#bannerLink').find("img").size()===0)
						$('#why_subscr').append('<img src="'+app.response.banner.src+'" />');
					else{
						$('#bannerLink').find("img").attr("src",app.response.banner.src);
						$('#bannerLink').find("img").show();
					}
				}else{
					$('#bannerLink').find("img").hide();
					$('#why_subscr').find('button').text(app.response.banner.text).show();
				}
			}
		});
	},
	
	
	
	sendAuthData: function(){		
		var user = $("#authForm .email").val(); 
		var pass = $("#authForm .password").val();
		app.exit = false;
		window.localStorage.setItem("user",user);
		window.localStorage.setItem("pass",pass);	
		$.ajax({				
			url: app.apiUrl + '/user/login',			
			beforeSend: function(xhr){
				user = window.localStorage.getItem("user");
				pass = window.localStorage.getItem("pass");	
				xhr.setRequestHeader ("Authorization", "Basic " + btoa ( user + ":" + pass) );				
			},
			success: function(data, status){				
				if(data.userId > 0){
					app.logged = true;					
					app.ajaxSetup();
					app.showPage('main_page');
					$('#logout').show();
					window.localStorage.setItem("userId", data.userId);
					window.localStorage.setItem("userInput", user);
					app.loggedUserInit();
					//document.removeEventListener("backbutton", app.back, false);
				}				
			}
		});
	},
	
	sendUserPosition: function(){			
		if(app.positionSaved === false){	
			navigator.geolocation.getCurrentPosition(app.persistUserPosition, app.userPositionError);
		}
	},
	
	persistUserPosition: function(position){	
		var data = {
			longitude: position.coords.longitude,
			latitude: position.coords.latitude
		};
			
		//alert(JSON.stringify(data));
		//return;
		
		$.ajax({
			url: app.apiUrl + '/user/location',
			type: 'Post',
			data:JSON.stringify(data),
			success: function(response){
				app.response = response;
				app.positionSaved = app.response.result;			
			}
		});
	},
	
	userPositionError: function(error){		
		//alert('code: '    + error.code    + '\n' +
	    //      'message: ' + error.message + '\n');		
	},
	
	printUsers: function(){
		$.ajax({
			url: app.apiUrl + '/users/recently_visited/2',
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
		//window.location.href = 'http://dating4disabled.com/contact.asp';		
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
    	//alert(1);   
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
					
					if (e.coldstart){
						console.log('COLDSTART NOTIFICATION');
						app.getMessenger();
					}	
					else{
						console.log('--BACKGROUND NOTIFICATION--');
						app.getMessenger();
					}	
					
					//app.getMessenger();
				}					
            	//console.log('MESSAGE -> MSG: ' + e.payload.message);
            	//console.log('MESSAGE -> MSGCNT: ' + e.payload.msgcnt);            	
            	//alert(e.payload.message);
            	
            	  
            	
            	
            break;
            
            case 'error':
            	console.log('ERROR -> MSG:' + e.msg);
            break;
            
            default:
            	console.log('EVENT -> Unknown, an event was received and we do not know what it is');
            break;
        }
    },
    
    persistGcmDeviceId: function(){
    	$.ajax({				
			url: app.apiUrl + '/user/gcmDeviceId',
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
		$.fancybox.close();
		//app.startLoading();
		$(window).unbind("scroll");
		window.scrollTo(0, 0);
		//alert(pagesTracker);
		pagesTracker.splice(pagesTracker.length-1,1);
		//alert(pagesTracker);
		var prevPage = pagesTracker[pagesTracker.length-1];		
		//alert(prevPage); 
		
		if(typeof prevPage == "undefined" || prevPage == "main_page" ||  prevPage == "login_page")
			//app.showPage('main_page');
			app.chooseMainPage();
		else
			app.showPage(prevPage);
		
		if(app.currentPageId == 'users_list_page'){
			app.template = $('#userDataTemplate').html();
			window.scrollTo(0, app.recentScrollPos);
			app.setScrollEventHandler();
		}
		app.searchFuncsMainCall = true;
		app.stopLoading();
	},
	
	showPage: function(page){		
		app.currentPageId = page;
		app.currentPageWrapper = $('#'+app.currentPageId);
		app.container = app.currentPageWrapper.find('.content_wrap');
		if(pagesTracker.indexOf(app.currentPageId)!=-1){			
			pagesTracker.splice(pagesTracker.length-1,pagesTracker.indexOf(app.currentPageId));
			
		}
		if(pagesTracker.indexOf(app.currentPageId) == -1){
			pagesTracker.push(app.currentPageId);
		}		
		$('.appPage').hide();
		//alert('1');
		app.currentPageWrapper.show();	
		
		
		if(app.currentPageId == 'main_page'){
			$('#back').hide();
			$('#sign_up').hide();
			//$('#contact').show();			
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
			document.addEventListener("backbutton", app.back, false);
		}
		
		$(window).unbind("scroll");
		
	},
	
	sortByDistance: function(){
		app.sort = 'distance';		
		$('#sortByDistance').hide();
		$('#sortByEntranceTime').show();
		app.chooseSearchFunction();		
	},
	
	sortByEntranceTime: function(){
		app.sort = '';		
		$('#sortByEntranceTime').hide();
		$('#sortByDistance').show();		
		app.chooseSearchFunction();
	},
	
	chooseSearchFunction: function(){
		
		app.searchFuncsMainCall = false;
		
		if(app.action == 'getOnlineNow'){					
			app.getOnlineNow();			
		}			
		else if(app.action == 'getSearchResults'){
			app.search();
		}
		else if(app.action == 'getStatResults'){
			app.getStatUsers(app.statAction);
		}
	},
	
	getOnlineNow: function(){
		app.showPage('users_list_page');		
		app.currentPageWrapper.find('.content_wrap').html('');
		app.template = $('#userDataTemplate').html();
		app.container = app.currentPageWrapper.find('.content_wrap');
		app.container.append('<h1>Resultados</h1><div class="dots"></div>');
		app.action = 'getOnlineNow';
		app.pageNumber = 1;
		app.getUsers();
	},
	
 
	getUsers: function(){
		app.startLoading();		
		
		if(app.searchFuncsMainCall === true && app.positionSaved === true){
			$('#sortByEntranceTime').hide();			
			$('#sortByDistance').show();
			app.sort = '';
		}
		
		if(app.action == 'getOnlineNow'){					
			app.requestUrl = app.apiUrl + '/users/online/count:'+app.itemsPerPage+'/page:'+app.pageNumber+'/sort:'+app.sort;
		}	
		else if(app.action == 'getSearchResults'){
			//var countryCode = $('#countries_list').val();
			var countryCode = $('.countryList select').val();
			var regionCode = $('.regionsList select').val();
			if(regionCode==undefined) regionCode='';
			var city = $('#userCityName').val();
			if($('#userCity').val()!=undefined) city=$('#userCity').val();
			var ageFrom = $(".age_1 select").val();
			var ageTo = $(".age_2 select").val();			
			var nickName = $('.nickName').val();
			var userGender=$('.gen input[name="gen"]:checked').val();
			app.requestUrl = app.apiUrl + '/users/search/countryCode:'+countryCode+'/regionCode:'+regionCode+'/city:'+city+'/age:'+ageFrom+'-'+ageTo+'/userGender:'+userGender+'/nickName:'+nickName+'/count:'+app.itemsPerPage+'/page:'+app.pageNumber+'/sort:'+app.sort;
		}	
		else if(app.action == 'getStatResults'){					
			app.requestUrl = app.apiUrl + '/user/statistics/'+app.statAction+'/count:'+app.itemsPerPage+'/page:'+app.pageNumber+'/sort:'+app.sort;
		}
		//alert(app.requestUrl);
		$.ajax({						
			url: app.requestUrl,
			timeout:10000,
			success: function(response, status){
				app.response = response;
				//alert(JSON.stringify(app.response));				
				app.displayUsers();
			}/*,
			error: function(err){
				app.stopLoading();
				alert(JSON.stringify(err));	
			},
			complete: function(response, status, jqXHR){
				alert(JSON.stringify(erresponser));	
				app.stopLoading();
			},*/
		});
	},	
	
	
	displayUsers: function(){
		//alert('1');
		for(var i in app.response.users.items){
			var currentTemplate = app.template; 
			var user = app.response.users.items[i];
			currentTemplate = currentTemplate.replace("[USERNICK]",user.nickName);
			currentTemplate = currentTemplate.replace("[AGE]",user.age);
			//currentTemplate = currentTemplate.replace("[COUNTRY]",user.country+',');
			currentTemplate = currentTemplate.replace("[CITY]",user.country);
			currentTemplate = currentTemplate.replace("[IMAGE]",user.mainImage);			
			currentTemplate = currentTemplate.replace(/\[USERNICK\]/g,user.nickName);										
			currentTemplate = currentTemplate.replace("[USER_ID]", user.id);	
			var aboutUser = user.about;
			//if(aboutUser==null)aboutUser='';
			//if(typeof(user.about) === 'string'){   
			//	if(user.about.length > 90){
			//		aboutUser = user.about.substring(0,90)+'...';
			//	}
			//	else{
			//		aboutUser = user.about;
			//	}
			//}				
			//alert(aboutUser);
			
			currentTemplate = currentTemplate.replace("[ABOUT]", aboutUser);			
			app.container.append(currentTemplate);			
			var currentUserNode = app.container.find(".user_data:last-child");		
			//alert(currentUserNode.find('.user_short_txt').css('text-align'));
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
			}else{
				currentUserNode.find(".on1").show();
			}
			if(user.distance != ""){						
				currentUserNode.find(".distance_value").show().find("span").html(user.distance);
			}
			if(user.id==window.localStorage.getItem("userId")){currentUserNode.find('.send_mes').hide();}
		}
		//setTimeout(app.stopLoading(), 10000);
		app.stopLoading();
		app.responseItemsNumber = app.response.users.itemsNumber;
		app.setScrollEventHandler();
	},	
	
	recovery: function(){
		app.showPage('recovery_page');
		app.currentPageWrapper.find('#user').val('');
	},
	
	sendRecovery: function(){
		var mail = app.currentPageWrapper.find('#user').val();
		var email_pattern = new RegExp(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i);
        if (!(email_pattern.test(mail))) {
            alert('Por favor introduzca un email válido');
            return false;
        }
        $.ajax({
        	url: app.apiUrl + '/recovery/'+mail,
        	success: function(response){
        		//alert(JSON.stringify(response));
        		if(!response.err)
        			app.currentPageWrapper.find('#user').val('');
        		if(response.url){
        			$.ajax({url:response.url});
        		}        			
        		alert(response.text);
        	},
        	error: function(err){
        		//alert(JSON.stringify(err));
        		app.currentPageWrapper.find('#user').val('');
				alert('La contraseña ha sido enviada a la dirección de correo electrónico que ha introducido');
			}
        });
	},
		
	setScrollEventHandler: function(){
		$(window).scroll(function(){	
			var min=700;
			//alert($(this).width());
			if($(this).width()>500)min=1300;
			app.recentScrollPos = $(this).scrollTop();
			if(app.recentScrollPos >= app.container.height()-min){						
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
			
			$('#get_stat_div').show();
			$('#upload_image_div').hide();
		});
		$("#get_stat").click(function(){		
			$("#statistics").show();			
			$("#uploadDiv").hide();
			
			$('#get_stat_div').hide();
			$('#upload_image_div').show();			
		});	
		var userId = window.localStorage.getItem("userId");		
		$.ajax({
			url: app.apiUrl + '/user/profile/'+userId,						
			success: function(user, status, xhr){
				app.showPage('my_profile_page');
				app.container = app.currentPageWrapper.find('.myProfileWrap');		
				app.container.find('.txt strong').html(user.nickName+', <span>'+user.age+'</span>');			
				app.container.find('.txt strong').siblings('span').text(user.city); 
				app.container.find('.txt').append(user.about);			
				app.container.find('.user_pic img').attr("src",user.mainImage);		
				if(user.isPaying==1){
					app.container.find(".special4").show();
				}				
				//console.log(JSON.stringify(user));
				//return;
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
		app.container.append('<h1>Resultados</h1><div class="dots"></div>');
		app.pageNumber = 1;
		app.action = 'getStatResults';
		app.statAction = statAction;		
		app.getUsers();
	},
	
	getSearchForm: function(){				
		app.startLoading();
		app.showPage('search_form_page');
		app.getCountries();
		app.searchFuncsMainCall = true;
		//app.getSexPreference();
		//$("#regions_wrap").hide();
		//app.getCountries();		
		var html = '<select data-iconpos="right">';
		for(var i = 18; i <= 80; i++){			
			html = html + '<option value="' + i + '"">' + i + '</option>';
		}		
		html = html + '</select>';		
		
		$(".age_1").html(html);				
		$(".age_1").trigger("create");
		
		var html = '<select data-iconpos="right">';
		var sel = '';
		for(var i = 19; i <= 80; i++){
			if(i == 40) sel = ' selected="selected"';
			else sel = '';
			html = html + '<option value="' + i + '"' + sel + '>' + i + '</option>';
		}
		html = html + '</select>';				
		$(".age_2").html(html);
		$(".age_2").trigger("create");
		app.formchange(true,'region');
		app.stopLoading();
	},
		
/*	getSexPreference: function(){
		$.ajax({			
			url: app.apiUrl + '/list/sexPreference',						
			success: function(list, status, xhr){							
				var html = '';	
				if(app.currentPageId == 'register_page'){
					for(var i in list.items){					  
						var item = list.items[i];					
						html = html + '<option value="' + item.sexPrefId + '">' + item.sexPrefName + '</option>';
					}					
					$(".sexPreferenceList").html(html);				
					$(".sexPreferenceList").val($(".sexPreferenceList").val());
					$(".sexPreferenceList").find("option[value='1']").insertBefore($(".sexPreferenceList").find("option:eq(0)"));
					$(".sexPreferenceList").val($(".sexPreferenceList").find("option:first").val()).selectmenu("refresh");
				}else if(app.currentPageId == 'search_form_page'){
					for(var i in list.items){					  
						var item = list.items[i];					
						html = html + '<input type="checkbox" id="check-sex' + item.itemId  + '" value="' + item.itemId  + '"><label for="check-sex' + item.itemId  + '">' + item.itemName + '</label>';		
					}
					$(".sexPreferenceList fieldset").html(html);
					$(".sexPreferenceList").trigger("create");					
				}
				
			}
		
		});
	},*/
	
	injectCountries: function(html, container){
		container.html(html);
		container.trigger('create');
		container.find("option[value='US']").insertBefore(container.find("option:eq(0)"));
		container.find("option[value='CA']").insertBefore(container.find("option:eq(1)"));
		container.find("option[value='AU']").insertBefore(container.find("option:eq(2)"));
		container.find("option[value='GB']").insertBefore(container.find("option:eq(3)"));
		container.val(container.find("option:first").val()).selectmenu("refresh");
	},
	
	getCountries: function(){
		$.ajax({
			url: app.apiUrl + '/list/country',
			success: function(list, status, xhr){
				var html = '<select name="countryCode" onchange="app.getRegions($(this).val());" data-iconpos="right">';
				html = html + '<option value=""></option>';//Seleccione un país
				if(list.itemsNumber > 0){
					for(var i in list.items){					
						var item = list.items[i];					
						html = html + '<option value="' + item.countryCode + '">' + item.countryName + '</option>';
					}
					html = html + '</select>';
					app.container.find(".countryList").html(html).trigger('create');
				}
			}
		});
	},
	
	getRegions: function(countryCode){
		if(countryCode!==''){
			$.ajax({
				url: app.apiUrl + '/list/regions/'+countryCode,						
				success: function(list, status, xhr){							
					var html = '<select name="regionCode" onchange="app.getCities(\''+countryCode+'\',$(this).val());" data-iconpos="right">';
					//if(app.currentPageId == 'search_form_page'){
						html = html + '<option value=""></option>';
					//}				
					if(list.itemsNumber > 0){						
						app.formchange(true,'region');
						app.container.find(".regionsList").html('');
						for(var i in list.items){					
							var item = list.items[i];					
							html = html + '<option value="' + item.regionCode + '">' + item.regionName + '</option>';
						}
						html = html + '</select>';
						app.container.find(".regionsList").html(html).trigger('create');					
					}
					else{
						app.formchange(false,'region');
					}
				}
			});
		}else{
			app.formchange(true,'region');
		}
	},
	
	formchange: function(flag,get){
		if(flag){
			app.container.find(".cityInp").hide();
			app.container.find("#userCityName").val('');
			app.container.find(".citiesList").html("<sp>Seleccione una area</sp>").show();
			if(get=='region')app.container.find(".regionsList").html("<sp>Seleccione un país</sp>").show();
			app.container.find("#regions_wrap").show();
		}else{
			app.container.find(".cityInp").show();					
			app.container.find(".citiesList, .regionsList, #regions_wrap").hide();
			app.container.find(".regionsList select,.citiesList select").val('');
		}
	},
	
	getCities: function(countryCode,regionCode){
		if(regionCode!==''){
			$.ajax({
				url: app.apiUrl + '/list/cities/'+countryCode+'/'+regionCode,						
				success: function(list, status, xhr){
					//alert( JSON.stringify(list));				
					if(list.itemsNumber > 0){
						app.formchange(true,'city');
						app.container.find(".citiesList").html('');
						var html = '<select name="userCity" id="userCity" data-iconpos="right">';
						html = html + '<option value=""></option>';
						for(var i in list.items){					
							var item = list.items[i];					
							html = html + '<option value="' + item.cityName + '">' + item.cityName + '</option>';
						}
						html = html + '</select>';
						app.container.find(".citiesList").html(html).trigger('create');								
					}
					else{
						app.formchange(false,'city');
					}
				}
			});
		}else{
			app.formchange(true,'city');
		}
	},
	
	sendRegData: function(){		
		if(app.formIsValid()){
			app.startLoading();
			var data = JSON.stringify(
				$('#regForm').serializeObject()
			);
			//alert(data);
			$.ajax({
				url: app.apiUrl + '/user',
				type: 'Post',
				data: data,
				success: function(response){
					app.response = response;
					app.stopLoading();
					//alert( JSON.stringify(app.response));
					//alert( app.response.err.trim()=="Incorrect syntax near ','.");
					if(app.response.result > 0||(app.response.err==""||app.response.err=="Incorrect syntax near ','.")){
						var user = app.container.find("#userEmail").val(); 
						var pass = app.container.find("#userPass").val();						
						window.localStorage.setItem("user",user);
						window.localStorage.setItem("pass",pass);
						window.localStorage.setItem("userId", app.response.result);
						app.ajaxSetup(); 						
						app.getRegStep();
					}
					else{
						navigator.notification.alert(
							$('<div>'+app.response.err+'</div>').text(),								
							//app.response.result,
							'Notification',
							'Notification'
						);
					}    
				}//,error: function(error){
				//	alert( JSON.stringify(error));
				//}
			});
			
			
		}
		
	},	
		
	getRegStep: function(){
		//$('#test_test_page').show();
		app.showPage('upload_image_page');
		app.container.find('.regInfo').text('Por favor revise su buzón de correo electrónico para confirmar tu registro. Ahora puede cargar una imagen en formato JPEG a su perfil');  // Also you may upload an image in your profile now.
		window.scrollTo(0,0);
	},
	
	formIsValid: function(){
		//alert(app.container.find('#userCityName').val());
		//return false;
		var email_pattern = new RegExp(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i);		
		if (!(email_pattern.test($('#userEmail').val()))) {
			alert('Correo electrónico es incorrecto');
			$('#userEmail').focus();
			return false;
		}
		/*if ($('#userEmail').val() != $('#userEmail2').val()) {
			alert("Error in retyped email");
			$('#userEmail2').focus();
			return false;
		}*/
		if ($('#userPass').val().length < 4 || $('#userPass').val().length > 12) {
			alert("La clave es incorrecta (debería ser de 4-12 puntos)");
			$('#userPass').focus();
			return false;
		}
		if ($('#userPass').val() != $('#userPass2').val()) {
			alert("La clave de nuevo es incorrecta");
			$('#userPass2').focus();
			return false;
		}
		if($('#d').val().length == 0 || $('#m').val().length == 0 || $('#y').val().length == 0){
			alert('Fecha de nacimiento incorrecta');
			return false;
		}
		
		if((app.container.find('#userCityName').val().length == 0&&app.container.find('#userCity').val()==undefined)||(app.container.find('#userCity').val()!=undefined&&app.container.find('#userCity').val().length == 0)){
			alert('Ciudad incorrecta');
			return false;
		}
		/*if($('#confirm option:selected').val() != "1"){
			alert('Please check confirmation box');
			return false;
		}*/
		return true;
	},
	
	search: function(pageNumber){
		app.showPage('users_list_page');		
		app.template = $('#userDataTemplate').html();
		app.container = app.currentPageWrapper.find('.content_wrap');
		app.container.html('');
		app.container.append('<h1>Resultados</h1><div class="dots"></div>');
		app.pageNumber = 1;
		app.action = 'getSearchResults';
		app.getUsers();
	},
	
	getUserProfile: function(userId){		
		if(userId==window.localStorage.getItem("userId")){app.getMyProfileData(); return;}
		app.ajaxSetup();
		app.startLoading();	
		$.ajax({
			url: app.apiUrl + '/user/profile/'+userId,
			type: 'Get',
			success: function(user, status, xhr){
				//alert( JSON.stringify(user));				
				app.showPage('user_profile_page');
				window.scrollTo(0, 0);
				var detailsContainer = app.container.find('#user_details');
				app.container.find('#pic1, #pic2, #pic3').attr("src","");
				app.container.find(".special3, .blue_star, .on5, .pic_wrap").hide();
				app.container.find('.pic_wrap').addClass("left").removeClass("center");
				app.container.find('#pic1').parent('a').addClass("fancybox");
				app.container.find("h1 span").text(user.nickName);
				app.container.find('#pic1').attr("src",user.mainImage).parent('a').attr({"href":user.mainImage, "rel":"images_"+user.userId});				
				if(user.mainImage == "http://m.shedate.co.il/images/no_photo_female.jpg" 
				|| user.mainImage == "http://m.shedate.co.il/images/no_photo_male.jpg"){
					app.container.find('#pic1').parent('a').removeClass("fancybox").attr("href","#");
				}
				app.container.find('.pic_wrap').eq(0).show();				
				app.container.find('.fancybox').fancybox();
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
				if(user.distance != ""){						
					app.container.find(".distance_value").show().css({'right':($('#user_pictures .pic_wrap').width()*0.9-$('#user_pictures .distance_value').width())/2+'px'}).find("span").html(user.distance);
				}else{
					app.container.find(".distance_value").hide().find("span").html(user.distance);
				}
				app.profileGroupTemplate = $('#userProfileGroupTemplate').html();
				app.profileLineTemplate = $('#userProfileLineTemplate').html();
				app.profileLineTemplate2 = $('#userProfileLineTemplate2').html();
				var profileButtonsTemplate = $('#userProfileButtonsTemplate').html();
				profileButtonsTemplate = profileButtonsTemplate.replace(/\[USERNICK\]/g,user.nickName);									
				profileButtonsTemplate = profileButtonsTemplate.replace("[USER_ID]", user.userId);
				//profileButtonsTemplate.insertBefore(detailsContainer);
				var html = profileButtonsTemplate;				 				
				if(!((user.eyesColor== undefined || user.eyesColor=='') && (user.bodyType== undefined || user.bodyType=='') && (user.hairColor== undefined || user.hairColor=='') && (user.hairLength== undefined || user.hairLength=='') && (user.breast== undefined || user.breast=='')))
					html = html + app.getProfileGroup("Apariencia");
				if(user.eyesColor!== undefined && user.eyesColor!=='')html = html + app.getProfileLine("Color de los Ojos", user.eyesColor);
				if(user.bodyType!== undefined && user.bodyType!=='')html = html + app.getProfileLine("Complexión Física", user.bodyType);
				if(user.hairColor!== undefined && user.hairColor!=='')html = html + app.getProfileLine("Color del Cabello", user.hairColor);
				if(user.hairLength!== undefined && user.hairLength!=='')html = html + app.getProfileLine("Peinado", user.hairLength);
				if(user.breast!== undefined && user.breast!=='')html = html + app.getProfileLine("Peso", user.breast);
				html = html + app.getProfileGroup("Información general");
				//html = html + app.getProfileLine("Nickname", user.nickName);
				if(user.age!== undefined && user.age!=='')html = html + app.getProfileLine("Edad", user.age);
				//html = html + app.getProfileLine("נטיה מינית", user.sexPreference);
				//html = html + app.getProfileLine("נסיון עם נשים", user.experience);	
				if(user.country!== undefined && user.country!=='')html = html + app.getProfileLine("País de Nacimiento", user.country);
				if(user.region!== undefined && user.region!=='')html = html + app.getProfileLine("Area", user.region);
				if(user.city!== undefined && user.city!=='' && user.city!==null)html = html + app.getProfileLine("Ciudad", user.city);
				if(user.smoking!== undefined && user.smoking!=='')html = html + app.getProfileLine("Hábitos de Fumar", user.smoking);
				if(user.education!== undefined && user.education!=='')html = html + app.getProfileLine("Educación", user.education);
				if(user.occupation!== undefined && user.occupation!=='')html = html + app.getProfileLine("Ocupaciones", user.occupation);
				if(user.economy!== undefined && user.economy!=='')html = html + app.getProfileLine("Situación Económica", user.economy);
				//html = html + app.getProfileLine("דתי", user.religion);
				if(user.about!== undefined && user.about!=='' && user.about!=null){
					html = html + app.getProfileGroup("Un poco sobre mí");				
					html = html + app.getProfileLine("", user.about);
				}
				if(user.lookingFor!== undefined && user.lookingFor!=='' && user.lookingFor!=null){
					html = html + app.getProfileGroup("Busco");				
					html = html + app.getProfileLine("", user.lookingFor);
				}
				if((user.hobbies!== undefined && user.hobbies!=='')&&(user.music!== undefined && user.music!=='')){				
					html = html + app.getProfileGroup("Más información sobre mí");
					if(user.hobbies!== undefined && user.hobbies!=='')html = html + app.getProfileLine("Mis intereses", user.hobbies);
					if(user.music!== undefined && user.music!=='')html = html + app.getProfileLine("My Music", user.music);
				}
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
		if(lineName != ""){
			var line = app.profileLineTemplate;
			line = line.replace("[LINE_NAME]", lineName);			
		}
		else{
			var line = app.profileLineTemplate2;
		}
		line = line.replace("[LINE_VALUE]", lineValue);
		return line;
	},
	
	getMessenger: function(){		
		app.startLoading();		
		$.ajax({
			url: app.apiUrl + '/user/contacts',									
			success: function(response){
				
				app.response = response;	
				//alert(JSON.stringify(app.response));
				
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
					if(chat.newMessagesCount > 0||chat. user.isPaying == 1){
						var currentUserNode = app.container.find(":last-child");
						if(chat.newMessagesCount > 0)currentUserNode.find(".new_mes_count").html(chat.newMessagesCount).show();
						if(chat.user.isPaying == 1)currentUserNode.find(".special2").show();
					}
				}
				app.stopLoading();
			}
		});
	},
	
	getChat: function(chatWith, userNick){
		if(chatWith==window.localStorage.getItem("userId")){app.getMyProfileData(); return;}
		app.chatWith = chatWith;
		app.startLoading();
		$.ajax({
			url: app.apiUrl + '/user/chat/'+app.chatWith,									
			success: function(response){				
				app.response = response;
				//alert(JSON.stringify(app.response));
				app.showPage('chat_page');
				window.scrollTo(0, 0);
				app.container = app.currentPageWrapper.find('.chat_wrap');
				app.container.html('');
				app.template = $('#chatMessageTemplate').html();				
				app.currentPageWrapper.find('.content_wrap').find("h1 span").text(userNick).attr('onclick','app.getUserProfile(\''+chatWith+'\')');
				var html = app.buildChat();
				app.container.html(html);
				app.subscribtionButtonHandler();
				app.refreshChat();
				app.stopLoading();
			}
		});
	},
	
	subscribtionButtonHandler: function(){
		if(app.response.chat.abilityReadingMessages == 0){					
			app.container.find('.message_in .buySubscr').show().trigger('create');	//.noread								
		}
	},
	
	buildChat: function(){
		var html = '';
		var k = 1;
		var appendToMessage = '';
				
		for(var i in app.response.chat.items){					
			var currentTemplate = app.template; 
			var message = app.response.chat.items[i];
			
			if(app.chatWith == message.from){
				var messageType = "message_in";
				//if(message.readClass == 'checked'){
				//	messageType = messageType + ' noread';
				//}
				var read = "";
			} 
			else{ 
				var messageType = "message_out";
				var read = '<div class="read_mess '+message.readClass+'"></div>';
			}
			
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
			currentTemplate = currentTemplate.replace("[READ]", read);
			
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
				url: app.apiUrl + '/user/chat/'+app.chatWith,
				type: 'Post',
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify({			
					message: message 
				}),
				success: function(response){
					//alert(JSON.stringify(app.response));
					app.response = response;
					var html = app.buildChat();
					app.container.html(html);
					app.subscribtionButtonHandler();
					app.refreshChat();
				}
			});
		
		}
	},
	
	
	refreshChat: function(){
		if(app.currentPageId == 'chat_page'){
			$.ajax({
				url: app.apiUrl + '/user/chat/'+app.chatWith+'/refresh',
				type: 'Get',
				complete: function(response, status, jqXHR){					
					//app.stopLoading();
				},
				success: function(response){
					if(response.chat != false){							
						if(app.currentPageId == 'chat_page'){
							app.response = response;
							//alert(JSON.stringify(app.response));
							var html = app.buildChat();
							app.container.html(html);	
							app.subscribtionButtonHandler();
						}
					}
					refresh = setTimeout(app.refreshChat, 100);
					
				}
			});
		}
		else{
			clearTimeout(refresh);
		}
		
	},
	
	checkNewMessages: function(){
		$.ajax({
			url: app.apiUrl + '/user/newMessagesCount',
			type: 'Get',
			complete: function(response, status, jqXHR){					
				//app.stopLoading();
			},
			success: function(response){
				app.response = response;				
				//alert(app.response.newMessagesCount);
				if(app.response.newMessagesCount > 0){
					var count = app.response.newMessagesCount;
					
					//var width = $(document).width();				
					//var pos = width/2 - 30;
					$('.new_mes_count2').html(count);
					$('#main_page').addClass('pad_top_25');//css({'padding-top':'25px'});					
					$('.new_mes').show();
					if(app.currentPageId == 'messenger_page'&&app.countMes != count){
						//$('.new_mes_count').html(count).show();
						app.getMessenger();
					}					
				}
				else{
					$('.new_mes').hide();
					$('#main_page').css({'padding-top':'0px'});
					if(app.currentPageId == 'messenger_page'){
						$('.new_mes_count').hide();
					}
				}
				app.countMes = count;
				newMesssages = setTimeout(app.checkNewMessages, 10000);
			}
		});
		
	},
	
	getSubscription: function(){
		var userId = window.localStorage.getItem("userId");
		var ref = window.open('http://m.ricosybellas.com/subscription/?userId='+userId+'&app=1', '_blank', 'location=yes');
	
		//app.showPage('subscription_page');
		//$(".subscr_quest").unbind('click');
		//$(".subscr_quest").click(function(){
		//	$(this).siblings(".subscr_text").slideToggle("slow");
		//	var span = $(this).find("span");
		//	if(span.text() == '+')
		//		span.text('-');
		//	else
		//		span.text('+');
		//});
		
		//$('input[type="radio"]').removeAttr("checked");
		
		//$(".subscr").click(function(){
		//	$(".subscr_left").removeClass("subscr_sel");
		//	$(this).find("input").attr("checked","checked");
		//	$(this).find(".subscr_left").addClass("subscr_sel");
		//	setTimeout(function(){
		//		var product_id = $(".subscr_ch:checked").val();
		//		var nickName = '';
		//		window.location.href = 'https://www.2checkout.com/2co/buyer/purchase?sid=1400004&quantity=1&product_id='+product_id+'&userid='+app.userId+'&usernick='+nickName;			
		//	},100);
		//});
	},
	
	confirmDeleteImage: function(imageId){
		app.imageId = imageId;		
		navigator.notification.confirm(
				'Eliminar esta foto?',  // message
		        app.deleteImageChoice,              // callback to invoke with index of button pressed		       
		        'Confirmation',            // title
		        'Confirmar,Camcelar'          // buttonLabels
		 );
	},
	
	deleteImageChoice: function(buttonPressedIndex){
		if(buttonPressedIndex == 1){
			app.deleteImage();
		}
	},
	
	deleteImage: function(){
		app.requestUrl = app.apiUrl + '/user/images/delete/' + app.imageId,
		app.requestMethod = 'Post';
		app.getUserImages();
	},
	
	displayUserImages: function(){
		app.requestUrl = app.apiUrl + '/user/images';
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
				
				//alert(JSON.stringify(app.response));				
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
						currentImageNode.find('.imageStatus').html("Aprobada").css({"color":"green"});
					else						
						currentImageNode.find('.imageStatus').html("Todavía no se ha aprobado").css({"color":"red"});					
					
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
			targetWidth: 600,
			targetHeight: 600,		
			saveToPhotoAlbum: false,
			chunkedMode:true,
			correctOrientation: true
		};
		
		navigator.camera.getPicture(app.onPhotoDataSuccess, app.onPhotoDataFail, options);
		
	},
	
	onPhotoDataSuccess: function(imageURI) {		
		app.startLoading();
		
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
        	encodeURI("http://m.ricosybellas.com/api/v1/user/image"), 
        	app.uploadSuccess, 
        	app.uploadFailure,
	        options
	    );
	},
	
	
	uploadSuccess: function(r){
		//console.log("Code = " + r.responseCode);
        //console.log("Response = " + r.response);
        //console.log("Sent = " + r.bytesSent);
		eval('var obj='+r.response);
		//alert(obj.status.code);
        //return;
		
		app.stopLoading();
		
		//app.response = JSON.parse(r.response);
		app.response = obj;
		
		//alert(app.response.status.code);
		if(app.response.status.code == 0){
			navigator.notification.confirm(
				app.response.status.message + '. Haga clic en el enlace "Mis imágenes" para borrar imágenes',  // message
		        app.manageImagesChoice,              // callback to invoke with index of button pressed		       
		        'Notification',            // title
		        'Organizar las imágenes, cancelar'          // buttonLabels
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
		app.stopLoading(); 
		alert("Se ha producido un error. Por favor, vuelve a intentarlo.");
	},
	
	
	register: function(){		
		app.showPage('register_page');		
		$('#birthDate').html(app.getBithDate()).trigger('create');
		app.getCountries();
		//app.getRegions();
		//app.getCities();
		//app.getSexPreference();
	},
	
	
	getBithDate: function(){
		var html;		
		html = '<div class="left">';
			html = html + '<select name="userBirthday_d" id="d" data-iconpos="right">';
				html = html + '<option value="">dia</option>';
				for (var i = 1; i <= 31; i++) {
					html = html + '<option value="' + i + '">' + i + '</option>';
				}		
			html = html + '</select>';		
		html = html + '</div>';
				
		html = html + '<div class="left">';
			html = html + '<select name="userBirthday_m" id="m" data-iconpos="right">';
				html = html + '<option value="">mes</option>';
				for (var i = 1; i <= 12; i++) {
					html = html + '<option value="' + i + '">' + i + '</option>';
				}		
			html = html + '</select>';		
		html = html + '</div>';
						
		var curYear = new Date().getFullYear();
		
		html = html + '<div class="left">';
			html = html + '<select name="userBirthday_y" id="y" data-iconpos="right">';
				html = html + '<option value="">año</option>';
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



//======================================================== FASTCLICK
function FastButton(element, handler) {
   this.element = element;
   this.handler = handler;
   element.addEventListener('touchstart', this, false);
};
FastButton.prototype.handleEvent = function(event) {
   switch (event.type) {
      case 'touchstart': this.onTouchStart(event); break;
      case 'touchmove': this.onTouchMove(event); break;
      case 'touchend': this.onClick(event); break;
      case 'click': this.onClick(event); break;
   }
};
FastButton.prototype.onTouchStart = function(event) {

event.stopPropagation();
   this.element.addEventListener('touchend', this, false);
   document.body.addEventListener('touchmove', this, false);
   this.startX = event.touches[0].clientX;
   this.startY = event.touches[0].clientY;
isMoving = false;
};
FastButton.prototype.onTouchMove = function(event) {
   if(Math.abs(event.touches[0].clientX - this.startX) > 10 || Math.abs(event.touches[0].clientY - this.startY) > 10) {
      this.reset();
   }
};
FastButton.prototype.onClick = function(event) {
   this.reset();
   this.handler(event);
   if(event.type == 'touchend') {
      preventGhostClick(this.startX, this.startY);
   }
};
FastButton.prototype.reset = function() {
   this.element.removeEventListener('touchend', this, false);
   document.body.removeEventListener('touchmove', this, false);
};
function preventGhostClick(x, y) {
   coordinates.push(x, y);
   window.setTimeout(gpop, 2500);
};
function gpop() {
   coordinates.splice(0, 2);
};
function gonClick(event) {
   for(var i = 0; i < coordinates.length; i += 2) {
      var x = coordinates[i];
      var y = coordinates[i + 1];
      if(Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25) {
         event.stopPropagation();
         event.preventDefault();
      }
   }
};
document.addEventListener('click', gonClick, true);
var coordinates = [];
function initFastButtons() {
new FastButton(document.getElementById("mainContainer"), goSomewhere);
};
function goSomewhere() {
var theTarget = document.elementFromPoint(this.startX, this.startY);
if(theTarget.nodeType == 3) theTarget = theTarget.parentNode;

var theEvent = document.createEvent('MouseEvents');
theEvent.initEvent('click', true, true);
theTarget.dispatchEvent(theEvent);
};
//========================================================
