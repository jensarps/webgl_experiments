define(function(){

  var Controls = function(object, input){
    this.object = object;
    this.object.useQuaternion = true;
    this.input = input;

    this.quaternion = new THREE.Quaternion();
  };

  Controls.prototype = {

    input: null,

    object: null,

    speed: 0,

    thrust: 0,

    roll: 0,

    pitch: 0,

    quaternion: null,

    update: function(delta){

      var factor = delta / 16,
          speed = this.speed,
          thrust = this.thrust,
          input = this.input,
          object = this.object;

      speed += (input.accelerate - input.decelerate) / 50;
      speed = THREE.Math.clamp(speed, 1, 5);
      var speedMultiplier = speed / 10 + 1;

      if (input.boost) {
        speed *= 1.5;
      }

      this.speed = speed;

      object.translateZ(-speed * factor);

      var pitch = (input.pitch / 150) * speedMultiplier;
      var roll = (input.roll / 100) * speedMultiplier;
      var yaw = (input.yawLeft - input.yawRight) / 1000;

      //pitch += Math.abs(object.quaternion.z) * 0.01;
      //yaw += object.quaternion.z * 0.002;

      yaw = THREE.Math.clamp(yaw, -0.001, 0.001);
      pitch = THREE.Math.clamp(pitch, -0.005, 0.005);

      this.quaternion.set(pitch * factor, yaw * factor, roll * factor, 1).normalize();
      object.quaternion.multiplySelf(this.quaternion);
      object.matrix.setRotationFromQuaternion(object.quaternion);
      
    }
  };

  return Controls;
});
