import 'styles/index.scss';
import { radians, map, distance } from './helpers';
import {data} from './data.js';

import { TweenLite } from 'gsap/TweenMax';
import InteractiveControls from './vendor/InteractiveControls';

const glslify = require('glslify');

export default class App {
  setup() {
  //3D STUFF
    this.meshes = []; //objects we need to worry about for interaction
    this.grid = { rows: 5, cols: 5 };
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.mouse3D = new THREE.Vector2();
    this.effect = new THREE.ShaderPass();
    this.rgbeffect = new THREE.ShaderPass();

    this.raycaster = new THREE.Raycaster();
    this.testCube = new THREE.Mesh();
    this.mouse = new THREE.Vector2();
    this.target = new THREE.Vector2();
    this.windowHalf = new THREE.Vector2( window.innerWidth / 2, window.innerHeight / 2 );
    this.movableLight = new THREE.PointLight();
    this.mixer = new THREE.AnimationMixer();
    this.clock = new THREE.Clock(true);
    this.animatedmesh = new THREE.Mesh();
    this.mixers = [];
    this.animatedMeshes = [];
    this.roomModels = [];

    //LIGHTS----------
    this.led = new THREE.PointLight();
    this.halogen = new THREE.PointLight();
    this.fluorescent = new THREE.PointLight();
    this.pinkneon = new THREE.PointLight();
    this.whiteneon = new THREE.PointLight();
    this.bluelight = new THREE.PointLight();
    this.sunlight = new THREE.PointLight();

    this.allLights = [this.led, this.halogen, this.fluorescent, this.pinkneon, this.whiteneon, this.bluelight, this.sunlight]
    //--------------------------------

    this.interactiveMeshes = []; //repel
    this.hoverMeshes = [];
    this.particleMeshes = [];

    this.audio = null;
    this.audioVolume = 0.7;
    this.textureCube = null;
    this.videoTexs = [];

    this.interactive = new InteractiveControls(); //failed - for now
    this.dustscreen = null;

    //LOGIC
    this.loadingHasStarted = false;
    this.middleMenuIsUp = true;
    this.midMenuIndex = 0;
    this.currentRoom = 0;
    this.scl = 0;
    this.hasTransitioned = false;
    this.mouseDown = false;
    this.triggerRGB = false;
    this.readyToChangeRooms = false;
    this.mousedownTimeout = null;
    this.currentKey = Object.keys(data)[0];
    this.setupLights = false;
    this.lightsAreImmediateSetting = true;

    //UI
    $('.dots li').first().addClass('active');
    $('.bottomTitle .dots li').first().addClass('active');
    $('.parallax img').each(function() {
      $(this).hide();
    });
  }

  createScene() {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(new THREE.Color(0, 0, 0));

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    //this.renderer.shadowMap.type = THREE.PCFShadowMap;

    var element = this.renderer.domElement;
    document.body.appendChild(element);
    element.className += " mainCanvas";

  }

  addModelToScene(position, string, isCam)
  {
    var localThis = this;

  var material = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    roughness: 0.5,
    metalness: 0.0
});

//---------------------------------
//GLTF LOADER
var loader = new THREE.GLTFLoader();
// const decoder = require('draco3dgltf').createDecoderModule();

// loader.setDRACOLoader(decoder);

//https://blackthread.io/gltf-converter/
loader.load(
  // resource URL
  string,
  // called when the resource is loaded
  function ( gltf ) {

    localThis.scene.add(gltf.scene);

    //gltf.scene.visible = true;

    gltf.scene.position.set(position);
    //gltf.scene.position.set(10,10,10);

    //gltf.scene.scale.set(0.1,0.1,0.1);

    gltf.scene.traverse(function (node) {
    if (node.isMesh)
    {
      node.material = material;
      node.castShadow = true;
      node.receiveShadow = true;

      // if(isCam)
      // {
      //   localThis.camera.
      // }
    }
  });


//constants
    // gltf.animations; // Array<THREE.AnimationClip>
    // gltf.scene; // THREE.Scene
    // gltf.scenes; // Array<THREE.Scene>
    // gltf.cameras; // Array<THREE.Camera>
    // gltf.asset; // Object

//Camera mixer
    localThis.mixer = new THREE.AnimationMixer(gltf.scene);

      //Play all
      if(gltf.animations)
      {
        var clips = gltf.animations;
        //console.log(clips);

        // clips.forEach( function ( clip ) {
        //      localThis.mixer.clipAction( clip ).play();
        //     } );
      //  Play a specific animation
          var clip = THREE.AnimationClip.findByName( clips, "camMove" );
          var action = localThis.mixer.clipAction( clip );
          action.loop = THREE.LoopOnce;
          action.play();
      }

  },
  // called while loading is progressing
  function ( xhr ) {

    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

  },
  // called when loading has errors
  function ( error ) {

    console.log( 'An error happened' +error);

  }
);

}

//--------------------------------------------------------
  createCamera() {


    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
  	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
  	this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.camera.position.set(0, 4, 9);

    this.scene.add(this.camera);
  }

  roomTransition()
  {
    //https://greensock.com/ease-visualizer/
    var animation = new TimelineLite()
    animation.to(this.camera.position, .4, {
      ease: Expo.easeOut,
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z - 3,
    }).to(this.camera.position, 1.5, {
      ease: Elastic.easeOut.config(1, 0.5),
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: 9,
    });

    console.log("GOING TO ROOM "+this.currentRoom);
    this.updateCurrentRoom();
    //this.roomModels[0].position.set(0, 8, 0);

  }

  addAmbientLight() {
    const light = new THREE.AmbientLight('#ffffff', 1);

    this.scene.add(light);
  }

  addDistanceAffectLight()
  {
    var light = new THREE.PointLight(0xe66d00, 1);
    light.castShadow = true;
    light.shadow.radius = 10;

    // light.position.set(0, 4, 5); //-0.016651358914349323, 1.0135781033773235, -0.24438868304759298
    light.position.set(-0.2, 4, 6);
    this.distanceBrightLight = light;
    this.scene.add(this.distanceBrightLight);

    var helper = new THREE.PointLightHelper(this.distanceBrightLight, 1);
    //this.distanceBrightLight.add( helper );
  }

