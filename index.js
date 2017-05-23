/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Gaze Control component for A-Frame.
 */
AFRAME.registerComponent('gaze-control', {

  schema: {
    enabled: {default: true},
    widthSectors: {type: 'number', default: 3},
    heightSectors: {type: 'number', default: 3}
  },

  /**
   * Set if component needs multiple instancing.
   */
  multiple: false,


  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {
    this.previousPosition = new THREE.Vector3();
    this.deltaPosition = new THREE.Vector3();
  },

  /**
   * Called when component is attached and when component data changes.
   * Generally modifies the entity based on the data.
   */
  update: function (oldData) {
    if (!this.data.enabled) { return; }
  },

  /**
   * Called when a component is removed (e.g., via removeAttribute).
   * Generally undoes all modifications to the entity.
   */
  remove: function () {
    this.pause();
  },

  /**
   * Called on each scene tick.
   */
  // tick: function (t) { },

  /**
   * Called when entity pauses.
   * Use to stop or remove any dynamic or background behavior such as events.
   */
  pause: function () {
    var sceneEl = this.el.sceneEl;
    var canvasEl = sceneEl.canvas;

    canvasEl.removeEventListener('gazemove', this.onGazeMove);
  },

  /**
   * Called when entity resumes.
   * Use to continue or add any dynamic or background behavior such as events.
   */
  play: function () {
    var sceneEl = this.el.sceneEl;
    var canvasEl = sceneEl.canvas;

    // listen for canvas to load.
    if (!canvasEl) {
      sceneEl.addEventListener('render-target-loaded', this.addEventListeners.bind(this));
      return;
    }

    this.previousPosition.set(0, 0, 0);
    canvasEl.addEventListener('gazemove', this.onGazeMove);
  },

  onGazeMove: function(event) {
    // Base sector size and movements on the size of the window
    var width = window.innerWidth;
    var height = window.innerHeight;

    // Because of landscape orientation and focal area, a larger portion
    // of the height contributes to a sector size than width.
    var sector_height = height/4; // height dimension of sector
    var sector_width = width/6; // width dimension of sector

    // Speed is somewhat arbitrary but obtained based on what felt
    // comfortable in testing.
    var movement_speed = 25; // speed of panning

    // Adapted from onMouseMove()
    var pitchObject = this.pitchObject;
    var yawObject = this.yawObject;
    var previousGazeEvent = this.previousGazeEvent;
    if (!this.data.enabled) { return; }

    // Bottom Left
    if (event.detail.x > 0 && event.detail.x < sector_width && event.detail.y > 0 && event.detail.y < sector_height){
      var movementX = -movement_speed;
      var movementY = -movement_speed;
    } // Bottom Center
    else if (event.detail.x > sector_width && event.detail.x < width - sector_width && event.detail.y > 0 && event.detail.y < sector_height){
      var movementX = 0;
      var movementY = -movement_speed;
    } // Bottom Right
    else if (event.detail.x > width - sector_width && event.detail.x < width && event.detail.y > 0 && event.detail.y < sector_height){
      var movementX = movement_speed;
      var movementY = -movement_speed;
    } // Middle Left
    else if (event.detail.x > 0 && event.detail.x < sector_width && event.detail.y > sector_height && event.detail.y < height - sector_height){
      var movementX = -movement_speed;
      var movementY = 0;
    } // Middle Right
    else if (event.detail.x > width - sector_width && event.detail.x < width && event.detail.y > sector_height && event.detail.y < height - sector_height){
      var movementX = movement_speed;
      var movementY = 0;
    } // Top Left
    else if (event.detail.x > 0 && event.detail.x < sector_width && event.detail.y > height - sector_height && event.detail.y < height){
      var movementX = -movement_speed
      var movementY = movement_speed;
    } // Top Center
    else if (event.detail.x > sector_width && event.detail.x < width - sector_width && event.detail.y > height - sector_height && event.detail.y < height){
      var movementX = 0;
      var movementY = movement_speed;
    } // Top Right
    else if (event.detail.x > width - sector_width && event.detail.x < width && event.detail.y > height - sector_height && event.detail.y < height){
      var movementX = movement_speed;
      var movementY = movement_speed;
    } // User is looking at center or not at another sector
    else{
      var movementX = 0;
      var movementY = 0;
    }

    // Adapted from onMouseMove()
    this.previousGazeEvent = event;
    yawObject.rotation.y -= movementX * 0.002;
    pitchObject.rotation.x -= movementY * 0.002;
    pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
  },
});
