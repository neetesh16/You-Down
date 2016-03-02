(function() {




if (document.getElementById("You-Down") != null)
    document.getElementById("You-Down").remove();


var fa = document.createElement('style');
fa.type = 'text/css';
fa.textContent = '@font-face { font-family: FontAwesome; src: url("' + chrome.extension.getURL('fonts/font-awesome-4.2.0/fonts/fontawesome-webfont.woff?v=4.2.0') + '"); }';
document.head.appendChild(fa);


var div = document.createElement('div');
div.setAttribute("id", "You-Down");
var pv = document.getElementById("pl-load-more-destination");

div.dataset.ngNonBindable = '';
////http://cssdeck.com/labs/3fo47n21



/* Create the app's root element (everything else should go in here) */
var appRoot = document.createElement('div');
appRoot.setAttribute("id", "arc");
appRoot.dataset.ngController = 'cs_myCtrl';
appRoot.innerHTML="";
if(pv==null)appRoot.innerHTML='<div class="container-me"><div class="menu-wrap stitched"><nav class="menu"><div class="profile"><img src="{{data.thumbnail}}" alt="PiC"/><span class="titles">{{data.title}}</span></div><div class="link-list"><ul><li ng-repeat="link in data.links" class="lin"><a href="{{link.url}}">{{link.resolution}}</a></li></ul></div><div class="icon-list"><a href="https://github.com/neetesh16/You-Down"><i class="fa fa-lg fa-home"></i></a><a href="https://www.github.com/neetesh16"><i class="fa fa-lg fa-github-square"></i></a><a href="https://www.facebook.com/neetesh16"><i class="fa fa-lg fa-facebook-square"></i></a></div></nav></div><button class="menu-button" id="open-button"><i class="fa fa-fw fa-cog fa-2x"></i><span>Open Menu</span></button>';
else appRoot.innerHTML = '<button id= "copy-button" class="" data-button={{playlinks}}  ng-click="len==completed && doSomething()"><span id="complete">{{completed}}</span></button>'
document.body.appendChild(div);

div.appendChild(appRoot);

var app = angular.module('cs_myApp', []);
app.service('pageInfoService', function() {
    this.getInfo = function(callback, url) {
        var model = {};
        model.url = url;
        url = url.split('&')[0] + "&spf=navigate";
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'json',
            success: function(myjson) {

                try {
                    console.log(myjson);
                    for(var iN=0; iN<myjson.length ;iN++){
                        console.log(myjson[iN].data );
                        if(myjson[iN].data!=null && myjson[iN].data.swfcfg!=null){
                        model.title = myjson[iN].data.swfcfg.args.title;
                        model.thumbnail = myjson[iN].data.swfcfg.args.thumbnail_url
                        model.links = linkGenerator(myjson[iN].data.swfcfg);

                        break;
                     }

                   }
                }
                catch(err) {
                    out(err.message);

                }


                // out(model.links)
                //
                callback(model);

            },
            data: {},
            async: true
        });



        //callback(model)
    };
});

app.controller("cs_myCtrl",["$scope","pageInfoService",function($scope, pageInfoService) {
    $scope.message = document.URL;

    if (~$scope.message.indexOf('www.youtube.com/watch?v=')) {
        pageInfoService.getInfo(function(info) {
            // To call the digest cycle either use $apply or put empty ng-click on div
            ///Both Works Fine
            $scope.$apply(function() {

                $scope.data = {
                    url: info.url,
                    title: info.title,
                    links: info.links,
                    thumbnail: info.thumbnail

                }
                console.log($scope.data);
            });
        }, document.URL);
    }

    if (~$scope.message.indexOf('www.youtube.com/playlist?list=')) {
        $scope.playlinks = "";

        $scope.doSomething = function() {
            chrome.runtime.sendMessage({
                type: 'copy',
                text: $scope.playlinks
            });

            $('#copy-button').addClass("animated bounceInRight");
            $scope.completed = "Copied to Clipboard";

        }


        var vid = [];
        if (pv != null)
            for (i = 0; i < pv.children.length; i++) {
                vid.push(pv.children[i].getAttribute("data-video-id"));

            }
        $scope.len = pv.children.length;
        $scope.completed = 0;

        var asyncLoop = function(o) {
            var i = -1,
                length = o.length;

            var loop = function() {
                i++;
                if (i == length) {
                    o.callback();
                    return;
                }
                o.functionToLoop(loop, i);
            }
            loop(); //init
        }




        asyncLoop({
            length: vid.length,
            functionToLoop: function(loop, i) {
                setTimeout(function() {
                    pageInfoService.getInfo(function(info) {

                        $scope.$apply(function() {

                            $scope.data = {
                                    url: info.url,
                                    title: info.title,
                                    links: info.links,
                                    thumbnail: info.thumbnail

                                }
                                //console.log( $scope.data.title + ' '+ $scope.data.links[0].url );
                            $scope.completed = $scope.completed + 1;
                            $('#complete').addClass("animated fadeIn")
                            if($scope.playlinks=="")$scope.playlinks=$scope.data.links[0].url
                            else
                            $scope.playlinks = ($scope.playlinks + '\n') + $scope.data.links[0].url;

                        });
                    }, 'https://www.youtube.com/watch?v=' + vid[i]);
                    loop();
                }, 100);
            },
            callback: function() {
                out($scope.playlinks);
            }
        });
    }
}]);

