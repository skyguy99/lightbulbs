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
    this.led = null;
    this.halogen = null;
    this.fluorescent = null;
    this.pinkneon = null;
    this.whiteneon = null;
    this.bluelight = null;
    this.sunlight = null;
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
    this.tester = 0;
    this.hasTransitioned = false;
    this.mouseDown = false;
    this.triggerRGB = false;
    this.readyToChangeRooms = false;
    this.mousedownTimeout = null;

    //For data
    this.currentKeydex = 0;
    this.currentKey = Object.keys(data)[0];
    this.setupLights = false;
    this.lightsAreImmediateSetting = true;
    this.currentDataPt = data[this.currentKey];
    this.infoIsUp = false;
    this.calIsUp = false;
    this.didMakeCal = false;

    //UI

    this.switchLightIntensitySetting(true);
    var localThis = this;
    $('.parallax img').each(function() {
      $(this).hide();
    });

    $('#plusBtn').click(function(){

      localThis.infoIsUp = !localThis.infoIsUp;
      var deg = localThis.infoIsUp ? 45 : 0;

       $('#plusBtn').css({ WebkitTransform: 'rotate(' + deg + 'deg)'});
  // For Mozilla browser: e.g. Firefox
       $('#plusBtn').css({ '-moz-transform': 'rotate(' + deg + 'deg)'});

       if(localThis.infoIsUp)
       {
         $('#center').hide();
         $('#centerInfo').show();
         $('#centerCalendar').hide();
       } else if (localThis.calIsUp)
       {
         $('#center').hide();
         $('#centerInfo').hide();
          $('#centerCalendar').show();
       }
       else {
         $('#center').show();
         $('#centerInfo').hide();
          $('#centerCalendar').hide();
       }
    })


    $('#showStrike').hover(function(){

      $('#strikedOut').css('display', 'inline-block');
      $(this).children().each(function(i, kid) {
        if(i == 0)
        {
          $(kid).css('transform', 'rotate(-45deg)');
        }
        $(kid).css('font-weight', '700');
      })
    })

    $('#showStrike').mouseleave(function(){

      $('#strikedOut').css('display', 'none');
      $(this).children().each(function(i, kid) {
        if(i == 0)
        {
          $(kid).css('transform', 'rotate(0deg)');
        }
        $(kid).css('font-weight', '400');
      })

    })

var localThis = this;
        $('#center > span').hover(function() {

          if(!localThis.lightsAreImmediateSetting)
          {
            $(this).children().each(function () {
              $(this).addClass('active');
            })
          }
        })

        $('#center > span').mouseout(function() {

          if(!localThis.lightsAreImmediateSetting)
          {
            $(this).children().each(function () {
              $(this).removeClass('active');
            })
        }
        })


    //---------------------------------------
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
    //localThis.forceDoneLoading(); //end w song

  }  , 13000);

  }

