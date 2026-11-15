import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Sparkles,
  Eye,
  Radio,
  Volume2,
  VolumeX,
  Maximize2,
  Scan,
  Rotate3d,
  Activity,
  CheckCircle2,
} from 'lucide-react';

interface RobotInspector3DProps {
  isScanning?: boolean;
  onTriggerScan?: () => void;
  detectedMaterial?: string | null;
  className?: string;
}

// Procedural audio synthesizer for subtle futuristic robot chimes
class RobotAudioSynth {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playHoverChirp() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  playScanPulse() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(940, now + 0.25);
      osc.frequency.linearRampToValueAtTime(440, now + 0.5);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.52);
    } catch {
      // Audio policy fallback
    }
  }
}

const robotAudio = new RobotAudioSynth();

// Reusable math helpers outside render loop
const _targetHeadRot = new THREE.Euler(0, 0, 0);
const _targetTorsoRot = new THREE.Euler(0, 0, 0);

export const RobotInspector3D: React.FC<RobotInspector3DProps> = ({
  isScanning = false,
  onTriggerScan,
  detectedMaterial = 'Cement & Rebar',
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeMode, setActiveMode] = useState<'track' | 'orbit' | 'lidar'>('track');
  const [robotStatus, setRobotStatus] = useState<string>('Online & Calibrated');
  const [scanPulseActive, setScanPulseActive] = useState(false);

  // References to animate in render loop
  const headRef = useRef<THREE.Group | null>(null);
  const torsoRef = useRef<THREE.Group | null>(null);
  const leftEyeRef = useRef<THREE.Mesh | null>(null);
  const rightEyeRef = useRef<THREE.Mesh | null>(null);
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const gyroRing1Ref = useRef<THREE.Mesh | null>(null);
  const gyroRing2Ref = useRef<THREE.Mesh | null>(null);
  const scanBeamRef = useRef<THREE.Mesh | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);

  // Normalized pointer coordinates (-1 to 1)
  const pointerPos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Handle pointer tracking
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!mountRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    pointerPos.current.targetX = Math.max(-1, Math.min(1, x));
    pointerPos.current.targetY = Math.max(-1, Math.min(1, y));
  }, []);

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
    setRobotStatus('Tracking User Focus');
    robotAudio.playHoverChirp();
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
    pointerPos.current.targetX = 0;
    pointerPos.current.targetY = 0;
    setRobotStatus('Standby Patrol Mode');
  }, []);

  const triggerManualPulse = () => {
    setScanPulseActive(true);
    robotAudio.playScanPulse();
    setRobotStatus('Emitting Micro-LiDAR Sweep');
    if (onTriggerScan) onTriggerScan();
    setTimeout(() => {
      setScanPulseActive(false);
      setRobotStatus('Scan Analysis Complete');
    }, 1800);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    robotAudio.enabled = next;
    if (next) robotAudio.playHoverChirp();
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL guard
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1e182e, 6, 16);

    const camera = new THREE.PerspectiveCamera(
      36,
      container.clientWidth / container.clientHeight,
      0.1,
      30
    );
    camera.position.set(0, 0.4, 4.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf4eeff, 2.2);
    keyLight.position.set(3, 4, 3);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.shadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x72b9e8, 0x51416f, 0.9);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x7561a8, 1.8);
    rimLight.position.set(-3, 2, -2.5);
    scene.add(rimLight);

    // Visor accent point light
    const pointLight = new THREE.PointLight(0x72b9e8, 2.0, 3.5);
    pointLight.position.set(0, 0.8, 1.1);
    scene.add(pointLight);
    pointLightRef.current = pointLight;

    // Contact Ground Shadow Disc
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const shadowCtx = shadowCanvas.getContext('2d');
    if (shadowCtx) {
      const grad = shadowCtx.createRadialGradient(64, 64, 0, 64, 64, 60);
      grad.addColorStop(0, 'rgba(15, 10, 30, 0.55)');
      grad.addColorStop(0.5, 'rgba(25, 18, 45, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      shadowCtx.fillStyle = grad;
      shadowCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;

    const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.08;
    scene.add(shadowMesh);

    // =========================================================================
    // BUILD ROBOT COMPOSITE MODEL (THREE.Group: 10 distinct architectural parts)
    // =========================================================================
    const robotRoot = new THREE.Group();
    robotRoot.position.y = -0.15;
    scene.add(robotRoot);

    // Shared high-grade PBR Materials
    const armorDarkMat = new THREE.MeshStandardMaterial({
      color: 0x252336,
      roughness: 0.28,
      metalness: 0.65,
    });

    const armorVioletMat = new THREE.MeshStandardMaterial({
      color: 0x51416f,
      roughness: 0.22,
      metalness: 0.72,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe5e7eb,
      roughness: 0.15,
      metalness: 0.92,
    });

    const goldAccentMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.2,
      metalness: 0.88,
    });

    const glassVisorMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a0914,
      roughness: 0.08,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.45,
      transparent: true,
      opacity: 0.92,
    });

    const cyanEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0x72b9e8,
      emissive: 0x72b9e8,
      emissiveIntensity: 2.2,
      roughness: 0.1,
    });

    const purpleGlowMat = new THREE.MeshStandardMaterial({
      color: 0x7561a8,
      emissive: 0x7561a8,
      emissiveIntensity: 1.8,
      roughness: 0.2,
    });

    // 1. BASE LEVITATION SYSTEM (Gyroscopic Anti-Grav Rings)
    const baseGroup = new THREE.Group();
    baseGroup.position.y = -0.78;
    robotRoot.add(baseGroup);

    const ring1Geo = new THREE.TorusGeometry(0.72, 0.032, 16, 64);
    const ring1 = new THREE.Mesh(ring1Geo, chromeMat);
    ring1.rotation.x = Math.PI / 2;
    baseGroup.add(ring1);
    gyroRing1Ref.current = ring1;

    const ring2Geo = new THREE.TorusGeometry(0.55, 0.024, 16, 48);
    const ring2 = new THREE.Mesh(ring2Geo, goldAccentMat);
    ring2.rotation.x = Math.PI / 2.1;
    ring2.rotation.y = Math.PI / 6;
    baseGroup.add(ring2);
    gyroRing2Ref.current = ring2;

    const antiGravCoreGeo = new THREE.CylinderGeometry(0.24, 0.08, 0.18, 32);
    const antiGravCore = new THREE.Mesh(antiGravCoreGeo, armorVioletMat);
    baseGroup.add(antiGravCore);

    // 2. TORSO / EXOSUIT CHASSIS
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = -0.32;
    robotRoot.add(torsoGroup);
    torsoRef.current = torsoGroup;

    // Main chest capsule
    const chestGeo = new THREE.CylinderGeometry(0.48, 0.38, 0.65, 32);
    const chestMesh = new THREE.Mesh(chestGeo, armorDarkMat);
    chestMesh.castShadow = !isSoftwareGl;
    chestMesh.receiveShadow = !isSoftwareGl;
    torsoGroup.add(chestMesh);

    // Front Chest Armor Shield
    const chestPlateGeo = new THREE.BoxGeometry(0.56, 0.44, 0.16);
    const chestPlate = new THREE.Mesh(chestPlateGeo, armorVioletMat);
    chestPlate.position.set(0, 0.02, 0.2);
    torsoGroup.add(chestPlate);

    // Quantum Arc Reactor Core (Circular glowing lens in chest)
    const coreGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.05, 32);
    const coreMesh = new THREE.Mesh(coreGeo, cyanEmissiveMat);
    coreMesh.rotation.x = Math.PI / 2;
    coreMesh.position.set(0, 0.02, 0.29);
    torsoGroup.add(coreMesh);
    coreMeshRef.current = coreMesh;

    // Core Outer Bezel
    const coreBezelGeo = new THREE.TorusGeometry(0.155, 0.02, 16, 32);
    const coreBezel = new THREE.Mesh(coreBezelGeo, chromeMat);
    coreBezel.position.set(0, 0.02, 0.29);
    torsoGroup.add(coreBezel);

    // Mechanical Collar Ring
    const collarGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.12, 32);
    const collarMesh = new THREE.Mesh(collarGeo, chromeMat);
    collarMesh.position.y = 0.36;
    torsoGroup.add(collarMesh);

    // Shoulder Pauldrons (Left & Right)
    const leftShoulderGeo = new THREE.SphereGeometry(0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const leftShoulder = new THREE.Mesh(leftShoulderGeo, armorVioletMat);
    leftShoulder.position.set(-0.52, 0.22, 0);
    leftShoulder.rotation.z = Math.PI / 3;
    torsoGroup.add(leftShoulder);

    const rightShoulder = leftShoulder.clone();
    rightShoulder.position.x = 0.52;
    rightShoulder.rotation.z = -Math.PI / 3;
    torsoGroup.add(rightShoulder);

    // 3. ARTICULATED HEAD UNIT (Pivots seamlessly with mouse tracking)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.58, 0);
    robotRoot.add(headGroup);
    headRef.current = headGroup;

    // Aerodynamic Helmet Shell
    const helmetGeo = new THREE.SphereGeometry(0.44, 32, 32);
    helmetGeo.scale(1.0, 0.94, 1.08);
    const helmetMesh = new THREE.Mesh(helmetGeo, armorDarkMat);
    helmetMesh.castShadow = !isSoftwareGl;
    headGroup.add(helmetMesh);

    // Curved Dark Glass Visor
    const visorGeo = new THREE.SphereGeometry(
      0.445,
      32,
      32,
      -Math.PI / 2,
      Math.PI,
      Math.PI / 5,
      Math.PI / 1.7
    );
    visorGeo.scale(1.01, 0.96, 1.1);
    const visorMesh = new THREE.Mesh(visorGeo, glassVisorMat);
    headGroup.add(visorMesh);

    // Expressive Digital LED Eyes inside Visor
    const eyeGeo = new THREE.CapsuleGeometry(0.045, 0.11, 8, 16);

    const leftEye = new THREE.Mesh(eyeGeo, cyanEmissiveMat);
    leftEye.rotation.z = Math.PI / 2;
    leftEye.position.set(-0.16, 0.05, 0.44);
    headGroup.add(leftEye);
    leftEyeRef.current = leftEye;

    const rightEye = leftEye.clone();
    rightEye.position.x = 0.16;
    headGroup.add(rightEye);
    rightEyeRef.current = rightEye;

    // Center Optical Laser Aperture
    const centerSensorGeo = new THREE.SphereGeometry(0.035, 16, 16);
    const centerSensor = new THREE.Mesh(centerSensorGeo, purpleGlowMat);
    centerSensor.position.set(0, 0.05, 0.465);
    headGroup.add(centerSensor);

    // Dual Sensor Ear Pods (Left & Right)
    const earPodGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.07, 24);
    const leftEar = new THREE.Mesh(earPodGeo, chromeMat);
    leftEar.rotation.z = Math.PI / 2;
    leftEar.position.set(-0.46, 0.02, 0);
    headGroup.add(leftEar);

    const earGlowGeo = new THREE.TorusGeometry(0.075, 0.015, 12, 24);
    const leftEarGlow = new THREE.Mesh(earGlowGeo, purpleGlowMat);
    leftEarGlow.rotation.y = Math.PI / 2;
    leftEarGlow.position.set(-0.496, 0.02, 0);
    headGroup.add(leftEarGlow);

    const rightEar = leftEar.clone();
    rightEar.position.x = 0.46;
    headGroup.add(rightEar);

    const rightEarGlow = leftEarGlow.clone();
    rightEarGlow.position.x = 0.496;
    headGroup.add(rightEarGlow);

    // Crown LiDAR Scanner Dome on top of head
    const lidarDomeGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.08, 24);
    const lidarDome = new THREE.Mesh(lidarDomeGeo, goldAccentMat);
    lidarDome.position.set(0, 0.43, -0.02);
    headGroup.add(lidarDome);

    const lidarLensGeo = new THREE.SphereGeometry(0.065, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const lidarLens = new THREE.Mesh(lidarLensGeo, cyanEmissiveMat);
    lidarLens.position.set(0, 0.47, -0.02);
    headGroup.add(lidarLens);

    // Holographic LiDAR Scan Beam (Cone projected downwards when scanning)
    const scanBeamGeo = new THREE.ConeGeometry(0.85, 1.8, 32, 1, true);
    const scanBeamMat = new THREE.MeshBasicMaterial({
      color: 0x72b9e8,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const scanBeam = new THREE.Mesh(scanBeamGeo, scanBeamMat);
    scanBeam.rotation.x = Math.PI;
    scanBeam.position.set(0, -0.9, 0.5);
    headGroup.add(scanBeam);
    scanBeamRef.current = scanBeam;

    // =========================================================================
    // ANIMATION & KINEMATICS RENDER LOOP
    // =========================================================================
    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      // Smooth interpolation of pointer coordinates
      pointerPos.current.x = THREE.MathUtils.damp(
        pointerPos.current.x,
        pointerPos.current.targetX,
        10,
        delta
      );
      pointerPos.current.y = THREE.MathUtils.damp(
        pointerPos.current.y,
        pointerPos.current.targetY,
        10,
        delta
      );

      // 1. Hover Floating Bob & Idle Levitation
      const hoverY = Math.sin(elapsed * 2.2) * 0.045;
      robotRoot.position.y = -0.15 + hoverY;

      // 2. Gyroscope Ring Counter-Rotations
      if (gyroRing1Ref.current) {
        gyroRing1Ref.current.rotation.z += delta * 1.8;
      }
      if (gyroRing2Ref.current) {
        gyroRing2Ref.current.rotation.z -= delta * 2.4;
      }

      // 3. Head Kinematics: Tracking mouse or idle scanning
      if (headRef.current) {
        if (activeMode === 'orbit') {
          // Slow 360 preview orbit
          _targetHeadRot.y = Math.sin(elapsed * 0.9) * 0.6;
          _targetHeadRot.x = Math.cos(elapsed * 1.2) * 0.15;
          _targetHeadRot.z = 0;
        } else {
          // Responsive pointer tracking: Head follows cursor!
          _targetHeadRot.y = pointerPos.current.x * 0.75;
          _targetHeadRot.x = -pointerPos.current.y * 0.52;
          _targetHeadRot.z = -pointerPos.current.x * 0.12;
        }

        headRef.current.rotation.y = THREE.MathUtils.damp(
          headRef.current.rotation.y,
          _targetHeadRot.y,
          12,
          delta
        );
        headRef.current.rotation.x = THREE.MathUtils.damp(
          headRef.current.rotation.x,
          _targetHeadRot.x,
          12,
          delta
        );
        headRef.current.rotation.z = THREE.MathUtils.damp(
          headRef.current.rotation.z,
          _targetHeadRot.z,
          10,
          delta
        );
      }

      // 4. Torso Subtle Kinematic Lag (Natural organic body follows head)
      if (torsoRef.current && headRef.current) {
        _targetTorsoRot.y = headRef.current.rotation.y * 0.35;
        _targetTorsoRot.x = headRef.current.rotation.x * 0.2;
        torsoRef.current.rotation.y = THREE.MathUtils.damp(
          torsoRef.current.rotation.y,
          _targetTorsoRot.y,
          6,
          delta
        );
        torsoRef.current.rotation.x = THREE.MathUtils.damp(
          torsoRef.current.rotation.x,
          _targetTorsoRot.x,
          6,
          delta
        );
      }

      // 5. Digital Eye Blink & Tracking Shift
      const eyeScaleY = Math.sin(elapsed * 0.8) > 0.96 ? 0.1 : 1.0;
      if (leftEyeRef.current && rightEyeRef.current) {
        leftEyeRef.current.scale.y = eyeScaleY;
        rightEyeRef.current.scale.y = eyeScaleY;

        // Shift eyes slightly within visor based on cursor position
        const eyeShiftX = pointerPos.current.x * 0.025;
        const eyeShiftY = pointerPos.current.y * 0.02;
        leftEyeRef.current.position.x = -0.16 + eyeShiftX;
        leftEyeRef.current.position.y = 0.05 + eyeShiftY;
        rightEyeRef.current.position.x = 0.16 + eyeShiftX;
        rightEyeRef.current.position.y = 0.05 + eyeShiftY;
      }

      // 6. Chest Arc Reactor Pulse Intensity
      if (coreMeshRef.current) {
        const pulse = 1.6 + Math.sin(elapsed * 4.0) * 0.7;
        (coreMeshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
      }

      // 7. Active LiDAR Scan Beam Visualization
      const activeScanning = isScanning || scanPulseActive;
      if (scanBeamRef.current) {
        const targetOpacity = activeScanning ? 0.35 + Math.sin(elapsed * 18.0) * 0.15 : 0.0;
        const beamMat = scanBeamRef.current.material as THREE.MeshBasicMaterial;
        beamMat.opacity = THREE.MathUtils.damp(beamMat.opacity, targetOpacity, 12, delta);
        scanBeamRef.current.rotation.y += delta * 3.0;
      }

      // Point light intensity tracking
      if (pointLightRef.current) {
        pointLightRef.current.intensity = activeScanning ? 3.5 : 1.8 + Math.sin(elapsed * 3) * 0.4;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeMode, isScanning, scanPulseActive]);

  return (
    <div
      className={`relative rounded-3xl bg-gradient-to-b from-[#252536] via-[#1f1d2e] to-[#181624] text-white p-5 border border-purple-500/20 shadow-xl overflow-hidden flex flex-col justify-between ${className}`}
    >
      {/* Background Tech Hex Grid & Radial Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#7561A8]/25 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Top Status Bar */}
      <div className="relative z-10 flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold tracking-wide text-white flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#72B9E8]" />
            RoboInspector Unit v4.2
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute Robot Sound' : 'Enable Robot Sound'}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#72B9E8] transition-colors"
            title={soundEnabled ? 'Sound FX: On' : 'Sound FX: Off'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-gray-400" />}
          </button>

          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#7561A8]/40 border border-[#7561A8]/50 text-[#72B9E8]">
            AI Optical Vision
          </span>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport with Hover Interactivity */}
      <div
        ref={mountRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className="relative z-10 w-full h-[280px] sm:h-[320px] cursor-grab active:cursor-grabbing focus:outline-hidden"
      >
        {/* Floating Instruction Overlay */}
        <div className="absolute top-2 left-2 z-20 pointer-events-none bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 flex items-center gap-1.5 text-[10px] text-gray-300">
          <Eye className="w-3 h-3 text-[#72B9E8]" />
          <span>{isHovered ? 'Tracking your pointer in real-time' : 'Hover over robot to track cursor'}</span>
        </div>

        {/* Real-time Status Badge */}
        <div className="absolute top-2 right-2 z-20 pointer-events-none bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 flex items-center gap-1.5 text-[10px] text-[#72B9E8]">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span>{robotStatus}</span>
        </div>

        {/* Live LiDAR Scan Indicator */}
        {(isScanning || scanPulseActive) && (
          <div className="absolute inset-x-4 bottom-4 z-20 bg-blue-950/80 backdrop-blur-md border border-[#72B9E8]/50 text-[#72B9E8] px-3 py-2 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-2 animate-pulse">
            <Scan className="w-4 h-4 animate-spin" />
            <span>LiDAR Scan In Progress: Profiling Surface Degradation...</span>
          </div>
        )}
      </div>

      {/* Interactive Bottom Control Toolbar */}
      <div className="relative z-10 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        {/* Inspection Mode Toggles */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveMode('track')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
              activeMode === 'track'
                ? 'bg-[#7561A8] text-white shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            Head Track
          </button>
          <button
            onClick={() => setActiveMode('orbit')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
              activeMode === 'orbit'
                ? 'bg-[#7561A8] text-white shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Rotate3d className="w-3 h-3" />
            Auto Orbit
          </button>
        </div>

        {/* Action Trigger Button */}
        <button
          onClick={triggerManualPulse}
          disabled={scanPulseActive || isScanning}
          className="px-4 py-2 rounded-xl font-bold bg-gradient-to-r from-[#7561A8] to-[#51416F] hover:from-[#8973c4] hover:to-[#604f85] text-white shadow-md shadow-[#7561A8]/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          <Scan className="w-3.5 h-3.5 text-[#72B9E8]" />
          <span>Trigger LiDAR Pulse</span>
        </button>
      </div>
    </div>
  );
};
