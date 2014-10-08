;(function(){

    var srcPath = String("http://sites.emid.com.br:8088/webemid/radio_ampere/Site/Atual/");

    yepnope(
        {
            // loader framework ( Zepto or jQuery );
            test : '__proto__' in {},
            yep  : String(srcPath + 'deploy/js/zepto.min.js' ),
            nope : String(srcPath + 'deploy/js/jquery-1.9.1.min.js'),
            complete : function () {
                if( (window.Zepto || window.jQuery) ) {

                    $ = window.Zepto || window.jQuery;
                    app.init( $ );

                };
            }
        }
    );


    // action all page default script
    var doc, target, main, ctnPlayer, selected = String( "selected" ), activeClick = true;
    var app = {
        init : function($) {

            // utils var
            doc     = $("html, body");
            main    = doc.find("#main");
            target  = null;

            /*/ radio online
            if(yepnope != undefined) { // !Modernizr.audio.mp3 || !Modernizr.audio.ogg && 
                yepnope({
                    // load: [String(srcPath + 'audiojs/audio.js')],
                    load: ['http://demo.svnlabs.com/html5player/volume-control/audiojs/audio.js'],
                    complete: function () {
                        // init event audio
                        setTimeout(app.radioOnline, 800);
                    }
                });
            } else */

            app.radioOnline();


            // Load facebook
            setTimeout(function(){
                if( doc.find("div#fb-root").length ) {
                    // yepnope( String('//connect.facebook.net/pt_BR/all.js#xfbml=1') ); // load dependecias
                    ;(function(d, s, id) {
                        var js, fjs = d.getElementsByTagName(s)[0];
                        if (d.getElementById(id)) return;
                        js = d.createElement(s); js.id = id;
                        js.src = "//connect.facebook.net/pt_BR/all.js#xfbml=1";
                        fjs.parentNode.insertBefore(js, fjs);
                    }(document, 'script', 'facebook-jssdk'));
                };
            }, 2300);


        }, // end init


        radioOnline : function() {

            ctnPlayer       = $('div#container-player-radio');

            var ctr         = ctnPlayer.find('audio#som'),
                player      = ctnPlayer.find("menu.control-radio"),
                playPause   = 'a.playPause',
                mudo        = 'a.audio',
                _volume     = Number( ctnPlayer.find("input[type='hidden']#volume-radio").val() ),
                _selected   = selected;

            if ( null != null ){ // Modernizr.audio.mp3 || Modernizr.audio.ogg

                var song        = ctr.get(0),
                    statusAudio = null;

                song.volume = _volume;

                player.on("click", playPause, function(){

                    statusAudio = "player";
                    if (song.paused){
                        statusAudio = "paused";
                        player.find(playPause).attr("title", "Stop rádio").find("span.fs1").removeClass("icon-play").addClass("icon-stop");
                        song.play();
                        song.volume = _volume;
                    } else {
                        player.find(playPause).attr("title", "Play rádio").find("span.fs1").removeClass("icon-stop").addClass("icon-play");
                        song.pause();
                        song.volume = 0;
                    };
                    app.radioStopPlay(player, statusAudio);

                    return false;
                }).on("click", mudo, function(){
                    if(song.volume != 0) {
                        $(this).addClass("mute");
                        _volume = Number(0);
                    } else {
                        $(this).removeClass("mute");
                        _volume = Number(0.8);
                    };

                    song.volume = _volume;

                    /* // update controles
                    statusAudio = (song.paused) ? "paused" : "player";
                    app.radioStopPlay(player, statusAudio);
                    */

                    return false;
                });

            } else { // Support Flash

                //console.log("player flash na veia...");
                if( activeClick ) {
                    activeClick = false;
                    setTimeout(function () { activeClick = true; }, 900);

                    // init cross browser audio
                    audiojs.events.ready(function(event){
                        var as = audiojs.createAll(),
                            audio = as[0];

                        // activeClick = true;
                        player.on("click", playPause, function(){
                            if(activeClick){
                                activeClick = false;
                                setTimeout(function () { activeClick = true; }, 500);

                                audio.playPause();

                                var statusAudio = ($(this).find("span").hasClass("icon-stop")) ? "player" : "paused";
                                app.radioStopPlay(player, statusAudio);
                            
                            };

                            return false;
                        });
                        player.on("click", mudo, function(event){

                            // console.log( $(this).hasClass("mute") );

                            if( !$(this).hasClass("mute") ) {
                                $(this).addClass("mute");
                                _volume = Number(0);
                            } else {
                                $(this).removeClass("mute");
                                _volume = Number(0.8);
                            };

                            try {
                                audio.setVolume( Number(_volume) );
                            } catch(e) {
                                // console.log("fail audio...");
                            };

                            if (event) event.returnValue = false;
                            return false;
                        });

                        
                        if( doc.find("div#audiojs_wrapper0").length > 1 ) {
                            //doc.find("div#audiojs_wrapper0").remove();
                        };

                        setTimeout(function(){

                            if( ctnPlayer.find("div.audiojs").hasClass("loading") && audio.loadedPercent == 0 ) {
                                ctnPlayer.find("menu.control-radio").find("a.playPause").addClass("loading");
                                app.corrigeBug(0);
                            } else {
                                ctnPlayer.find("div.audiojs").removeClass("loading");
                            };

                        }, 999);

                        if (event) event.returnValue = false;
                        return false;
                    });
                };

            }; // else

            return false;
        },

        radioStopPlay : function(obj, status){
            if (status == 'paused'){
                obj.find('a.playPause').attr("title", "Stop rádio").find("span.fs1").removeClass("icon-play").addClass("icon-stop");
            } else {
                obj.find('a.playPause').attr("title", "Play rádio").find("span.fs1").removeClass("icon-stop").addClass("icon-play");
            };
        },

        corrigeBug : function(nn){

            var timer = null;
            clearTimeout( timer );

            if( ctnPlayer.find("div.audiojs").hasClass("loading") ) {

                timer = setTimeout(function() {
                    // ctnPlayer.find("div.audiojs").addClass("playing");
                    ctnPlayer.find("div.audiojs").find("div.play-pause").trigger("click");

                    nn++;
                    if( nn < 50 ) {
                        app.corrigeBug( nn );
                    } else {
                        clearTimeout( timer );
                        ctnPlayer.find("menu.control-radio").find("a.playPause").trigger("click");
                    };

                }, 400);

            } else ctnPlayer.find("menu.control-radio").find("a.playPause").removeClass("loading").trigger("click");

        }

    };


}());