//FOLLOWS MOUSE
  addPointLight(color, position) {
    this.movableLight = new THREE.PointLight('#ffffff', 0.5, 1000, 1); //2nd num is intensity

    this.movableLight.position.set(position.x, position.y, position.z);

    //this.scene.add(this.movableLight);

    var helper = new THREE.PointLightHelper(this.movableLight, 1);

    //this.movableLight.add( helper );
  }

  applyTVShader()
  {

    this.uniforms = {
      u_time : {
        type : "f",
        value : 0.0
      },
      u_frame : {
        type : "f",
        value : 0.0
      },
      u_resolution : {
        type : "v2",
        value : new THREE.Vector2(window.innerWidth, window.innerHeight)
            .multiplyScalar(window.devicePixelRatio)
      },
      u_mouse : {
        type : "v2",
        value : new THREE.Vector2(0.5 * window.innerWidth, window.innerHeight)
            .multiplyScalar(window.devicePixelRatio)
      },
      u_texture : {
        type : "t",
        value : null
      }
    };

    // postprocessing
		var material = new THREE.ShaderMaterial({
			uniforms : this.uniforms,
			vertexShader : document.getElementById("vertexShader").textContent,
			fragmentShader : document.getElementById("fragmentShader").textContent
		});

		// Initialize the effect composer
		this.composer = new THREE.EffectComposer(this.renderer);
		this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));

		// Add the post-processing effect
		this.effect = new THREE.ShaderPass(material, "u_texture");
		this.effect.renderToScreen = true;
		this.composer.addPass(this.effect);

  }

  applyRGBShader() //goes AFTER Tv shader
  {
    // postprocessing
    var material = new THREE.ShaderMaterial({
      uniforms : this.uniforms,
      vertexShader : document.getElementById("vertexShader-rgb").textContent,
      fragmentShader : document.getElementById("fragmentShader-rgb").textContent
    });

    // Initialize the effect composer
    //this.composer = new THREE.EffectComposer(this.renderer);
    if(this.composer)
    {
      this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));

      // Add the post-processing effect
      this.rgbeffect = new THREE.ShaderPass(material, "u_texture");
      this.rgbeffect.renderToScreen = true;
      this.composer.addPass(this.rgbeffect);
    }
  }

  addFloor() {
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.ShadowMaterial({ opacity: .3 });

    this.floor = new THREE.Mesh(geometry, material);
    this.floor.position.y = 0;
    this.floor.receiveShadow = true;
    this.floor.rotateX(- Math.PI / 2);

    this.scene.add(this.floor);
  }

  playAudio(){

    if(!this.audio)
    {
      this.audio = new Audio("./src/resources/test.mp3");
      this.audio.loop = true;
      this.audio.autoplay = true;
    } else {
      this.audio.autoplay = true;
    }

  }

  runParallax()
  {
    var scene = document.getElementsByClassName('parallax')[0];
    var parallaxInstance = new Parallax(scene);
    parallaxInstance.friction(0.05, 0.05);
    parallaxInstance.relativeInput = true;

  }

//FOR INTRO
  switchSiteVideo()
  {
    //switch opening video > images

    $('.parallax video source').each(function(){
        $(this).attr('src', '')
    });
  $('.parallax video').remove();

    $('#bgVideo').each(function(){
        $(this).attr('src', './src/images/glitchbg.mp4')
    });

    $('.parallax img').each(function() {
      $(this).show();
    });
  }

//initial loading
  doneLoading()
  {

  var localThis = this;
  setTimeout( function(){
    localThis.switchSiteVideo();
  }  , 0);

  setTimeout( function(){
    localThis.forceDoneLoading(); //end w song

  }  , 13000);

  }

