import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeMedicalHologramProps {
  variant?: 'fullscreen' | 'compact';
  interactive?: boolean;
  pulseIntensity?: number;
  className?: string;
  onSceneReady?: () => void;
}

export const ThreeMedicalHologram: React.FC<ThreeMedicalHologramProps> = ({
  variant = 'fullscreen',
  interactive = true,
  pulseIntensity = 1,
  className = '',
  onSceneReady
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || (variant === 'fullscreen' ? window.innerWidth : 400);
    const height = container.clientHeight || (variant === 'fullscreen' ? window.innerHeight : 400);

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = variant === 'fullscreen' ? 18 : 15;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Main 3D Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // ─── 1. Professional Medical Blue DNA Double Helix ───
    const dnaGroup = new THREE.Group();
    const strand1Geometry = new THREE.SphereGeometry(0.22, 16, 16);
    const strand2Geometry = new THREE.SphereGeometry(0.22, 16, 16);
    
    // Royal Sapphire Blue Strand
    const strand1Material = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x1d4ed8,
      emissiveIntensity: 1.1,
      roughness: 0.2,
      metalness: 0.8
    });
    
    // Sky Blue Strand
    const strand2Material = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.1,
      roughness: 0.2,
      metalness: 0.8
    });

    // Soft White & Ice Blue Base Rungs
    const rungMaterial1 = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.8
    });
    const rungMaterial2 = new THREE.MeshBasicMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.8
    });

    const numBasePairs = variant === 'fullscreen' ? 36 : 24;
    const helixRadius = variant === 'fullscreen' ? 2.9 : 2.3;
    const helixHeight = variant === 'fullscreen' ? 12.5 : 9.5;
    const stepHeight = helixHeight / numBasePairs;

    for (let i = 0; i < numBasePairs; i++) {
      const t = (i / numBasePairs) * Math.PI * 4;
      const y = (i - numBasePairs / 2) * stepHeight;
      const x1 = Math.cos(t) * helixRadius;
      const z1 = Math.sin(t) * helixRadius;
      const x2 = Math.cos(t + Math.PI) * helixRadius;
      const z2 = Math.sin(t + Math.PI) * helixRadius;

      // Strand 1 Sphere (Royal Blue)
      const sphere1 = new THREE.Mesh(strand1Geometry, strand1Material);
      sphere1.position.set(x1, y, z1);
      dnaGroup.add(sphere1);

      // Strand 2 Sphere (Sky Blue)
      const sphere2 = new THREE.Mesh(strand2Geometry, strand2Material);
      sphere2.position.set(x2, y, z2);
      dnaGroup.add(sphere2);

      // Connecting Base Rung
      const p1 = new THREE.Vector3(x1, y, z1);
      const p2 = new THREE.Vector3(x2, y, z2);
      const rungDist = p1.distanceTo(p2);
      const rungGeom = new THREE.CylinderGeometry(0.045, 0.045, rungDist, 8);
      const rung = new THREE.Mesh(rungGeom, i % 2 === 0 ? rungMaterial1 : rungMaterial2);
      rung.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
      rung.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
      dnaGroup.add(rung);
    }
    mainGroup.add(dnaGroup);

    // ─── 2. 3D Floating Glowing Medical Cross (Pure White & Sapphire) ───
    const crossGroup = new THREE.Group();
    const crossMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x3b82f6,
      emissiveIntensity: 1.0,
      roughness: 0.1,
      metalness: 0.9
    });

    const crossVGeom = new THREE.BoxGeometry(0.7, 2.4, 0.5);
    const crossHGeom = new THREE.BoxGeometry(2.4, 0.7, 0.5);
    const crossV = new THREE.Mesh(crossVGeom, crossMat);
    const crossH = new THREE.Mesh(crossHGeom, crossMat);
    crossGroup.add(crossV);
    crossGroup.add(crossH);
    crossGroup.position.set(0, 0, 0);
    mainGroup.add(crossGroup);

    // ─── 3. Holographic HUD Telemetry Rings (Royal & Sky Blue) ───
    const hudGroup = new THREE.Group();
    const ringRadius1 = variant === 'fullscreen' ? 4.6 : 3.6;
    const ringRadius2 = variant === 'fullscreen' ? 5.9 : 4.6;

    const ringGeom1 = new THREE.RingGeometry(ringRadius1 - 0.06, ringRadius1, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const ringMesh1 = new THREE.Mesh(ringGeom1, ringMat1);
    ringMesh1.rotation.x = Math.PI / 2.3;
    hudGroup.add(ringMesh1);

    const ringGeom2 = new THREE.RingGeometry(ringRadius2 - 0.05, ringRadius2, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const ringMesh2 = new THREE.Mesh(ringGeom2, ringMat2);
    ringMesh2.rotation.x = -Math.PI / 2.5;
    ringMesh2.rotation.y = Math.PI / 4;
    hudGroup.add(ringMesh2);

    // Orbiting Nodes (Blue & White palette)
    const orbitNodes: THREE.Mesh[] = [];
    const nodeColors = [0x3b82f6, 0x60a5fa, 0x93c5fd, 0xffffff, 0x0284c7, 0xe2e8f0];
    for (let i = 0; i < 6; i++) {
      const nodeGeom = new THREE.SphereGeometry(0.18, 14, 14);
      const nodeMat = new THREE.MeshBasicMaterial({ color: nodeColors[i % nodeColors.length] });
      const node = new THREE.Mesh(nodeGeom, nodeMat);
      hudGroup.add(node);
      orbitNodes.push(node);
    }
    mainGroup.add(hudGroup);

    // ─── 4. Dynamic ECG Heartbeat Waveform Ring ───
    const wavePointsCount = 140;
    const waveGeom = new THREE.BufferGeometry();
    const wavePositions = new Float32Array(wavePointsCount * 3);
    const waveRadius = variant === 'fullscreen' ? 3.9 : 3.1;

    for (let i = 0; i < wavePointsCount; i++) {
      const angle = (i / wavePointsCount) * Math.PI * 2;
      wavePositions[i * 3] = Math.cos(angle) * waveRadius;
      wavePositions[i * 3 + 1] = Math.sin(angle) * waveRadius;
      wavePositions[i * 3 + 2] = 0;
    }
    waveGeom.setAttribute('position', new THREE.BufferAttribute(wavePositions, 3));
    const waveMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
      linewidth: 2.5
    });
    const waveLine = new THREE.LineLoop(waveGeom, waveMat);
    waveLine.rotation.x = Math.PI / 2;
    mainGroup.add(waveLine);

    // ─── 5. Blue & White Particle Constellation ───
    const particleCount = variant === 'fullscreen' ? 700 : 350;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color(0x3b82f6), // Royal Blue
      new THREE.Color(0x38bdf8), // Sky Blue
      new THREE.Color(0x93c5fd), // Soft Blue
      new THREE.Color(0x60a5fa), // Light Royal
      new THREE.Color(0xffffff)  // Pure White
    ];

    for (let i = 0; i < particleCount; i++) {
      const spread = variant === 'fullscreen' ? 24 : 15;
      particlePositions[i * 3] = (Math.random() - 0.5) * spread;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * spread;

      const chosen = palette[Math.floor(Math.random() * palette.length)];
      particleColors[i * 3] = chosen.r;
      particleColors[i * 3 + 1] = chosen.g;
      particleColors[i * 3 + 2] = chosen.b;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeom.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // ─── 6. Clean Medical Studio Lighting ───
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x3b82f6, 3.0);
    dirLight1.position.set(6, 12, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 2.5);
    dirLight2.position.set(-9, -6, 8);
    scene.add(dirLight2);

    const dirLight3 = new THREE.DirectionalLight(0x93c5fd, 2.0);
    dirLight3.position.set(0, -10, 6);
    scene.add(dirLight3);

    const pointLight = new THREE.PointLight(0x3b82f6, 4.0, 25);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    // ─── Interaction Controls ───
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (!interactive) return;
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousMousePosition = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isDragging && interactive) {
        const deltaX = clientX - previousMousePosition.x;
        const deltaY = clientY - previousMousePosition.y;
        targetRotY += deltaX * 0.008;
        targetRotX += deltaY * 0.008;
        previousMousePosition = { x: clientX, y: clientY };
      } else {
        mouseX = (clientX / window.innerWidth) * 2 - 1;
        mouseY = -(clientY / window.innerHeight) * 2 + 1;
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    if (interactive) {
      window.addEventListener('mousedown', handlePointerDown);
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchstart', handlePointerDown, { passive: true });
      window.addEventListener('touchmove', handlePointerMove, { passive: true });
      window.addEventListener('touchend', handlePointerUp);
    }

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // ─── Animation Loop ───
    let clock = new THREE.Clock();
    onSceneReady?.();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // DNA Rotation
      dnaGroup.rotation.y = elapsedTime * 0.45;
      dnaGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.15;

      // Cross Pulsing & Rotation
      const pulseScale = 1 + Math.sin(elapsedTime * 3) * 0.06 * pulseIntensity;
      crossGroup.scale.set(pulseScale, pulseScale, pulseScale);
      crossGroup.rotation.y = -elapsedTime * 0.25;

      // Orbiting HUD rings
      ringMesh1.rotation.z = elapsedTime * 0.3;
      ringMesh2.rotation.z = -elapsedTime * 0.25;

      // Orbiting Nodes
      orbitNodes.forEach((node, idx) => {
        const theta = elapsedTime * 0.65 + (idx * Math.PI * 2) / orbitNodes.length;
        node.position.set(Math.cos(theta) * ringRadius1, Math.sin(theta) * ringRadius1 * 0.4, Math.sin(theta) * ringRadius1 * 0.8);
      });

      // Waveform EKG dynamic pulse
      const posAttr = waveGeom.getAttribute('position') as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;
      for (let i = 0; i < wavePointsCount; i++) {
        const angle = (i / wavePointsCount) * Math.PI * 2;
        const ekgPulse = Math.sin(angle * 8 - elapsedTime * 5) * (Math.sin(angle * 2) > 0.5 ? 0.45 : 0.1);
        const r = waveRadius + ekgPulse * pulseIntensity;
        posArr[i * 3] = Math.cos(angle) * r;
        posArr[i * 3 + 1] = Math.sin(angle) * r;
      }
      posAttr.needsUpdate = true;
      waveLine.rotation.z = elapsedTime * 0.15;

      // Ambient Cyber Particles
      particles.rotation.y = elapsedTime * 0.04;
      particles.rotation.x = elapsedTime * 0.02;

      // Damping / Mouse parallax
      mainGroup.rotation.y += (targetRotY + mouseX * 0.4 - mainGroup.rotation.y) * 0.05;
      mainGroup.rotation.x += (targetRotX + mouseY * 0.3 - mainGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousedown', handlePointerDown);
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('mouseup', handlePointerUp);
        window.removeEventListener('touchstart', handlePointerDown);
        window.removeEventListener('touchmove', handlePointerMove);
        window.removeEventListener('touchend', handlePointerUp);
      }

      // Dispose Three.js elements
      renderer.dispose();
      strand1Geometry.dispose();
      strand2Geometry.dispose();
      crossVGeom.dispose();
      crossHGeom.dispose();
      ringGeom1.dispose();
      ringGeom2.dispose();
      particleGeom.dispose();
      waveGeom.dispose();
    };
  }, [variant, interactive, pulseIntensity, onSceneReady]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none pointer-events-auto ${className}`}
    />
  );
};
