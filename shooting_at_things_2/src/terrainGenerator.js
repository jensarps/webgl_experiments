define(function(){

  var dataContext;
  var MESH_SIZE;
  var TILE_SIZE;
  var MODIFIER;

  function buildTerrain (img, meshSize, tileSize, elevationModifier, scene) {

    var data, geometry, texture,
        i, m, l,
        meshes = [];

    MESH_SIZE = meshSize;
    TILE_SIZE = tileSize;
    MODIFIER = elevationModifier;

    data = readElevationData(img, tileSize, elevationModifier);

    geometry = new THREE.PlaneGeometry(meshSize, meshSize, tileSize - 1, tileSize - 1);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    for (i = 0, l = geometry.vertices.length; i < l; i++) {
      geometry.vertices[ i ].y = data[ i ] * 10;
    }

    texture = new THREE.Texture(generateTexture(data, tileSize, tileSize));
    texture.needsUpdate = true;

    for (i = 0, m = 4; i < m; i++) {
      var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture }));

      mesh.castShadow = false;
      mesh.receiveShadow = true;

      var meshObject = {
        _mesh: mesh,
        x: 0,
        z: 0,
        data: data
      };

      meshes.push(meshObject);
      scene.add(mesh);
    }

    return meshes;
  }

  function generateTexture (data, width, height) {

    var canvas, canvasScaled, context, image, imageData,
        vector3, sun, shade,
        i, j, l;

    vector3 = new THREE.Vector3(0, 0, 0);

    sun = new THREE.Vector3(1, 1, 1);
    sun.normalize();

    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    context = canvas.getContext('2d');
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);

    image = context.getImageData(0, 0, canvas.width, canvas.height);
    imageData = image.data;

    for (i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {

      vector3.x = data[ j - 2 ] - data[ j + 2 ];
      vector3.y = 2;
      vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
      vector3.normalize();

      shade = vector3.dot(sun);
      var zeroCount = 0;
      if(shade == 0){
        zeroCount++;
        shade = 0.6;
      }

      imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
      imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
      imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );

    }

    context.putImageData(image, 0, 0);

    // Scaled 4x

    canvasScaled = document.createElement('canvas');
    canvasScaled.width = width * 4;
    canvasScaled.height = height * 4;

    context = canvasScaled.getContext('2d');
    context.scale(4, 4);
    context.drawImage(canvas, 0, 0);

    image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
    imageData = image.data;

    for (i = 0, l = imageData.length; i < l; i += 4) {

      var v = ~~( Math.random() * 5 );

      imageData[ i ] += v;
      imageData[ i + 1 ] += v;
      imageData[ i + 2 ] += v;

    }

    context.putImageData(image, 0, 0);

    return canvasScaled;

  }

  function readElevationData (img, tileSize, elevationModifier) {
    var canvas = document.createElement('canvas');
    canvas.width = tileSize;
    canvas.height = tileSize;
    var context = dataContext = canvas.getContext('2d');

    var totalSize = tileSize * tileSize,
        data = new Float32Array(totalSize);

    context.drawImage(img, 0, 0);

    var i, n;

    for (i = 0; i < totalSize; i++) {
      data[i] = 0;
    }

    var imgd = context.getImageData(0, 0, tileSize, tileSize);
    var pix = imgd.data;

    var j = 0;
    for (i = 0, n = pix.length; i < n; i += (4)) {
      var all = pix[i] + pix[i + 1] + pix[i + 2];
      data[j++] = all * elevationModifier;
    }

    return data;
  }

  var heightHash = {};

  return {

    build: buildTerrain,

    getHeightAt: function(x, z){

      var relPosX = x % MESH_SIZE;
      if(relPosX < 0){
        relPosX += MESH_SIZE;
      }
      var tilePosX = Math.floor( ( relPosX / MESH_SIZE ) * TILE_SIZE );

      var relPosZ = z % MESH_SIZE;
      if(relPosZ < 0){
        relPosZ += MESH_SIZE;
      }
      var tilePosZ = Math.floor( ( relPosZ / MESH_SIZE ) * TILE_SIZE );


      var key = tilePosX +'-'+tilePosZ;
      if(heightHash[key]){
        return heightHash[key];
      }

      var imgd = dataContext.getImageData(tilePosX, tilePosZ, 1, 1);
      var pixel = imgd.data;

      var height = ( pixel[0] + pixel[1] + pixel[2] ) * MODIFIER * 10;
      heightHash[key] = height;
      return height;
    }
  };

});
