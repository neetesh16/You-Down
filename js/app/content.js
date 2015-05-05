if(document.getElementById("You-Down")!=null)
    document.getElementById("You-Down").remove();

var fa = document.createElement('style');
    fa.type = 'text/css';
    fa.textContent = '@font-face { font-family: FontAwesome; src: url("'
        + chrome.extension.getURL('fonts/font-awesome-4.2.0/fonts/fontawesome-webfont.woff?v=4.2.0')
        + '"); }';
document.head.appendChild(fa);


var div = document.createElement('div');
div.setAttribute("id","You-Down");

// var spn = document.createElement('span');
// spn.dataset.ngController = 'cs_myCtrl';
// spn.innerText = "{{data.title}}";
// document.getElementById("eow-title").innerHTML = spn.outerHTML;
// alert(spn.outerHTML);
div.dataset.ngNonBindable = '';
////http://cssdeck.com/labs/3fo47n21



/* Create the app's root element (everything else should go in here) */
 var appRoot = document.createElement('div');
 appRoot.setAttribute("id","arc");
appRoot.dataset.ngController = 'cs_myCtrl';

appRoot.innerHTML ='<div class="container"><div class="menu-wrap stitched"><nav class="menu"><div class="profile"><img src="{{data.thumbnail}}" alt="PiC"/><span class="titles">{{data.title}}</span></div><div class="link-list"><ul><li ng-repeat="link in data.links" class="lin"><a href="{{link.url}}">{{link.resolution}}</a></li></ul></div></nav></div><button class="menu-button" id="open-button"><i class="fa fa-fw fa-cog fa-2x"></i><span>Open Menu</span></button>';
document.body.appendChild(div);

div.appendChild(appRoot);

var app = angular.module('cs_myApp', []);
app.service('pageInfoService', function() {
    this.getInfo = function(callback) {
        var model = {};
        var url = document.URL; 
        model.url = url;
        url = url.split('&')[0] + "&spf=navigate";
        $.ajax({
             type: 'GET',
             url: url,
             dataType: 'json',
             success: function(myjson) { 
               
                
                 model.title = myjson[1].data.swfcfg.args.title;
                 model.thumbnail = myjson[1].data.swfcfg.args.thumbnail_url
                 model.links = linkGenerator(myjson[1].data.swfcfg);
                 // out(model.links)
                 //


                },
                data: {},
            async: false
        });      
        
        

        callback(model)
    };
});

app.controller("cs_myCtrl", function ($scope, pageInfoService) {
    $scope.message = document.URL;
    
    pageInfoService.getInfo(function (info) {

        $scope.data = {
            url : info.url,
            title : info.title,
            links : info.links,
            thumbnail : info.thumbnail

        }
        //document.getElementById("eow-title").innerHTML = '<a href="'+info.links[0].url+'">'+info.title+'</a>';
       
        
    });

    console.log($scope.data);
  

 });





/* Manually bootstrap the Angular app */
window.name = '';   // To allow `bootstrap()` to continue normally
angular.bootstrap(appRoot, ['cs_myApp']);