//To actual experience
  forceDoneLoading()
  {
    $(".frame").show();
    $(".mainCanvas").show();
    $(".loadingScreen").hide();

    $('#bgVideo').each(function(){
        $(this).attr('src', '')
    });
    $('#bgVideo').remove();

    $('#myVideo').each(function(){
        $(this).attr('src', '../src/images/interstit.webm')
    });
  }

  toggleVideo()
  {
    $(".mainCanvas").toggle();
    //$("#myVideo").toggle();
  }
  makeIntoShape()
  {

    //LOCAL VARS---------------
    var localThis = this;
    var particleMeshes = [];
    var pScale = 0.3;
    const meshParams = {
      color: '#ff00ff',
      metalness: .58,
      emissive: '#222222',
      roughness: .18,
    };

    var particleContainer = new THREE.Object3D();

    const material = new THREE.MeshPhysicalMaterial(meshParams);
    var loader = new THREE.ObjectLoader();
//---------------------------------

    loader.load(
    	// DEBUG
      "./src/scripts/elements/Icosphere.json",

      //DEPLOY
    	//"https://dojusticeandlettheskiesfall.firebaseapp.com/elements/Icosphere.json",

    	function ( obj ) {

        var geoFromScene = new THREE.Geometry();

    		//localThis.scene.add( obj );
        obj.position.set(0, 4, 0);
        obj.scale.set(3, 3, 3);

        obj.traverse( function (child){
          if(child.isMesh)
          {

                geoFromScene = (new THREE.Geometry()).fromBufferGeometry(child.geometry);
                //console.log(geometry.vertices.length);
          }
});

        var particleCount = geoFromScene.vertices.length;

        for (var p = 0; p < particleCount; p ++) {
            // var particle = model.geometry.vertices[p];
            // particles.vertices.push(particle);

            //console.log(geometry2.vertices[p].x); //Test get a vertex

            const geometry = localThis.getRandomGeometry();
            const mesh = localThis.getMesh(geometry.geom, material);

            mesh.position.set(geoFromScene.vertices[p].x, geoFromScene.vertices[p].y, geoFromScene.vertices[p].z);
            mesh.scale.set(pScale, pScale, pScale);
            // mesh.position.set(col + (col * this.gutter.size), 0, row + (row * this.gutter.size));
            mesh.rotation.x = geometry.rotationX;
            mesh.rotation.y = geometry.rotationY;
            mesh.rotation.z = geometry.rotationZ;

            // store the initial values of each element so we can animate back
            mesh.initialRotation = {
              x: mesh.rotation.x,
              y: mesh.rotation.y,
              z: mesh.rotation.z,
            };
            mesh.initialPosition = {
              x: mesh.position.x,
              y: mesh.position.y,
              z: mesh.position.z,
            };
            mesh.initialScale = pScale;

            //do if statement - if there isn't already a particle at this location

            var canAdd = true;
            particleMeshes.forEach(function(s) {
              //console.log(s.position);
              if(s.position.equals(mesh.position))
              {
                canAdd = false;
              }

              });

              if(canAdd)
              {
                particleMeshes.push(mesh);
                  particleContainer.add(mesh);
              }
            // store the element inside our array so we can get back when need to animate
            //localThis.meshes[0][p] = mesh;

        } //end of for
        particleContainer.scale.set(8, 8, 8);
        particleContainer.position.set(0, 8, 0);
        localThis.scene.add(particleContainer);

    	},

    	// onProgress callback -------------------------------
    	function ( xhr ) {
    		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
    	},

    	// onError callback
    	function ( err ) {
    		console.error( 'Sky - An error happened' );
    	}
    );
    //assign to global array
    //this.overallParticleMeshes = particleMeshes;
    //this.overallParticleContainer = particleContainer; //is groupmesh

  }

  getRandomGeometry() {
    return this.geometries[Math.floor(Math.random() * Math.floor(this.geometries.length))];
  }

  addTextureAnimationObject(key, parent)
  {

      if(key == 'dust')
      {
        //DUSTMOTES ** these are the correct settings for alpha channel
        var video = document.createElement( 'video' );
        video.src = './src/images/dust2.webm'; //dust2
        video.load(); // must call after setting/changing source
        video.preload = 'auto';
        video.loop = true;
        video.autoload = true;
        video.transparent = true;
        video.playbackRate = 0.8; //1.06

        this.videoTexs[this.videoTexs.length] = video;


        var texture = new THREE.VideoTexture( video );
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBAFormat;

        var runnerMaterial = new THREE.MeshBasicMaterial( { map: texture, transparent: true, side:THREE.DoubleSide, alphaTest: 0 } );
        //var runnerMaterial = new THREE.MeshBasicMaterial( { color: '0xff0000'} );
        var runnerGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
        runnerMaterial.transparent = true;
        this.dustscreen = new THREE.Mesh(runnerGeometry, runnerMaterial);
        this.dustscreen.position.set(0,4,8);
        this.dustscreen.scale.set(1.4,1,-1);

      //this.scene.add(this.dustscreen);

      }
  }

  addTestObject()
  {

    const geometry = new THREE.BoxBufferGeometry();
    var material = new THREE.MeshPhongMaterial({
			color : 0xffffff,
			precision: "mediump"
		});

this.testCube.geometry = geometry;
	geometry.computeVertexNormals();
this.testCube.material = material;

//this.testCube.scale.set(15,15,15);
this.testCube.position.set(0,5,0);
this.scene.add(this.testCube);

  }

glowSphere()
  {
//https://stemkoski.github.io/Three.js/Shader-Glow.html
var geometry = new THREE.SphereGeometry( 30, 32, 16 );
    var material = new THREE.MeshLambertMaterial( { color: 0x000088 } );
    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set(0,3,-10);
    mesh.scale.set(0.1,0.1, 0.1);
    this.scene.add(mesh);

    var spriteMaterial = new THREE.SpriteMaterial(
    {
      map: new THREE.TextureLoader().load( './src/images/glow.png' ),
      color: 0xffff00, transparent: true, blending: THREE.AdditiveBlending,
    });
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(200, 200, 1.0);
    mesh.add(sprite);
}

