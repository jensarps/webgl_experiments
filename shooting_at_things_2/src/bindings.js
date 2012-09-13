define(function(){

  /* This is an example bindings file */

  var KEYBOARD = 'keyboard',
      MOUSE = 'mouse';

  var bindings = {

    accelerate: {
      device: KEYBOARD,
      inputId: 87, // w
      down: true,
      up: true
    },

    decelerate: {
      device: KEYBOARD,
      inputId: 83, // s
      down: true,
      up: true
    },

    cannon: {
      device: MOUSE,
      inputId: 0,
      down: true,
      up: true
    },

    boost: {
      device: MOUSE,
      inputId: 2,
      down: true,
      up: true
    },

    pitch: {
      device: MOUSE,
      inputId: 'y'
    },

    roll: {
      device: MOUSE,
      inputId: 'x'
    },

    yawLeft: {
      device: KEYBOARD,
      inputId: 65, // a
      down: true,
      up: true
    },

    yawRight: {
      device: KEYBOARD,
      inputId: 68, // d
      down: true,
      up: true
    },

    toggleFullscreen: {
      device: KEYBOARD,
      inputId: 70, // f
      down: true,
      up: false
    }
  };

  return bindings;
});