function out(a){
    console.log(a);
}
function linkGenerator(data){

        
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
        
        html5version = html5version.split('/html5player')[1];
        html5version = html5version.slice(1, html5version.length);
        
        
        if(typeof(Storage) !== "undefined") {
    // Code for localStorage/sessionStorage.
            //console.log(html5version);
            var stored_version = localStorage.getItem("html5version");

            if(stored_version==null || stored_version!=html5version){
                // Make Call to decrypt Signature;
                var sig = decryptSignature(html5versionlink);
                localStorage.setItem("html5version",html5version);
                localStorage.setItem("sig",sig);

               // console.log(stored_version+"1");
            }
            
        } else {
    // Sorry! No Web Storage support..
        }
        
        //var links = ytplayer.args.adaptive_fmts;
        links = links.split(',');
        
        for(var i in links){
            var obj = {};
            var link = links[i].split('&');
            for(var j in link ){

                var o = link[j].split("=");
                obj[o[0]] =decodeURIComponent(o[1]); 
            }
            //console.log(obj.url);
            dl.push(obj);

        }
        
           
            var sig = localStorage.getItem("sig");
            sig = sig.split(" ");
            for(var j in dl){
               
                var oh = dl[j].s;
                if(dl[j].s !=null){
                    var a = dl[j].s;
                    for(i in sig){
                        a = dl[j].s.split("");
                        var s = sig[i].split(":");
                        var b = parseInt(s[1]);
                        if(s[0]=="0"){
                            a = a.reverse();
                        }else if(s[0]=="1"){
                            var c=a[0];a[0]=a[b%a.length];a[b]=c;
                            
                        }else if(s[0]=="2"){
                             a.splice(0,b);
                        }
                        a = a.join("");
                        dl[j].s = a;
                        
                    }

                }
                
                if(dl[j].s!==undefined){
                    dl[j].url=dl[j].url+"&signature="+dl[j].s;
                }
                dl[j].url=dl[j].url+"&title="+encodeURIComponent(title.replace(/"/g, "'"));
               
                dl[j].resolution = resolution[dl[j].itag];
                // console.log(dl[j]);
               


            }   

        
         // document.getElementById("eow-title").innerHTML = '<a href="'+dl[0].url+'">'+document.getElementById("eow-title").innerText+'</a>';
        return dl;

}

function decryptSignature(url){
    var sig = "" ; 
          $.ajax({
             type: 'GET',
             url: url,
             success: function(data) { 
                
                   var patt = /function\s[a-zA-Z0-9$_]{2,4}\([a-z]\)\s{0,2}\{[a-z]=[a-z]\.split\(""\);[a-zA-Z0-9.(),;$_]{1,300}return\s[a-z]\.join\(""\)}/g;
                   var algo = patt.exec(data);
                   // out(algo);

                   var funcfinder = /var\s[a-zA-Z0-9$_]{1,3}=\{[a-zA-Z0-9$_]{1,3}:function[a-zA-Z0-9.(),;:{}\s=\[\]%]{1,150}\}\;/g;
                   var func = funcfinder.exec(data);
                   // out(func);
                   console.log(func);
                   console.log(algo);


                   var functionName = [];
                   funcfinder = /([a-zA-Z0-9]{1,3})(?=\:)/g;
                   var m;
                   while (m = funcfinder.exec(func[0])) {                         
                         functionName.push(m[0]);
                    }
                    // console.log(functionName);

                    var functionPos = new Array(3);
                    functionPos[0] = func[0].indexOf("reverse");
                    functionPos[1] = func[0].indexOf("%");
                    functionPos[2] = func[0].indexOf("splice");
                    // out(functionPos);

                    var funcMap = new Array(3);
                    for( var i=0;i<3;i++){

                        var ans = 0;
                        var min = 999999999;
                        for(var j=0;j<3;j++){
                            var l = functionPos[j]- func[0].indexOf(functionName[i]);
                            if( l>=0 && l<min ){
                                min = l; ans = j;
                            }
                        }
                        funcMap[i] = ans;

                    }
                    // out(funcMap);
                    var mp = {};
                    for(var i=0;i<3;i++){
                        mp[functionName[i]] = funcMap[i];

                    }
                    // out(mp);
                    var sf = algo[0].split(";");
                    // out(sf);
                  
                    for(var i = 1; i <sf.length-1;i++){
                         var functioncall = /\.[0-9a-zA-Z_$]{1,2}/g;
                         var num = /[0-9]{1,2}\)/g;
                         var f = functioncall.exec(sf[i]);
                         var n = num.exec(sf[i]);
                    
                         var key  = f[0].slice(1,f[0].length);
                         var val = n[0].slice(0,n[0].length-1);
                         sig+=mp[key]+":"+val+" "; 
                    }

                },
                data: {},
            async: false
        });  
        // out(sig) 
        return sig.trim(); 

}


