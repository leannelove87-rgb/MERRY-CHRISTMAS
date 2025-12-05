import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { TreeConfig, THEME_COLORS } from '../types';

interface ArixTreeProps {
  config: TreeConfig;
}

// -- CONSTANTS & MATERIALS --

const GOLD_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#FFD700",
  roughness: 0.1,
  metalness: 1.0,
  emissive: "#B45309",
  emissiveIntensity: 0.2,
});

const RED_GIFT_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#7f1d1d",
  roughness: 0.3,
  metalness: 0.4,
});

const BOX_GEOMETRY = new THREE.BoxGeometry(0.25, 0.25, 0.25);
const SPHERE_GEOMETRY = new THREE.SphereGeometry(0.12, 16, 16);

// -- SHADERS --

const particlesVertexShader = `
  uniform float uTime;
  uniform float uProgress;
  attribute vec3 aScatterPos;
  attribute float aRandom;
  
  varying float vProgress;
  varying float vRandom;
  
  // Easing function for smooth transition
  float cubicBezier(float t) {
    return t * t * (3.0 - 2.0 * t);
  }

  void main() {
    vProgress = uProgress;
    vRandom = aRandom;
    
    float t = cubicBezier(uProgress);
    
    // Mix positions
    vec3 pos = mix(aScatterPos, position, t);
    
    // Add "breathing" noise when in tree form
    if (t > 0.8) {
       float breathe = sin(uTime * 2.0 + pos.y * 2.0) * 0.02;
       pos.x += breathe * pos.x;
       pos.z += breathe * pos.z;
    }
    
    // Add turbulent noise when scattered
    if (t < 1.0) {
       float turbulence = sin(uTime * 0.5 + aRandom * 10.0) * 0.5 * (1.0 - t);
       pos.y += turbulence;
       pos.x += cos(uTime * 0.3 + aRandom * 5.0) * 0.2 * (1.0 - t);
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Size attenuation
    float size = (25.0 * (1.0 + t * 0.5)) * (1.0 / -mvPosition.z);
    gl_PointSize = size;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const particlesFragmentShader = `
  uniform vec3 uColor;
  uniform float uAlpha;
  
  void main() {
    // Soft circular particle
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    if(ll > 0.5) discard;
    
    // Glow gradient
    float strength = 1.0 - (ll * 2.0);
    strength = pow(strength, 2.0);
    
    gl_FragColor = vec4(uColor, strength * uAlpha);
  }
