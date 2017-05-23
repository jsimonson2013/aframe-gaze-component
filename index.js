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
  update: function (oldData) { },

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

    this.previousPosition.set(0, 0, 0);
    canvasEl.addEventListener('gazemove', this.onGazeMove);
  },


  onGazeMove: function(event) {
    var width = window.innerWidth;
    var height = window.innerHeight;

    var sector_height = height/4; // height dimension of sector
    var sector_width = width/6; // width dimension of sector

    var movement_speed = 25; // speed of panning

    // Adapted from onMouseMove()
    var pitchObject = this.pitchObject;
    var yawObject = this.yawObject;
    var previousGazeEvent = this.previousGazeEvent;
    if (!this.data.enabled) { return; }

    var movementX = 1;
    var movementY = 1;

    // Adapted from onMouseMove()
    this.previousGazeEvent = event;
    yawObject.rotation.y -= movementX * 0.002;
    pitchObject.rotation.x -= movementY * 0.002;
    pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
  }
});