addParticleEngine(parameters)
{
  var engine = new ParticleEngine();
  // engine.setValues( Examples.fountain );

  engine.position.set(0,5,0);
    engine.setValues(parameters);
  engine.initialize();

}
getMaterial(string, room) //**NOTE - flip all textures vertically, idk why
{

  //DEFAULT
  var material = new THREE.MeshStandardMaterial({
    color: 0x424242,
    roughness: 0.8,
    metalness: 0,
    //normalMap: materials.normalMap,
    //roughnessMap: materials.roughnessMap,
    //metalnessMap: materials.metalnessMap,
    //envMap: me.reflectionCube,
    flatShading: true,
    skinning: true
  });

if(string.toLowerCase().includes('screenroom1'))
{
    var video = document.createElement( 'video' );
    video.src = './src/images/computerscreen.webm'; //try w fire if cant see it
    video.load(); // must call after setting/changing source
    video.preload = 'auto';
    video.loop = true;
    video.autoload = true;
    video.transparent = true;
    video.playbackRate = 1.06; //1.06

    this.videoTexs[this.videoTexs.length] = video;


    var texture = new THREE.VideoTexture( video );
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;

    material = new THREE.MeshStandardMaterial({
        map: texture,
        emissive: 0xb5b5b5,
        emissiveMap: texture,
        roughness: 0,
        metalness: 0.2,
        skinning: true
      });

}
  else if(string.toLowerCase().includes('glass'))
  {

//------------------------------------------------------------
//DEFAULT - assign room skybox cubemap
    // var imagePrefix = "./src/images/cubemap-";
    // var directions  = ["back", "front",  "front", "bottom",  "front",  "front"];
    var imagePrefix = "./src/images/lmcity_";
    var directions  = ["bk", "ft",  "up", "dn",  "rt",  "lf"];
    var imageSuffix = ".png";
    var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );

    this.urls = [];
    for (var i = 0; i < 6; i++)
      this.urls.push( imagePrefix + directions[i] + imageSuffix );

    var materialArray = [];
    for (var i = 0; i < 6; i++)
      materialArray.push( new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load( imagePrefix + directions[i] + imageSuffix ),
        side: THREE.BackSide
      }));
      this.textureCube = new THREE.CubeTextureLoader().load(this.urls);
      this.textureCube.mapping = THREE.CubeRefractionMapping;

        var fShader = THREE.FresnelShader;
        var fresnelUniforms =
        {
          "mRefractionRatio": { type: "f", value: 1.02 },
          "mFresnelBias": 	{ type: "f", value: 0.1 },
          "mFresnelPower": 	{ type: "f", value: 2.0 },
          "mFresnelScale": 	{ type: "f", value: 1.0 },
          "tCube": 			{ type: "t", value: this.textureCube} //textureCube
        };


//Option 01- Hiding a screen
      // if(!string.toLowerCase().includes('screenroom1'))
      // {
   //later - thing doesnt work
      // }

      //---------------------------------------------------



      // create custom material for the shader
      material = new THREE.ShaderMaterial(
      {
          uniforms: 		fresnelUniforms,
        vertexShader:   fShader.vertexShader,
        fragmentShader: fShader.fragmentShader,
        skinning: true
      }   );
  } else if(string.toLowerCase() == "mirror".toLowerCase())
  {
      material = new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        roughness: 0,
        metalness: 1,
        //normalMap: materials.normalMap,
        //roughnessMap: materials.roughnessMap,
        //metalnessMap: materials.metalnessMap,
        envMap: this.textureCube,
        skinning: true
      });
  }
  else if(string.toLowerCase().includes('fire'))
  {
    var video = document.createElement( 'video' );
    video.src = './src/images/firealpha.webm'; //USE FIREALPHA
    video.load(); // must call after setting/changing source
    video.preload = 'auto';
    video.loop = true;
    video.autoload = true;
    video.transparent = true;
    video.playbackRate = 1.4; //1.06

    this.videoTexs[this.videoTexs.length] = video;


    var texture = new THREE.VideoTexture( video );
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;

    var runnerMaterial = new THREE.MeshBasicMaterial( { map: texture, transparent: true, side:THREE.DoubleSide, alphaTest: 0 } );
    runnerMaterial.transparent = true;

    material = runnerMaterial;
  }
  else if(string.toLowerCase().includes('metal'))
  {

    // var texture = new THREE.TextureLoader().load( './src/images/Deadends_room2mat.png' );
      material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.2,
        metalness: 1,
        skinning: true
      });
  }

  return material;
}


updateLights()
{

    //GET DATA FROM HELPER FILE
    //console.log('DATA: '+data['02-22-20_11:00AM'][0][0]);

if(!this.setupLights){ //check so dont repeat
var teststr = '';

  var localThis = this;

  var dictLength = Object.keys(data).length*10;

  this.allLights.forEach(function(l) {
      l.aggregateIntensity = 0;
      l.intensity = 0;

        Object.keys(data).forEach(function(key) {
        //console.log(key, data[key]);
        if(data[key][0].includes(l.name)){

          l.aggregateIntensity = (((l.aggregateIntensity)*dictLength)+data[key][1])/(dictLength);
        }
    });
    //console.log(l.name+' | '+l.aggregateIntensity*10);
  });

  //To set individual point:
  this.allLights.forEach(function(l) {
    if(data[localThis.currentKey][0].includes(l.name)){
      l.intensity = data[localThis.currentKey][1];
    }

    //check
    //console.log(l.name+" = "+l.intensity);
  });

  this.setupLights = true;

  var localThis = this;

  console.log("intensity "+this.led.intensity);
  console.log("aggregate"+this.led.aggregateIntensity);
}

}

connectToMysql()
{
  // var mysql = require('mysql');
  // var connection = mysql.createConnection({
  //   host     : 'localhost',
  //   user     : 'root',
  //   password : '',
  //   database : 'SkylarData'
  // });
  //
  // connection.connect();
  //
  // connection.query('SELECT * from LightingTypes', function(err, rows, fields) {
  //   if (!err)
  //   {
  //       console.log('The solution is: ', rows);
  //   }
  //   else
  //     console.log('Error while performing Query.');
  // });
  //
  // connection.end();
}