`;

// -- HELPERS --

// Generate points inside cone volumes
const generateTreePoints = (count: number, scatterRadius: number) => {
  const positions = new Float32Array(count * 3);
  const scatterPositions = new Float32Array(count * 3);
  const randoms = new Float32Array(count);

  const cones = [
    { bottom: 0, height: 1.5, radiusBot: 1.8, radiusTop: 1.0 },
    { bottom: 1.2, height: 1.5, radiusBot: 1.4, radiusTop: 0.6 },
    { bottom: 2.2, height: 1.5, radiusBot: 1.0, radiusTop: 0.2 },
    { bottom: 3.2, height: 1.2, radiusBot: 0.6, radiusTop: 0.0 },
  ];

  for (let i = 0; i < count; i++) {
    // Select a random cone segment weighted by volume (simplified to random pick for visual noise)
    const cone = cones[Math.floor(Math.random() * cones.length)];
    
    // Random height within cone segment
    const hPercent = Math.random();
    const y = cone.bottom + hPercent * cone.height;
    
    // Radius at this height
    const rAtH = THREE.MathUtils.lerp(cone.radiusBot, cone.radiusTop, hPercent);
    
    // Random point inside the circle at this height (mostly surface for fullness)
    const angle = Math.random() * Math.PI * 2;
    // Square root random for uniform distribution, but we want dense surface so keep it linear or bias to 1
    const rRandom = Math.sqrt(Math.random()) * rAtH; 
    
    const x = Math.cos(angle) * rRandom;
    const z = Math.sin(angle) * rRandom;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y - 1.5; // Center vertically somewhat
    positions[i * 3 + 2] = z;

    // Scatter position (Sphere cloud)
    const sTheta = Math.random() * Math.PI * 2;
    const sPhi = Math.acos(2 * Math.random() - 1);
    const sR = scatterRadius * Math.cbrt(Math.random());
    
    scatterPositions[i * 3] = sR * Math.sin(sPhi) * Math.cos(sTheta);
    scatterPositions[i * 3 + 1] = sR * Math.sin(sPhi) * Math.sin(sTheta);
    scatterPositions[i * 3 + 2] = sR * Math.cos(sPhi);

    randoms[i] = Math.random();
  }

  return { positions, scatterPositions, randoms };
};

// Generate points specifically on the surface for ornaments
const generateOrnamentPositions = (count: number, scatterRadius: number) => {
  const data = [];
  const cones = [
    { bottom: 0, height: 1.5, radiusBot: 1.8, radiusTop: 1.0 },
    { bottom: 1.2, height: 1.5, radiusBot: 1.4, radiusTop: 0.6 },
    { bottom: 2.2, height: 1.5, radiusBot: 1.0, radiusTop: 0.2 },
  ];

  for (let i = 0; i < count; i++) {
    const cone = cones[Math.floor(Math.random() * cones.length)];
    const hPercent = Math.random();
    const y = cone.bottom + hPercent * cone.height - 1.5;
    const rAtH = THREE.MathUtils.lerp(cone.radiusBot, cone.radiusTop, hPercent);
    const angle = Math.random() * Math.PI * 2;
    
    // Surface placement
    const x = Math.cos(angle) * rAtH;
    const z = Math.sin(angle) * rAtH;

    // Scatter pos
    const sx = (Math.random() - 0.5) * scatterRadius * 2;
    const sy = (Math.random() - 0.5) * scatterRadius * 2;
    const sz = (Math.random() - 0.5) * scatterRadius * 2;

    data.push({ 
      target: new THREE.Vector3(x, y, z), 
      scatter: new THREE.Vector3(sx, sy, sz),
      scale: 0.5 + Math.random() * 0.5 
    });
  }
  return data;
};

// -- COMPONENTS --

const FoliageSystem: React.FC<{ 
  color: string; 
  isAssembled: boolean; 
  opacity: number 
}> = ({ color, isAssembled, opacity }) => {
  const count = 15000;
  const { positions, scatterPositions, randoms } = useMemo(() => generateTreePoints(count, 12), []);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Current animation progress value (0 to 1)
  const progress = useRef(0);

  useFrame((state, delta) => {
    // Smooth damp towards target state
    const target = isAssembled ? 1 : 0;
    progress.current = THREE.MathUtils.damp(progress.current, target, 2, delta); // Lambda 2 for smooth flow

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uProgress.value = progress.current;
      materialRef.current.uniforms.uColor.value.set(color);
      materialRef.current.uniforms.uAlpha.value = opacity;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={scatterPositions.length / 3}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={particlesVertexShader}
        fragmentShader={particlesFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uColor: { value: new THREE.Color(color) },
          uAlpha: { value: opacity }
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const DynamicOrnamentLayer: React.FC<{
  type: 'box' | 'sphere';
  count: number;
  isAssembled: boolean;
  color: string;
  lag: number; // Physics weight: higher lag = heavier
}> = ({ type, count, isAssembled, color, lag }) => {
  const data = useMemo(() => generateOrnamentPositions(count, 15), [count]);
  // Store current positions to interpolate from
  const currentPositions = useRef(data.map(d => d.scatter.clone()));
  const instancesRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!instancesRef.current) return;

    const targetState = isAssembled ? 1 : 0;
    
    data.forEach((item, i) => {
      // Lerp logic tailored per instance for "organic" feel
      // We interpolate the "current" position towards the "destination" (target or scatter)
      const destination = isAssembled ? item.target : item.scatter;
      
      // Calculate speed based on lag. Heavier items move slower.
      // Basic lerp: pos = pos + (target - pos) * speed
      const speed = delta * lag; 
      currentPositions.current[i].lerp(destination, speed);

      // Add rotation
      dummy.position.copy(currentPositions.current[i]);
      if (isAssembled) {
         // Face outward roughly or just spin slowly
         dummy.rotation.y += delta * 0.5 * (i % 2 === 0 ? 1 : -1);
         dummy.rotation.x = Math.sin(state.clock.elapsedTime + i) * 0.1;
      } else {
         // Tumble when scattered
         dummy.rotation.x += delta * (i % 2 === 0 ? 1 : -1);
         dummy.rotation.z += delta * (i % 2 === 0 ? 1 : -1);
      }
      
      dummy.scale.setScalar(item.scale * (isAssembled ? 1 : 0.8)); // Shrink slightly when scattered
      dummy.updateMatrix();
      instancesRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    instancesRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh 
        ref={instancesRef} 
        args={[undefined, undefined, count]} 
        castShadow 
        receiveShadow
    >
      {type === 'box' ? <boxGeometry args={[0.25, 0.25, 0.25]} /> : <sphereGeometry args={[0.15, 16, 16]} />}
      <meshStandardMaterial 
        color={color} 
        roughness={0.15} 
        metalness={0.9} 
        envMapIntensity={2} 
      />
    </instancedMesh>
  );
};

const StarTopper: React.FC<{ isAssembled: boolean; isLit: boolean }> = ({ isAssembled, isLit }) => {
  const ref = useRef<THREE.Group>(null);
  const pos = useRef(new THREE.Vector3(0, 10, 0)); // Start high up
  
  useFrame((state, delta) => {
    if(!ref.current) return;
    
    const target = isAssembled ? new THREE.Vector3(0, 4.0, 0) : new THREE.Vector3(0, 15, 0);
    pos.current.lerp(target, delta * 1.5); // Moves slowly
    
    ref.current.position.copy(pos.current);
    ref.current.rotation.y += delta * 0.5;
    
    // Scale pulsation
    const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    ref.current.scale.setScalar(scale);
  });

  return (
    <group ref={ref}>
      <mesh>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial 
          color="#FFD700" 
          emissive="#FFD700" 
          emissiveIntensity={isLit ? 2 : 0} 
          toneMapped={false}
        />
      </mesh>
      {isLit && isAssembled && (
         <pointLight intensity={3} distance={6} color="#FDB813" decay={2} />
      )}
    </group>
  );
}

// -- MAIN TREE COMPONENT --

export const ArixTree: React.FC<ArixTreeProps> = ({ config }) => {
  const groupRef = useRef<THREE.Group>(null);
  const themeColors = THEME_COLORS[config.theme];

  useFrame((state) => {
    if (groupRef.current) {
      // Very slow rotation of the whole group for cinematic effect
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <Float 
      speed={2} 
      rotationIntensity={0.1} 
      floatIntensity={0.2} 
      floatingRange={[-0.1, 0.1]}
      enabled={config.isAssembled} // Only float when assembled
    >
      <group ref={groupRef}>
        
        {/* The main foliage cloud/tree */}
        <FoliageSystem 
            color={themeColors.body} 
            isAssembled={config.isAssembled} 
            opacity={0.9}
        />
        
        {/* Secondary foliage for density and color variation (e.g., gold highlights) */}
        <FoliageSystem 
            color={themeColors.glow} 
            isAssembled={config.isAssembled} 
            opacity={0.4}
        />

        {/* Dynamic Ornaments - Heavy Boxes */}
        <DynamicOrnamentLayer 
            type="box"
            count={30}
            isAssembled={config.isAssembled}
            color={config.theme === 'emerald' ? '#7f1d1d' : themeColors.ornament} // Red gifts on green tree
            lag={1.5} // Slower
        />

        {/* Dynamic Ornaments - Light Spheres */}
        <DynamicOrnamentLayer 
            type="sphere"
            count={60}
            isAssembled={config.isAssembled}
            color={themeColors.ornament}
            lag={3.0} // Faster
        />

        <StarTopper isAssembled={config.isAssembled} isLit={config.lightsOn} />

        {/* Ambient Particles in background */}
        {config.showParticles && (
          <Sparkles 
            count={200} 
            scale={15} 
            size={4} 
            speed={0.4} 
            opacity={0.3} 
            color={themeColors.glow}
          />
        )}
      </group>
    </Float>
  );
};
