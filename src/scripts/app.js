import 'styles/index.scss';
import Cone from './elements/cone';
import Tourus from './elements/tourus';
import Cylinder from './elements/cylinder';
import { radians, map, distance } from './helpers';

export default class App {
  setup() {

console.log("SKY");

//constantss
    this.gutter = { size: 4 };
    this.meshes = [];
    this.grid = { rows: 5, cols: 5 };
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.mouse3D = new THREE.Vector2();
    this.geometries = [
      new Cone(),
      new Tourus(),
      new Cylinder(),
    ];

    this.raycaster = new THREE.Raycaster();

    this.mouse = new THREE.Vector2();
    this.target = new THREE.Vector2();
    this.windowHalf = new THREE.Vector2( window.innerWidth / 2, window.innerHeight / 2 );
    this.movableLight = new THREE.PointLight();

    //logic
    this.loadingHasStarted = false;
  }

  createScene() {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);


    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(this.renderer.domElement);
    this.scene.background = new THREE.Color( 0x424242 );
  }

  createCamera() {

    this.camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1);
    this.camera.position.set(0, 10, 0);
    //this.camera.rotation.x = -1.57;

    this.scene.add(this.camera);
  }

  addAmbientLight() {
    const light = new THREE.AmbientLight('#ffffff', 1);

    this.scene.add(light);
  }

