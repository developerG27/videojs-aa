/**  
  * @summary Video.js plugin for tracking video engagement with Adobe Analytics (formerly Site Catalyst, formerly Omniture...)
  * @author Justin Emsoff, hello@emsoff.com
  * @required video.js (http://www.videojs.com/), s_code.js
  * @version 0.5
  * @copyright Justin Emsoff 2014
  * @license WTFPL (http://www.wtfpl.net/)
*/

(function() {

  // Declare videojs plugin omniVideoTracker
  videojs.plugin('omniVideoTracker', function(userOptions) {

    var videoOptions, videoName, inTheBag, interval, seekEnd, seekBegin, isSeeking, sendbeacon, _trackingQueue, grabMeta, trackTimeupdate, trackEnd, trackPlay, trackPause, sendbeacon, _sendCustom, _sendMedia, duration, playerName;

    // Set default variable values
    userOptions = userOptions || {};

    // inTheBag will contain which of our intervals or milestones have been captured already. 
    inTheBag = [];
    
    // _trackingQueue holds our events that are called before s is defined, which is then checked periodically for backlogged events. 
    _trackingQueue = [];

    // Get the data-setup options from videojs element and apply to local variables for this current instance. 
    videoOptions = {};
    if (this.options()["data-tracking"]) {
      videoOptions = JSON.parse(this.options()["data-tracking"]).omniVideoTracker;
    }

    /** 
      * @desc Called on load of video, sets initial values for common variables.
    */  
    grabMeta = function() {
      interval = videoOptions.interval || 10;
      videoName = videoOptions.videoName || this.id();
      playerName = videoOptions.player || 'Video.js Player';
      duration = Math.round(this.duration());
      isSeeking = false;
      seekBegin = seekEnd = 0;
      sendbeacon('Loaded');
    };

    /** 
      * @desc Called on timeupdate and triggers the Started, Interval, or Seeking beacons. Portions adapted from videojs-ga (https://github.com/mickey/videojs-ga).
    */  
    trackTimeupdate = function() {
      var currentTime, counter, percent, percentComplete;
      currentTime = Math.round(this.currentTime());
      percentComplete = Math.round(currentTime / duration * 100);
      seekBegin = seekEnd;
      seekEnd = currentTime;
      if (Math.abs(seekBegin - seekEnd) > 1) {
        isSeeking = true;
        sendbeacon('Seeking', currentTime);
      } else {
        for (percent = counter = 0; counter <= 99; percent = counter += interval) {
          if (percentComplete >= percent && inTheBag.indexOf(percent) < 0 ) {
            if ( percentComplete > 0 && percent === 0) {
              sendbeacon('Started');
            } else if ( percentComplete !== 0 && !isSeeking) {
              sendbeacon('Interval', percent);
            }
            if (percentComplete > 0) {
              inTheBag.push(percent);
            }            
          }
        }
      }
      if(_trackingQueue.length > 0) {
        clearQueue();
      }
    };

    /** 
      * @desc Called within trackTimeupdate() to clear backlogged events from the queue, resulting when video.js is instatiated before s is defined.
    */  
    clearQueue = function() {
      i = _trackingQueue.length;
      while (i--) {
        _trackingQueue.splice(i, 1);
      } 
    };

    /** 
      * @desc Sends the End beacon.
    */  
    trackEnd = function() {
      sendbeacon('End');
    };

    /** 
      * @desc Sends the Play beacon, along with the current time. 
    */  
    trackPlay = function() {
      var currentTime = Math.round(this.currentTime());
      isSeeking = false;
      sendbeacon('Play', currentTime);
    };

    /** 
      * @desc Sends the Paused beacon.
      * @todo add current time, to be received by custom beacons.
    */  
    trackPause = function() {
      var currentTime = Math.round(this.currentTime());
      if (currentTime !== duration && !isSeeking) {
        sendbeacon('Paused');
      }
    };

    /** 
      * @desc Create a catch for premature beacon calls when Adobe Analytic's "s" is not defined. If s exists, send the call. 
    */  
    sendbeacon = function(action, params) {
      var received = new Date().getTime();
      if (typeof window.s !== 'object') {
        _trackingQueue.push([action, params, received]);
      } else {
        _send(action, params);
      }
    };

    /** 
      * @desc Request a Media Module beacon depending on action type.
      * @todo Split into two separate functions, one of which will allow setting of custom variables. 
    */  
    _send = function(action, params) {
      var received = new Date().getTime();
      var lastTag = document.getElementById('last-tag');
      lastTag.innerHTML = action;

      var node = document.createElement("li");
      var textnode = document.createTextNode(action + " (Fired at " + received + ")");
      node.appendChild(textnode);
      document.getElementById("all-tags").appendChild(node);

      switch (action) {
        
        case 'Paused':
          s.Media.stop(videoName, params);
          break;

        case 'Started':
          s.Media.open(videoName, duration, playerName);
          s.Media.play(videoName, 0);
          break;

        case 'Play':
          s.Media.play(videoName, params);
          break;

        case 'Ended':
          s.Media.stop(videoName, params);
          s.Media.close(videoName);
          break;

        case 'Seeking':
          s.Media.stop(videoName, params);
          break;

      }
    };

    /** 
      * @desc Map HTML5 video events to our custom events.
    */  
    this.ready(function() {
      this.on("loadedmetadata", grabMeta);
      this.on("timeupdate", trackTimeupdate);
      this.on("ended", trackEnd);
      this.on("play", trackPlay);
      this.on("pause", trackPause);
    });
  });

}).call(this);