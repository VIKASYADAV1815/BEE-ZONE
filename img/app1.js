// Bhai, yahan se teen bade-bade tools bahar se mangwaye hain:
// - THREE: Yeh 3D ka boss hai, scene, camera, sab banata hai.
// - GLTFLoader: Yeh 3D model ko load karne ka helper hai.
// - gsap: Yeh animation ko makkhan jaisa smooth banata hai.
import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';

// Scene aur Camera - Stage aur Nazar Set Kiya:
// Scene ek khali manch hai jahan model dikhne wala hai.
// Camera humari aankh hai, 15 ka angle diya taaki mobile pe bhi wide dikhe.
// Camera ko thodi dur (z=12) rakha taaki model pura nazar aaye.
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    15, // Wider FOV for mobile
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 12; // Adjusted for image visibility

// Renderer - Screen Pe Dikhane Ka Jugad:
// Renderer scene ko screen pe paint karta hai, alpha se background transparent rakha.
// Pixel ratio ko mobile ke liye thoda kam rakha taaki load na pade.
// Container3D mein yeh sab daal diya, jaise TV mein picture dikhana.
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Lower for mobile
renderer.setSize(window.innerWidth, window.innerHeight);
const container3D = document.getElementById('container3D');
container3D.appendChild(renderer.domElement);

// Fallback - Agar WebGL Na Chale:
// Agar purana device ho aur 3D na chale, toh ek message dikhayega: "Model nahi chalega bhai."
if (!renderer.getContext()) {
    container3D.innerHTML = '<p style="color: #d1ff48; text-align: center;">3D model unavailable on this device.</p>';
}

// Lighting - Roshni Ka Intezaam:
// Ambient light har taraf se thodi roshni deta hai, taaki model andhere mein na rahe.
// Top light ek taraf se (jaise suraj) roshni deta hai, position upar se set ki.
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);
const topLight = new THREE.DirectionalLight(0xffffff, 0.8);
topLight.position.set(500, 500, 500);
scene.add(topLight);

// Load 3D Model - Demon Ko Bulaya:
// Bee ek variable hai jisme model store hoga (yahan demon.glb hai).
// Loader se model load kiya, mobile pe chhota (0.5) aur desktop pe bada (0.7) scale rakha.
// Animation ho toh play karega, aur modelMove function chalega position set karne.
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

// Animation Loop - Har Frame Update:
// Clock time track karta hai, reRender3D har baar screen refresh karta hai.
// Mixer animation ko update rakhta hai, renderer scene ko dikhata hai.
const clock = new THREE.Clock();
const reRender3D = () => {
    requestAnimationFrame(reRender3D);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
};
reRender3D();

// Model Positioning - Jagah Fix Ki:
// Yeh array hai jisme har section ke liye model ki position aur rotation set hai.
// Har section (banner, intro, etc.) ke liye alag-alag coordinates diye hain.
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

// Model Move - Scroll Pe Dance:
// Scroll karne pe yeh check karta hai kon sa section screen pe hai.
// Jo section top 1/3 mein hai, uske coordinates pe model ko smoothly le jata hai GSAP ke saath.
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

// Event Listeners - Scroll aur Resize Ka Jugad:
// Scroll pe modelMove chalta hai taaki model section ke saath move kare.
// Resize pe camera aur renderer ko window ke size ke hisaab se adjust karta hai.
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