//change from aggregate to immediate
switchLightIntensitySetting(isImmediate)
{
  this.lightsAreImmediateSetting = isImmediate;
  console.log('Changing to immediate: '+isImmediate)

  var localThis = this;
  // if(!isImmediate)
  // {
  //   this.allLights.forEach(function(l) {
  //     if(data[localThis.currentKey][0].includes(l.name)){
  //       l.intensity = l.aggregateIntensity;
  //     }
  //   });
  // } else {
  //   this.allLights.forEach(function(l) {
  //     if(data[localThis.currentKey][0].includes(l.name)){
  //       l.intensity = data[localThis.currentKey][1];
  //     }
  //   });
  // }

}

addRoomToScene(i, string)
{
      //ADD MODEL
      var localThis = this;

    //---------------------------------
    //GLTF LOADER
    var loader = new THREE.GLTFLoader();

    //https://blackthread.io/gltf-converter/
    loader.load(
    // resource URL
    string,
    // called when the resource is loaded
    function ( gltf ) {


      localThis.scene.add(gltf.scene);

      //ADD TO DICTIONARY***
      gltf.scene.pathName = string;
      gltf.scene.index = i;
      localThis.roomModels[i] = gltf.scene; //set to parent node


      gltf.scene.position.set(-0.2,3,6); //0,3,6
      gltf.scene.scale.set(0.2,0.2,0.2);

      gltf.scene.updateMatrixWorld(true);
      gltf.scene.traverse(function (node) {

      //Assign lights----------------------
      if(node.name.toLowerCase() == 'led')
      {
        localThis.led = node;
        // node.intensity = 4.2;
      } else if (node.name.toLowerCase() == 'halogen'){
        localThis.halogen = node;
      }
      else if (node.name.toLowerCase() == 'sunlight'){
        localThis.sunlight = node;
      }
      else if (node.name.toLowerCase() == 'bluelight'){
        localThis.bluelight = node;
      }
      else if (node.name.toLowerCase() == 'fluorescent'){
        localThis.fluorescent = node;
      }
      else if (node.name.toLowerCase() == 'white neon'){
        localThis.whiteneon = node;
      }
      else if (node.name.toLowerCase() == 'pink neon'){
        localThis.pinkneon = node;
      }

      localThis.led.name = 'led';
      localThis.halogen.name = 'halogen';
      localThis.pinkneon.name = 'pink neon';
      localThis.whiteneon.name = 'white neon';
      localThis.fluorescent.name = 'fluorescent';
      localThis.bluelight.name = 'bluelight';
      localThis.sunlight.name = 'sunlight';

//assuming none are null
      localThis.updateLights();
      //-------------------------------

      if (node.isMesh)
      {

        node.material = localThis.getMaterial(node.material.name, i);
        node.castShadow = true;
        node.receiveShadow = true;

        //**ADD TO INTERACTIVES ------------------------------------------------------>

        //0- nothing - dont move
        //1- (hover) - low speed no rotation
        //2- (repel) - medium rotation medium speed
        //3- (particles) - high rotation high speed


        if(node.name.includes('(hover)'))
        {
          localThis.hoverMeshes[localThis.hoverMeshes.length] = node;

          if(!node.initialPosition)
          {
            node.initialPosition = {
              x: node.position.x,
              y: node.position.y,
              z: node.position.z,
            }
          }
          if(!node.initialRotation)
          {
            node.initialRotation = {
              x: node.rotation.x,
              y: node.rotation.y,
              z: node.rotation.z,
            };
          }
        }
        else if(node.name.includes('(repel)'))
        {
              localThis.interactiveMeshes[localThis.interactiveMeshes.length] = node;
              if(!node.initialPosition)
              {
                node.initialPosition = {
                  x: node.position.x,
                  y: node.position.y,
                  z: node.position.z,
                }
              }
              if(!node.initialRotation)
              {
                node.initialRotation = {
                  x: node.rotation.x,
                  y: node.rotation.y,
                  z: node.rotation.z,
                };
              }
        }
        else if(node.name.includes('(particles)'))
        {
            localThis.particleMeshes[localThis.particleMeshes.length] = node;
            if(!node.initialPosition)
            {
              node.initialPosition = {
                x: node.position.x,
                y: node.position.y,
                z: node.position.z,
              }
            }
            if(!node.initialRotation)
            {
              node.initialRotation = {
                x: node.rotation.x,
                y: node.rotation.y,
                z: node.rotation.z,
              };
            }

        }
           //------------------------------------------------------------------->
     }
    });

      var myMixer = new THREE.AnimationMixer(gltf.scene);
      localThis.mixers[i] = myMixer;
      myMixer.hasClips = (gltf.animations.length > 0);
        //->PLAY ALL
        // console.log(string+" | "+myMixer.hasClips);
        // if(gltf.animations)
        if(gltf.animations.length > 0)
        {
          var clips = gltf.animations;
          //console.log(clips);

          clips.forEach( function ( clip ) {
               myMixer.clipAction( clip ).play();
              } );
        // -> PLAY A SPECIFIC CLIP
            // var clip = THREE.AnimationClip.findByName( clips, "mixamo.com" );
            // var action = localThis.mixer.clipAction( clip );
            // action.play();
            //action.loop = THREE.LoopOnce;
        }


        //END OF LOADING ----------------------------
        localThis.updateCurrentRoom();
    },
    // called while loading is progressing
    function ( xhr ) {

      //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

    },
    // called when loading has errors
    function ( error ) {

      console.log( 'An error happened' +error);

    }
    );
}

