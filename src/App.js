
import React, { Component } from 'react'
import * as THREE from 'three'
import { PointerLockControls } from './PointerLockControls'
import floorImage from './images/floor2.jpg'
import wallImage from './images/wall.jpg'
import './App.css';

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

export default class App extends Component {

  componentDidMount(){

    const scene = new THREE.Scene();
    const canvas = document.getElementById('webgl');
    const renderer = new THREE.WebGLRenderer({
        canvas : canvas,
    });
    renderer.setSize(800, 600);

    scene.add( new THREE.AmbientLight( 0xffffff ));

    const camera = new THREE.PerspectiveCamera(50, 4/3, 0.1, 1000);
    camera.position.y = 1.5;

    const controls = new PointerLockControls( camera, canvas );
    const raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

    canvas.addEventListener( 'click', function () {controls.lock();} );
    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener( 'keyup', onKeyUp );

    scene.add( controls.getObject() );

    const newStore = createStore();
    scene.add(newStore);
    
    function animate() {

      const time = performance.now();

      if ( controls.isLocked === true ) {

        raycaster.ray.origin.copy( controls.getObject().position );

        //const intersections = raycaster.intersectObjects( objects, false );

        //const onObject = intersections.length > 0;

        const delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveRight ) - Number( moveLeft );
        direction.normalize(); // this ensures consistent movements in all directions

        if ( moveForward || moveBackward ) velocity.z -= direction.z * 40.0 * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 40.0 * delta;

        /*if ( onObject === true ) {

          velocity.y = Math.max( 0, velocity.y );

        }*/

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