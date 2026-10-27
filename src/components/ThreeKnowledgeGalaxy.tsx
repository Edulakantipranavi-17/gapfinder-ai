import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { useApp } from '../context/AppContext';
import { Topic, MasteryStatus } from '../types';
import { 
  Orbit, 
  Sparkles, 
  Target, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronUp, 
  ChevronDown, 
  RotateCcw, 
  Layers, 
  Eye, 
  BookOpen, 
  ArrowRight,
  Sliders,
  Filter
} from 'lucide-react';

interface ThreeKnowledgeGalaxyProps {
  onSelectTopicForQuiz?: (topicId: string) => void;
  onAskAboutTopic?: (topicName: string) => void;
}

export const ThreeKnowledgeGalaxy: React.FC<ThreeKnowledgeGalaxyProps> = ({
  onSelectTopicForQuiz,
  onAskAboutTopic,
}) => {
  const { activeCourse, setActiveTab } = useApp();

  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'weak' | 'medium' | 'strong'>('all');
  const [autoRotate, setAutoRotate] = useState(true);
  const [orbitSpeed, setOrbitSpeed] = useState(0.8);

  // References for three.js scene mutation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const topicNodesRef = useRef<Map<string, THREE.Group>>(new Map());
  const targetCamPos = useRef(new THREE.Vector3(0, 8, 26));

  const topics = activeCourse.topics;

  const getStatusColorHex = (status: MasteryStatus) => {
    switch (status) {
      case 'weak':
        return 0xf43f5e; // Rose-500
      case 'medium':
        return 0xf59e0b; // Amber-500
      case 'strong':
        return 0x10b981; // Emerald-500
      default:
        return 0x64748b; // Slate-500
    }
  };

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // Detect software WebGL per Three.js skill guidelines
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Initialize Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Initialize Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.025);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 28);
    cameraRef.current = camera;

    // Environment reflections via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    keyLight.position.set(12, 18, 14);
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 1.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 1.8);
    rimLight.position.set(-15, -8, -10);
    scene.add(rimLight);

    // Particle Background Dust
    const particleCount = isSoftwareGl ? 150 : 500;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 80;
      particlePos[i + 1] = (Math.random() - 0.5) * 60;
      particlePos[i + 2] = (Math.random() - 0.5) * 80;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.25,
      transparent: true,
      opacity: 0.6,
    });
    const starField = new THREE.Points(particleGeo, particleMat);
    scene.add(starField);

    // Central Sun / Curriculum Root Anchor
    const sunGroup = new THREE.Group();
    const sunCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.0, 3),
      new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        emissive: 0x4338ca,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.8,
      })
    );
    const sunHalo = new THREE.Mesh(
      new THREE.TorusGeometry(3.2, 0.08, 16, 64),
      new THREE.MeshStandardMaterial({
        color: 0x818cf8,
        emissive: 0x6366f1,
        emissiveIntensity: 1.0,
        roughness: 0.1,
        metalness: 0.9,
      })
    );
    sunHalo.rotation.x = Math.PI / 3;
    sunGroup.add(sunCore);
    sunGroup.add(sunHalo);
    scene.add(sunGroup);

    // Create 3D Composite Topic Nodes (THREE.Group with 3-5 parts each)
    const nodesMap = new Map<string, THREE.Group>();
    const nodeRadius = 14;
    const topicCount = Math.max(1, topics.length);

    topics.forEach((topic, idx) => {
      const angle = (idx / topicCount) * Math.PI * 2;
      const elevation = ((idx % 3) - 1) * 3.5;
      const x = Math.cos(angle) * nodeRadius;
      const z = Math.sin(angle) * nodeRadius;
      const y = elevation;

      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(x, y, z);
      (nodeGroup as any).userData = { topicId: topic.id, topic };

      const colorHex = getStatusColorHex(topic.status);

      // Part 1: Primary Nucleus (Faceted Crystal)
      const nucleusGeo = new THREE.IcosahedronGeometry(1.2, 1);
      const nucleusMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: topic.status === 'weak' ? 0.9 : 0.4,
        roughness: 0.15,
        metalness: 0.85,
      });
      const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
      nucleus.name = 'nucleus';
      nodeGroup.add(nucleus);

      // Part 2: Outer Faceted Lattice Cage
      const latticeGeo = new THREE.OctahedronGeometry(1.7, 0);
      const latticeMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
        roughness: 0.1,
        metalness: 0.9,
      });
      const lattice = new THREE.Mesh(latticeGeo, latticeMat);
      lattice.name = 'lattice';
      nodeGroup.add(lattice);

      // Part 3: Dual Orbital Gyroscope Rings
      const ringGeo = new THREE.TorusGeometry(2.1, 0.04, 12, 48);
      const ringMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.3,
        metalness: 0.7,
      });
      const ring1 = new THREE.Mesh(ringGeo, ringMat);
      ring1.name = 'ring1';
      ring1.rotation.x = Math.PI / 4;
      nodeGroup.add(ring1);

      const ring2 = new THREE.Mesh(ringGeo, ringMat);
      ring2.name = 'ring2';
      ring2.rotation.y = Math.PI / 3;
      nodeGroup.add(ring2);

      // Part 4: Satellite Status Beacon
      const beaconGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 1.2,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.name = 'beacon';
      beacon.position.set(1.8, 1.2, 0);
      nodeGroup.add(beacon);

      scene.add(nodeGroup);
      nodesMap.set(topic.id, nodeGroup);

      // Draw connection beam to central curriculum anchor
      const beamGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, z),
      ]);
      const beamMat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: topic.status === 'weak' ? 0.7 : 0.25,
      });
      const beam = new THREE.Line(beamGeo, beamMat);
      scene.add(beam);
    });

    topicNodesRef.current = nodesMap;

    // Mouse / Touch Interaction & Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = 0;
    let sphericalPhi = Math.PI / 2.8;
    let sphericalRadius = 32;

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isMouseDown) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        sphericalTheta -= deltaX * 0.006;
        sphericalPhi = Math.max(0.2, Math.min(Math.PI - 0.2, sphericalPhi - deltaY * 0.006));
      }
    };

    const onPointerDown = (e: MouseEvent) => {
      isMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerUp = () => {
      isMouseDown = false;
    };

    const onWheel = (e: WheelEvent) => {
      sphericalRadius = Math.max(14, Math.min(50, sphericalRadius + e.deltaY * 0.03));
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const meshes: THREE.Mesh[] = [];
      nodesMap.forEach((g) => {
        g.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
        });
      });

      const intersects = raycaster.intersectObjects(meshes, false);
      if (intersects.length > 0) {
        let parentGroup: THREE.Group | null = intersects[0].object.parent as THREE.Group;
        while (parentGroup && !parentGroup.userData?.topic) {
          parentGroup = parentGroup.parent as THREE.Group;
        }
        if (parentGroup && parentGroup.userData?.topic) {
          setSelectedTopic(parentGroup.userData.topic);
        }
      }
    };

    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mouseup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: true });
    container.addEventListener('click', onClick);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Render Loop with Silky Exponential Damping
    let frameId = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Auto rotation
      if (autoRotate && !isMouseDown) {
        sphericalTheta += delta * 0.15 * orbitSpeed;
      }

      // Smooth camera position damping
      const camTargetX = sphericalRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      const camTargetY = sphericalRadius * Math.cos(sphericalPhi);
      const camTargetZ = sphericalRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);

      camera.position.x += (camTargetX - camera.position.x) * 0.08;
      camera.position.y += (camTargetY - camera.position.y) * 0.08;
      camera.position.z += (camTargetZ - camera.position.z) * 0.08;
      camera.lookAt(0, 0, 0);

      // Rotate central sun
      sunCore.rotation.y += 0.005;
      sunHalo.rotation.z += 0.003;

      // Rotate nodes & orbit beacons
      nodesMap.forEach((node, topicId) => {
        const lattice = node.getObjectByName('lattice');
        const ring1 = node.getObjectByName('ring1');
        const ring2 = node.getObjectByName('ring2');
        const beacon = node.getObjectByName('beacon');

        if (lattice) lattice.rotation.y += delta * 0.4;
        if (ring1) ring1.rotation.z += delta * 0.6;
        if (ring2) ring2.rotation.x += delta * 0.5;
        if (beacon) {
          beacon.position.x = Math.cos(time * 2) * 1.9;
          beacon.position.z = Math.sin(time * 2) * 1.9;
        }

        // Float oscillation
        node.position.y += Math.sin(time * 1.5 + Number(topicId.slice(-1) || 0)) * 0.004;
      });

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('mousedown', onPointerDown);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('click', onClick);

      // Clean disposal
      scene.clear();
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [topics, autoRotate, orbitSpeed]);

  const handleFocusWeakest = () => {
    const weakTopic = topics.find((t) => t.status === 'weak');
    if (weakTopic) {
      setSelectedTopic(weakTopic);
    }
  };

  return (
    <div className="relative w-full h-[78vh] rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden select-none">
      {/* 3D Canvas Container */}
      <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Minimal Overlay Badge */}
      <div className="absolute top-5 left-5 z-20 pointer-events-none">
        <div className="bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <Orbit className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>3D Knowledge Galaxy & Cognitive Synapse Map</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30">
                PBR WebGL
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Drag to orbit • Scroll to zoom • Click any node to inspect gap diagnostics
            </div>
          </div>
        </div>
      </div>

      {/* Selected Topic Inspector HUD Card (Pivots cleanly) */}
      {selectedTopic && (
        <div className="absolute top-5 right-5 z-20 max-w-sm w-full bg-slate-900/95 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-800 px-2 py-0.5 rounded">
              {selectedTopic.unit}
            </span>
            <button
              onClick={() => setSelectedTopic(null)}
              className="text-slate-400 hover:text-white text-xs font-bold px-2 py-0.5 rounded bg-slate-800"
            >
              ✕
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                selectedTopic.status === 'weak' ? 'bg-rose-500' : selectedTopic.status === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              <h3 className="text-base font-bold text-white">{selectedTopic.name}</h3>
            </div>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
              {selectedTopic.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400">Mastery Score:</span>
              <div className={`text-base font-bold ${
                selectedTopic.status === 'weak' ? 'text-rose-400' : selectedTopic.status === 'medium' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {selectedTopic.masteryScore}%
              </div>
            </div>
            <div>
              <span className="text-slate-400">Exam Weightage:</span>
              <div className="text-base font-bold text-indigo-300">
                {selectedTopic.weightage}%
              </div>
            </div>
          </div>

          {selectedTopic.diagnosisReason && (
            <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
              <strong className="text-indigo-300">Clinical Diagnosis: </strong>
              {selectedTopic.diagnosisReason}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                if (onSelectTopicForQuiz) {
                  onSelectTopicForQuiz(selectedTopic.id);
                } else {
                  setActiveTab('quiz');
                }
              }}
              className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow transition text-center"
            >
              Run Diagnostic Quiz
            </button>
            <button
              onClick={() => {
                if (onAskAboutTopic) {
                  onAskAboutTopic(selectedTopic.name);
                } else {
                  setActiveTab('assistant');
                }
              }}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-xl border border-slate-700"
            >
              Ask Tutor
            </button>
          </div>
        </div>
      )}

      {/* Unified Bottom Control Dock (Adheres to Three.js skill layout <= 15% footprint) */}
      <div
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 max-w-2xl w-[92%] ${
          isDockCollapsed ? 'translate-y-[85%]' : 'translate-y-0'
        }`}
      >
        <div className="flex justify-center -mb-2 relative z-30">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-lg transition flex items-center gap-1 cursor-pointer"
          >
            {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{isDockCollapsed ? 'Show 3D Galaxy Controls' : 'Hide Controls'}</span>
          </button>
        </div>

        <div className="bg-slate-900/95 border border-slate-850 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          {/* Status Indicators Pill */}
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-rose-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Weak ({topics.filter((t) => t.status === 'weak').length})</span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Medium ({topics.filter((t) => t.status === 'medium').length})</span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Strong ({topics.filter((t) => t.status === 'strong').length})</span>
            </span>
          </div>

          {/* Quick Camera Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleFocusWeakest}
              className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Inspect Weakest Gap</span>
            </button>

            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                autoRotate
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Auto Orbit: {autoRotate ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
