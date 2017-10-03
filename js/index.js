
pagesTracker = [];
pagesTracker.push('main_page');
var pushNotification;
checkNewMessagesRequest = '';
newMessages = '';
checkStatus = '';




var app = { 
	
	apiUrl : 'http://m.ricosybellas.com/api/v3',
	pictureSource : '',
	destinationType : '',
	encodingType : '',	
	backPage : '',
	currentPageId : '',
	currentPageWrapper : '',
	recentScrollPos : '',
	activationMessage: '',
	
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
		/*cordova.plugins.backgroundMode.on('enable', function(){
		    alert('test');
		});*/
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
                user = window.localStorage.getItem("user");
		        pass = window.localStorage.getItem("pass");
			    xhr.setRequestHeader ("Authorization", "Basic " + btoa ( user + ":" + pass) );
			},		
			statusCode:{
				
				401: function(response, textStatus, xhr){
					 //alert(JSON.stringify(response));
					app.stopLoading();
					app.showPage('login_page');
					document.removeEventListener("backbutton", app.back, false);
					//app.printUsers();
					
					if(app.exit===false){

					    //app.alert('La información de ingresos es incorrecta, por favor inténtalo de nuevo');

                        var resArr = response.responseText.split('{');

                        if(resArr.length == 1){
                            resArr[1] = '}';
                        }
                        var errText = resArr[0];
                        resArr.splice(0, 1);
                        var resp = JSON.parse('{' + resArr.join('{'));
                        var url = false;
                        if(typeof resp.url != 'undefined'){
                            url = resp.url;
                        }

                        app.alert(errText);

					    user = 'nouser';
                        pass = 'nopass';
						/*navigator.notification.alert(
							'La información de ingresos es incorrecta, por favor inténtalo de nuevo',
							//response.status + ':' + textStatus,	
							'Notification',
							'Notification'
						);*/
					}
					 
				},
		
			},
			
			error: function(response, textStatus, errorThrown){
				app.stopLoading();
							//alert(JSON.stringify(response));
				//alert(response.status + ':' + errorThrown );
			},
			
			complete: function(response, status, jqXHR){
				//alert(response.status);
				app.stopLoading();
			},
		});		
	},
	
	logout:function(){
		app.logged = false;
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

	checkUserStatus: function() {
            if(app.logged === false){
                var userInput = window.localStorage.getItem("userInput");
                $('#user_input').find('input').val(userInput);
                $('.appPage').hide();
                $('.new_mes').hide();
                $("#login_page").show();
                $('#back').hide();
                $('#logout').hide();
                $('#contact').show();
                $('#sign_up').show();
                //app.printUsers();
                app.currentPageId = 'login_page';
                app.currentPageWrapper = $('#'+app.currentPageId);
            }
            else{

               if(app.logged == 'nopay'){
                        $('#likesNotifications, .appPage, #sign_up').hide();
                        document.addEventListener("pause", navigator.app.exitApp, false);
                        document.removeEventListener("backbutton", app.back, false);
                        document.addEventListener("backbutton", navigator.app.exitApp, false);

                        app.currentPageId = 'paymentPage';
                        app.currentPageWrapper = $('#'+app.currentPageId);
                        app.currentPageWrapper.show();
                     //   app.getSubscription();
                }else{

                    if(app.logged == 'noimg'){
                         app.displayUserImages();
                        //$('#likesNotifications').css({left:'auto',right:'0px'}).show();
                        //app.getRegStep();
                        //app.showPage('delete_images_page');
                    }

                    if(app.logged === true){
                        $('#likesNotifications').css({left:'auto',right:'0px'}).show();
                        document.removeEventListener("pause", navigator.app.exitApp, false);
                        app.currentPageId = 'main_page';
                        app.currentPageWrapper = $('#'+app.currentPageId);
                        app.currentPageWrapper.find('.mainBut').show();
                    }

                    if(app.logged == 'notCompleteData'){
                        $('#likesNotifications').css({left:'auto',right:'0px'}).show();
                        //$('#likesNotifications,.new_mes').hide();
                        app.getEditProfile();
                        //app.formIsValid(false);
                    }

                    $('.appPage').hide();
                    $("#main_page").show();
                    $('#back').hide();
                    $('#logout').show();
                    $('#sign_up').hide();
                    //$('#contact').show();
                    app.currentPageId = 'main_page';
                    app.currentPageWrapper = $('#'+app.currentPageId);
                }

            }
    	},

	UIHandler: function(){
	    app.checkUserStatus();
		document.removeEventListener("backbutton", app.back, false);
	},
	
	loggedUserInit: function(){
		app.searchFuncsMainCall = true;
		app.setBannerDestination();
		app.checkNewMessages();					
		app.pushNotificationInit();
		app.sendUserPosition();
	},
	
	startLoading: function(){
		navigator.notification.activityStart(
				'Carga', 
				'Por favor, espere...');
	},
	
	stopLoading: function(){
	    //alert(231);
		navigator.notification.activityStop();
	},	
	
	chooseMainPage: function(){

        if(window.localStorage.getItem("activationMessage")) {
            app.alert(window.localStorage.getItem("activationMessage"));
            window.localStorage.removeItem('activationMessage');
        }
                //    app.alert(window.localStorage.getItem("activationMessage"));
		pagesTracker = [];
		pagesTracker.push('main_page');
		app.startLoading();
		app.exit = false;
		//$('#userProfileButtonsTemplate').addClass('hidden');

		$.ajax({ 
			url: app.apiUrl + '/user/login',
			error: function(response){
				//app.stopLoading();
				//alert(JSON.stringify(response));
			},
			statusCode:{
				401: function(response, status, xhr){
					app.logged = false;
					app.UIHandler();
				}
			},
			success: function(data, status){
				if(data.userId > 0){
					app.logged = data.logged;
					app.checkUserStatus();
					window.localStorage.setItem("userId", data.userId);
					app.UIHandler();
					app.loggedUserInit();
					$(window).unbind("scroll");
					window.scrollTo(0, 0);
					app.checkUserStatus();
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
					app.logged = data.logged;
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
		
	/*pushNotificationInit: function(){


		try{ 
        	pushNotification = window.plugins.pushNotification;
        	if (device.platform == 'android' || device.platform == 'Android') {
				//alert('registering android'); 
            	pushNotification.register(app.regSuccessGCM, app.regErrorGCM, {"senderID":"573194026362","ecb":"app.onNotificationGCM"});		// required!
			}
        }
		catch(err){ 
			txt="There was an error on this page.\n\n"; 
			txt+="Error description: " + err.message + "\n\n"; 
			alert(txt); 
		}

	},	*/

	pushNotificationInit: function() {

       var push = PushNotification.init({
          android: {
             senderID: "573194026362",
             icon: "icon",
             iconColor: "silver",
          }
       });

       push.on('registration', function (data) {
          // data.registrationId

          //alert(JSON.stringify(data));

          app.gcmDeviceId = data.registrationId;
          app.persistGcmDeviceId();
       });

       push.on('notification', function (data) {

           if(!data.additionalData.foreground || app.currentPageId == 'messenger_page'){
              app.getMessenger();
           }
           });

       push.on('error', function (e) {

          console.log("PUSH PLUGIN ERROR: " + JSON.stringify(e));

          //e.message
       });

    },
	
	// handle GCM notifications for Android
    onNotificationGCM: function(e) {
    	//console.log('EVENT -> RECEIVED:' + e.event);        
        switch( e.event ){
            case 'registered':            

			if ( e.regid.length > 0 ){
				app.gcmDeviceId = e.regid;
				app.persistGcmDeviceId();
			}
            break;
            
            
            case 'message':
            	// if this flag is set, this notification happened while we were in the foreground.
            	// you might want to play a sound to get the user's attention, throw up a dialog, etc.
            	if (e.foreground){
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
		//$.fancybox.close();
		//app.startLoading();
		app.closeUserGallery();
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

	getPage : function(id) {

		app.showPage('dynamic_page');


        $.ajax({
            url: app.apiUrl + '/page/'+id,
            type: 'GET',
            contentType: "application/json; charset=utf-8",
            error: function(error){
              // alert(JSON.stringify(error));
            },
            success: function(response, status, xhr){
               //alert(JSON.stringify(response));
               $('#dynamic_page h1').html(response.result.pageTitle);
               $('#dynamic_page .chats_wrap').html(response.result.pageText);
            }
        });
	},

	sendMessageToAdmin: function(){

    		app.startLoading();

    		var userId = window.localStorage.getItem("userId");
    		var messageToAdmin = $('#messageToAdmin').val();

    		if(!messageToAdmin.length){
    			return;
    		}

    		$.ajax({
    		   	url: app.apiUrl + '/contactUs',
    		   	type: 'Post',
    		   	contentType: "application/json; charset=utf-8",
    		   	data: JSON.stringify({
    				userId: userId,
    				messageToAdmin: messageToAdmin,
    			}),
    			error: function(error){
    			  // alert(JSON.stringify(error));
    			   app.stopLoading();
    			},
    			success: function(response, status, xhr){
    			   app.stopLoading();
    			   $('#messageToAdmin').val('');
    			   app.alert('Gracias. mensaje enviado');
    			   app.back();
    			}
    	   });
    	},

	showPage: function(page){
        app.checkUserStatus();
        if(app.logged !== 'nopay'){
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
                $('#contact,#logout').hide();
            //}else if(app.currentPageId == 'user_profile_page'){
                //$('#userProfileButtonsTemplate').removeClass('hidden');
            }
            else{
                $('#back').show();
                $('#sign_up').hide();
                $('#contact').hide();
                //$('#userProfileButtonsTemplate').addClass('hidden');
                document.addEventListener("backbutton", app.back, false);
            }

            if(app.currentPageId  == 'paymentPage' ) {
                $('#logout').show();
            }


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
	

    getUsersForLikes: function(supposedToBeLikedUserId, notifId){

 		app.startLoading();

 		if(!supposedToBeLikedUserId){
 			supposedToBeLikedUserId = 0;
 		}

 		if(!notifId){
         	notifId = 0;
         }

         var url = app.apiUrl + '/users/forLikes/' + supposedToBeLikedUserId + '/' + notifId;
         //alert(url);
         //return;


 		$.ajax({
         	url: url,
         	type: 'Get',
         	timeout: 10000,
         	error: function(error){
         		alert("ERROR:" + JSON.stringify(error));
         	},
         	success: function(response){


 				if(response.userHasNoMainImage){
                	alert("כדי להיכנס לזירה של ריצ'דייט עליך לעדכן תמונה.");
                 	app.displayUserImages();
                 }else{
                  		alert("Success2:" + JSON.stringify(response));
                 }

         		console.log("RESP:" + JSON.stringify(response));
                 if(response.users.itemsNumber > 0){
 					app.showPage('do_likes_page');
                 	//console.log("NUMBER: " + response.users.itemsNumber);
                 	//console.log("ITEMS: " + JSON.stringify(response));


 					var wrapper = $('.swiper-wrapper');
 					var userId = window.localStorage.getItem("userId");
 					var html = '';
 					//wrapper.html(html);
 					//alert(response.users.items.length);
 					for(var i in response.users.items){

 						if (i < 200){

 							var user = response.users.items[i];


 							//console.log("USER: " + JSON.stringify(user));


 							//html = html + '<div class="swiper-slide">'+i+'</div>';

 							html = html + '<div class="swiper-slide"><div id="' + user.id + '" class="cont" style="background-image: url('
 								+ user.imageUrl + ')"><div class="nickname" onclick="app.getUserProfile(' + user.id + ')">' + user.nickName + ', '+ user.age +'</div></div></div>';

 							//if (i < 3){
 								//wrapper.append(html);
 								//html = '';
 							//}
 						//wrapper.append(html);
 						}
 						if (i == 200) break;
 					}


                     wrapper.html(html);
                     //wrapper.append(html);
                     //console.log("SWIPER HTML: " + wrapper.html());
 					app.initSwiper();
 					app.showPage('do_likes_page');
                 }


         	},
         });
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
			var countryCode = $('input[name=countryCode]').val();
			var regionCode = $('.regionsList select').val();
			if(regionCode==undefined) regionCode='';
			var city = $('#userCityName').val();
			if($('#userCity').val()!=undefined) city=$('#userCity').val();
			var ageFrom = $(".age_1 select").val();
			var ageTo = $(".age_2 select").val();			
			var nickName = $('.nickName').val();
			var userGender=$('.registerOnly input[name="userGender"]:checked').val();

			app.requestUrl = app.apiUrl + '/users/search/countryCode:'+countryCode+'/regionCode:'+regionCode+'/city:'+city+'/age:'+ageFrom+'-'+ageTo+'/userGender:'+userGender+'/nickName:'+nickName+'/count:'+app.itemsPerPage+'/page:'+app.pageNumber+'/sort:'+app.sort;
		}	
		else if(app.action == 'getStatResults'){

			app.requestUrl = app.apiUrl + '/user/statistics/'+app.statAction+'/count:'+app.itemsPerPage+'/page:'+app.pageNumber+'/sort:'+app.sort;
		}

		$.ajax({
			url: app.requestUrl,
			timeout:10000,
			success: function(response, status){
				app.response = response;
				app.displayUsers();
				app.stopLoading();
			},
			error: function(err){
				app.stopLoading();
				alert(JSON.stringify(err));
			},
			complete: function(response, status, jqXHR){
				app.stopLoading();
			},
		});
	},
	
	displayUsers: function(){
		for(var i in app.response.users.items){
			var currentTemplate = app.template; 
			var user = app.response.users.items[i];

            if(user.city == null) {
                user.city = '';
            }

			currentTemplate = currentTemplate.replace("[USERNICK]",user.nickName);
			currentTemplate = currentTemplate.replace("[AGE]",user.age);
			//currentTemplate = currentTemplate.replace("[COUNTRY]",user.country+',');
			currentTemplate = currentTemplate.replace("[CITY]",user.city);
			currentTemplate = currentTemplate.replace("[IMAGE]",user.mainImage.url);
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
        /*if (!(email_pattern.test(mail))) {
            alert('Por favor introduzca un email válido');
            return false;
        }*/
        $.ajax({
        	url: app.apiUrl + '/recovery/'+mail,
        	success: function(response){
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
				app.container.find('.txt .text').text(user.about);
				app.container.find('.user_pic img').attr("src",user.mainImage.url);
				if(user.isPaying==1){
					app.container.find(".special4").show();
				}				

				var addedToFriends = user.statistics.fav;  
				var contacted = user.statistics.contactedme;
				var contactedYou = user.statistics.contacted;
				var addedToBlackList = user.statistics.black;
				var addedYouToFriends = user.statistics.favedme;
				var lookedMe = user.statistics.lookedme;
				var looked = user.statistics.looked;

				app.container.find(".stat_side").eq(1).find(".items_wrap").eq(0).find(".stat_value").text(addedToFriends);
				app.container.find(".stat_side").eq(0).find(".items_wrap").eq(1).find(".stat_value").text(contactedYou);
				app.container.find(".stat_side").eq(1).find(".items_wrap").eq(1).find(".stat_value").text(addedToBlackList);
				app.container.find(".stat_side").eq(0).find(".items_wrap").eq(0).find(".stat_value").text(addedYouToFriends);
				app.container.find(".stat_side").eq(0).find(".items_wrap").eq(2).find(".stat_value").text(lookedMe);
				app.container.find(".stat_side").find(".items_wrap").find(".stat_value.contactedThem").text(contacted);

				app.stopLoading();
			},
			error : function(err) {
				alert(JSON.stringify(err));
			}
		});
	},	


    manageLists: function(list, act){

        app.startLoading();

        if(list == 'black' && act == 0) {
            app.alert('El socio fue removido de la lista.');
        }else if(list == 'black' && act == 1) {
            app.alert('Socio añadido.');
        }

        if(list == 'favi' && act == 0) {
            app.alert('Eliminar de Favoritos.');
        }else if(list == 'favi' && act == 1) {
              app.alert('Socio añadido. Atención, para que este socio aparezca en tu perfil, él tiene que añadirte tambien como amigo.');
        }

        $.ajax({
            url: app.apiUrl+'/user/managelists/'+ list + '/' + act + '/' + app.reportAbuseUserId,
            type: 'Post',
            contentType: "application/json; charset=utf-8",
            error: function(response){
               // alert(JSON.stringify(response));
            },
            success: function(response, status, xhr){
                if(response.success){
                    app.container.find('.' + list + act).hide();
                    if(act == '1'){
                        app.container.find('.' + list + '0').show();
                    }else{
                        app.container.find('.' + list + '1').show();
                    }
                }

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
		app.getRegions();
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

    reportAbuse: function(){

        var abuseMessage = $('#abuseMessage').val();

        $.ajax({
           url: app.apiUrl+'/user/abuse/'+app.reportAbuseUserId,
           type: 'Post',
           contentType: "application/json; charset=utf-8",
           data: JSON.stringify({abuseMessage: abuseMessage}),
           error: function(response){
              // alert(JSON.stringify(response));
           },
           success: function(response, status, xhr){
               //alert(JSON.stringify(response));
               $('#abuseMessage').val('');
               app.alert('Tu mensaje ha sido enviado.');
               app.back();
           }
        });
    },


	getList: function(entity, multiple, val){
            if(typeof val == 'undefined'){
                val = '';
            }
        	var entityContainer = [];
        	entityContainer['children'] = '.childrenList';
        	entityContainer['maritalStatus'] = '.maritalStatusList';
        	entityContainer['bodyType'] = '.bodyTypeList';
        	entityContainer['eyesColor'] = '.eyesColorList';
        	entityContainer['hairColor'] = '.hairColorList';
        	entityContainer['hairLength'] = '.hairLengthList';
        	entityContainer['smoking'] = '.smokingList';
        	entityContainer['drinking'] = '.drinkingList';
        	entityContainer['economy'] = '.economyList';
        	entityContainer['relationshipType'] = '.relationshipTypeList';
        	entityContainer['children'] = '.childrenList';
        	entityContainer['origin'] = '.originList';
        	//entityContainer['country'] = '.countryList';

        	entityContainer['occupation'] = '.professionList';
        	entityContainer['education'] = '.educationList';
        	entityContainer['userWeight0'] = '.weightList';
        	//entityContainer['userCity'] = '.userCityList';
            if(entity != 'userWeight0'){
                $.ajax({
                    url: app.apiUrl + '/list/' + entity,
                    success: function(list, status, xhr){
                        /*if(entity == 'country'){
                            alert(JSON.stringify(list));
                        }*/
                        var html = '';
                        if(multiple){
                            html = '<fieldset data-role="controlgroup">';
                            for(var i in list.items){
                                var item = list.items[i];
                                var checked = '';
                                if(val != ''){
                                    for(var e in val){
                                        if(item.itemId == val[e]){
                                            checked = ' checked="checked"';
                                        }
                                    }
                                }
                                html = html + '<input name="' + entity + 'Id" type="checkbox" id="check-sex' + item.itemId  + '" value="' + item.itemId  + '"' + checked + '><label for="check-sex' + item.itemId  + '">' + item.itemName + '</label>';
                            }
                            html = html + '</fieldset>';
                        }
                       else{
                            if(entity == 'userCity'){
                                var nameSel = entity;
                                var valItem = 'name';
                                var labItem = 'name';
                            }else{
                                var nameSel = entity + 'Id';
                                var valItem = 0;
                                var labItem = 1;
                            }

                            if(entity == 'occupation'){
                                var nameSel = 'professionId';
                            }

                            html = '<select name="' + nameSel + '" id="' + nameSel + '">';
                            if(entity != 'country'){
                                html += '<option value=""></option>';
                            }
                            for(var i in list.items){
                                var item = list.items[i];
                                var selected = '';
                                /*if(entity == 'children'){
                                    alert(item[0] + ' = ' + val);
                                }*/
                                if(item[valItem] == val){
                                    selected = ' selected="selected"';
                                }
                                html = html + '<option value="' + item[valItem]  + '"' + selected + '>' + item[labItem] + '</option>';
                            }
                            html = html + '</select>';
                        }
                        app.container.find(entityContainer[entity]).html(html).trigger("create");
                        console.log(entity + 'Id');
                    },
                    error: function(err) {
                        //alert(JSON.stringify(err));
                    }
                });
        	}else{
        	    html = '<select name="' + entity + '" id="' + entity + '">';
                html += '<option value=""></option>';
                //alert(html);
                for (var i = 29; i < 201; i++) {
                    var selected = '';
                    if(i == val){
                        selected = ' selected="selected"';
                    }
                    html = html + '<option value="' + i  + '"' + selected + '>' + i + '</option>';
                }
                var selected = '';
                if(201 == val){
                    selected = ' selected="selected"';
                }
                html = html + '<option value="201"' + selected + '>200 ></option>';
                html = html + '</select>';
                //alert(html);
                app.container.find(entityContainer[entity]).html(html).trigger("create");
        	}
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
	
	getRegions: function(val){

	    if(typeof val == 'undefined'){
    	   val = '';
    	}
    	//alert(val);
			$.ajax({
				url: app.apiUrl + '/list/regions/ES',
				success: function(list, status, xhr){							
					var html = '<select name="regionCode" onchange="app.getCities(\'ES\',$(this).val());" data-iconpos="right">';
					//if(app.currentPageId == 'search_form_page'){
						html = html + '<option value=""></option>';
					//}				
					if(list.itemsNumber > 0){						
						app.formchange(true,'region');
						app.container.find(".regionsList").html('');
						for(var i in list.items){					
							var item = list.items[i];
					        var selected = '';
                            if(item.regionCode == val){
                                selected = ' selected="selected"';
                            }
							html = html + '<option value="' + item.regionCode + '"' + selected + '>' + item.regionName + '</option>';
						}
						html = html + '</select>';
						app.container.find(".regionsList").html(html).trigger('create');					
					}
					else{
						app.formchange(false,'region');
					}
				}
			});

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
	
	getCities: function(countryCode,regionCode,val){
	    if(typeof val == 'undefined'){
    	    val = '';
    	}
    	countryCode = 'ES';
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
							var selected = '';
                            if(item.cityName == val){
                                selected = ' selected="selected"';
                            }
							html = html + '<option value="' + item.cityName + '"' + selected + '>' + item.cityName + '</option>';
						}
						html = html + '</select>';
						app.container.find(".citiesList").html(html).trigger('create');								
					}
					else{
						app.formchange(false,'city');
					}
				}
			});

	},

	addToBlackList: function(){

        	$.ajax({
                url: app.apiUrl+'/user/blacklist/' + app.reportAbuseUserId,
                type: 'Post',
                contentType: "application/json; charset=utf-8",
                error: function(response){
           			//alert(JSON.stringify(response));
        		},
                success: function(response, status, xhr){

                	if(response.success){
                		app.alert('משתמש הוסף לרשימה שחורה');
                	}
                	else{
                		app.alert('משתמש כבר קיים ברשימה שחורה');
                	}
                }
            });
        },

	sendRegData: function(){
		if(app.formIsValid()){
			app.startLoading();
			var data = JSON.stringify(
				$('#regForm').serializeObject()
			);

			$.ajax({
				url: app.apiUrl + '/user',
				type: 'Post',
				contentType: "application/json; charset=utf-8",
				data: data,
				success: function(response){
					app.stopLoading();
				    	app.response = response;
					if(app.response.user.success == 1){
						var user = app.container.find("#userEmail").val();
						var pass = app.container.find("#userPass").val();						
						window.localStorage.setItem("user",user);
						window.localStorage.setItem("pass",pass);
						window.localStorage.setItem("userId", app.response.user.userId);
						$('#delete_images_page .regInfo').text(app.response.text);
						app.ajaxSetup(); 						
						app.getRegStep(app.response.text);
						if(app.response.user.gender == 1) {
						   window.localStorage.setItem("activationMessage", "Por favor revise su buzon de correo para activar su cuenta");
						}
					}
					else{
					    //alert(JSON.stringify(app.response.err));
					    app.alert($('<div>'+app.response.user.err+'</div>').text());
						/*navigator.notification.navigator.notification.alert(
							$('<div>'+app.response.err+'</div>').text(),
							//app.response.result,
							'Notification',
							'Notification'
						);*/
					}    
				},error: function(error){


                    if(typeof error.responseText != 'undefined'){
                        //alert(JSON.stringify(error));
                        var resp = JSON.parse('{' + error.responseText.replace("E",''));
                        if(typeof resp.err != 'undefined'){
                            //alert(JSON.stringify(resp));
                            app.alert($('<div>'+resp.err+'</div>').text());
                        }
					}
				}
			});
		}
		
	},	
		
	getRegStep: function(text = ''){

		//$('#test_test_page').show();
		app.showPage('delete_images_page');

		$('.continue').show();
		app.container.find('.regInfo').html(text);  // Also you may upload an image in your profile now.
		app.container.find('.imagesListWrap').html('');
		window.scrollTo(0,0);
	},
	
	formIsValid: function(status='register'){
		//alert(app.container.find('#userCityName').val());
		//return false;

        if ($('#userNick').val().length < 4 || $('#userNick').val().length > 25) {
            alert("Usuario incorrecta (debería ser de 4-25 puntos)");
            //$('#userNick').focus();
            return false;
         }

        if(status == 'register'){

             if ($('#userPass').val().length < 6) {
                alert("La clave es incorrecta (debería ser de 6 puntos)");
               // $('#userPass').focus();
                return false;
            }

            if ($('#userPass').val() != $('#userPass2').val()) {
                alert("La clave de nuevo es incorrecta");
               // $('#userPass2').focus();
                return false;
            }

            if($('.registerOnly [name="userGender"]:checked').length == 0) {
                alert("Sexo es incorrecta");
                return false;
            }
        }

		var email_pattern = new RegExp(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i);

		if (!(email_pattern.test($('#userEmail').val()))) {
			alert('Correo electrónico es incorrecto');
			//$('#userEmail').focus();
			return false;
		}

		if((app.container.find('#userCity').val().length == 0&&app.container.find('#userCity').val()==undefined)||(app.container.find('#userCity').val()!=undefined&&app.container.find('#userCity').val().length == 0)){
			alert('Ciudad incorrecta');
			return false;
		}

        if(status == 'register'){
            if($('#d').val().length == 0 || $('#m').val().length == 0 || $('#y').val().length == 0){
                alert('Fecha de nacimiento incorrecta');
                return false;
            }
		}

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
		app.reportAbuseUserId = userId;
		app.ajaxSetup();
		app.startLoading();	
		$.ajax({
			url: app.apiUrl + '/user/profile/'+userId,
			type: 'Get',
			success: function(user, status, xhr){

			    $('.my-gallery').html('');
				app.showPage('user_profile_page');
				window.scrollTo(0, 0);

				var detailsContainer = app.container.find('#user_details');
				app.container.find(".special3, .blue_star, .on5, .pic_wrap").hide();
				app.container.find("h1 span").text(user.nickName);

				if(user.mainImage.size.length >= 3){
                    $('.noPicture').hide();
                    var userPhotoTemplate = $('#userPhotoTemplate').html().replace(/\[ID\]/g,'pic1');
                    $(userPhotoTemplate).appendTo('.my-gallery');
                    app.container.find('#pic1').attr("src",user.mainImage.url).parent('a').attr({"href":user.mainImage.url, "data-size": user.mainImage.size});
                    app.container.find('.pic_wrap').eq(0).show();
                }
                else{
                    $('.noPicture img').attr("src",user.mainImage.url);
                    $('.noPicture').show();
                }

                if(typeof user.otherImages[0] !== "undefined"){
                    app.proccessUserPhotoHtml(user,1);

                }else{
                    app.container.find('.pic_wrap').addClass("center");
                }

                if(typeof user.otherImages[1] !== "undefined"){
                    app.proccessUserPhotoHtml(user,2);
                }

				initPhotoSwipeFromDOM('.my-gallery');

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
				if(user.userId != window.localStorage.getItem('userId')){
                    var profileButtonsTemplate = $('#userProfileButtonsTemplate').html();
                    var profileButtonsTemplate_2 = $('#userProfileButtonsTemplate_2').html();
                    profileButtonsTemplate = profileButtonsTemplate.replace(/\[USER_ID\]/g, user.userId);
                    profileButtonsTemplate = profileButtonsTemplate.replace(/\[USERNICK\]/g,user.nickName);
                    profileButtonsTemplate_2 = profileButtonsTemplate_2.replace(/\[USER_ID\]/g, user.userId);
                }
                else{
                    var profileButtonsTemplate = '';
                    var profileButtonsTemplate_2 = '';
                }
				var html = profileButtonsTemplate;
				if(!((user.eyesColor== undefined || user.eyesColor=='') && (user.bodyType== undefined || user.bodyType=='') && (user.hairColor== undefined || user.hairColor=='') && (user.hairLength== undefined || user.hairLength=='') && (user.breast== undefined || user.breast=='')))
					html = html + app.getProfileGroup("Apariencia");
				if(user.userHeight0!== undefined && user.userHeight0!=='')html = html + app.getProfileLine("Estatura", user.userHeight0);
				if(user.userWeight0!== undefined && user.userWeight0!== null)html = html + app.getProfileLine("Peso", user.userWeight0);
				if(user.eyesColor!== undefined && user.eyesColor!=='')html = html + app.getProfileLine("Color de los Ojos", user.eyesColor);
				if(user.bodyType!== undefined && user.bodyType!=='')html = html + app.getProfileLine("Complexión Física", user.bodyType);
				if(user.hairColor!== undefined && user.hairColor!=='')html = html + app.getProfileLine("Color del Cabello", user.hairColor);
				if(user.hairLength!== undefined && user.hairLength!=='')html = html + app.getProfileLine("Tipo de Peinado", user.hairLength);
				//if(user.hairStyle!== undefined && user.hairStyle!=='')html = html + app.getProfileLine("Tipo de Peinado", user.hairStyle);
				if(user.breast!== undefined && user.breast!=='')html = html + app.getProfileLine("Peso", user.breast);

				html = html + app.getProfileGroup("Información Personal");
				if(user.region!== undefined && user.region!=='')html = html + app.getProfileLine("Area", user.region);
				if(user.userCity!== undefined && user.userCity!==''  && user.userCity!== null)html = html + app.getProfileLine("Ciudad", user.userCity);
				if(user.zodiac!== undefined && user.zodiac!=='')html = html + app.getProfileLine("Singo", user.zodiac);
				if(user.age!== undefined && user.age!=='')html = html + app.getProfileLine("Edad", user.age);
				if(user.maritalStatusId!== undefined && user.maritalStatusId!=='' && user.maritalStatusId!==null)html = html + app.getProfileLine("Estado Civil", user.maritalStatusId);
				if(user.childrenId!== undefined && user.childrenId!=='' && user.childrenId!==null)html = html + app.getProfileLine("Hijos", user.childrenId);
				if(user.smoking!== undefined && user.smoking!=='')html = html + app.getProfileLine("Hábitos de Fumar", user.smoking);
				if(user.education!== undefined && user.education!=='')html = html + app.getProfileLine("Educación", user.education);
				if(user.occupation!== undefined && user.occupation!=='')html = html + app.getProfileLine("Línea de Negocios", user.occupation);
				if(user.economy!== undefined && user.economy!=='')html = html + app.getProfileLine("Situación Económica", user.economy);
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

                if(user.relationshipTypeIds!== undefined && user.relationshipTypeIds!== '') {
                    html = html + app.getProfileGroup("Objectivo");
                    html = html + app.getProfileLine("", user.relationshipTypeIds);
                }

				html = html + profileButtonsTemplate + profileButtonsTemplate_2;

				detailsContainer.html(html).trigger('create');

				var hideFavButton = 0;
                if(user.is_in_favorite_list){
                    hideFavButton = 1;
                }
                var hideBlackButton = 0;
                if(user.is_in_black_list){
                    hideBlackButton = 1;
                }
                detailsContainer.find('.favi'  + hideFavButton).hide();
                detailsContainer.find('.black'  + hideBlackButton).hide();
				app.stopLoading();				
			},
            error: function(err){
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

				app.showPage('messenger_page');
				app.container = app.currentPageWrapper.find('.chats_wrap');
				app.container.html('');				
				app.template = $('#messengerTemplate').html();
				for(var i in app.response.allChats){
					var currentTemplate = app.template;
					var chat = app.response.allChats[i];
					currentTemplate = currentTemplate.replace("[IMAGE]",chat.user.mainImage.url);
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


    getChatWith: function(){
        var chatWith = $('.swiper-slide-active .cont').attr("id");
        var userNick = $('.swiper-slide-active .cont .nickname').text();
        console.log($('.swiper-container').html());
        app.getChat(chatWith, userNick);
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

				    if(response.chat.isBlocked == 1) {
				        app.alert('Has sido incluído en la lista de socios bloqueados de este usuario por lo que no puedes contactarlo.');
				    }
					app.response = response;
					var html = app.buildChat();
					app.container.html(html);
					app.subscribtionButtonHandler();
					app.refreshChat();
					app.sendPush();
				},
				 error: function(response){
                   //alert(JSON.stringify(response));
                }
			});
		
		}
	},

    sendPush: function(){
        $.ajax({
            url: app.apiUrl + '/user/chat/push/'+app.chatWith,
            type: 'Post',
            contentType: "application/json; charset=utf-8",
            success: function(response){
            },
            error: function(response){
              //  alert(JSON.stringify(response));
            }
        });
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
	
	getSubscription: function(productId){

		var userId = window.localStorage.getItem("userId");
        var form = $('#pp');

        form.find('input[name="item_number"]').val(userId+'mb1');
           /* switch(productId){
                case '1':
                    form.find('input[name="a3"]').val('49');
                    form.find('input[name="t3"]').val('M');
                    form.find('input[name="custom"]').val('1');
                    form.find('input[name="p3"]').val('1');
                    break;
                case '2':
                    form.find('input[name="a3"]').val('120');
                    form.find('input[name="custom"]').val('3');
                    form.find('input[name="p3"]').val('3');
                    form.find('input[name="t3"]').val('M');
                    break;
                case '3':
                    form.find('input[name="a3"]').val('210');
                    form.find('input[name="custom"]').val('6');
                    form.find('input[name="p3"]').val('6');
                    form.find('input[name="t3"]').val('M');
                    break;
                case '4':
                    form.find('input[name="a3"]').val('360');
                    form.find('input[name="custom"]').val('12');
                    form.find('input[name="p3"]').val('1');
                    form.find('input[name="t3"]').val('Y');
                    break;
            }*/


            switch(productId){
                    case '1':
                        form.find('input[name="amount"],input[name="a3"]').val('49');
                        form.find('input[name="t3"]').val('M');
                        //form.find('input[name="custom"]').val('1');
                        form.find('input[name="p3"]').val('1');
                        break;
                    case '2':
                        form.find('input[name="amount"],input[name="a3"]').val('120');
                        //form.find('input[name="a3"]').val('120');
                        //form.find('input[name="custom"]').val('3');
                        form.find('input[name="p3"]').val('3');
                        form.find('input[name="t3"]').val('M');
                        break;
                    case '3':
                        form.find('input[name="amount"],input[name="a3"]').val('210');
                        //form.find('input[name="custom"]').val('6');
                        form.find('input[name="p3"]').val('6');
                        form.find('input[name="t3"]').val('M');
                        break;
                    case '4':
                        form.find('input[name="amount"],input[name="a3"]').val('360');
                        //form.find('input[name="custom"]').val('12');
                        form.find('input[name="p3"]').val('1');
                        form.find('input[name="t3"]').val('Y');
                        break;
            }




            form.submit();


		//var ref = window.open('http://m.ricosybellas.com/subscription/?userId='+userId+'&app=1', '_blank', 'location=yes');
	    //ref.addEventListener('exit',function(){ app.showPage('main_page'); });
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


saveProf: function (el,tag){
    	var name = '';
    	var val = '';
    	var input = $(el).parents('.save').find(tag);

    		name = input.attr('name');
    		val = input.val();

            //alert(JSON.stringify({name:name,val:val}));
    		if(val.length < 5){
    			alert('La contraseña es demasiado corta');
    			return false;
    		}

    		if($('#editedUserPass2').val() !== val){
    			alert('Varios datos no son válidos: contraseña o contraseña de nuevo');
    			return false;
    		}

    	app.startLoading();

    	$.ajax({
    	    url: app.apiUrl + '/user/data',
    		//dataType: 'json',
    		type: 'post',
    		data: JSON.stringify({name:name,val:val}),
    		contentType: "application/json; charset=utf-8",
    		success : function(res){


    		    //checkNewMessagesRequest.abort();
    		    //clearTimeout(newMessages);
    		    //console.log("Abort checkNewMessagesRequest");


    		    //var user = app.container.find("#userNick").val();

    		    //alert("USERNAME: " + user);
    		    //alert("PASSWORD: " + pass);
    		    //user = unescape(encodeURIComponent(user));
    		    //window.localStorage.setItem("user",user);
    		    if(name == 'userPass'){

    		        var pass = val;//app.container.find("#editedUserPass").val();
    		        app.container.find('#editedUserPass').val(pass);
    		        //pass = unescape(encodeURIComponent(pass));
    		        window.localStorage.setItem("pass",pass);
    		    }

    		    app.ajaxSetup();
    		    app.checkNewMessages();

    		    app.stopLoading();
    		    //alert(JSON.stringify(res)); return false;

    		    if(res.err == '1'){
    		        //check(input.attr('id'),val);
    		        app.alert(res.text);
    		        $(el).parent().find('.input').css({'background':'red'});
    		    }else if(res.res == '1'){
    		        //alert(val);
    		        app.alert('Actualización guardados');

    		        //if(name=='userPass')
    		           // $(el).parent().next().find('input').val(val);

    		        $('.save').hide();
    		        $('.edit').show().find('.ui-btn').show();
    		    }
    		},
    		error: function(err){
    		    //alert(JSON.stringify(err));
    		    app.stopLoading();
    		    //app.alert(JSON.stringify(err));
    		    $('.save').hide();
    		    $('.edit').show().find('.ui-btn').show();
    		}
    	});
    },



    alert: function(message, url){
        navigator.notification.alert(
             message,
             function(){
                if(typeof url != 'undefined' && url != false){
                    if(url == 'market://details?id=com.interdate.richdate'){
                       window.location.href = url;
                    }
                    ref = cordova.InAppBrowser.open(url, '_blank', 'location=yes');
                    return false;
                }
             },
             'Notification',
             'Ok'
        );
    },

    closeUserGallery: function(){
        	$('.pswp__button--close').click();
        },

	proccessUserPhotoHtml: function(user,index){

               // alert( JSON.stringify(user));

    	var userPhotoTemplate = $('#userPhotoTemplate').html().replace(/\[ID\]/g,'pic' + index + 1);
    	$(userPhotoTemplate).appendTo('.my-gallery');

               //alert( $('.my-gallery').html() );

    	var imageSize = (user.otherImages[index-1].size.length >= 3) ? user.otherImages[index-1].size : '1x1' ;

    	console.log("SIZE of " + user.otherImages[index-1].url + ":" + imageSize);


    	app.container
    		.find('.pic_wrap')
    		//.css({"float": "left"})
    		.eq(index)
    		.show()
    		.find('img')
    		.show()
    		.attr("src",user.otherImages[index-1].url)
    		.parent('a')
    		.attr({"href": user.otherImages[index-1].url, "data-size": imageSize});
    },

    editProf: function (el){
        	var name = $(el).attr('name');

        	if(name == 'edit'){
        		$('.save').hide();
        		$('.edit').show().find('.ui-btn').show();
        		//alert($('.sf_sel_wrap .edit').size());
        		//alert($(el).parents('.sf_sel_wrap'));
        		$(el).parents('.sf_sel_wrap').find('.edit').hide().parents('.sf_sel_wrap').find('.save').show().find('.ui-btn').show();
        	}else{
        	    //alert($(el).parents('.sf_sel_wrap').find('.edit').html());
        	    $(el).parents('.sf_sel_wrap').find('.edit').show().find('.ui-btn').show();
        		$(el).parents('.sf_sel_wrap').find('.save').hide();
        	}
        },


    getHeight: function(val){

        if(typeof val == 'undefined'){
            val = '';
        }
        var html = '';
        html = html + '<select name="userHeight" id="userHeight"><option value=""></option>';
        for (var i = 100; i <= 250; i++) {
            var selected = '';
            if(i == val){
                selected = ' selected="selected"';
            }
            html = html + '<option value="' + i + '"' + selected + '>' + i + '</option>';
        }
        var selected = '';
        if(251 == val){
            selected = ' selected="selected"';
        }
        html = html + '<option value="251"' + selected + '>250 ></option>';
        html = html + '</select>';

        app.container.find('.heightList').html(html).trigger("create");
    },

	getEditProfile: function(){
        	$.ajax({
        	    url: app.apiUrl + '/user/data',
        		success: function(response){
                    user = response.user;
                    app.showPage('register_page');
                    app.container.find("#regForm")[0].reset();
                    app.container.find('h1').html('Editar Perfil');
                    app.container.find('.errorTxt').html('').hide();
                    app.container.find('.registerOnly').hide();
                    app.container.find('.editOnly').show();
                    app.container.find('.save').hide();
                    app.container.find('.edit').show();
                    app.container.find('.ui-btn').show();

                    //$('#birthDate').html(app.getBithDate()).trigger('create');

                    app.getHeight(user.userHeight0);
                    //alert(user.childrenId);
                    app.getList('bodyType', false, user.bodyTypeId0);
                    app.getList('eyesColor', false, user.eyesColorId0);
                    app.getList('hairColor', false, user.hairColorId0);
                    app.getList('hairLength', false, user.hairStyleId0);
                    app.getList('relationshipType', true, user.relationshipTypeIds);
                    app.getList('economy', false, user.economicId);
                    app.getList('maritalStatus', false, user.maritalStatusId);
                    app.getList('children', false, user.childrenId);
                    app.getList('origin', false, user.originId);
                    app.getList('smoking', false, user.smokingId0);
                    app.getList('drinking', false, user.drinkingId0);
                    //app.getList('country', false, user.countryId);
                    app.getRegions(user.regionCode);
                    //alert(user.regionCode);
                    //app.getList('userCity', false, user.userCity);
                    app.getList('userWeight0', false, user.userWeight0);
                    //app.getList('profession', false, user.professionId);
                    app.getList('occupation', false, user.professionId);
                    app.getList('education', false, user.educationId);

                    app.getCities(user.countryCode,user.regionCode,user.userCity);

                    //alert(JSON.stringify(app.getCities(user.countryCode,user.regionCode,user.userCityName)));

                    for(var prop in user){
                        if(prop == 'Y' || prop == 'n' || prop == 'j'){
                            /*
                            var selId = '';
                            if(prop == 'Y'){
                                selId = 'y';
                            }
                            if(prop == 'n'){
                                selId = 'm';
                            }
                            if(prop == 'j'){
                                selId = 'd';
                            }
                            app.container.find('#' + selId).val(user[prop]).find("option[value='" + user[prop] + "']").attr('selected', 'selected');
                            app.container.find('#' + selId).selectmenu('refresh');
                            */
                        }else{
                            if(app.container.find('#' + prop).prop("tagName") == 'TEXTAREA'){
                                if(user[prop] != null){
                                    //alert(user[prop]);
                                    app.container.find('#' + prop).text(user[prop]);
                                }
                            }else{
                                if(prop == 'countryRegionId'){
                                    //alert(app.container.find('.regionsList').html());
                                }
                                app.container.find('#' + prop).val(user[prop]);
                                if(app.container.find('#' + prop).prop("tagName") == 'SELECT'){
                                    //app.container.find('#' + prop).find("option[value='" + user[prop] + "']").attr('selected', 'selected');
                                    //app.container.find('#' + prop).selectmenu('refresh');
                                }
                            }
                        }
                    }
                    app.container.find('#userNick').val(user.userNick);
                    if(app.logged == 'notCompleteData'){
                        $('#logout').show();
                        $('#back,#likesNotifications').hide();
                        app.alert('Por favor, complete los datos de su tarjeta');
                        setTimeout(function(){
                            app.formIsValid(false);
                        }, 500);
                    }
        		    /*
        		    app.showPage('edit_profile_page');
        		    app.container = app.currentPageWrapper.find('.edit_wrap');
        		    app.container.html('');
        		    app.template = $('#userEditProfileTemplate').html();
        		    app.template = app.template.replace(/\[userNick\]/g,user.userNick);
        		    app.template = app.template.replace(/\[userPass\]/g,user.userPass);
        		    app.template = app.template.replace(/\[userEmail\]/g,user.userEmail);
        		    app.template = app.template.replace(/\[userRegion\]/g,user.userRegion);
        		    app.template = app.template.replace(/\[userCity\]/g,user.userCity);

        		    if(user.userAboutMe == null)
        				user.userAboutMe='';

        		    if(user.userLookingFor == null)
        				user.userLookingFor='';

        		    app.template = app.template.replace(/\[userAboutMe\]/g,user.userAboutMe);
        		    app.template = app.template.replace(/\[userLookingFor\]/g,user.userLookingFor);
        		    //app.template = app.template.replace(/\[userfName\]/g,user.userfName);
        		    //app.template = app.template.replace(/\[userlName\]/g,user.userlName);
        		    app.template = app.template.replace(/\[Y\]/g,user.Y);
        		    app.template = app.template.replace(/\[n\]/g,user.n);
        		    app.template = app.template.replace(/\[j\]/g,user.j);


        		    app.container.html(app.template).trigger('create');
        		    app.getRegions();
        		    $('#userBirth').html(app.getBithDate()).trigger('create');

                    */

        		    //app.container.find('.userGender').html(app.getuserGender()).trigger('create');
        		},
        		error: function(err){
                   // alert(JSON.stringify(err));
                }
        	});
        },


	getUserImages: function(){
		$('.imagesButtonsWrap').hide();
		$.ajax({
			url: app.requestUrl,
			type: app.requestMethod,			
			success: function(response){
				app.response = response;
				app.showPage('delete_images_page');
				app.container.find('.regInfo').html(response.text);  // Also you may upload an image in your profile now.
				app.container = app.currentPageWrapper.find('.imagesListWrap');
				app.container.html('');
				app.template = $('#editImageTemplate').html();

				if(app.response.images.itemsNumber < 4)
					$('.imagesButtonsWrap').show();

				for(var i in app.response.images.items){					
					var currentTemplate = app.template;
					var image = app.response.images.items[i].url;
					currentTemplate = currentTemplate.replace("[IMAGE]", image);
					currentTemplate = currentTemplate.replace("[IMAGE_ID]", app.response.images.items[i].id);
					app.container.append(currentTemplate);
					var currentImageNode = app.container.find('.userImageWrap:last-child');
															
					if(app.response.images.items[i].isValid == 1)
						currentImageNode.find('.imageStatus').html("Aprobada").css({"color":"green"});
					else						
						currentImageNode.find('.imageStatus').html("Todavía no se ha aprobado").css({"color":"red"});					
					
				}
				
				app.container.trigger('create');
			},

			error: function(err){
               // alert(JSON.stringify(err));
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
        	encodeURI(app.apiUrl + "/user/image"),
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
		    if(app.logged == 'noimg'){
		        app.logged = true;
		    }
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
		alert(error);
	},

    saveUserData: function(){

        if(app.formIsValid('edit')){
            app.startLoading();
            var data = JSON.stringify(
                $('#regForm').serializeObject()
            );


            $.ajax({
                url: app.apiUrl + '/user/data/edit',
                type: 'Post',
                data: data,
                success: function(response){
                    app.response = response;

                    if(app.logged == 'notCompleteData'){
                        app.logged = true;
                        $('#logout').hide();
                        $('#back,#likesNotifications').show();
                    }
                    for(var prop in response.user){
                        if(prop == 'userBirthday_y' || prop == 'userBirthday_m' || prop == 'userBirthday_d'){
                            /*
                            var selId = '';
                            if(prop == 'userBirthday_y'){
                                selId = 'y';
                            }
                            if(prop == 'userBirthday_m'){
                                selId = 'm';
                            }
                            if(prop == 'userBirthday_d'){
                                selId = 'd';
                            }
                            app.container.find('#' + selId).val(response.user[prop]).find("option[value='" + response.user[prop] + "']").attr('selected', 'selected');
                            app.container.find('#' + selId).selectmenu('refresh');
                            */
                        }else{
                            if(prop != 'confirm' && prop != 'userPass' && prop != 'userPass2' && prop != 'userGender' && prop != 'userPhone' && prop != 'relationshipTypeId'){
                                if(app.container.find('#' + prop).prop("tagName") == 'TEXTAREA'){
                                    app.container.find('#' + prop).text(response.user[prop]);
                                }else{
                                    app.container.find('#' + prop).val(response.user[prop]);
                                    if(app.container.find('#' + prop).prop("tagName") == 'SELECT'){
                                        app.container.find('#' + prop).find("option[value='" + response.user[prop] + "']").attr('selected', 'selected');
                                        app.container.find('#' + prop).selectmenu('refresh');
                                    }
                                }
                            }
                        }
                    }
                    app.stopLoading();
                    if(app.response.save == 1){
                        var userInput = app.container.find("#userNick").val();
                        //var pass = app.container.find("#userPass").val();
                        user = unescape(encodeURIComponent(userInput));
                        //pass = unescape(encodeURIComponent(pass));
                        window.localStorage.setItem("user",user);
                        //window.localStorage.setItem("pass",pass);
                        app.ajaxSetup();
                        app.response = response;
                        app.getList('relationshipType', true, response.user.relationshipTypeId);
                        //app.getRegStep(data);
                        app.alert('Actualización guardados');
                    }
                    else{
                        app.formIsValid(false);
                        var focus = false;
                        for (var key2 in response.err) {
                            //app.container.find('.errorTxt.' + key2).html(response.err[key2]).show();
                            if(!focus){
                                focus = true;
                                app.container.find('#' + key2).focus();
                            }
                        }
                        app.alert(response.err);
                        //alert( response.user.userEmail);
                        //app.alert(response.err);
                    }


                },
                error: function(err){
                    app.stopLoading();
                    //app.alert(JSON.stringify(err));

                }
            });

        }else{
            //app.alert('Por favor, rellene todos los campos');
        }
    },
	
	register: function(){
	    app.showPage('register_page');
    	app.container.find('h1').html('Registro');
    	app.container.find("#regForm")[0].reset();
        app.container.find('.registerOnly').show();
        app.container.find('.editOnly').hide();
        app.container.find('.ui-btn').show();
        app.container.find('.errorTxt').html('').hide();

		app.getHeight();
		app.getList('relationshipType', true);
		app.getList('userWeight0', false);
		app.getList('bodyType', false);
        app.getList('eyesColor', false);
        app.getList('hairColor', false);
        app.getList('hairLength', false);
        app.getList('relationshipType', true);
        app.getList('economy', false);
        app.getList('maritalStatus', false);
        app.getList('children', false);
        app.getList('origin', false);
        app.getList('smoking', false);
        app.getList('drinking', false);
        //app.getList('country', false, user.countryId);
        //app.getRegions('ES');
       // app.getList('userCity', false, user.userCity);
        app.getList('occupation', false);
        app.getList('education', false);
		$('#birthDate').html(app.getBithDate()).trigger('create');
		//app.getCountries();
		app.getRegions();
		app.getCities();
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