/* Manually bootstrap the Angular app */
window.name = ''; // To allow `bootstrap()` to continue normally
angular.bootstrap(appRoot, ['cs_myApp']);

function out(a) {
    console.log(a);
}

function linkGenerator(data) {


    var dl = [];
    var links = data.args.url_encoded_fmt_stream_map;
    var title = data.args.title;
    var thumbnail = data.args.thumbnail_url;
    var html5versionlink = data.assets.js;
    var html5version = data.assets.js;
    var r = data.args.fmt_list.split(',');
    var resolution = {};
    for (var i in r) {
        resolution[r[i].split('/')[0]] = r[i].split('/')[1];

    };
    // html5version = html5version.split('/html5player')[1];
    //
    // html5version = html5version.slice(1, html5version.length);


    if (typeof(Storage) !== "undefined") {
        var stored_version = localStorage.getItem("html5version");
        if (stored_version == null || stored_version != html5version) {
            var sig = decryptSignature(html5versionlink);
            localStorage.setItem("html5version", html5version);
            localStorage.setItem("sig", sig);
        }

    } else {

    }

    links = links.split(',');

    for (var i in links) {
        var obj = {};
        var link = links[i].split('&');
        for (var j in link) {

            var o = link[j].split("=");
            obj[o[0]] = decodeURIComponent(o[1]);
        }
        //console.log(obj.url);
        dl.push(obj);

    }


    var sig = localStorage.getItem("sig");
    sig = sig.split(" ");
    for (var j in dl) {

        var oh = dl[j].s;
        if (dl[j].s != null) {
            var a = dl[j].s;
            for (i in sig) {
                a = dl[j].s.split("");
                var s = sig[i].split(":");
                var b = parseInt(s[1]);
                if (s[0] == "0") {
                    a = a.reverse();
                } else if (s[0] == "1") {
                    var c = a[0];
                    a[0] = a[b % a.length];
                    a[b] = c;

                } else if (s[0] == "2") {
                    a.splice(0, b);
                }
                a = a.join("");
                dl[j].s = a;

            }

        }

        if (dl[j].s !== undefined) {
            dl[j].url = dl[j].url + "&signature=" + dl[j].s;
        }
        dl[j].url = dl[j].url + "&title=" + encodeURIComponent(title.replace(/"/g, "'"));

        dl[j].resolution = resolution[dl[j].itag];

    }
    return dl;

}

function decryptSignature(url) {
    var sig = "";
    $.ajax({
        type: 'GET',
        url: url,
        success: function(data) {
            data = data.replace(/(\r\n|\n|\r)/gm,"");
            var patt = /function[a-zA-Z0-9$_\(\)]{1,3}\{[a-z]=[a-z]\.split\(""\);[a-zA-Z0-9.\(,\);]{1,300}return\s[a-z].join\(""\)}/g;
            var algo = patt.exec(data);
            var funcfinder = /var\s[a-zA-Z0-9$_]{1,3}=\{[a-zA-Z0-9]{1,3}:function[a-zA-Z0-9.(),;:{}\s=\[\]%]{1,150}\}\;/g;
            var func = funcfinder.exec(data);
            var functionName = [];
            funcfinder = /([a-zA-Z0-9]{1,3})(?=\:)/g;
            var m;
            while (m = funcfinder.exec(func[0])) {
                functionName.push(m[0]);
            }
            var functionPos = new Array(3);
            functionPos[0] = func[0].indexOf("reverse");
            functionPos[1] = func[0].indexOf("%");
            functionPos[2] = func[0].indexOf("splice");
            for (var i = 0; i < 3; i++) {
                var ans = 0;
                var min = 999999999;
                for (var j = 0; j < 3; j++) {
                    var l = functionPos[j] - func[0].indexOf(functionName[i]);
                    if (l >= 0 && l < min) {
                        min = l;
                        ans = j;
                    }
                }
                funcMap[i] = ans;
            }
            var mp = {};
            for (var i = 0; i < 3; i++) {
                mp[functionName[i]] = funcMap[i];

            }
            var sf = algo[0].split(";");
            for (var i = 1; i < sf.length - 1; i++) {
                var functioncall = /\.[0-9a-zA-Z_$]{1,2}/g;
                var num = /[0-9]{1,2}\)/g;
                var f = functioncall.exec(sf[i]);
                var n = num.exec(sf[i]);
                var key = f[0].slice(1, f[0].length);
                var val = n[0].slice(0, n[0].length - 1);
                sig += mp[key] + ":" + val + " ";
            }
        },
        data: {},
        async: false
    });
    return sig.trim();
}

})();
