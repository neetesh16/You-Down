/* Inject our Angular app, taking care
 * not to interfere with page's Angular (if any) */
function injectAngular(tabId) {

    /* Prevent immediate automatic bootstrapping */
    chrome.tabs.executeScript(tabId, {
        code: 'window.name = "NG_DEFER_BOOTSTRAP!" + window.name;'
    }, function () {

        /* Inject AngularJS */
         chrome.tabs.executeScript(tabId, {
                file: 'js/lib/jquery-1.11.2.min.js'
            });
         // chrome.tabs.executeScript(tabId, {
         //        file: 'js/lib/menu.js'
         //    });
      
      chrome.tabs.executeScript(tabId, {
                 file: 'js/lib/classie.js'
             });

       
      
        chrome.tabs.executeScript(tabId, {
            file: 'js/lib/angular.min.js'
        }, function () {

            /* Inject our app's script */
             
              chrome.tabs.executeScript(tabId, {
                 file: 'js/lib/angular-animate.min.js'
             });

            chrome.tabs.executeScript(tabId, {
                file: 'js/app/content.js'
            });

              chrome.tabs.executeScript(tabId, {
                file: 'js/lib/main.js'
            });
        });

        
        // chrome.tabs.insertCSS(tabId, {
        //         file: 'css/style.css'
        //     });
     // chrome.tabs.insertCSS(tabId, {
     //            file: 'css/normalize.css'
     //        });
     // chrome.tabs.insertCSS(tabId, {
     //            file: 'css/demo.css'
     //        });
        chrome.tabs.insertCSS(tabId, {
                file: 'fonts/font-awesome-4.2.0/css/font-awesome.min.css'
            });
      chrome.tabs.insertCSS(tabId, {
                file: 'css/menu_cornermorph.css'
            });
    });
}

function openNetInternals() { 
  chrome.tabs.create({url: 'chrome://net-internals/'});
}

chrome.pageAction.onClicked.addListener(function (tab) {
    injectAngular(tab.id);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (~tab.url.indexOf('www.youtube.com/watch?v=') || ~tab.url.indexOf('www.youtube.com/playlist?list=')) {
    chrome.pageAction.show(tabId);
    if(changeInfo.status=="complete")
       injectAngular(tab.id);
  }
});


chrome.runtime.onMessage.addListener(function(message) {
    if (message && message.type == 'copy') {
        var input = document.createElement('textarea');
        document.body.appendChild(input);
        input.value = message.text;
        input.focus();
        input.select();
        document.execCommand('Copy');
        input.remove();
    }
});
