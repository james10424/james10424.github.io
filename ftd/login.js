var user;
var pw;
var f;//first
var s;//second
var t;//thrid

function login() {
	let error="Login Errors: \n";
	let er = 1;
	// should checkout validatio here before send it to back end
	if($("#login_name").val() == ""){
		error += "- Invalid username\n";
		$("#login_name").css({"border-color": "#b30000"});
		er = 0;
	} 
	if($("#login_pw").val() == ""){
		error+= "- Invalid password\n";
		$("#login_pw").css({"border-color": "#b30000"});
		er = 0;
	}
	if(er === 0){
		alert(error);
		return;
	}
	// if login info correct
	$.ajax({
		type: "POST",
		url: "/api/ftd/v1/CheckUser",
		data: { uid: $("#login_name").val(),
		userSecret: $("#login_pw").val()
		},
		dataType: "json",
		success: function(data, text_status, jqXHR){
			if(jqXHR.status==200){
				console.log("status code: " + jqXHR.status); 
				user = data.uid;
				pw = data.userSecret;
				f = data.first;
				s = data.second;
				t  = data.third;
				$("#login_pw").val("");
				toMainPage();
			}else{
				$("#login_name").css({"border-color": "#b30000"});
				$("#login_pw").css({"border-color": "#b30000"});
				alert(data.error);
			}
		},
		error: function(data, ajaxOptions, thrownError){
			console.log(data);
			console.log(ajaxOptions);
			console.log(thrownError);
			alert("Something went wrong with the server..\nPlease try again"); 
		}
	});
}