loadRoomModels()
{

  //skyboxes - http://www.custommapmakers.org/skyboxes.php

  //**When export to glb, make sure no missing images in material
  var paths = [
  "./src/scripts/elements/scene.glb"
];

  for(var i = 0; i<paths.length;i++)
  {
    //console.log('adding room '+i);
    this.addRoomToScene(i, paths[i]);

    if(i == 1)
    {
      this.addDistanceAffectLight();
    }

  }
}

updateCurrentRoom()
{
  var localThis = this;
  this.roomModels.forEach(function(obj) {
    obj.visible = (obj.index == localThis.currentRoom);
  });

  //this.distanceBrightLight.visible = (this.currentRoom == 1);
}

animatedTexturePngs()
{

  var alphaMap = new THREE.TextureLoader().load("./src/images/explosion.jpg"); //also use for diffuse

  var runnerMaterial = new THREE.MeshBasicMaterial( { map: alphaMap, alphaMap: alphaMap, transparent: true, side:THREE.DoubleSide, alphaTest: 0.5 } );
  runnerMaterial.alphaMap.magFilter = THREE.NearestFilter;
  runnerMaterial.alphaMap.wrapT = THREE.RepeatWrapping;
  runnerMaterial.alphaMap.repeat.y = 1;

  var runnerGeometry = new THREE.PlaneGeometry(5, 5, 1, 1);
  var runner = new THREE.Mesh(runnerGeometry, runnerMaterial);
  runner.position.set(0,1,0);
  this.scene.add(runner);

}

  glassSphere()
  {
    //*note for later - just render out a skybox of the scene then feed that into glass shader it will look ok

      var imagePrefix = "./src/images/dawnmountain-";
      var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
      var imageSuffix = ".png";
      var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );

      this.urls = [];
      for (var i = 0; i < 6; i++)
        this.urls.push( imagePrefix + directions[i] + imageSuffix );

      var materialArray = [];
      for (var i = 0; i < 6; i++)
        materialArray.push( new THREE.MeshBasicMaterial({
          map: new THREE.TextureLoader().load( imagePrefix + directions[i] + imageSuffix ),
          side: THREE.BackSide
        }));
          var textureCube = new THREE.CubeTextureLoader().load(this.urls);
  				textureCube.mapping = THREE.CubeRefractionMapping;


  				var cubeMaterial3 = new THREE.MeshPhongMaterial( { color: 0xccddff, envMap: textureCube, refractionRatio: 0.98, reflectivity: 0.9 } );
          var cubeMaterial2 = new THREE.MeshPhongMaterial( { color: 0xccfffd, envMap: textureCube, refractionRatio: 0.985 } );
				var cubeMaterial1 = new THREE.MeshPhongMaterial( { color: 0xffffff, envMap: textureCube, refractionRatio: 0.98 } );
    //------------------------

    this.refractSphereCamera = new THREE.CubeCamera( 0.1, 10000, 512 );
  	this.scene.add( this.refractSphereCamera );

  	var fShader = THREE.FresnelShader;

  	var fresnelUniforms =
  	{
  		"mRefractionRatio": { type: "f", value: 1.02 },
  		"mFresnelBias": 	{ type: "f", value: 0.1 },
  		"mFresnelPower": 	{ type: "f", value: 2.0 },
  		"mFresnelScale": 	{ type: "f", value: 1.0 },
  		"tCube": 			{ type: "t", value: textureCube} //textureCube
  	};

  	// create custom material for the shader
  	var customMaterial = new THREE.ShaderMaterial(
  	{
  	    uniforms: 		fresnelUniforms,
  		vertexShader:   fShader.vertexShader,
  		fragmentShader: fShader.fragmentShader
  	}   );

    const material3 = new THREE.MeshStandardMaterial( {

    color: 0xff0000,

    roughness: 0.3,
    metalness: 0.2
} );

  	var sphereGeometry = new THREE.SphereGeometry( 2, 64, 32 );
  	this.sphere = new THREE.Mesh( sphereGeometry, customMaterial);

  	//this.sphere.position.set(0,9,-10);
    this.sphere.position.set(0,20,0);

  	//this.scene.add(this.sphere);
    this.refractSphereCamera.position.set(new THREE.Vector3(0,0,0));
  	//this.refractSphereCamera.position.set(this.sphere.position);
  }

  getMesh(geometry, material) {
    const mesh = new THREE.Mesh(geometry, material);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

getRandomFloat(min, max, decimalPlaces) {
    var rand = Math.random()*(max-min) + min;
    var power = Math.pow(10, decimalPlaces);
    return Math.floor(rand*power) / power;
}

  getMouseDistance(mesh)
  {
    //mesh world pos
    var meshWorldPos = new THREE.Vector3();
    mesh.getWorldPosition(meshWorldPos);

    //mouse world pos
    var vector = new THREE.Vector3(this.mouse3D.x, this.mouse3D.y, 0.5); //0.5
    vector.unproject(this.camera );
    var dir = vector.sub(this.camera.position ).normalize();

    var pos = this.camera.position.clone().add( dir.multiplyScalar( 14.8) );

    const mouseDistance = distance
      (pos.x,
      pos.y,
      meshWorldPos.x,
      meshWorldPos.y);

    return mouseDistance;
  }

  draw() {
    this.raycaster.setFromCamera(this.mouse3D, this.camera);


//INTERACTIVES ANIMATE -------------------------------
  var localThis = this;
  if(!localThis.triggerRGB)
  {
      //1
      this.interactiveMeshes.forEach(function(mesh)
      {
              var mouseDistance = localThis.getMouseDistance(mesh);
              var duration = 0.6;

              const y = map(mouseDistance, 5, 0, 0, 5);

            TweenMax.to(mesh.position, duration, { y: y < 1 ? mesh.initialPosition.y : mesh.initialPosition.y+y });
              // TweenMax.to(mesh.position, .3, { y: y < 1 ? 1 : y });
              //TweenMax.to(mesh.position, .3, { y: y < 1 ? 1 : y });

              const scaleFactor = mesh.position.y / 2;
              const scale = scaleFactor < 1 ? 1 : scaleFactor;
              // TweenMax.to(mesh.scale, .3, {
              //   ease: Expo.easeOut,
              //   x: scale,
              //   y: scale,
              //   z: scale,
              // });

              // TweenMax.to(mesh.rotation, .9, {
              //   ease: Expo.easeOut,
              //   x: map(mesh.position.y, mesh.initialPosition.y, mesh.initialPosition.y+y, radians(270), mesh.initialRotation.x), //val 2 and 3 are the ranges that control rotation
              //   z: map(mesh.position.y, mesh.initialPosition.y, mesh.initialPosition.y+y, radians(-90), mesh.initialRotation.z),
              //   y: map(mesh.position.y, mesh.initialPosition.y, mesh.initialPosition.y+y, radians(45), mesh.initialRotation.y),
              // });

              TweenMax.to(mesh.rotation, duration-0.3, {
                x: y < 1 ? mesh.initialRotation.x : radians(45),
                y: y < 1 ? mesh.initialRotation.y : radians(180),
                z: y < 1 ? mesh.initialRotation.z : radians(0)
              });

              //WORKS!
              //TweenMax.to(mesh.rotation, .3, { y: y < 1 ? mesh.initialRotation.y : radians(45)});
      //
      }); //-----

    //2
      this.particleMeshes.forEach(function(mesh)
      {


        var mouseDistance = localThis.getMouseDistance(mesh);

        const y = map(mouseDistance, 3, 0, 0, 3);

        var changer = y;
        if(mesh.initialPosition.x > 0) //right side goes in
        {
          changer*=-1;
        }

      //TweenMax.to(mesh.position, 0.5, { x: y < 1 ? mesh.initialPosition.x : mesh.initialPosition.x+localThis.getRandomInt(changer-1,changer+1) });

        const scaleFactor = mesh.position.x / 1.2;
        const scale = scaleFactor < 1 ? 1 : scaleFactor;
        // TweenMax.to(mesh.scale, .3, {
        //   ease: Expo.easeOut,
        //   x: scale,
        //   y: scale,
        //   z: scale,
        // });
      });

      //3
      this.hoverMeshes.forEach(function(mesh)
      {
        var mouseDistance = localThis.getMouseDistance(mesh);
        var duration = 0.6;

        const y = map(mouseDistance, 5, 0, 0, 1.5);

      TweenMax.to(mesh.position, duration, { y: y < 1 ? mesh.initialPosition.y : mesh.initialPosition.y+y });
        // TweenMax.to(mesh.position, .3, { y: y < 1 ? 1 : y });
        //TweenMax.to(mesh.position, .3, { y: y < 1 ? 1 : y });

      });
  }
  }

  mouseIsCloseTo(object)
  {
    //console.log("Mouse is close to "+object.name);
  }

  init() {
    this.runParallax();

    this.connectToMysql();

    this.setup();

    this.doneLoading();

    this.createScene();

    this.createCamera();

    this.glassSphere();

    //this.particleemitter();

    //this.glowSphere();

    //this.loadRoomModels();

    this.applyTVShader();

  //  this.applyRGBShader();

    this.animate();

    //this.playAudio();

    //Interaction setup
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('touchmove', this.onTouchMove.bind(this), false);
    window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    window.addEventListener('keydown', this.onKeyDown.bind(this));
 window.addEventListener('mousedown', this.onMouseDown.bind(this));
 window.addEventListener('mouseup', this.onMouseUp.bind(this));
    window.addEventListener('click', this.onClick.bind(this));
    window.addEventListener('wheel', this.onScroll.bind(this), false);
    this.onMouseMove({ clientX: 0, clientY: 0 });


    //bind other divs
      var localThis = this;
      $('.endLoading').click(function(){
          localThis.forceDoneLoading();
      });

      $('.endLoading').hover(function(){
          $('.parallax img').each(function(num)
        {
          if(num == 4)
          {
            $(this).attr({ "src": "../src/images/enterbox-new.png" });
          }
        })
      });
      $('.endLoading').mouseleave(function() {
        $('.parallax img').each(function(num)
      {
        if(num == 4)
        {
          $(this).attr({ "src": "../src/images/percent-new.png" });
        }
      })
      });

    //stats
    //(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()

  }
  onScroll(event)
  {


  }

  clearRoomChange(){

    this.readyToChangeRooms = true;
    //console.log('READY');
  };

  onMouseDown(eventdata)
  {

    if(eventdata.which == 3) //right click
    {
      this.triggerRGB++;
    } else {
      //this.mousedownTimeout = setTimeout(this.clearRoomChange.bind(this), 2900);
      this.mouseDown++;
    }
  }
  onMouseUp(eventdata)
  {
    if(eventdata.which == 3) //right click
    {
      this.triggerRGB--;
    } else {
      clearTimeout(this.mousedownTimeout);


      //console.log(this.readyToChangeRooms);
      if(this.readyToChangeRooms)
      {
        this.triggerRoomChange();
        this.readyToChangeRooms = false;
      }
      this.mouseDown--;
    }
  }

  onClick({ clientX, clientY })
  {


    // console.log($('#audioplayer')[0]);
    //$('#audioplayer')[0].play(); //this will FUCK UP REST OF APP SKYLAR
      if(this.videoTexs.length > 0)
      {
        for(var i =0;i<this.videoTexs.length;i++)
        {
          this.videoTexs[i].play();
        }
      }
  }

  onMouseMove({ clientX, clientY }) {


    this.mouse3D.x = (clientX / this.width) * 2 - 1;
    this.mouse3D.y = -(clientY / this.height) * 2 + 1;
    //this.mouse3D.updateMatrixWorld(true);

    this.mouse.x = (clientX - this.windowHalf.x );
    this.mouse.y = (clientY - this.windowHalf.x );

    //track to mouse
  var vector = new THREE.Vector3(this.mouse3D.x, this.mouse3D.y, 0.5); //0.5
	vector.unproject( this.camera );
	var dir = vector.sub( this.camera.position ).normalize();
	var distance = - this.camera.position.z / dir.z;

	var pos = this.camera.position.clone().add( dir.multiplyScalar( 14.8) ); //distance = z distance

  //var lightPos = new THREE.Vector3(pos.x, pos.y, 6);
	this.movableLight.position.copy(pos);

  //SHADER
  // this.uniforms.u_mouse.value.set(this.mouse.x, window.innerHeight - this.mouse.y).multiplyScalar(
  //     window.devicePixelRatio);

    this.uniforms.u_mouse.value.set(clientX, clientY).multiplyScalar(
		window.devicePixelRatio);

  }

  onTouchMove({ clientX, clientY }) {

    // //shader
    // this.uniforms.u_mouse.value.set(event.touches[0].pageX, window.innerHeight - event.touches[0].pageY).multiplyScalar(
    //    window.devicePixelRatio);
  }
onKeyDown(event)
{

//Show aggregate view
if(event.key == 1)
{
  console.log('--AGGREGATE--');
  this.switchLightIntensitySetting(false);
}

//show immediate view
if(event.key == 2)
{
  console.log('--IMMEDIATE--');
  this.switchLightIntensitySetting(true);
}

  //do this when come in from loading

  this.forceDoneLoading(); //TEMP

    if(this.videoTexs.length > 0)
    {
      for(var i =0;i<this.videoTexs.length;i++)
      {
        this.videoTexs[i].play();
      }
    }

if(this.middleMenuIsUp)
{
    if(event.key == "ArrowRight")
    {
      if(this.midMenuIndex < 2)
      {
        this.midMenuIndex++;
      }
    } else if (event.key == "ArrowLeft")
    {
      if(this.midMenuIndex > 0)
      {
        this.midMenuIndex--;
      }
    }
    var self = this;
      $('.middleMenu .dots li').each(function(){

        if($(this).index() <= self.midMenuIndex)
        {
          $(this).addClass('active');
        } else {
          $(this).removeClass('active');
        }
      });
}

}

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.windowHalf.set( this.width / 2, this.height / 2 );

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.composer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setSize(this.width, this.height);

    if (this.interactive) this.interactive.resize();
		if (this.particles) this.particles.resize();

    //shader
    // Update the resolution uniform
		this.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight).multiplyScalar(window.devicePixelRatio);
  }

  render() {
    this.uniforms.u_time.value = this.clock.getElapsedTime();
    this.uniforms.u_frame.value += 1.0;
    this.composer.render();
	}

