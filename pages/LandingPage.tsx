// 1. Force dynamic rendering to prevent build-time router errors
export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import Footer from '../components/Footer';
import BackgroundClouds from '../components/BackgroundClouds';
import Header from '../components/Header';
import { useAuth } from '../services/AuthContext';

const LandingPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [modelStatus, setModelStatus] = useState<'loading' | 'procedural' | 'custom'>('loading');
  const mountRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- BUILD SAFE REDIRECT ---
  useEffect(() => {
    // Only run if we are in the browser and auth is ready
    if (typeof window !== 'undefined' && user && !loading) {
      navigate(user.role === 'customer' ? '/customer/dashboard' : '/owner/dashboard');
    }
  }, [user, loading, navigate]);

  const colors = {
    primary: 'blue-600',
    deep: 'blue-900',
    light: 'blue-50/50',
    border: 'white/60',
    aura: 'sky-400'
  };

  const sceneRef = useRef<THREE.Scene | null>(null);
  const droneGroupRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- BUILD SAFE THREE.JS INIT ---
  useEffect(() => {
    // Critical: Do not run Three.js initialization during SSR/Build
    if (typeof window === 'undefined' || !mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 100);
    camera.position.set(0, 1.5, 6.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 3.5);
    sunLight.position.set(10, 20, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    const skyLight = new THREE.DirectionalLight(0x3b82f6, 1.5);
    skyLight.position.set(-5, 5, -5);
    scene.add(skyLight);

    const droneGroup = new THREE.Group();
    droneGroupRef.current = droneGroup;
    scene.add(droneGroup);

    attemptLoadDefaultModel();

    droneGroup.rotation.x = 0.2;
    droneGroup.rotation.y = -0.5;

    const clock = new THREE.Clock();
    let mouseX = 0;
    let mouseY = 0;

    const animate = () => {
      const time = clock.getElapsedTime();
      if (droneGroup.userData.props) {
        const speed = 25;
        droneGroup.userData.props.forEach((prop: THREE.Group) => {
          prop.rotation.y -= speed * 0.05;
        });
      }
      if (droneGroup.userData.rotors) {
        const rotorSpeed = 100;
        droneGroup.userData.rotors.forEach((rotor: THREE.Object3D) => {
          rotor.rotation.z -= rotorSpeed * 0.05;
        });
      }
      if (cameraRef.current) {
        cameraRef.current.fov = 45;
        cameraRef.current.updateProjectionMatrix();
        cameraRef.current.position.z = 6.5;
        cameraRef.current.position.y = 1.5;
        cameraRef.current.lookAt(0, 0, 0);
      }
      if (droneGroupRef.current) {
        const isMobile = window.innerWidth < 768;
        const mobileYOffset = isMobile ? -0.8 : 0;
        droneGroupRef.current.position.y = Math.sin(time * 0.5) * 0.05 + mobileYOffset;
        droneGroupRef.current.position.x = isMobile ? 0.0 : -1.0;
        droneGroupRef.current.rotation.z = Math.sin(time * 0.3) * 0.01;
        const targetRotX = 0.2 + mouseY * 0.3;
        const targetRotY = -0.4 + mouseX * 0.3;
        droneGroupRef.current.rotation.x += (targetRotX - droneGroupRef.current.rotation.x) * 0.05;
        droneGroupRef.current.rotation.y += (targetRotY - droneGroupRef.current.rotation.y) * 0.05;
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    const onMouseMove = (event: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (rect) {
        mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      }
    };

    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, []);

  const clearDroneGroup = () => {
    if (!droneGroupRef.current) return;
    while (droneGroupRef.current.children.length > 0) {
      const obj = droneGroupRef.current.children[0];
      droneGroupRef.current.remove(obj);
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) {
            if (Array.isArray(mesh.material)) mesh.material.forEach(m => m.dispose());
            else mesh.material.dispose();
          }
        }
      });
    }
    droneGroupRef.current.userData = {};
  };

  const attemptLoadDefaultModel = () => {
    const loader = new GLTFLoader();
    loader.load('/models/drone.glb', (gltf) => {
      if (droneGroupRef.current) {
        setupLoadedModel(gltf.scene);
        setModelStatus('custom');
      }
    }, undefined, () => {
      loadFuturisticModel();
      setModelStatus('procedural');
    });
  };

  const setupLoadedModel = (model: THREE.Group) => {
    clearDroneGroup();
    if (!droneGroupRef.current) return;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const scaleFactor = 4.2 / Math.max(size.x, size.y, size.z);
    model.scale.set(scaleFactor, scaleFactor, scaleFactor);
    model.position.sub(box.getCenter(new THREE.Vector3()));
    const rotors: THREE.Object3D[] = [];
    model.traverse((child) => {
      if (['fanbase', 'innercircle', 'circle_outer'].some(n => child.name.toLowerCase().includes(n))) {
        rotors.push(child);
      }
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    droneGroupRef.current.userData.rotors = rotors;
    droneGroupRef.current.add(model);
  };

  const loadFuturisticModel = () => {
    if (!droneGroupRef.current) return;
    clearDroneGroup();
    const hullMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.1, clearcoat: 1.0 });
    const armMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.9 });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), hullMat);
    droneGroupRef.current.add(core);
    const arm1 = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.1, 0.3), armMat);
    const arm2 = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.1, 0.3), armMat);
    arm1.rotation.y = Math.PI / 4;
    arm2.rotation.y = -Math.PI / 4;
    droneGroupRef.current.add(arm1, arm2);
    droneGroupRef.current.scale.set(0.75, 0.75, 0.75);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const cards = document.getElementsByClassName('spotlight-card');
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      (card as HTMLElement).style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      (card as HTMLElement).style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    }
  };

  return (
    <div onMouseMove={handleMouseMove} className="relative min-h-screen font-sans text-slate-900 overflow-x-hidden selection:bg-white selection:text-blue-600">
      <div className="fixed inset-0 pointer-events-none -z-10 bg-gradient-to-br from-sky-400 to-blue-600">
        <div className="absolute inset-0 bg-blue-400/10 backdrop-blur-[2px]" />
        <BackgroundClouds />
      </div>
      <Header />

      <section className="relative min-h-screen w-full overflow-hidden flex flex-col justify-center">
        <div className="absolute top-[15%] left-0 w-full text-center z-10 select-none pointer-events-none">
          <span className="text-[5vw] md:text-[2.2vw] xl:text-2xl font-bold tracking-[0.2em] md:tracking-[0.5em] text-blue-600 uppercase mb-4">The Future of Delivery</span>
          <div className="flex flex-col items-center leading-[0.7] drop-shadow-[0_10px_40px_rgba(255,255,255,0.5)]">
            <span className="text-[19vw] md:text-[13vw] 2xl:text-[200px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">DELIVERED</span>
            <span className="text-[19vw] md:text-[13vw] 2xl:text-[200px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-transparent">TODAY</span>
          </div>
        </div>

        <div className="container mx-auto px-6 relative z-20 h-full flex flex-col justify-center min-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="col-span-1 md:col-span-3 py-8 md:py-12 order-2 md:order-1 relative z-20">
              <div className="mt-0 md:mt-56">
                <div className="bg-white/50 backdrop-blur-2xl border border-white/60 p-6 md:p-8 rounded-[2rem] shadow-2xl w-full max-w-[340px]">
                  <h3 className="text-3xl md:text-4xl font-black text-blue-950 mb-3 leading-[0.9] tracking-tight mt-4">START <br /><span className="text-blue-600">SHIPPING</span></h3>
                  <p className="text-slate-800 font-bold mb-6 text-sm md:text-base opacity-90">Seamlessly connect to our autonomous drone network for instant, eco-friendly logistics.</p>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <Link to="/login" className="py-3 md:py-4 bg-gradient-to-br from-blue-600 to-blue-800 text-white font-black rounded-xl text-xs md:text-sm flex items-center justify-center">Login</Link>
                    <Link to="/signup" className="py-3 md:py-4 bg-white/70 text-blue-900 border border-blue-200 font-black rounded-xl text-xs md:text-sm flex items-center justify-center backdrop-blur-sm">Sign Up</Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-1 md:col-span-9 relative h-[400px] md:h-[600px] order-1 md:order-2 z-20">
              <div ref={mountRef} className="relative w-full h-full cursor-move"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified features for brevity, matching your logic */}
      <section className="py-32 relative overflow-hidden bg-transparent">
        <div className="container mx-auto px-6 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">Effortless Delivery in <br /><span className="text-blue-900">3 Simple Steps.</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {["1. Create Order", "2. Drone Dispatched", "3. Track & Receive"].map((title, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-10 rounded-[3rem] bg-white/50 border border-white/60 backdrop-blur-2xl shadow-2xl">
                <h3 className="text-2xl font-black text-blue-950 mb-4">{title}</h3>
                <p className="text-slate-800 font-bold opacity-80">Process for {title.toLowerCase()}.</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default LandingPage;