function register(){
	let error="Registration Errors: \n";
	let er = 1;
	// should checkout validatio here before send it to back end
	if($("#reg_name").val() === ""){
		error += "- Invalid username\n";
		$("#reg_name").css({"border-color": "#b30000"});
		er = 0;
	} 
	if($("#reg_pw").val() === ""){
		error+= "- Invalid password\n";
		$("#reg_pw").css({"border-color": "#b30000"});
		$("#reg_pw_con").css({"border-color": "#b30000"});
		er = 0;
	}
	//  front end check
	if($("#reg_pw").val() != $("#reg_pw_con").val()){
		$("#reg_pw").css({"border-color": "#b30000"});
		$("#reg_pw_con").css({"border-color": "#b30000"});
		error += "- Password doesn't match\n";
		er = 0;
	}
	if(er === 0){
		alert(error);
		return;
	}
	$.ajax({
		type: "PUT",
		url: "/api/ftd/v1/AddUser",
		dataType: "json",
		data:{ uid: $("#reg_name").val(),
			userSecret: $("#reg_pw").val()
		},
		success: function(data, text_status, jqXHR){
			if(jqXHR.status==200){
				console.log("status code: " + jqXHR.status); 
				alert("Success! Please log in again");
				$("#login_name").val($("#reg_name").val());
				back();
			}else{
				$("#reg_name").css({"border-color": "#b30000"});
				$("#reg_pw").css({"border-color": "#b30000"});
				alert(data.error);
			}
		},
		error: function(data, ajaxOptions, thrownError){
			console.log(data);
			console.log(ajaxOptions);
			console.log(thrownError);
			alert("Something went wrong with the server..\nPlease try again"); 
		}
	});
}
// check authorization everytime when user send any requests to db
function checkAuth(){
	$.ajax({
		type: "POST",
		url: "/api/ftd/v1/CheckAuth",
		data: { uid: user,
		userSecret: pw
		},
		dataType: "json",
		success: function(data, text_status, jqXHR){
			if(jqXHR.status==200){
				console.log(JSON.stringify(data));
			}else{
				alert(data.error);
				logout();
			}
		},
		error: function(data, ajaxOptions, thrownError){
			console.log(data);
			console.log(ajaxOptions);
			console.log(thrownError);
			alert("Something went wrong :( \nPlease try again"); 
			logout();
		}
	});
}
function updateGameStats(){
	// check auth first
	checkAuth();
	// need to calulate scores here
	var score = showScore();
	if(score <= t){
		;//do nothing
	}else if(score > t && score <= s){
		t = score;
	}else if(score > s && score <= f){
		t = s;
		s = score;
	}else if (score > f){
		t = s;
		s = f;
		f = score;
	}
	//snd req
	$.ajax({
		type: "POST",
		url: "/api/ftd/v1/UpdateStats/",
		data:{uid: user,
			first: f,
			second: s,
			third: t
		},
		dataType: "json",
		success: function(data, text_status, jqXHR){
			if(jqXHR.status==200){
				console.log(JSON.stringify(data));
				console.log("status code: " + jqXHR.status); 
				//alert("game stats update success");
			}else{
				alert(data.error);
			}
		},
		error: function(data, ajaxOptions, thrownError){
			console.log(data);
			console.log(ajaxOptions);
			console.log(thrownError);
			alert("Something went wrong\nPlease login again"); 
			logout();
			return;
		}
	});
}
function back(){
	$("#loginPage").show();
	$("#reg").hide();
	$("#game").hide();
}
// shwo the register view
function show_register(){
	$("#loginPage").hide();
	$("#reg").show();
	$('#mainPage').hide();
	$('#how2play').hide();
	$('#scorePage').hide();
	$('#deadPage').hide();
	$("#game").hide();
	$("#weapon_info").hide();
}
// set up and start the game. invoked by game_btn/2
function gameOn(){
	checkAuth();
	$("#loginPage").hide();
	$("#reg").hide();
	$('#mainPage').hide();
	$('#how2play').hide();
	$('#scorePage').hide();
	$('#deadPage').hide();
	setupGame();
	$("#game").show();
	$("#weapon_info").show();
	startGame();
}
function howPlay(){
	$("#loginPage").hide();
	$("#reg").hide();
	$('#mainPage').hide();
	$('#how2play').show();
	$('#scorePage').hide();
	$('#deadPage').hide();
	$("#game").hide();
	$("#weapon_info").hide();
}
function toScorePage(){
	checkAuth();
	$("#loginPage").hide();
	$("#reg").hide();
	$('#mainPage').hide();
	$('#how2play').hide();
	$('#scorePage').show();
	$('#deadPage').hide();
	$("#game").hide();
	$("#weapon_info").hide();
	checkAuth();
	var gameNum = 0;
	var g0 = "---"; 
	var g1 = "---";
	var g2 = "---";
	var g3 = "---";
	var g4 = "---";
	var g0s = 0;
	var g1s = 0;
	var g2s = 0;
	var g3s = 0;
	var g4s = 0;
	//SELECT uid, first FROM Score ORDER BY first DESC LIMIT 5;
	$.ajax({
		type: "GET",
		url: "/api/ftd/v1/GameStats/"+user+"/",
		async:false,
		data:{},
		dataType: "json",
		success: function(data, text_status, jqXHR){
			if(jqXHR.status==200){
				console.log("status code: " + jqXHR.status);
				gameNum = data.gamesPlayed;
				//alert("game stats update success");
			}else{
				alert(data.error);
			}
		},
		error: function(data, ajaxOptions, thrownError){
			console.log(data);
			console.log(ajaxOptions);
			console.log(thrownError);
			alert("Something went wrong\nPlease login again"); 
			logout();
			return;
		}
	}).then(function(){
		$.ajax({
			type: "GET",
			url: "/api/ftd/v1/TopFive/",
			async:false,
			data:{},
			dataType: "json",
			success: function(data, text_status, jqXHR){
				if(jqXHR.status==200){
					console.log(JSON.stringify(data));
					console.log("top 5 status code: " + jqXHR.status);
					var i = 0;
					console.log("length :"+ data.scores.length);
					for(i = 0; i < data.scores.length; i++){
						if(i== 0){
							g0 = data.scores[i]["uid"];
							g0s = data.scores[i]["first"];
						}
						if(i== 1){
							g1 = data.scores[i]["uid"];
							g1s = data.scores[i]["first"];
						}
						if(i== 2){
							g2 = data.scores[i]["uid"];
							g2s = data.scores[i]["first"];
						}
						if(i== 3){
							g3 = data.scores[i]["uid"];
							g3s = data.scores[i]["first"];
						}
						if(i== 4){
							g4 = data.scores[i]["uid"];
							g4s = data.scores[i]["first"];
						}
					}
					//alert("game stats update success");
				}else{
					alert(data.error);
				}
			},
			error: function(data, ajaxOptions, thrownError){
				console.log(data);
				console.log(ajaxOptions);
				console.log(thrownError);
				alert("Something went wrong line 307\nPlease login again"); 
				logout();
				return;
			}
		});
	}).then(function(){
		// user info
		// document.getElementById("first").innerHTML = " "+f;
		scoreAnimation(document.getElementById("first"), " ", f);
		document.getElementById("second").innerHTML = " "+s;
		document.getElementById("third").innerHTML = " "+t;
		document.getElementById("gameNum").innerHTML = "  " +gameNum;
		//global player info
		document.getElementById("g0").innerHTML = g0;
		document.getElementById("g1").innerHTML = g1;
		document.getElementById("g2").innerHTML = g2;
		document.getElementById("g3").innerHTML = g3;
		document.getElementById("g4").innerHTML = g4;
		document.getElementById("g0s").innerHTML = g0s;
		document.getElementById("g1s").innerHTML = g1s;
		document.getElementById("g2s").innerHTML = g2s;
		document.getElementById("g3s").innerHTML = g3s;
		document.getElementById("g4s").innerHTML = g4s;
	});
}
function deleteAcc(){
	// check auth first
	checkAuth();
	// get confirm
	var confirm = prompt("type in \"yes\" if you really want to delete your account");
	if(confirm === "yes" || confirm === "YES" || confirm === "Yes"){
		$.ajax({
			type: "DELETE",
			url: "/api/ftd/v1/user/"+user+"/",
			async:false,
			data:{},
			dataType: "json",
			success: function(data, text_status, jqXHR){
				if(jqXHR.status==200){
					console.log(JSON.stringify(data));
					alert("Account Deleted, Please register a new one");
					logout();
					return;
				}else{
					alert("something went wrong when deleting");
					logout();
					return;
				}
			},
			error: function(data, ajaxOptions, thrownError){
				console.log(data);
				console.log(ajaxOptions);
				console.log(thrownError);
				alert("Something went wrong\nPlease login again"); 
				logout();
				return;
			}
		});
	}else{
		alert("You did not confirm");
		return;
	}
}

