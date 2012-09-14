require([
  'lib/decoupled-input/Controller',
  'lib/decoupled-input/Mouse',
  'lib/decoupled-input/Keyboard',

  'src/bindings',
  'src/InfiniteGround',
  'src/Controls',
  'src/terrainGenerator',
  'src/Cannon',
  'src/RadarDetector'
], function (
  InputController,
  MouseHandler,
  Keyboardhandler,

  bindings,
  InfiniteGround,
  Controls,
  terrainGenerator,
  Cannon,
  RadarDetector
) {

  var camera, scene, renderer,
      stats, lastTime,
      infiniteGround, controls, input,
      cannon, targets, targetsLeft = 100,
      sun, radar, hud;

  var meshes,
      tileSize = 256,
      meshSize = tileSize * 20,
      halfMeshSize = meshSize / 2,
      heightMap = 'img/heightmap.png',
      elevationLevel = 0.1;

  var SCREEN_HEIGHT = window.innerHeight;
  var SCREEN_WIDTH = window.innerWidth;

  var info = document.getElementById('info');

  var isPaused = false;

  // go:
  init();

  function init () {

    /* Scene & Camera */
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xefd1b5, 0.001);
    //scene.fog = new THREE.Fog(0xefd1b5, halfMeshSize / 4, halfMeshSize);

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.z = 1000;
    camera.far = halfMeshSize;

    //camera = new THREE.PerspectiveCamera(45, SCREEN_WIDTH / SCREEN_HEIGHT);
    camera.position.y = 100;
    scene.add(camera);

    /* Input */
    var inputController = new InputController(bindings);
    inputController.registerDeviceHandler(MouseHandler, 'mouse');
    inputController.registerDeviceHandler(Keyboardhandler, 'keyboard');

    inputController.deviceHandlers.mouse.invertYAxis = true;

    // this is where we can read input data from:
    input = inputController.input;

    /* Controls */
    controls = new Controls(camera, inputController.input);

    cannon = new Cannon(camera, scene, input);

    /* Renderer */

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.sortObjects = false;
    renderer.setSize( window.innerWidth, window.innerHeight );

    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    scene.add( new THREE.AmbientLight( 0x505050 ) );

    sun = new THREE.DirectionalLight(0xffffff, 1);
    //sun = new THREE.SpotLight( 0xffffff, 1.5 );
    sun.position.set( 0, 500, 2000 );
    sun.position.set( 1000, 500, 2000 );
    sun.position.set( camera.position.x + 1000, camera.position.y + 1000, camera.position.z + 1000);
    sun.castShadow = true;

    sun.shadowCameraNear = 0;
    sun.shadowCameraFar = meshSize; //camera.far;
    sun.shadowCameraFov = 50;

    sun.shadowBias = -0.00022;
    sun.shadowDarkness = 0.5;

    sun.shadowMapWidth = 2048;
    sun.shadowMapHeight = 2048;

    sun.target = camera;

    scene.add( sun );

    /* HUD */

    hud = {
      horizon: document.getElementById('horizon')
    };

    /* Ground */

    var img = new Image();
    img.onload = function () {
      meshes = terrainGenerator.build(img, meshSize, tileSize, elevationLevel, scene);
      onTerrainLoaded();
    };
    img.src = heightMap;

    window.addEventListener('resize', onResize, false);
    document.addEventListener('dblclick', function(){
      document.documentElement.requestFullScreen();
      GameShim.supports.pointerLock && document.documentElement.requestPointerLock();
    }, false);
  }

  function onTerrainLoaded () {

    var container = document.getElementById('container');
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.domElement);

    infiniteGround = new InfiniteGround(camera, meshes, meshSize);

    /* Targets */
    targets = [];
    createTargets();
    cannon.setTargets(targets);

    lastTime = +new Date();
    animate(lastTime);
  }

  function onResize () {
    SCREEN_HEIGHT = window.innerHeight;
    SCREEN_WIDTH = window.innerWidth;
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();
  }

  function animate(time){
    if(isPaused){
      return;
    }

    var delta = time - lastTime;
    lastTime = time;

    requestAnimationFrame(animate);

    render(delta);
  }

  function render (delta) {

    controls.update(delta);

    infiniteGround.update();

    cannon.update(delta);

    sun.position.set( camera.position.x + 2000, camera.position.y + 2000, camera.position.z + 2000);

    var style;
    style = hud.horizon.style;

    this.forward = new THREE.Vector3(0, 0, -1);
    this.up = new THREE.Vector3(0, 1, 0);
    this.right = new THREE.Vector3();

    this.forwardVec = new THREE.Vector3(0, 0, -1);
    this.upVec = new THREE.Vector3(0, 1, 0);

    // set Forward, Right and Up plane vectors
    camera.quaternion.multiplyVector3(this.forwardVec, this.forward).normalize();
    camera.quaternion.multiplyVector3(this.upVec, this.up).normalize();
    this.right.cross(this.forward, this.up).normalize();

    var rotation = new THREE.Vector3().setEulerFromRotationMatrix(camera.matrix);

    renderer.render(scene, camera);

    stats.update(delta * 1000);

    var heightOverGround = camera.position.y - terrainGenerator.getHeightAt(camera.position.x, camera.position.z);
    if(heightOverGround <= 0){
      //isPaused = true;
      //alert('You crashed. Ts, ts, ts.');
    }

/*
    info.innerHTML = 'Pos: ' + camera.position.x.toFixed(0) + ' | ' + camera.position.z.toFixed(0) + ' <br>' +
      'Height: ' + ( heightOverGround / 10 ).toFixed(2);
*/

  }

  function createTargets() {
      var geometry = new THREE.SphereGeometry(20); // new THREE.CubeGeometry(20, 20, 20);

      for (var i = 0; i < targetsLeft; i++) {

          var object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));

          object.position.x = Math.random() *  2000 - 1000;
          object.position.z = Math.random() * -3000 - ( i * 500 );
          object.position.y = terrainGenerator.getHeightAt(object.position.x, object.position.z) + 20;

          object.rotation.x = ( Math.random() * 360 ) * Math.PI / 180;
          object.rotation.y = ( Math.random() * 360 ) * Math.PI / 180;
          object.rotation.z = ( Math.random() * 360 ) * Math.PI / 180;

          //object.scale.x = Math.random() * 2 + 1;
          //object.scale.y = Math.random() * 2 + 1;
          //object.scale.z = Math.random() * 2 + 1;

          object.castShadow = true;
   			  object.receiveShadow = false;

          object.hitCounter = 0;
          object.isHit = false;

          targets.push(object);
          scene.add(object);
      }
  }

});