//UPDATE
  animate() {

    this.draw();

    const resistance = 0.002;
    this.target.x = ( 1 - this.mouse.x ) * resistance;
    this.target.y = ( 1 - this.mouse.y ) * resistance;

    this.camera.rotation.x += 0.05 * ( this.target.y - this.camera.rotation.x );
    this.camera.rotation.y += 0.05 * ( this.target.x - this.camera.rotation.y );

    //anything glass----------
    this.sphere.visible = false;
        //this.refractSphereCamera.clear();
        //this.refractSphereCamera.updateCubeMap( this.renderer, this.scene );
      //this.refractSphereCamera.update();
      this.sphere.visible = true;
    //-------------------------

//other logic ------------------------

//SHADERS
//this.effect.renderToScreen = this.mouseDown; //trigger shader w mousedown!
this.rgbeffect.renderToScreen = (this.triggerRGB && this.currentRoom == 1); //only certain rooms

// if(this.dustscreen)
// {
//     this.dustscreen.visible = (this.currentRoom == 0);
// }

if (this.particles) this.particles.update(this.clock.getDelta());

if(this.distanceBrightLight)
{
  var brightness = (1/(this.getMouseDistance(this.distanceBrightLight)*0.5)); //last val should up the intensity
  //console.log(this.getMouseDistance(this.distanceBrightLight));
  //console.log('light intensity -'+brightness);
  this.distanceBrightLight.intensity = brightness;
}


//--ANIMATE MODELS------------------------------
//this.mixer.update(this.clock.getDelta());

if(this.mixers.length > 0)
{
  for(var i = 0; i< this.mixers.length;i++)
  {
    if(this.mixers[i])
    {
      this.mixers[i].update(this.clock.getDelta());
    }
  }
}
//-------------------

//this.updateCurrentRoom(); //shows only one

//console.log(this.uniforms.u_frame);

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.animate.bind(this));

    //render shader
    this.render();

//UI
    var self = this;
      $('.bottomTitle .dots li').each(function(){

        if($(this).index() == self.currentRoom)
        {
          $(this).addClass('active');
        } else {
          $(this).removeClass('active');
        }
      });
  }
}
