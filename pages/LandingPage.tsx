
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

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      console.log('LandingPage: User detected, redirecting to dashboard');
      navigate(user.role === 'customer' ? '/customer/dashboard' : '/owner/dashboard');
    }
  }, [user, loading, navigate]);

  // --- Universal Sky Theme Constants ---
  const colors = {
    primary: 'blue-600',
    deep: 'blue-900',
    light: 'blue-50/50',
    border: 'white/60',
    aura: 'sky-400'
  };

  // Refs to access scene elements across renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const droneGroupRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Scroll handler for Nav
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize Scene
  useEffect(() => {
    if (!mountRef.current) return;

    // --- SCENE INIT ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 100);
    camera.position.set(0, 1.5, 6.5); // Move camera back to fit wide props
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

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 3.5);
    sunLight.position.set(10, 20, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    const skyLight = new THREE.DirectionalLight(0x3b82f6, 1.5);
    skyLight.position.set(-5, 5, -5);
    scene.add(skyLight);

    // --- DRONE CONTAINER ---
    const droneGroup = new THREE.Group();
    droneGroupRef.current = droneGroup;
    scene.add(droneGroup);

    attemptLoadDefaultModel();

    // Initial position
    droneGroup.rotation.x = 0.2;
    droneGroup.rotation.y = -0.5;

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();
    let mouseX = 0;
    let mouseY = 0;

    const animate = () => {
      const time = clock.getElapsedTime();

      // Animate Procedural Props if they exist
      if (droneGroup.userData.props) {
        const speed = 25;
        droneGroup.userData.props.forEach((prop: THREE.Group) => {
          prop.rotation.y -= speed * 0.05;
        });
      }

      // Animate Rotors from imported .glb model
      if (droneGroup.userData.rotors) {
        const rotorSpeed = 100;
        droneGroup.userData.rotors.forEach((rotor: THREE.Object3D) => {
          rotor.rotation.z -= rotorSpeed * 0.05;
        });
      }

      // Cinematic Camera/Drone Static Hover
      if (cameraRef.current) {
        // Static Good-looking FOV
        cameraRef.current.fov = 45;
        cameraRef.current.updateProjectionMatrix();

        cameraRef.current.position.z = 6.5;
        cameraRef.current.position.y = 1.5;
        cameraRef.current.lookAt(0, 0, 0);
      }

      if (droneGroupRef.current) {
        // Responsive vertical positioning - lower on mobile to prevent cutoff
        const isMobile = window.innerWidth < 768;
        const mobileYOffset = isMobile ? -0.8 : 0;

        // Very subtle hover effect (much slower) + mobile offset
        droneGroupRef.current.position.y = Math.sin(time * 0.5) * 0.05 + mobileYOffset;
        droneGroupRef.current.position.x = isMobile ? 0.0 : -1.0;
        droneGroupRef.current.position.z = 0;

        // Very subtle rotation
        droneGroupRef.current.rotation.z = Math.sin(time * 0.3) * 0.01;

        // Mouse interactive tilt
        const baseRotX = 0.2;
        const baseRotY = -0.4;
        const targetRotX = baseRotX + mouseY * 0.3;
        const targetRotY = baseRotY + mouseX * 0.3;

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
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
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
    loader.load(
      '/models/drone.glb',
      (gltf) => {
        const model = gltf.scene;
        if (droneGroupRef.current) {
          setupLoadedModel(model);
          setModelStatus('custom');
        }
      },
      undefined,
      (error) => {
        console.warn('Failed to load drone.glb, using procedural model:', error);
        loadFuturisticModel();
        setModelStatus('procedural');
      }
    );
  };

  const setupLoadedModel = (model: THREE.Group) => {
    clearDroneGroup();
    if (!droneGroupRef.current) return;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = 4.2 / maxDim;
    model.scale.set(scaleFactor, scaleFactor, scaleFactor);
    box.setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    const rotors: THREE.Object3D[] = [];
    model.traverse((child) => {
      const nameLower = child.name.toLowerCase();
      if (nameLower.includes('fanbase') || nameLower.includes('innercircle') || nameLower.includes('circle_outer')) {
        rotors.push(child);
      }
    });

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material && !Array.isArray(mesh.material)) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.metalness = Math.min(1, (mat.metalness || 0) + 0.1);
          mat.roughness = Math.max(0, (mat.roughness || 0.5) - 0.1);
        }
      }
    });
    droneGroupRef.current.userData.rotors = rotors;
    droneGroupRef.current.add(model);
  };

  const loadFuturisticModel = () => {
    if (!droneGroupRef.current) return;
    clearDroneGroup();
    const droneGroup = droneGroupRef.current;
    const hullMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.1, clearcoat: 1.0 });
    const armMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.9 });
    const coreMat = new THREE.MeshPhysicalMaterial({ color: 0x3b82f6, emissive: 0x3b82f6, emissiveIntensity: 0.5, transmission: 0.6, thickness: 1.0 });
    const neonRingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.0, toneMapped: false });

    const core = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), hullMat);
    core.castShadow = true;
    droneGroup.add(core);

    const heart = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), coreMat);
    droneGroup.add(heart);

    const arm1 = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.1, 0.3), armMat);
    const arm2 = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.1, 0.3), armMat);
    arm1.rotation.y = Math.PI / 4;
    arm2.rotation.y = -Math.PI / 4;
    droneGroup.add(arm1);
    droneGroup.add(arm2);

    const positions = [{ x: 1.6, z: 1.6 }, { x: -1.6, z: 1.6 }, { x: 1.6, z: -1.6 }, { x: -1.6, z: -1.6 }];
    const props: THREE.Group[] = [];
    positions.forEach((pos) => {
      const rotorGroup = new THREE.Group();
      rotorGroup.position.set(pos.x, 0, pos.z);
      rotorGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.2, 0.4, 16), hullMat));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.05, 8, 32), neonRingMat);
      ring.rotateX(Math.PI / 2);
      rotorGroup.add(ring);
      const propBladeGroup = new THREE.Group();
      const blade1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 0.15), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }));
      const blade2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 0.15), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }));
      blade2.rotation.y = Math.PI / 2;
      propBladeGroup.position.y = 0.25;
      propBladeGroup.add(blade1);
      propBladeGroup.add(blade2);
      rotorGroup.add(propBladeGroup);
      props.push(propBladeGroup);
      droneGroup.add(rotorGroup);
    });
    droneGroup.userData.props = props;
    droneGroup.scale.set(0.75, 0.75, 0.75);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const cards = document.getElementsByClassName('spotlight-card');
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
      (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen font-sans text-slate-900 overflow-x-hidden selection:bg-white selection:text-blue-600"
      style={{ scrollBehavior: 'smooth' }}
    >

      {/* GLOBAL BACKGROUND ELEMENTS (Unified Mist) */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-gradient-to-br from-sky-400 to-blue-600">
        <div className="absolute inset-0 bg-blue-400/10 backdrop-blur-[2px]" />

        {/* Static Atmospheric Elements for Performance */}
        <div className="absolute top-1/4 -left-40 w-[800px] h-[800px] bg-white/20 rounded-full blur-[140px] opacity-50" />
        <div className="absolute bottom-1/4 -right-40 w-[1000px] h-[1000px] bg-sky-200/10 rounded-full blur-[160px] opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.15)_0%,_transparent_70%)]" />

        <BackgroundClouds />
      </div>
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen w-full overflow-hidden flex flex-col justify-center">
        <div className="absolute top-[15%] left-0 w-full text-center z-10 select-none pointer-events-none">
          <span className="text-[5vw] md:text-[2.2vw] xl:text-2xl font-bold tracking-[0.2em] md:tracking-[0.5em] text-blue-600 uppercase mb-4">
            The Future of Delivery
          </span>

          <div className="flex flex-col items-center leading-[0.7] drop-shadow-[0_10px_40px_rgba(255,255,255,0.5)] max-w-full">
            <span className="text-[19vw] md:text-[13vw] 2xl:text-[200px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 brightness-110">
              DELIVERED
            </span>
            <span className="text-[19vw] md:text-[13vw] 2xl:text-[200px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-transparent brightness-125">
              TODAY
            </span>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="container mx-auto px-6 relative z-20 h-full flex flex-col justify-center min-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-4 h-full items-center">
            <div className="col-span-1 md:col-span-3 flex flex-col justify-center items-center md:items-start py-8 md:py-12 order-2 md:order-1 pointer-events-none relative z-20">
              <div className="pointer-events-auto mt-0 md:mt-56">
                <div className="bg-white/50 backdrop-blur-2xl border border-white/60 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-blue-900/10 w-full max-w-[340px] transition-transform hover:-translate-y-1 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/60 to-transparent rounded-bl-[4rem] pointer-events-none -mr-4 -mt-4 opacity-50"></div>

                  <h3 className="text-3xl md:text-4xl font-black text-blue-950 mb-3 relative z-10 leading-[0.9] tracking-tight mt-4">
                    START <br />
                    <span className="text-blue-600 drop-shadow-sm">SHIPPING</span>
                  </h3>
                  <p className="text-slate-800 font-bold mb-6 md:mb-8 leading-snug relative z-10 text-sm md:text-base opacity-90">
                    Seamlessly connect to our autonomous drone network for instant, eco-friendly logistics.
                  </p>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <Link to="/login" className="py-3 md:py-4 bg-gradient-to-br from-blue-600 to-blue-800 text-white font-black rounded-xl md:rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all text-center text-xs md:text-sm flex items-center justify-center gap-2">
                      Login
                    </Link>
                    <Link to="/signup" className="py-3 md:py-4 bg-white/70 text-blue-900 border border-blue-200 font-black rounded-xl md:rounded-2xl shadow-sm hover:bg-white transition-all text-center text-xs md:text-sm flex items-center justify-center backdrop-blur-sm">
                      Sign Up
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-9 relative h-[400px] md:h-[600px] flex items-center justify-center order-1 md:order-2 z-20">
              <div ref={mountRef} className="relative w-full h-full flex items-center justify-center cursor-move"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features: 3 Simple Steps */}
      <section className="py-32 relative overflow-hidden bg-transparent">



        <div className="container mx-auto px-6 relative">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20 relative z-10"
          >
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
              Effortless Delivery in <br />
              <span className="text-blue-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-950 to-blue-700">3 Simple Steps.</span>
            </h2>

          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {[
              { icon: "fa-pencil", title: "1. Create Order", desc: "Enter pickup and delivery details. Our system instantly calculates the best route." },
              { icon: "fa-paper-plane", title: "2. Drone Dispatched", desc: "The nearest available drone pilot is assigned and dispatched for secure pickup." },
              { icon: "fa-box-open", title: "3. Track & Receive", desc: "Monitor your delivery in real-time on a live map and receive instant confirmation." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group relative p-10 rounded-[3rem] bg-white/50 border border-white/60 backdrop-blur-2xl hover:bg-white/60 transition-all duration-500 shadow-2xl shadow-blue-900/10 overflow-hidden ring-1 ring-white/30"
                style={{ willChange: 'transform, opacity' }}
              >
                {/* Decorative Corner Gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/60 to-transparent rounded-bl-[4rem] pointer-events-none -mr-4 -mt-4 opacity-50"></div>

                {/* Internal Glow */}
                <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(255,255,255,0.3)] pointer-events-none rounded-[3rem]" />
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50/20 rounded-full blur-3xl group-hover:bg-blue-100/30 transition-colors" />

                <div className="relative z-10">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-2xl bg-white text-blue-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ring-4 ring-blue-50"
                  >
                    <i className={`fas ${item.icon}`}></i>
                  </motion.div>
                  <h3 className="text-2xl font-black text-blue-950 mb-4 tracking-tight uppercase text-[0.95em] drop-shadow-sm">{item.title}</h3>
                  <p className="text-slate-800 font-bold leading-relaxed text-lg opacity-80 group-hover:opacity-100 transition-opacity">{item.desc}</p>
                </div>
              </motion.div>

            ))}
          </div>
        </div>
      </section >

      {/* NEW: Global Scale Statistics */}
      < section className="py-24 relative overflow-hidden bg-transparent border-y border-white/10" >


        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: "Welcome Offer", val: "First 3 FREE", sub: "Exclusive Dhule Launch", icon: "fa-tag", c: "from-amber-400 to-orange-500" },
              { label: "Carbon Neutral", val: "100%", sub: "Eco-Friendly Flow", icon: "fa-leaf", c: "from-emerald-400 to-teal-500" },
              { label: "Avg. Speed", val: "12.5m", sub: "Pickup to Dropoff", icon: "fa-gauge-high", c: "from-sky-400 to-blue-500" },
              { label: "Safety Rating", val: "99.9%", sub: "Guaranteed", icon: "fa-shield-heart", c: "from-indigo-400 to-purple-500" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="relative group p-6 rounded-[2.5rem] bg-white/50 backdrop-blur-2xl border border-white/60 shadow-xl shadow-blue-900/5 overflow-hidden transition-all hover:-translate-y-1 hover:bg-white/60"
                style={{ willChange: 'transform, opacity' }}
              >
                {/* Decorative Corner Gradient */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/60 to-transparent rounded-bl-[3rem] pointer-events-none -mr-2 -mt-2 opacity-50"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <i className={`fas ${stat.icon} text-lg bg-clip-text text-transparent bg-gradient-to-br ${stat.c}`}></i>
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-blue-950 mb-1 tracking-tighter drop-shadow-sm">
                    {stat.val}
                  </div>
                  <div className="text-blue-900 font-black uppercase tracking-[0.1em] text-[10px] mb-1">
                    {stat.label}
                  </div>
                  <div className={`text-[9px] font-black uppercase tracking-widest ${stat.sub === "Exclusive Dhule Launch" ? "text-blue-600 drop-shadow-[0_0_8px_rgba(37,99,235,0.3)]" : "text-slate-800 opacity-60"}`}>
                    {stat.sub}
                  </div>

                </div>
              </motion.div>
            ))}

          </div>
        </div>
      </section >


      {/* Tools Section: Senders & Pilots */}
      < section className="py-32 relative overflow-hidden bg-transparent" >



        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-stretch">

            {/* Senders */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative group bg-white/50 backdrop-blur-2xl border border-white/60 rounded-[3.5rem] p-12 shadow-[0_32px_64px_-16px_rgba(30,58,138,0.15)] flex flex-col justify-between overflow-hidden ring-1 ring-white/30"
              style={{ willChange: 'transform, opacity' }}
            >
              {/* Decorative Corner Gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/60 to-transparent rounded-bl-[10rem] pointer-events-none -mr-4 -mt-4 opacity-50"></div>

              <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(255,255,255,0.4)] pointer-events-none rounded-[3.5rem]" />

              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-transparent rounded-bl-[10rem] -mr-20 -mt-20 group-hover:from-blue-400/20 transition-all duration-700" />


              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black text-blue-950 mb-10 tracking-tight leading-[1] uppercase drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
                  Powerful <br />
                  <span className="text-blue-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-950 to-blue-700">Senders</span>
                </h2>


                <div className="space-y-10">
                  {[
                    { icon: "fa-calendar-check", t: "On-Demand Booking", d: "Schedule a delivery now or for a later time.", c: "from-blue-400 to-sky-400" },
                    { icon: "fa-shield-heart", t: "Secure & Insured", d: "Every delivery is insured and handled with care.", c: "from-sky-400 to-indigo-400" },
                    { icon: "fa-gauge-high", t: "Multi-Order Dashboard", d: "Manage all your past and current deliveries easily.", c: "from-indigo-400 to-blue-400" }
                  ].map((f, i) => (
                    <div key={i} className="flex gap-8 group/item">
                      <div className="relative flex-shrink-0 w-16 h-16">
                        <div className={`absolute inset-0 bg-gradient-to-br ${f.c} blur-xl opacity-20 group-hover/item:opacity-40 transition-opacity duration-500`} />
                        <div className="relative w-full h-full rounded-2xl bg-white shadow-xl flex items-center justify-center text-blue-600 group-hover/item:scale-110 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all duration-500 ring-1 ring-blue-50">
                          <i className={`fas ${f.icon} text-xl`}></i>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-blue-950 mb-1 tracking-tight drop-shadow-sm">{f.t}</h3>
                        <p className="text-slate-800 font-bold leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity text-sm">{f.d}</p>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Pilots */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative group bg-white/50 backdrop-blur-2xl border border-white/60 rounded-[3.5rem] p-12 shadow-[0_32px_64px_-16px_rgba(30,58,138,0.15)] flex flex-col justify-between overflow-hidden ring-1 ring-white/30"
              style={{ willChange: 'transform, opacity' }}
            >
              {/* Decorative Corner Gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/60 to-transparent rounded-bl-[10rem] pointer-events-none -mr-4 -mt-4 opacity-50"></div>

              <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(255,255,255,0.5)] pointer-events-none rounded-[3.5rem]" />

              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-transparent rounded-bl-[10rem] -mr-20 -mt-20 group-hover:from-blue-400/20 transition-all duration-700" />

              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black text-blue-950 mb-10 tracking-tight leading-[1] uppercase drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
                  Empowering <br />
                  <span className="text-blue-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-950 to-blue-700">Pilots</span>
                </h2>


                <div className="space-y-10">
                  {[
                    { icon: "fa-hand-holding-dollar", t: "Maximize Earnings", d: "Get paid instantly upon delivery completion.", c: "from-emerald-400 to-teal-500", shadow: "shadow-emerald-500/40" },
                    { icon: "fa-compass", t: "Smart Flight Planning", d: "Optimized routes and no-fly zone alerts.", c: "from-sky-400 to-blue-500", shadow: "shadow-blue-500/40" },
                    { icon: "fa-chart-pie", t: "Performance Analytics", d: "Track your earnings and flight hours.", c: "from-purple-400 to-indigo-500", shadow: "shadow-purple-500/40" }
                  ].map((f, i) => (
                    <div key={i} className="flex gap-8 group/item">
                      <div className="relative flex-shrink-0 w-16 h-16">
                        <div className={`absolute inset-0 bg-gradient-to-br ${f.c} blur-xl opacity-20 group-hover/item:opacity-40 transition-opacity duration-500`} />
                        <div className="relative w-full h-full rounded-2xl bg-white shadow-xl flex items-center justify-center text-blue-600 group-hover/item:scale-110 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all duration-500 ring-1 ring-blue-50">
                          <i className={`fas ${f.icon} text-xl`}></i>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-black text-blue-950 mb-1 tracking-tight transition-colors uppercase text-[0.9em] drop-shadow-sm">{f.t}</h3>
                        <p className="text-slate-800 font-bold leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity text-sm">{f.d}</p>
                      </div>


                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative Fiber-Optic Line */}
              <div className="absolute bottom-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-sky-500/40 to-transparent blur-[1px]" />
            </motion.div>
          </div>
        </div>
      </section >

      <Footer />
    </div >
  );
};

export default LandingPage;
