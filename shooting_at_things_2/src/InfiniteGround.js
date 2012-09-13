define(function(){

  var InfiniteGround = function(camera, meshes, meshSize){
    this.camera = camera;
    this.meshes = meshes;
    this.meshSize = meshSize;

    this.positionMeshes(0, 0);
  };

  InfiniteGround.prototype = {

    camera: null,

    lastCorner: null,

    meshes: null,

    meshSize: null,

    positionMeshes: function(cornerX, cornerZ) {
      var meshSize = this.meshSize,
          halfMeshSize = meshSize / 2;

      for(var i = 0, m = 4; i<m; i++){
        var meshObject = this.meshes[i];
        var isLeft = i == 1 || i == 2;
        var isNear = i > 1;

        meshObject.x = cornerX - ( isLeft ? meshSize : 0 );
        meshObject.z = cornerZ + ( isNear ? meshSize : 0 );

        meshObject._mesh.position.x = meshObject.x + halfMeshSize; // shift right
        meshObject._mesh.position.z = meshObject.z - halfMeshSize; // shift forward
      }
    },

    update: function(){
      var _rest, isNeg, cornerX, cornerZ,
          position = this.camera.position,
          meshSize = this.meshSize;

      _rest = position.x % meshSize;
      isNeg = position.x < 0;
      cornerX = position.x - _rest;
      if (Math.abs(_rest) > meshSize / 2) {
        cornerX += isNeg ? -meshSize : meshSize
      }

      _rest = position.z % meshSize;
      isNeg = position.z < 0;
      cornerZ = position.z - _rest;
      if (Math.abs(_rest) > meshSize / 2) {
        cornerZ += isNeg ? -meshSize : meshSize
      }

      var newCorner = cornerX + '/' + cornerZ;
      if(newCorner != this.lastCorner){
        this.positionMeshes(cornerX, cornerZ);
        this.lastCorner = newCorner;
      }
    },

    getHeight: function(){
      var _rest, isNeg, cornerX, cornerZ,
          position = this.camera.position,
          meshSize = this.meshSize;

      var tileSize = 256;

      var restX = position.x % meshSize;
      if(restX < 0){
        restX += meshSize;
      }
      restX = ( restX / meshSize ) * tileSize;

      var restZ = position.z % meshSize;
      if(restZ < 0){
        restZ += meshSize;
      }
      restZ = ( restZ / meshSize ) * tileSize;

      var dataPoint = restZ * tileSize + restX;

      return this.meshes[0].data[dataPoint];

    }

  };

  return InfiniteGround;

});
