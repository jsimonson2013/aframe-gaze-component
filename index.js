// To avoid recalculation at every mouse movement tick
var PI_2 = Math.PI / 2;

/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Gaze Control component for A-Frame.
 */
AFRAME.registerComponent('gaze-control', {
   dependencies: ['position', 'rotation'],

   schema: {
     enabled: { default: true }
   },

   init: function () {
     this.previousPosition = new THREE.Vector3();
     this.deltaPosition = new THREE.Vector3();

     // From setupMouseControls
     this.pitchObject = new THREE.Object3D();
     this.yawObject = new THREE.Object3D();
     this.yawObject.position.y = 10;
     this.yawObject.add(this.pitchObject);

     // From setupHMDControls
     this.dolly = new THREE.Object3D();
     this.euler = new THREE.Euler();
     this.zeroQuaternion = new THREE.Quaternion();

     this.onGazeMove = this.onGazeMove.bind(this);
   },

   update: function () {
     if (!this.data.enabled) { return; }
     this.updateOrientation();
     this.updatePosition();
   },

   play: function () {
     this.previousPosition.set(0, 0, 0);
     this.addEventListeners();
   },

   pause: function () {
     this.removeEventListeners();
   },

   tick: function (t) {
     this.update();
   },

   remove: function () {
     this.pause();
   },

   addEventListeners: function () {
     var sceneEl = this.el.sceneEl;
     var canvasEl = sceneEl.canvas;

     // listen for canvas to load.
     if (!canvasEl) {
       sceneEl.addEventListener('render-target-loaded', this.addEventListeners.bind(this));
       return;
     }

     canvasEl.addEventListener('gazemove', this.onGazeMove);
   },

   removeEventListeners: function () {
     var sceneEl = document.querySelector('a-scene');
     var canvasEl = sceneEl && sceneEl.canvas;
     if (!canvasEl) { return; }

     canvasEl.removeEventListener('gazemove', this.onGazeMove);
   },

   updateOrientation: (function () {
     var hmdEuler = new THREE.Euler();
     hmdEuler.order = 'YXZ';
     return function () {
       var pitchObject = this.pitchObject;
       var yawObject = this.yawObject;
       var hmdQuaternion = this.calculateHMDQuaternion();
       hmdEuler.setFromQuaternion(hmdQuaternion);
       this.el.setAttribute('rotation', {
         x: THREE.Math.radToDeg(hmdEuler.x) + THREE.Math.radToDeg(pitchObject.rotation.x),
         y: THREE.Math.radToDeg(hmdEuler.y) + THREE.Math.radToDeg(yawObject.rotation.y),
         z: THREE.Math.radToDeg(hmdEuler.z)
       });
     };
   })(),

   calculateHMDQuaternion: (function () {
     var hmdQuaternion = new THREE.Quaternion();
     return function () {
       var dolly = this.dolly;
       if (!this.zeroed && !dolly.quaternion.equals(this.zeroQuaternion)) {
         this.zeroOrientation();
         this.zeroed = true;
       }
       hmdQuaternion.copy(this.zeroQuaternion).multiply(dolly.quaternion);
       return hmdQuaternion;
     };
   })(),

   updatePosition: function () {
     var el = this.el;
     var deltaPosition = this.calculateDeltaPosition();
     var currentPosition = el.getAttribute('position');
     el.setAttribute('position', {
       x: currentPosition.x + deltaPosition.x,
       y: currentPosition.y + deltaPosition.y,
       z: currentPosition.z + deltaPosition.z
     });
   },

   calculateDeltaPosition: function () {
     var dolly = this.dolly;
     var deltaPosition = this.deltaPosition;
     var previousPosition = this.previousPosition;
     deltaPosition.copy(dolly.position);
     deltaPosition.sub(previousPosition);
     previousPosition.copy(dolly.position);
     return deltaPosition;
   },

   updateHMDQuaternion: (function () {
     var hmdQuaternion = new THREE.Quaternion();
     return function () {
       var dolly = this.dolly;
       this.controls.update();
       if (!this.zeroed && !dolly.quaternion.equals(this.zeroQuaternion)) {
         this.zeroOrientation();
         this.zeroed = true;
       }
       hmdQuaternion.copy(this.zeroQuaternion).multiply(dolly.quaternion);
       return hmdQuaternion;
     };
   })(),

   zeroOrientation: function () {
     var euler = new THREE.Euler();
     euler.setFromQuaternion(this.dolly.quaternion.clone().inverse());
     // Cancel out roll and pitch. We want to only reset yaw
     euler.z = 0;
     euler.x = 0;
     this.zeroQuaternion.setFromEuler(euler);
   },

   onGazeMove: function(event) {
     var width = window.innerWidth;
     var height = window.innerHeight;

     // sectors determine camera movement
     var sector_height = height/4;
     var sector_width = width/6;

     // gaze location
     var x = event.detail.x
     var y = event.detail.y

     // unit of movement
     var dist = 25;

     // gaze listener has not initialized
     if (!this.data.enabled){
       return;
     }

     // gaze is outside window
     if (x > width || y > height || x < 0 || y < 0){
       return;
     }

     var moveX = 0, moveY = 0;

     // determine movement in the x-direction
     if (x < sector_width){
       moveX = -dist; // move left
     }
     else if (x > width - sector_width){
       moveX = dist; // move right
     }

     // determine movement in the y-direction
     if (y < sector_height){
       moveY = -dist; // move down
     }
     else if (y > height - sector_height){
       moveY = dist; // move up
     }

     // From onMouseMove()
     this.yawObject.rotation.y -= moveX * 0.002;
     this.pitchObject.rotation.x -= moveY * 0.002;
     this.pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, this.pitchObject.rotation.x));
   }
 });
