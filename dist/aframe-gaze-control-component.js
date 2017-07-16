/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

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
	     var sector_height = height/4;
	     var sector_width = width/6;
	     var movement_speed = 25;

	     if (!this.data.enabled) { return; }

	     if (event.detail.x > 0 && event.detail.x < sector_width && event.detail.y > 0 && event.detail.y < sector_height){
	       var movementX = -movement_speed;
	       var movementY = -movement_speed;
	     }
	     else if (event.detail.x > sector_width && event.detail.x < width - sector_width && event.detail.y > 0 && event.detail.y < sector_height){
	       var movementX = 0;
	       var movementY = -movement_speed;
	     }
	     else if (event.detail.x > width - sector_width && event.detail.x < width && event.detail.y > 0 && event.detail.y < sector_height){
	       var movementX = movement_speed;
	       var movementY = -movement_speed;
	     }
	     else if (event.detail.x > 0 && event.detail.x < sector_width && event.detail.y > sector_height && event.detail.y < height - sector_height){
	       var movementX = -movement_speed;
	       var movementY = 0;
	     }
	     else if (event.detail.x > width - sector_width && event.detail.x < width && event.detail.y > sector_height && event.detail.y < height - sector_height){
	       var movementX = movement_speed;
	       var movementY = 0;
	     }
	     else if (event.detail.x > 0 && event.detail.x < sector_width && event.detail.y > height - sector_height && event.detail.y < height){
	       var movementX = -movement_speed
	       var movementY = movement_speed;
	     }
	     else if (event.detail.x > sector_width && event.detail.x < width - sector_width && event.detail.y > height - sector_height && event.detail.y < height){
	       var movementX = 0;
	       var movementY = movement_speed;
	     }
	     else if (event.detail.x > width - sector_width && event.detail.x < width && event.detail.y > height - sector_height && event.detail.y < height){
	       var movementX = movement_speed;
	       var movementY = movement_speed;
	     }
	     else{
	       var movementX = 0;
	       var movementY = 0;
	     }

	     // From onMouseMove()
	     this.previousGazeEvent = event;
	     this.yawObject.rotation.y -= movementX * 0.002;
	     this.pitchObject.rotation.x -= movementY * 0.002;
	     this.pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, this.pitchObject.rotation.x));
	   }
	 });


/***/ })
/******/ ]);