function scoreAnimation(e, str, score) {
	var k = 0;
	var speed = 2000 / score;
	var interval = setInterval(function() {
		if (k > score) {
			clearInterval(interval);
		}
		else {
			e.innerHTML = str + k + " ";
			k++;
		}
	}, speed);
}
var tips = [
"USE PORTAL TO TRICK YOUR ENEMIES!",
"BUILD A WALL IN FRONT OF YOU TO BLOCK PROJECTILES!",
"USE DASH TO GET AROUND QUICKER!",
"WATCH OUT! YOU TAKE DAMAGE WHEN ENEMY BUMPS INTO YOU!",
"PICK UP LASER GUN TO SMASH YOUR ENEMIES!",
"SOME WEAPONS WOULD LOCK ON ENEMIES TRACK THEM DOWN",
"NID NID IS THE CUTEST :p"];
var tipIndex = 0;
function toMainPage(){
	checkAuth();
	$("#loginPage").hide();
	$("#reg").hide();
	$('#mainPage').show();
	$('#how2play').hide();
	$('#scorePage').hide();
	$('#deadPage').hide();
	$("#game").hide();
	$("#weapon_info").hide();
	document.getElementById("welcome").innerHTML = "Alo  ~  " + user ;
}
function logout(){
	// db
	$("#loginPage").show();
	$("#reg").hide();
	$('#mainPage').hide();
	$('#how2play').hide();
	$('#scorePage').hide();
	$('#deadPage').hide();
	$("#game").hide();
	$("#weapon_info").hide();
}
// show the socre when play lost. update the score & game played here.
function toGameStats(){
	checkAuth();
	$("#loginPage").hide();
	$("#reg").hide();
	$('#mainPage').hide();
	$('#how2play').hide();
	$('#scorePage').hide();
	$('#deadPage').show();
	$("#game").hide();
	$("#weapon_info").hide();
	updateGameStats();
	scoreAnimation(document.getElementById("score"), "SCORE : ", score);
}

function logout(){
	user = "";
	pw = "";
	first = 0;
	second = 0;
	thrid  = 0;
	$("#loginPage").show();
	$("#reg").hide();
	$('#mainPage').hide();
	$('#how2play').hide();
	$('#scorePage').hide();
	$('#deadPage').hide();
	$("#game").hide();
	$("#weapon_info").hide();
}

function restart(){
	checkAuth();
	pauseGame();
	setupGame();
	startGame();
}

// This is executed when the document is ready (the DOM for this document is loaded)
function setup() {
	$("#start_btn").on('click',function(){ login(); });
	$("#reg_btn").on('click',function(){ show_register(); });
	$("#done_reg_btn").on('click',function(){ register(); });
	$("#back_btn").on('click',function(){ back(); });
	$("#restart_btn").on('click',function(){ restart(); });
	$("#game_btn").on('click',function(){ gameOn(); });
	$("#game_btn2").on('click',function(){ gameOn(); });
	$('#how2play_btn').on('click', howPlay);
	$("#checkScore_btn").on('click',function(){ toScorePage(); });
	$("#backMain_btn").on('click',function(){ toMainPage(); });
	$("#backMain_btn2").on('click',function(){ toMainPage(); });
	$("#backMain_btn3").on('click',function(){ toMainPage(); });
	$("#logout_btn").on('click',function(){ logout(); }); 
	$("#del_btn").on('click',function(){ deleteAcc(); }); 
	$("#login_pw").on('keyup', function(e) {
		if (e.keyCode == 13) {
			login();
		}
	});
	$("#reg_pw_con").on('keyup', function(e) {
		if (e.keyCode == 13) {
			register();
		}
	});
	$("#loginPage").show();
	$("#reg").hide();
	$('#mainPage').hide();
	$('#how2play').hide();
	$('#scorePage').hide();
	$('#deadPage').hide();
	$("#game").hide();
	$("#weapon_info").hide();
    window.onkeydown = function (e) {
        return !(e.keyCode == 32);
	}; // space scrolls the page
	window.onwheel = function (e) {
        return false;
	};
	setInterval(function() {
		tipIndex = (tipIndex + 1) % tips.length;
		document.getElementById("tip1").innerHTML = "TIPS: " + tips[tipIndex];
	}, 3000);
}