import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';

// Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    15, // Wider FOV for mobile
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 12; // Adjusted for image visibility

// Renderer
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Lower for mobile
renderer.setSize(window.innerWidth, window.innerHeight);
const container3D = document.getElementById('container3D');
container3D.appendChild(renderer.domElement);

// Fallback if WebGL fails
if (!renderer.getContext()) {
    container3D.innerHTML = '<p style="color: #d1ff48; text-align: center;">3D model unavailable on this device.</p>';
}

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);
const topLight = new THREE.DirectionalLight(0xffffff, 0.8);
topLight.position.set(500, 500, 500);
scene.add(topLight);

// Load 3D Model
let bee;
let mixer;
const loader = new GLTFLoader();
loader.load(
    '/demon.glb',
    (gltf) => {
        bee = gltf.scene;
        const scale = window.innerWidth < 768 ? 0.5 : 0.7;
        bee.scale.set(scale, scale, scale);
        scene.add(bee);

        mixer = new THREE.AnimationMixer(bee);
        if (gltf.animations.length) {
            mixer.clipAction(gltf.animations[0]).play();
        }
        modelMove();
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
        console.error('Model loading error:', error);
        container3D.innerHTML = '<p style="color: #d1ff48; text-align: center;">Failed to load 3D model.</p>';
    }
);

// Animation Loop
const clock = new THREE.Clock();
const reRender3D = () => {
    requestAnimationFrame(reRender3D);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
};
reRender3D();

// Model Positioning
const arrPositionModel = [
    {
        id: 'banner',
        position: { x: 0, y: -0.5, z: 2 }, // Adjusted z to avoid image overlap
        rotation: { x: 0, y: 1.5, z: 0 }
    },
    {
        id: 'intro',
        position: { x: 0.8, y: -0.5, z: -2 },
        rotation: { x: 0.5, y: -0.5, z: 0 }
    },
    {
        id: 'description',
        position: { x: -0.8, y: -0.5, z: -2 },
        rotation: { x: 0, y: 0.5, z: 0 }
    },
    {
        id: 'contact',
        position: { x: 0.5, y: -0.5, z: 2 },
        rotation: { x: 0.3, y: -0.5, z: 0 }
    }
];

const modelMove = () => {
    if (!bee) return;
    const sections = document.querySelectorAll('.section');
    let currentSection;
    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 3) {
            currentSection = section.id;
        }
    });
    const position_active = arrPositionModel.findIndex((val) => val.id === currentSection);
    if (position_active >= 0) {
        const new_coordinates = arrPositionModel[position_active];
        gsap.to(bee.position, {
            x: new_coordinates.position.x,
            y: new_coordinates.position.y,
            z: new_coordinates.position.z,
            duration: 1.5,
            ease: 'power1.out'
        });
        gsap.to(bee.rotation, {
            x: new_coordinates.rotation.x,
            y: new_coordinates.rotation.y,
            z: new_coordinates.rotation.z,
            duration: 1.5,
            ease: 'power1.out'
        });
    }
};

// Event Listeners
window.addEventListener('scroll', () => {
    if (bee) modelMove();
});

window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (bee) {
        const scale = width < 768 ? 0.5 : 0.7;
        bee.scale.set(scale, scale, scale);
    }
});