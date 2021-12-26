
import React, { Component } from 'react'
import * as THREE from 'three'
import { PointerLockControls } from './PointerLockControls'
import floorImage from './images/floor2.jpg'
import wallImage from './images/wall.jpg'
import tShirt from './images/moko2.glb'
import './App.css';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'


const createStore = () => {
  
  const textureLoader = new THREE.TextureLoader();

  const newStore = new THREE.Group();

  const wallGeometry = new THREE.PlaneGeometry(20, 5, 100, 100);
  const wallTexture = textureLoader.load( wallImage );
  const wallMaterial = new THREE.MeshStandardMaterial( { map: wallTexture, side: THREE.DoubleSide });
  wallTexture.anisotropy = 16;
  wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
  wallTexture.repeat.set( 1, 1 );
  wallTexture.encoding = THREE.sRGBEncoding;

  const floorGeometry = new THREE.PlaneGeometry(20, 20, 100, 100);
  const floorTexture = textureLoader.load( floorImage );
  const floorMaterial = new THREE.MeshStandardMaterial( { map: floorTexture, side: THREE.DoubleSide });
  floorTexture.anisotropy = 16;
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set( 20, 20 );
  floorTexture.encoding = THREE.sRGBEncoding;
  
  const firstWall = new THREE.Mesh( wallGeometry, wallMaterial );
  firstWall.position.z = -10;
  firstWall.position.y = 2.5;

  const secondWall = new THREE.Mesh( wallGeometry, wallMaterial );
  secondWall.position.z = 10;
  secondWall.position.y = 2.5;

  const thirdWall = new THREE.Mesh( wallGeometry, wallMaterial );
  thirdWall.rotation.y = Math.PI / 2;
  thirdWall.position.x = 10;
  thirdWall.position.y = 2.5;

  const fourthWall = new THREE.Mesh( wallGeometry, wallMaterial );
  fourthWall.rotation.y = Math.PI / 2;
  fourthWall.position.x = -10;
  fourthWall.position.y = 2.5;

  const floor = new THREE.Mesh( floorGeometry, floorMaterial );
  floor.rotation.x = Math.PI / 2;

  newStore.add(firstWall, secondWall, thirdWall, fourthWall, floor);

  return newStore;

}

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const mouse = new THREE.Vector2();

const onKeyDown = function ( event ) {

  switch ( event.code ) {

    case 'ArrowUp':
    case 'KeyW':
      moveForward = true;
      break;

    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = true;
      break;

    case 'ArrowDown':
    case 'KeyS':
      moveBackward = true;
      break;

    case 'ArrowRight':
    case 'KeyD':
      moveRight = true;
      break;

  }
};

const onKeyUp = function ( event ) {

  switch ( event.code ) {

    case 'ArrowUp':
    case 'KeyW':
      moveForward = false;
      break;

    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = false;
      break;

    case 'ArrowDown':
    case 'KeyS':
      moveBackward = false;
      break;

    case 'ArrowRight':
    case 'KeyD':
      moveRight = false;
      break;

  }
};

const createObject = () => {

  const geometry = new THREE.SphereGeometry(1, 32, 16);
  const material = new THREE.MeshNormalMaterial();
  const newObject = new THREE.Mesh(geometry, material);
  return newObject;
}

function onMouseMove( event ) {

	mouse.x = ( event.clientX / document.body.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / document.body.innerHeight ) * 2 + 1;

}

export default class App extends Component {

  componentDidMount(){

    const scene = new THREE.Scene();
    const canvas = document.getElementById('webgl');
    const renderer = new THREE.WebGLRenderer({
        canvas : canvas,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const light = new THREE.SpotLight( 'red', 1 );
    light.angle = Math.PI / 6;
    light.position.set(0, 5, 0);
    scene.add(light);
    scene.add(light.target);

    scene.add( new THREE.AmbientLight( 0xffffff, 0.7 ));

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.y = 1.5;

    const controls = new PointerLockControls( camera, canvas );
    const raycaster = new THREE.Raycaster( );

    canvas.addEventListener( 'click', function () {controls.lock();} );
    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener( 'keyup', onKeyUp );

    scene.add( controls.getObject() );

    const newStore = createStore();
    const player = createObject()
    scene.add(newStore);
    scene.add(player);
    player.position.copy(camera.position);
    light.target = player;


    const loader = new GLTFLoader();
    loader.crossOrigin = true;
    loader.load( tShirt, function ( data ) {
      var whiteTsh = data.scene;
      whiteTsh.position.set(3, 1, 4);
      scene.add( whiteTsh );
    });

    function animate() {

      const time = performance.now();

      player.position.copy(camera.position);

      if ( controls.isLocked === true ) {

        // raycaster.ray.origin.copy( controls.getObject().position );

        raycaster.setFromCamera( mouse, camera );

        // // calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects( scene.children );
      
  

        const delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveRight ) - Number( moveLeft );
        direction.normalize(); // this ensures consistent movements in all directions

        if ( moveForward || moveBackward ) velocity.z -= direction.z * 40.0 * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 40.0 * delta;

        controls.moveRight( - velocity.x * delta );
        controls.moveForward( - velocity.z * delta );

        controls.getObject().position.y += ( velocity.y * delta ); // new behavior

        if ( controls.getObject().position.y < 1.5 ) {

          velocity.y = 0;
          controls.getObject().position.y = 1.5;

        }
      }

      prevTime = time;

      renderer.render( scene, camera );

      requestAnimationFrame( animate );

    }

    animate();

  }

  render() {
    return (
      <div className="App">
        <canvas id='webgl'></canvas>
    </div>
    )
  }
}