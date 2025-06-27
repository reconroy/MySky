import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeBackgroundProps {
  weatherTheme: string;
}

export default function ThreeBackground({ weatherTheme }: ThreeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const particlesRef = useRef<THREE.Points[]>([]);
  const animationIdRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true,
      antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    camera.position.z = 5;

    // Create particles based on weather theme
    createWeatherParticles(scene, weatherTheme);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      updateParticles();
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    // Update particles when weather theme changes
    if (sceneRef.current) {
      // Clear existing particles
      particlesRef.current.forEach(particles => {
        sceneRef.current?.remove(particles);
        particles.geometry.dispose();
        if (particles.material instanceof THREE.Material) {
          particles.material.dispose();
        }
      });
      particlesRef.current = [];

      // Create new particles for current weather theme
      createWeatherParticles(sceneRef.current, weatherTheme);
    }
  }, [weatherTheme]);

  const createWeatherParticles = (scene: THREE.Scene, theme: string) => {
    const particleCount = theme === 'stormy' ? 800 : theme === 'rainy' ? 600 : 400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    // Define colors based on weather theme
    const themeColors = {
      sunny: [1, 0.9, 0.3],
      rainy: [0.3, 0.6, 0.9],
      cloudy: [0.7, 0.7, 0.8],
      stormy: [0.2, 0.2, 0.4],
      night: [0.1, 0.1, 0.3],
    };

    const baseColor = themeColors[theme as keyof typeof themeColors] || themeColors.sunny;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Random positions
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      // Colors with variation
      colors[i3] = baseColor[0] + (Math.random() - 0.5) * 0.3;
      colors[i3 + 1] = baseColor[1] + (Math.random() - 0.5) * 0.3;
      colors[i3 + 2] = baseColor[2] + (Math.random() - 0.5) * 0.3;

      // Velocities based on weather theme
      const speed = theme === 'stormy' ? 0.02 : theme === 'rainy' ? 0.015 : 0.005;
      velocities[i3] = (Math.random() - 0.5) * speed;
      velocities[i3 + 1] = theme === 'rainy' || theme === 'stormy' ? -Math.random() * speed * 2 : (Math.random() - 0.5) * speed;
      velocities[i3 + 2] = (Math.random() - 0.5) * speed;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const material = new THREE.PointsMaterial({
      size: theme === 'stormy' ? 2 : theme === 'rainy' ? 1.5 : 1,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: theme === 'night' ? 0.8 : 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current.push(particles);
  };

  const updateParticles = () => {
    particlesRef.current.forEach(particles => {
      const positions = particles.geometry.attributes.position.array as Float32Array;
      const velocities = particles.geometry.attributes.velocity.array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];

        // Reset particles that go out of bounds
        if (positions[i] > 10 || positions[i] < -10) {
          positions[i] = (Math.random() - 0.5) * 20;
        }
        if (positions[i + 1] > 10 || positions[i + 1] < -10) {
          positions[i + 1] = (Math.random() - 0.5) * 20;
        }
        if (positions[i + 2] > 5 || positions[i + 2] < -5) {
          positions[i + 2] = (Math.random() - 0.5) * 10;
        }
      }

      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y += 0.001;
    });
  };

  return <canvas ref={canvasRef} id="three-canvas" className="fixed inset-0 -z-10 pointer-events-none" />;
}
