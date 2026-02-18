import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const createParticles = (count) => {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const radius = 8 + Math.random() * 24;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi) * 0.6;
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    sizes[i] = Math.random() * 1.5 + 0.6;
  }

  return { positions, sizes };
};

export const ThreeBackground = ({ theme = 'light' }) => {
  const mountRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
    camera.position.set(0, 3, 22);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const particleCount = 220;
    const geometry = new THREE.BufferGeometry();
    const { positions, sizes } = createParticles(particleCount);

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const color = theme === 'dark' ? '#7fdac6' : '#1f6f5b';
    const material = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 0.18,
      transparent: true,
      opacity: theme === 'dark' ? 0.55 : 0.35,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    points.rotation.x = 0.2;
    scene.add(points);

    const glow = new THREE.PointLight(color, theme === 'dark' ? 0.6 : 0.4, 90);
    glow.position.set(15, 10, 20);
    scene.add(glow);

    const resize = () => {
      if (!mountRef.current) return;
      const { clientWidth, clientHeight } = mountRef.current;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };

    const animate = () => {
      points.rotation.y += 0.0015;
      points.rotation.x += 0.0006;
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [theme]);

  return <div ref={mountRef} className="absolute inset-0 opacity-70" />;
};
