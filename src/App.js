
import React, { Component } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import floorImage from './static/floor2.jpg'
import wallImage from './static/wall.jpeg'
import t_Shirt from './static/moko2.glb'
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

  const shelfGeometry = new THREE.BoxGeometry(15, .1, 1 );
  const shelfMaterial = new THREE.MeshStandardMaterial( { color : '#000' });
  
  const firstWall = new THREE.Mesh( wallGeometry, wallMaterial );
  firstWall.position.z = -10;
  firstWall.position.y = 2.5;

  const firstShelf = new THREE.Mesh( shelfGeometry, shelfMaterial );
  firstShelf.position.z = -9.5;
  firstShelf.position.y = 1;

  const secondWall = new THREE.Mesh( wallGeometry, wallMaterial );
  secondWall.position.z = 10;
  secondWall.position.y = 2.5;

  const secondShelf = new THREE.Mesh( shelfGeometry, shelfMaterial );
  secondShelf.position.z = 9.5;
  secondShelf.position.y = 1;

  const thirdWall = new THREE.Mesh( wallGeometry, wallMaterial );
  thirdWall.rotation.y = Math.PI / 2;
  thirdWall.position.x = 10;
  thirdWall.position.y = 2.5;

  const thirdShelf = new THREE.Mesh( shelfGeometry, shelfMaterial );
  thirdShelf.rotation.y = Math.PI / 2;
  thirdShelf.position.x = 9.5;
  thirdShelf.position.y = 1;

  const fourthWall = new THREE.Mesh( wallGeometry, wallMaterial );
  fourthWall.rotation.y = Math.PI / 2;
  fourthWall.position.x = -10;
  fourthWall.position.y = 2.5;

  const fourthShelf = new THREE.Mesh( shelfGeometry, shelfMaterial );
  fourthShelf.rotation.y = -Math.PI / 2;
  fourthShelf.position.x = -9.5;
  fourthShelf.position.y = 1;

  const floor = new THREE.Mesh( floorGeometry, floorMaterial );
  floor.rotation.x = Math.PI / 2;

  newStore.add(firstWall, firstShelf, secondWall, secondShelf, thirdWall, thirdShelf, fourthWall, fourthShelf, floor);

  return newStore;

}

const raycaster = new THREE.Raycaster( );
const mouse = new THREE.Vector2();

const createObject = () => {

  const geometry = new THREE.SphereGeometry(.5, 32, 16);
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

    const light = new THREE.SpotLight( 0xffffff, 0.8 );
    light.angle = Math.PI / 3;
    light.position.set(0, 10, 0);
    scene.add(light);

    scene.add( new THREE.AmbientLight( 0xffffff, 0.7 ));

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);

    const controls = new OrbitControls( camera, canvas );
    controls.listenToKeyEvents( window );
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2;
    controls.update();

    const newStore = createStore();
    const sphere = createObject();
    scene.add(newStore);
    scene.add(sphere);

    sphere.position.set(-3, 1.55, -9.2);

    const loader = new GLTFLoader();
    loader.crossOrigin = true;
    loader.load( t_Shirt, function ( data ) {
      window.tShirt = data.scene;
      window.tShirt.position.set(3, 2, -9.2);
      scene.add( window.tShirt );
    });

    function animate() {

        raycaster.setFromCamera( mouse, camera );

        // // calculate objects intersecting the picking ray
        // const intersects = raycaster.intersectObjects( [sphere, window.tShirt] );

        // if ( intersects && intersects.length > 0) {
        //   objectIntersected = true;
        // }

        // else{
        //   objectIntersected = false;
        // }

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