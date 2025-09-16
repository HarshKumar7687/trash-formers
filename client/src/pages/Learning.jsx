// Learning.jsx
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Navbar from '../components/Navbar';

const Learning = () => {
  const [activeCategory, setActiveCategory] = useState('recycling');
  const [isVisible, setIsVisible] = useState(false);
  const [globeLoaded, setGlobeLoaded] = useState(false);
  const globeMountRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
    
    // Initialize Three.js scene for the globe
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    
    // Set renderer size to perfectly match the container
    const globeSize = 144; // Matches w-36 h-36 (144px)
    renderer.setSize(globeSize, globeSize);
    renderer.setClearColor(0x000000, 0);
    
    if (globeMountRef.current) {
      // Clear any existing content
      while (globeMountRef.current.firstChild) {
        globeMountRef.current.removeChild(globeMountRef.current.firstChild);
      }
      globeMountRef.current.appendChild(renderer.domElement);
    }
    
    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 3, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    const directionalLight2 = new THREE.DirectionalLight(0x88aaff, 1);
    directionalLight2.position.set(-5, -3, -5);
    scene.add(directionalLight2);
    
    const pointLight = new THREE.PointLight(0xffaa88, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
    
    const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    scene.add(hemisphereLight);

    // Load the globe model with better error handling
    const loader = new GLTFLoader();
    
    // Try multiple possible paths for the globe model
    const possiblePaths = [
      '/globe.glb',
      '/models/globe.glb',
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/earth/earth.glb'
    ];
    
    let modelLoaded = false;
    
    const tryLoadModel = (index = 0) => {
      if (index >= possiblePaths.length) {
        // All paths failed, create fallback
        createFallbackGlobe(scene);
        setGlobeLoaded(true);
        return;
      }
      
      loader.load(
        possiblePaths[index],
        (gltf) => {
          modelLoaded = true;
          const globe = gltf.scene;
          globe.scale.set(2, 2, 2);
          globe.position.y = 0;
          scene.add(globe);
          setGlobeLoaded(true);
        },
        (xhr) => {
          // Progress callback
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
          // Error callback - try next path
          console.error(`Error loading model from ${possiblePaths[index]}:`, error);
          tryLoadModel(index + 1);
        }
      );
    };
    
    // Start trying to load the model
    tryLoadModel();
    
    // Camera position
    camera.position.z = 3;
    
    // Add orbit controls for interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    
    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      const container = globeMountRef.current;
      if (container) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      if (globeMountRef.current && renderer.domElement) {
        globeMountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Create a fallback globe if model loading fails
  const createFallbackGlobe = (scene) => {
    // Clear existing objects
    while(scene.children.length > 0) { 
      scene.remove(scene.children[0]); 
    }
    
    // Earth geometry
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    
    // Create Earth texture programmatically
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    // Draw blue background (oceans)
    context.fillStyle = '#22a7f0';
    context.fillRect(0, 0, 512, 512);
    
    // Draw green continents
    context.fillStyle = '#2ecc71';
    context.beginPath();
    context.arc(150, 200, 60, 0, Math.PI * 2); // Continent 1
    context.fill();
    
    context.beginPath();
    context.arc(350, 250, 40, 0, Math.PI * 2); // Continent 2
    context.fill();
    
    context.beginPath();
    context.arc(280, 350, 50, 0, Math.PI * 2); // Continent 3
    context.fill();
    
    context.beginPath();
    context.arc(100, 350, 45, 0, Math.PI * 2); // Continent 4
    context.fill();
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    
    // Earth material
    const material = new THREE.MeshPhongMaterial({ 
      map: texture,
      specular: new THREE.Color(0x333333),
      shininess: 5
    });
    
    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);
    
    // Cloud layer
    const cloudGeometry = new THREE.SphereGeometry(1.02, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(clouds);
    
    // Add lights back
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    const directionalLight2 = new THREE.DirectionalLight(0x88aaff, 0.5);
    directionalLight2.position.set(-5, -3, -5);
    scene.add(directionalLight2);
  };

  // Function to handle PDF download
  const handleDownload = () => {
    const pdfUrl = 'https://www.khushiparisara.in/wp-content/uploads/2016/11/Waste_Management_Handbook.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute('download', 'Waste_Management_Handbook.pdf');
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Rest of your component remains the same...
  const wasteCategories = {
    // ... (keep your existing wasteCategories object)
  };

  const tips = [
    // ... (keep your existing tips array)
  ];

  const stats = [
    // ... (keep your existing stats array)
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white py-8 px-4 font-sans overflow-hidden">
      <Navbar />
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-700 rounded-full filter blur-3xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-800 rounded-full filter blur-3xl opacity-30 animate-pulse-slower"></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-pink-700 rounded-full filter blur-3xl opacity-25 animate-pulse-medium"></div>
      </div>
      
      <div className="max-w-6xl mt-48 mx-auto relative z-10">
        {/* Header */}
        <header className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block backdrop-blur-md rounded-full mb-6 animate-bounce-slow border border-cyan-500/30">
            {/* Globe container */}
            <div className="w-36 h-36 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center overflow-hidden p-0 m-0 relative">
              {!globeLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <div ref={globeMountRef} className="w-full h-full flex items-center justify-center p-0 m-0"></div>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-400 animate-pulse">
            WASTE MANAGEMENT
          </h1>
          <div className="w-48 h-1 bg-gradient-to-r from-green-400 to-cyan-400 mx-auto mb-6 rounded-full shadow-lg shadow-cyan-400/50"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Learn how to properly manage waste to protect our environment and create a sustainable future.
          </p>
        </header>

        {/* Rest of your component remains the same... */}
        
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.4; }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.35; }
        }
        @keyframes pulse-medium {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s infinite;
        }
        .animate-pulse-slower {
          animation: pulse-slower 8s infinite;
        }
        .animate-pulse-medium {
          animation: pulse-medium 7s infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite;
        }
      `}</style>
    </div>
  );
};

export default Learning;