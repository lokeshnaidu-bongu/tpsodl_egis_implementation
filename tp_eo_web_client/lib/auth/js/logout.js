/*! ElectricOfficeWeb 5.0.1 2019-12-09 */
define(["jquery", "underscore", "hogan", "i18n!viewer/nls/messages", "text!viewer-partials/logout.html", "comms", "map-core-component/pubsub"], function(a, b, c, d, e, f) {
    "use strict";
    var g, h = {},
        i = {},
        j = c.compile(e);
    var username, logindatetime;
     var insertLogin="https://"+window.location.hostname+":32060/insert_login",
    updateLogout="https://"+window.location.hostname+":32060/update_logout";


    a.fn.initialiseLogout = function(b) {

        k(a(this), b)
    };
    var k = function(b, c) {

            a.extend(!0, h, c),
                i.logoutPanel = b, i.logoutPanel.append(j.render({
                    messages: d.auth
                })),
                i.username = a("#username"),
                l()
        },
        l = function() {
            var b = {
                dataType: "json",
                url: "/auth/user",
                cache: !1
            };
            f.getNodeRequest(b, function(b) {
                b.user ? (i.username.text(b.user), g = b) : a("#logout").hide(), a.publish("userData", [b])
               
                username = b.user
                logindatetime = dateNow()+" "+timeNow()
                $('#user_login_time').html("")
               // if (window.localStorage.getItem("token") == null) {
                 if (window.localStorage.getItem("token") != window.localStorage.getItem("gss_access_token")) {

                    window.localStorage.setItem("token", window.localStorage.getItem("gss_access_token"))
                    window.localStorage.setItem("username", username)
                    window.localStorage.setItem("logintime",  logindatetime)
					var user_ip = "";
					$.getJSON('https://ipinfo.io/json', function(data) {
						user_ip = data.ip + ", " + data.city +", "+data.region
						console.log(">> logout : ", user_ip);
				
						var split_val=(logindatetime.split(" ")[0]).split("-")
						var split_date=split_val[2]+"/"+split_val[1]+"/"+split_val[0]
						$('#user_login_time').html("<b>Login time : "+split_date+" "+logindatetime.split(" ")[1]);
						l_logindatetime = split_date+" "+logindatetime.split(" ")[1];
						console.log(user_ip)
						$.ajax({
							type: "POST",
							data: JSON.stringify({
								"username": b.user,
								"logintime": logindatetime,
								"ip": user_ip
							}),
							contentType: "application/json",
							url: insertLogin,
							crossDomain: true,
							dataType: "json"
						}).done(function(result) {
							console.log(result)
						})
					});
					
					
                }else
                {
                    var date_time=window.localStorage.getItem("logintime")
                    var split_val=(date_time.split(" ")[0]).split("-")
                    var split_date=split_val[2]+"/"+split_val[1]+"/"+split_val[0]
                    $('#user_login_time').html("<b>Login time : "+split_date+" "+date_time.split(" ")[1])
                    
                }



            }, function(b) {

                a.publish("raiseTempMessage", [d.auth.userInfoError, {
                    messageType: "warning"
                }])
            })

            a('#log_out').click(function() {
               			   
                $.ajax({
                    type: "POST",
                    data: JSON.stringify({
                        "logouttime":  dateNow()+" "+timeNow(),
                        "username": window.localStorage.getItem("username"),
                        "login": window.localStorage.getItem("logintime")
                    }),
                    contentType: "application/json",
                    url: updateLogout,
                }).done(function(result) {
					// alert("Updated")
					
					window.localStorage.removeItem("username")
                    window.localStorage.removeItem("logintime")
                    window.localStorage.removeItem("token")
                    window.location.replace("/auth/logout")
					
                    // console.log(result)

                })
                // setTimeout(function() {
                    // window.localStorage.removeItem("username")
                    // window.localStorage.removeItem("logintime")
                    // window.localStorage.removeItem("token")

                    // window.location.replace("/auth/logout")
                // }, 2000);
                // });



            })

        },
            dateNow= function() {
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!

            var yyyy = today.getFullYear();
            if (dd < 10) {
                dd = '0' + dd
            }
            if (mm < 10) {
                mm = '0' + mm
            }
            return yyyy + '-' + mm + '-' + dd;
        },

       timeNow= function() {
            var currentTime = new Date()
            var hours = currentTime.getHours()
            var minutes = currentTime.getMinutes()
            var seconds = currentTime.getSeconds()
            if (minutes < 10)
                minutes = "0" + minutes;
            if (seconds < 10)
                seconds = "0" + seconds;
            return hours + ":" + minutes + ":" + seconds;
        },

        m = function() {
            f.isUnauthenticatedApp() || a("#logout").initialiseLogout()
        },
        n = {
            initialise: k,
            init: m
        };
    return n
});