//To actual experience
  forceDoneLoading()
  {
    $(".frame").css('display', 'grid');
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

calculateColor(hex, intensity)
{
  //Version 4.0 https://jsfiddle.net/PimpTrizkit/a7ac0qvp/
  //https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
  const pSBC=(p,c0,c1,l)=>{
  	let r,g,b,P,f,t,h,m=Math.round,a=typeof(c1)=="string";
  	if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
  	h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=pSBC.pSBCr(c0),P=p<0,t=c1&&c1!="c"?pSBC.pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
  	if(!f||!t)return null;
  	if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
  	else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
  	a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
  	if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
  	else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
  }

  pSBC.pSBCr=(d)=>{
  	const i=parseInt,m=Math.round;
  	let n=d.length,x={};
  	if(n>9){
  		const [r, g, b, a] = (d = d.split(','));
  	        n = d.length;
  		if(n<3||n>4)return null;
  		x.r=i(r[3]=="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
  	}else{
  		if(n==8||n==6||n<4)return null;
  		if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
  		d=i(d.slice(1),16);
  		if(n==9||n==5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=m((d&255)/0.255)/1000;
  		else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
  	}return x
  };
  return pSBC(intensity, hex);
}

formatLimitDecimals(value, decimals) {
  value = value.toString().split('.')

  if (value.length === 2) {
    return Number([value[0], value[1].slice(0, decimals)].join('.'))
  } else {
    return Number(value[0]);
  }
}

updateEmoji()
{
  var emojis = ["-_-", ":|", ":]", "0-0"];
  var e = emojis[0];
  if(this.currentDataPt[1] <= 4.2)
  {
    e = emojis[0];
  } else if(this.currentDataPt[1] > 4.2 && this.currentDataPt[1] <= 7.2)
  {
    e = emojis[1];
  } else if (this.currentDataPt[1] > 7.2 && this.currentDataPt[1] <= 9.4)
  {
    e = emojis[2];
  }
  else {
    e = emojis[3];
  }
  $('#leftCol > h1').text(e);
}

updateLights()
{

var localThis = this;
var aggregateIntensities = {};
//console.log(this.calculateColor('#42c4fd', 0.8));

if(this.lightsAreImmediateSetting)
{
  //strikethrus
  $('#strikedOut').text('');
  var allLights = ['halogen', 'led', 'fluorescent', 'white neon', 'sunlight', 'bluelight'];

  this.updateEmoji();

  //spans
    $('#center').children().each(function(i, child) {

      if(localThis.currentDataPt[0].includes($(child).attr('name')))
      {
        $(child).addClass('active');
        allLights = allLights.filter(e => e !== $(child).attr('name'));

      } else {
        $(child).removeClass('active');
      }

      //update each light ----------------'

        var intensity = (localThis.currentDataPt[1])/10;
        var color = '#ffffff';

        var val = (localThis.currentDataPt[1]/10)*45;

        if($(child).attr('name') == 'halogen')
        {
          color = '#ffcc00';
        } else if ($(child).attr('name') == 'led') {
          color = '#ffffff';
        }
        else if ($(child).attr('name') == 'sunlight') {
          color = '#feffd4';
        }
        else if ($(child).attr('name') == 'white neon') {
          color = '#ff3dbe';
        }
        else if ($(child).attr('name') == 'bluelight') {
          color = '#75e6ff';
        }

        var fillColor = localThis.calculateColor(color, ((localThis.currentDataPt[1]/10)*45)/25);

        color = localThis.calculateColor(color, (localThis.currentDataPt[1])/18);

        $(child).find("feGaussianBlur").attr("stdDeviation", ((localThis.currentDataPt[1]/12)*45).toString());
        //document.getElementsByTagName("feGaussianBlur")[0].setAttribute("stdDeviation", ((localThis.currentDataPt[1]/10)*45).toString());

       var thing =  $(child).find('use')[0];
       var thing2 = $(child).find('use')[1];
       $(thing).css('fill', color);

       $(thing2).css('fill', fillColor);
       $(child).find('h5').text(localThis.currentDataPt[1]);
      //--------------------------------------

    })

    $('#strikedOut').text(allLights.join(' '));

} else {

//AGGREGATE -------------------------------------------------
  $('#strikedOut').text('');
  $('#center').children().each(function(i, child) {

    if(i <= 5) //ONLY THE LIGHTS
    {
      $(child).addClass('active');

      aggregateIntensities = {'halogen' : 0, 'sunlight': 0, 'bluelight': 0, 'white neon': 0, 'led': 0, 'fluorescent': 0};
      for (var key of Object.keys(data)) {
        //console.log(key + " -> " + data[key])
        data[key][0].forEach(function(name, i) {
          if($(child).attr('name') == name)
          {
            aggregateIntensities[name] += data[key][1];
          }
        })
      }

      for (var key of Object.keys(aggregateIntensities)) {
        aggregateIntensities[key] = localThis.formatLimitDecimals((aggregateIntensities[key]/Object.keys(data).length), 2); //avg
        if($(child).attr('name') == key)
        {
           $(child).find('h5').text(aggregateIntensities[key]);
        }
      }

      //update each light ----------------'

      //console.log(aggregateIntensities[$(child).attr('name')]);

        var color = '#ffffff';
        var intensity = (aggregateIntensities[$(child).attr('name')]/10)*45;

        if($(child).attr('name') == 'halogen')
        {
          color = '#ffe88a';
        } else if ($(child).attr('name') == 'led') {
          color = '#a8a8a8';
          intensity = 1;
        }
        else if ($(child).attr('name') == 'sunlight') {
          color = '#feffd4';
        }
        else if ($(child).attr('name') == 'white neon') {
          color = '#ffa8ee';
        }
        else if ($(child).attr('name') == 'bluelight') {
          color = '#75e6ff';
        }

        var fillColor = localThis.calculateColor(color, ((aggregateIntensities[$(child).attr('name')]/40)));
        color = localThis.calculateColor(color, (aggregateIntensities[$(child).attr('name')])/18);

        $(child).find("feGaussianBlur").attr("stdDeviation", (aggregateIntensities[$(child).attr('name')]/8)*45);

        console.log($(child).attr('name')+" | "+intensity);

       var thing =  $(child).find('use')[0];
       var thing2 = $(child).find('use')[1];
       $(thing).css('fill', color);
       $(thing2).css('fill', fillColor);
      //--------------------------------------

    }

  })
  //
  // $('#gauss3').attr("stdDeviation", '5');
  // $('#gauss2').attr("stdDeviation", '50');
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
  console.log('Changing to daily: '+isImmediate);

  var localThis = this;
  if(isImmediate)
  {
      $('#showStrike').css('display', 'inline-block');
      $('#aggregate').text('aggregate');
      $('#daily').text('[ daily ]');
      $('#daily').css("font-weight", "700");
      $('#aggregate').css("font-weight", "400");
      $('#dateLabel').text(localThis.currentKey);
      $('.scrollBar').show();
      $('.scrollBar > h1').text(this.currentDataPt[1]);

  } else {
    $('.scrollBar').hide();
    $('#showStrike').css('display', 'none');
    $('#aggregate').text('[ aggregate ]');
    $('#daily').text('daily');
    $('#daily').css("font-weight", "400");
    $('#aggregate').css("font-weight", "700");
    $('#dateLabel').text('---');
  }
  this.updateLights();

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

      // localThis.led.name = 'led';
      // localThis.halogen.name = 'halogen';
      // localThis.pinkneon.name = 'pink neon';
      // localThis.whiteneon.name = 'white neon';
      // localThis.fluorescent.name = 'fluorescent';
      // localThis.bluelight.name = 'bluelight';
      // localThis.sunlight.name = 'sunlight';

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

    //updates current immediate

    if(this.lightsAreImmediateSetting)
    {
      if(event.deltaY >= 0)
      {
        if(this.currentKeydex < Object.keys(data).length-1)
        {
          this.currentKeydex++;
        } else {
          this.currentKeydex = 0;
        }
      } else {
        if(this.currentKeydex > 0)
        {
          this.currentKeydex--;
        } else {
          this.currentKeydex = Object.keys(data).length-1;
        }
      }
      this.currentKey = Object.keys(data)[this.currentKeydex];
      this.currentDataPt = data[this.currentKey];

      //scrollBar
      var newY = ((Object.keys(data).indexOf(this.currentKey)+1)/(Object.keys(data).length))*650;
      $('.scrollBar').css('margin-top', newY.toString()+"%");

      //update visuals
      console.log(this.currentDataPt);

      this.updateLights();
      $('.scrollBar > h1').text(this.currentDataPt[1]);
      $('#dateLabel').text(this.currentKey);

    } else {

      $('.scrollBar > h1').text('');
      $('#dateLabel').text('---');

    }

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

  randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  toggleCalendar()
  {
    this.calIsUp = !this.calIsUp;
    this.switchLightIntensitySetting(false);
    var localThis = this;

    if(this.infoIsUp)
    {
      $('#center').hide();
      $('#centerInfo').show();
      $('#centerCalendar').hide();
    } else if (this.calIsUp)
    {
      $('#center').hide();
      $('#centerInfo').hide();
       $('#centerCalendar').show();
    }
    else {
      $('#center').show();
      $('#centerInfo').hide();
       $('#centerCalendar').hide();
    }

    if(!this.didMakeCal)
    {


      var html = '<div id = "innerCal">';
      var color = '';

     for (var key of Object.keys(data)) {
        //data[key]
        //categorize by small/big, just bring in color data from updateLights

        var svg = '';
        for(var light of data[key][0])
        {

          var i = Object.keys(data).indexOf(key);
          //update each light ----------------

            var intensity = (data[key][1])/10;
            var color = '#ffffff';

            if(light == 'halogen')
            {
              color = '#ffcc00';
            } else if (light == 'led') {
              color = '#ffffff';
            }
            else if (light == 'sunlight') {
              color = '#feffd4';
            }
            else if (light == 'white neon') {
              color = '#ff3dbe';
            }
            else if (light == 'bluelight') {
              color = '#75e6ff';
            }

            //vars
            var gauss = ((data[key][1]/12)*45).toString();
            var fillColor = localThis.calculateColor(color, ((data[key][1]/10)*45)/25);
            color = localThis.calculateColor(color, (data[key][1])/18);
            var width = '40px';

          //----------------------------------------------
          if(data[key][1] <= 4.2 || light == "white neon" || light == "led")
          {
            //small
            if(localThis.randomNumber(0, 1) == 0)
            {
              svg += `<svg width = ${'100px'} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 447 443"><defs><filter x="-50%" y="-50%" width="200%" height="200%" id="Blur${i}"><feGaussianBlur stdDeviation="${gauss}" /></filter><g id="Img${i}"><path class="cls-1" d="M211.91,215.84a5.47,5.47,0,0,0-5.09-3.64,7.48,7.48,0,0,0-5.43,2.22,7.59,7.59,0,0,0-1.65,7,16.37,16.37,0,0,0,3.85,6.83c3,3.6,8,7.18,12.93,5.17a9.49,9.49,0,0,0,5.33-11c-1.25-5.21-6.9-8.26-12-8.06a2.75,2.75,0,1,0,0,5.5c.39,0,.78,0,1.17,0l.47.05c-.68-.08.09,0,.19,0,.31.06.62.14.92.23l.67.23c-.46-.16,0,0,.2.1a8.13,8.13,0,0,1,.91.51l.48.33c-.09-.07-.39-.34,0,0s.55.53.82.81c.09.09.29.41,0,0,.13.19.26.38.38.58s.17.34.27.5c.22.36-.16-.57,0,.05a6.61,6.61,0,0,0,.24.9c.16.33,0-.64,0,0,0,.14,0,.28,0,.42s0,.34,0,.52c0,.71.11-.34,0,.19-.07.27-.12.54-.2.81a5.71,5.71,0,0,1-.21.58c0-.09.27-.51,0-.09s-.34.58-.53.87c.05-.08.39-.43.06-.08-.14.15-.27.3-.42.44s-.54.39-.19.16l-.21.13-.36.19c.52-.31.21-.07,0,0l-.55.14c-.14,0-.49,0,0,0-.21,0-.42,0-.63,0l-.37,0c.28,0,.31,0,.11,0-.36-.11-.73-.19-1.09-.31-.75-.26.26.14-.17-.08l-.58-.31c-.35-.2-.68-.42-1-.65s.47.41-.19-.15l-.62-.53a20.3,20.3,0,0,1-1.71-1.76c-.18-.2-.35-.41-.52-.62,0,0-.32-.4-.1-.11-.32-.42-.62-.85-.9-1.3a11.19,11.19,0,0,1-.64-1.12c0,.07-.34-.76-.21-.44s-.17-.52-.15-.45c-.06-.17-.1-.35-.15-.53,0,0-.11-.81-.08-.43s0-.49,0-.44V219c-.05.28-.05.26,0-.08,0-.14.09-.29.11-.43.11-.52-.28.42,0,0s0,0,0,0a4.3,4.3,0,0,0,.37-.37c.28-.3-.07.19-.15.1l.44-.28c.19-.11.47-.09.14-.09s-.22.09,0,0l.33-.11.33-.08c.53-.13-.6,0-.07,0a1.87,1.87,0,0,0,.41,0c.22,0-.66-.18-.11,0s-.09-.14-.15-.1a1.9,1.9,0,0,1,.39.23c0,.07-.49-.44-.22-.13-.66-.75.16.49-.2-.39a2.82,2.82,0,0,0,3.38,1.92c1.28-.42,2.51-2,1.92-3.39Z"/></g></defs><use style="fill:${color};" filter="url(#Blur${i})" xlink:href="#Img${i}"transform="translate(0,0)"/><use style="fill:${fillColor};" xlink:href="#Img${i}"/></svg>`
            } else {
                svg += `<svg width = ${'90px'} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 447 443"><defs><filter x="-50%" y="-50%" width="200%" height="200%" id="Blur${i}"><feGaussianBlur stdDeviation="${gauss}" /></filter><g id="Img${i}"><path class="cls-1" d="M211.91,215.84a5.47,5.47,0,0,0-5.09-3.64,7.48,7.48,0,0,0-5.43,2.22,7.59,7.59,0,0,0-1.65,7,16.37,16.37,0,0,0,3.85,6.83c3,3.6,8,7.18,12.93,5.17a9.49,9.49,0,0,0,5.33-11c-1.25-5.21-6.9-8.26-12-8.06a2.75,2.75,0,1,0,0,5.5c.39,0,.78,0,1.17,0l.47.05c-.68-.08.09,0,.19,0,.31.06.62.14.92.23l.67.23c-.46-.16,0,0,.2.1a8.13,8.13,0,0,1,.91.51l.48.33c-.09-.07-.39-.34,0,0s.55.53.82.81c.09.09.29.41,0,0,.13.19.26.38.38.58s.17.34.27.5c.22.36-.16-.57,0,.05a6.61,6.61,0,0,0,.24.9c.16.33,0-.64,0,0,0,.14,0,.28,0,.42s0,.34,0,.52c0,.71.11-.34,0,.19-.07.27-.12.54-.2.81a5.71,5.71,0,0,1-.21.58c0-.09.27-.51,0-.09s-.34.58-.53.87c.05-.08.39-.43.06-.08-.14.15-.27.3-.42.44s-.54.39-.19.16l-.21.13-.36.19c.52-.31.21-.07,0,0l-.55.14c-.14,0-.49,0,0,0-.21,0-.42,0-.63,0l-.37,0c.28,0,.31,0,.11,0-.36-.11-.73-.19-1.09-.31-.75-.26.26.14-.17-.08l-.58-.31c-.35-.2-.68-.42-1-.65s.47.41-.19-.15l-.62-.53a20.3,20.3,0,0,1-1.71-1.76c-.18-.2-.35-.41-.52-.62,0,0-.32-.4-.1-.11-.32-.42-.62-.85-.9-1.3a11.19,11.19,0,0,1-.64-1.12c0,.07-.34-.76-.21-.44s-.17-.52-.15-.45c-.06-.17-.1-.35-.15-.53,0,0-.11-.81-.08-.43s0-.49,0-.44V219c-.05.28-.05.26,0-.08,0-.14.09-.29.11-.43.11-.52-.28.42,0,0s0,0,0,0a4.3,4.3,0,0,0,.37-.37c.28-.3-.07.19-.15.1l.44-.28c.19-.11.47-.09.14-.09s-.22.09,0,0l.33-.11.33-.08c.53-.13-.6,0-.07,0a1.87,1.87,0,0,0,.41,0c.22,0-.66-.18-.11,0s-.09-.14-.15-.1a1.9,1.9,0,0,1,.39.23c0,.07-.49-.44-.22-.13-.66-.75.16.49-.2-.39a2.82,2.82,0,0,0,3.38,1.92c1.28-.42,2.51-2,1.92-3.39Z"/></g></defs><use style="fill:${color};" filter="url(#Blur${i})" xlink:href="#Img${i}"transform="translate(0,0)"/><use style="fill:${fillColor};" xlink:href="#Img${i}"/></svg>`
            }

          } else if (data[key][1] > 4.2)
          {
            //big
            if(localThis.randomNumber(0, 1) == 0)
            {
              svg += `<svg width = ${'60px'} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 447 443"><defs><filter x="-50%" y="-50%" width="200%" height="200%" id="Blur${i}"><feGaussianBlur stdDeviation="${gauss}" /></filter><g id="Img${i}"><path class="cls-1" d="M271.48,176.8c-22.38-17.89-56.14-16.77-80.1-2.53-22.9,13.61-35.15,39.15-29.37,65.43,2.56,11.67,8.82,22.85,18.23,30.34,12.2,9.72,27.8,12,42.9,13.3,14.92,1.29,31.18,1.62,43.68-7.93,10-7.66,15.86-19.56,17.14-32,3.21-31.38-27.34-54.78-56.9-52.31-6.24.52-6.3,10.32,0,9.8,21.27-1.78,45.5,12,47.23,35.05.74,9.95-2.39,20.43-9.2,27.84-8.7,9.48-21.24,10.9-33.48,10.34-13.38-.62-28.27-1.56-40.18-8.27-8.71-4.91-15-13.27-18.26-22.65-7.09-20.59-.41-42.53,16.59-56,20-15.87,54-20.13,74.8-3.47,4.88,3.89,11.85-3,6.92-6.93Z"/></g></defs><use style="fill:${color};" filter="url(#Blur${i})" xlink:href="#Img${i}"transform="translate(0,0)"/><use style="fill:${fillColor};" xlink:href="#Img${i}"/></svg>`
            } else {
              svg += `<svg width = ${'50px'} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 447 443"><defs><filter x="-50%" y="-50%" width="200%" height="200%" id="Blur${i}"><feGaussianBlur stdDeviation="${gauss}" /></filter><g id="Img${i}"><path class="cls-1" d="M202.76,281.72a67.53,67.53,0,0,0,68.67-42.57,66.32,66.32,0,0,0-21.66-76.4,60.38,60.38,0,0,0-75.51,1.82c-11.79,9.87-17.32,23.53-20.44,38.24-1.69,7.94-3.74,16.27-2.77,24.42a30,30,0,0,0,10.2,18.91c12.69,11.33,32.11,19.47,49.24,18.39,15.38-1,29.86-9.82,35.21-24.65,2.17-6-7.43-8.62-9.58-2.64-3.75,10.42-15,16.68-25.63,17.35-13.55.86-27.15-4.91-38.19-12.38-5.07-3.43-9.73-8-11.11-14.15-1.48-6.69.4-13.84,1.74-20.39,2.6-12.63,6.14-24.55,15.69-33.69a50.21,50.21,0,0,1,61.73-5.74c20.3,12.94,29.65,37.62,23.84,60.86-6.89,27.54-33.4,45.3-61.43,42.68-6.36-.59-6.32,9.35,0,9.94Z"/></g></defs><use style="fill:${color};" filter="url(#Blur${i})" xlink:href="#Img${i}"transform="translate(0,0)"/><use style="fill:${fillColor};" xlink:href="#Img${i}"/></svg>`;
            }
          }

        }

        var imgs = ['./src/images/blank.png', './src/images/img1.png', './src/images/img2.png', './src/images/img3.png', './src/images/img4.png', './src/images/img5.png', './src/images/img6.png', './src/images/img7.png', './src/images/img8.png', './src/images/img9.png', './src/images/img10.png', './src/images/img11.png', './src/images/img12.png', './src/images/img2.png'];
        var img = `<img src = "${imgs[localThis.randomNumber(0, imgs.length)]}"/>`;
        //var img = `<img src = "./src/images/cloud.png"/>`;

        html += '<div class = "calCell"><span>[</span><span class = "svgCalContainer">';
      //  html += svg;
        html += img;
        html += '</span><span>]</span><h2>'+key+'</h2></div>';
    }
      html += '</div>';
      document.getElementById('centerCalendar').innerHTML += html;
      this.didMakeCal = true;
    }

    $('.calCell').hover(function() {

      $(this).find('h2').css('opacity', '1');
    })
    $('.calCell').mouseleave(function() {
      $(this).find('h2').css('opacity', '0');
    })


  }

onKeyDown(event)
{

  //do this when come in from loading

  this.forceDoneLoading(); //TEMP

    if(this.videoTexs.length > 0)
    {
      for(var i =0;i<this.videoTexs.length;i++)
      {
        this.videoTexs[i].play();
      }
    }
    if(event.key == " " && !this.calIsUp)
    {
      this.switchLightIntensitySetting(!this.lightsAreImmediateSetting);
    }

    if(event.key == "c")
    {
      this.toggleCalendar();
    }

    if(event.key == "ArrowRight")
    {

    }
    else if (event.key == "ArrowLeft")
    {

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
