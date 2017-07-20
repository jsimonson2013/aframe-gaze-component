window.onload = function() {
  // Initialize gaze coordinates and store view elements
  var gaze_x = 0;
  var gaze_y = 0;
  var sceneEl = document.querySelector('a-scene');
  var canvasEl = sceneEl && sceneEl.canvas;

  // Custom event to update gaze point and trigger handler in
  // gaze controls. Holds x- and y-coordinate of gaze prediction.
  var event = new CustomEvent('gazemove', {
    detail: {
      'x': gaze_x,
      'y': gaze_y,
    },
    bubbles: true,
    cancelable: true
  });
  event.initEvent('gazemove', true, true);

  webgazer.setRegression('ridge')
      .setTracker('clmtrackr')
      .setGazeListener(function(data, clock) {

       // Update gaze coordinates and fire the event.
       if(data != null){
         event.detail.x = data.x;
         event.detail.y = data.y;
         canvasEl.dispatchEvent(event);
       }

      })
      .begin()
      .showPredictionPoints(true);
  var width = 320;
  var height = 240;
  var topDist = '0px';
  var leftDist = '0px';
  var setup = function() {
      var video = document.getElementById('webgazerVideoFeed');
      var scene = document.getElementById('3DScene');
      video.style.display = 'block';
      video.style.position = 'absolute';
      video.style.top = topDist;
      video.style.left = leftDist;
      video.width = width;
      video.height = height;
      video.style.margin = '0px';
      webgazer.params.imgWidth = width;
      webgazer.params.imgHeight = height;
      var overlay = document.createElement('canvas');
      overlay.id = 'overlay';
      overlay.style.position = 'absolute';
      overlay.width = width;
      overlay.height = height;
      overlay.style.top = topDist;
      overlay.style.left = leftDist;
      overlay.style.margin = '0px';
      document.body.appendChild(overlay);
      var cl = webgazer.getTracker().clm;
      function drawLoop() {
          requestAnimFrame(drawLoop);
          overlay.getContext('2d').clearRect(0,0,width,height);
          if (cl.getCurrentPosition()) {
              cl.draw(overlay);
          }
      }
      drawLoop();
  };
  function checkIfReady() {
      if (webgazer.isReady()) {
          setup();
      } else {
          setTimeout(checkIfReady, 100);
      }
  }
  setTimeout(checkIfReady,100);
};
window.onbeforeunload = function() {
  window.localStorage.clear();
}