//follows mouse
  addSpotLight() {
    const spotlight = new THREE.SpotLight('#7bccd7', 1, 1000);
    //const spotlight = new THREE.SpotLight('#7bccd7', 1, 1000);

    spotlight.position.set(0, 27, 0);
    spotlight.castShadow = true;

    //this.scene.add(spotlight);
  }

  addRectLight() {
    const light = new THREE.RectAreaLight('#ffffff', 1, 2000, 2000);

    light.position.set(5, 50, 50);
    light.lookAt(0, 0, 0);

    this.scene.add(light);
  }

  addPointLight(color, position) {
    this.movableLight = new THREE.PointLight(color, 0.2, 1000, 1); //2nd num is intensity

    this.movableLight.position.set(position.x, position.y, position.z);

    this.scene.add(this.movableLight);
  }

  startLoading()
  {
    if(!this.loadingHasStarted)
    {
      this.loadingHasStarted = true;
      console.log("Starting load to back");
      //wait 3 seconds, then go
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

  cubeCloud()
  {
    const geometry = new THREE.BoxBufferGeometry();
    const material = new THREE.MeshStandardMaterial( {

    color: 0xffffff,

    roughness: 0.3,
    metalness: 1

    // roughnessMap: roughnessMap,
    // metalnessMap: metalnessMap,
    //
    // envMap: envMap, // important -- especially for metals!
    // envMapIntensity: envMapIntensity

} );

    for ( let i = 0; i < 1000; i ++ ) {

      const object = new THREE.Mesh( geometry, material );
      object.position.x = Math.random() * 80 - 40;
      object.position.y = Math.random() * 80 - 40;
      object.position.z = Math.random() * 80 - 40;
      object.rotation.x = Math.random() * 2 * Math.PI;
      object.rotation.y = Math.random() * 2 * Math.PI;
      object.rotation.z = Math.random() * 2 * Math.PI;
      this.scene.add( object );

		}
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

  createGrid() {
    this.groupMesh = new THREE.Object3D();

    const material = new THREE.MeshPhysicalMaterial({
      color: '#3e2917',
      metalness: .58,
      emissive: '#000000',
      roughness: .05,
    });

    for (let row = 0; row < this.grid.rows; row++) {
      this.meshes[row] = [];

      for (let index = 0; index < 1; index++) {
        const totalCol = this.getTotalRows(row);

        for (let col = 0; col < totalCol; col++) {
          const geometry = this.getRandomGeometry();
          const mesh = this.getMesh(geometry.geom, material);

          mesh.position.y = 0;
          mesh.position.x = col + (col * this.gutter.size) + (totalCol === this.grid.cols ? 0 : 2.5);
          mesh.position.z = row + (row * (index + .25));

          mesh.rotation.x = geometry.rotationX;
          mesh.rotation.y = geometry.rotationY;
          mesh.rotation.z = geometry.rotationZ;

          mesh.initialRotation = {
            x: mesh.rotation.x,
            y: mesh.rotation.y,
            z: mesh.rotation.z,
          };

          this.groupMesh.add(mesh);

          this.meshes[row][col] = mesh;
        }
      }
    }

    const centerX = -(this.grid.cols / 2) * this.gutter.size - 1;
    const centerZ = -(this.grid.rows / 2) - .8;

    this.groupMesh.position.set(centerX, 0, centerZ);

    this.scene.add(this.groupMesh);
  }

  getTotalRows(col) {
    return (col % 2 === 0 ? this.grid.cols : this.grid.cols - 1);
  }

  getMesh(geometry, material) {
    const mesh = new THREE.Mesh(geometry, material);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  draw() {
    this.raycaster.setFromCamera(this.mouse3D, this.camera);

    const intersects = this.raycaster.intersectObjects([this.floor]);

    if (intersects.length) {
      const { x, z } = intersects[0].point;

      for (let row = 0; row < this.grid.rows; row++) {
        for (let index = 0; index < 1; index++) {
          const totalCols = this.getTotalRows(row);

          for (let col = 0; col < totalCols; col++) {
            const mesh = this.meshes[row][col];

            const mouseDistance = distance(x, z,
              mesh.position.x + this.groupMesh.position.x,
              mesh.position.z + this.groupMesh.position.z);

            const y = map(mouseDistance, 7, 0, 0, 6);
            TweenMax.to(mesh.position, .3, { y: y < 1 ? 1 : y });

            const scaleFactor = mesh.position.y / 1.2;
            const scale = scaleFactor < 1 ? 1 : scaleFactor;
            TweenMax.to(mesh.scale, .3, {
              ease: Expo.easeOut,
              x: scale,
              y: scale,
              z: scale,
            });

            TweenMax.to(mesh.rotation, .7, {
              ease: Expo.easeOut,
              x: map(mesh.position.y, -1, 1, radians(270), mesh.initialRotation.x),
              z: map(mesh.position.y, -1, 1, radians(-90), mesh.initialRotation.z),
              y: map(mesh.position.y, -1, 1, radians(45), mesh.initialRotation.y),
            });
          }
        }
      }
    }
  }

  init() {
    this.setup();

    this.createScene();

    this.createCamera();

    this.createGrid();

    this.addFloor();

    this.addAmbientLight();

    this.cubeCloud();

    //this.addSpotLight();

    //this.addRectLight();

    this.addPointLight(0xffffff, { x: 0, y: 10, z: -100 });

    this.animate();

    window.addEventListener('resize', this.onResize.bind(this));

    window.addEventListener('mousemove', this.onMouseMove.bind(this), false);

    this.onMouseMove({ clientX: 0, clientY: 0 });
  }

  onMouseMove({ clientX, clientY }) {
    this.mouse3D.x = (clientX / this.width) * 2 - 1;
    this.mouse3D.y = -(clientY / this.height) * 2 + 1;

    //this.movableLight.position.set(this.mouse.position);

    this.mouse.x = (clientX - this.windowHalf.x );
    this.mouse.y = (clientY - this.windowHalf.x );

    if(this.mouse.y > this.height * 0.088)
    {
      this.startLoading();
    } else {
      this.loadingHasStarted = false;
    }
  }
//   onMouseWheel( event ) {
//
//   this.camera.position.z += event.deltaY * 0.1; // move camera along z-axis
//
// }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.windowHalf.set( this.width / 2, this.height / 2 );

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  animate() {
    this.draw();

    const resistance = 0.002;
    this.target.x = ( 1 - this.mouse.x ) * resistance;
    this.target.y = ( 1 - this.mouse.y ) * resistance;

    this.camera.rotation.x += 0.05 * ( this.target.y - this.camera.rotation.x );
    this.camera.rotation.y += 0.05 * ( this.target.x - this.camera.rotation.y );

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.animate.bind(this));
  }
}
