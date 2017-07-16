## aframe-gaze-control-component

[![Version](http://img.shields.io/npm/v/aframe-gaze-control-component.svg?style=flat-square)](https://npmjs.org/package/aframe-gaze-control-component)
[![License](http://img.shields.io/npm/l/aframe-gaze-control-component.svg?style=flat-square)](https://npmjs.org/package/aframe-gaze-control-component)

Look control that interprets gaze data as input.

### Usage

Usage requires Node.JS as well as Firefox.

* clone the repository: `git clone https://github.com/jsimonson2013/aframe-gaze-component.git`
* navigate to the root: `cd aframe-gaze-component`
* install packages: `npm install`
* run the application: `npm run start`

### Example

A live example can be found [here](http://jacobsimonson.me:7000).

For [A-Frame](https://aframe.io).

### API

| Property | Description | Default Value |
| -------- | ----------- | ------------- |
|          |             |               |

### Installation

#### Browser

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/0.5.0/aframe.min.js"></script>
  <script src="https://unpkg.com/aframe-gaze-control-component/dist/aframe-gaze-control-component.min.js"></script>
</head>

<body>
  <a-scene>
    <a-entity gaze-control="foo: bar"></a-entity>
  </a-scene>
</body>
```

<!-- If component is accepted to the Registry, uncomment this. -->
<!--
Or with [angle](https://npmjs.com/package/angle/), you can install the proper
version of the component straight into your HTML file, respective to your
version of A-Frame:

```sh
angle install aframe-gaze-control-component
```
-->
#### npm

Install via npm:

```bash
npm install aframe-gaze-control-component
```

Then require and use.

```js
require('aframe');
require('aframe-gaze-control-component');
```
