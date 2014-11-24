videojs-aa
==========

Videojs plugin for easy Adobe Analytics video tracking, inspired in part by [videojs-ga](https://github.com/mickey/videojs-ga)

## Requirements
[videojs](http://www.videojs.com/)
s_code.js (From your Adobe Analytics account manager, or through Admin > Code Manager in Adobe Marketing Cloud)

## Setup
1. Include video.js, s_code, and video-tracking.js in the head of your document
2.Include some markup (data-tracking) on your video element to overwrite the omniVideoTracker defaults. 

```html
<video id="video1" class="video-js vjs-default-skin" controls preload="auto" width="440" height="200"  data-tracking='{"omniVideoTracker": {"videoName": "Awesome Movie Title!", "interval" : 25, "player" : "Video.js Player"}}' muted data-setup=''>
	 <source src="http://vjs.zencdn.net/v/oceans.mp4" type='video/mp4'>
	 <source src="http://vjs.zencdn.net/v/oceans.webm" type='video/webm'>
	 <p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>
</video>
```

3. reference the video-aa (omniVideoTracker) when instantiating video.js
```javascript
videojs('video1', {}, function() {
	this.omniVideoTracker();
});
```

## Defaults
By default, omniVideoTracker users the s.Media module and therefore will only capture events that are specifically compatible with the available calls. Though future versions are expected to allow for custom implementations, the following events are tracked and passed the corresponding the s.Media module.
- Video Start (s.Media.open, s.Media.play)
- Video Play (s.Media.play)
- Video Pause (s.Media.stop)
- Video Intervals (s.Media.play)
- Video End (s.Media.stop, s.Media.close)
- Video Seek (s.Media.stop)




