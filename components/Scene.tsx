import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  ContactShadows, 
  PerspectiveCamera,
  Stars
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { ArixTree } from './ArixTree';
import { TreeConfig } from '../types';

interface SceneProps {
  config: TreeConfig;
}

const Scene: React.FC<SceneProps> = ({ config }) => {
  return (
    <Canvas 
      shadows 
      dpr={[1, 2]} 
      gl={{ antialias: false, toneMappingExposure: 1.5 }}
    >
      <PerspectiveCamera makeDefault position={[0, 1, 8]} fov={45} />
      
      <Suspense fallback={null}>
        {/* Lighting Setup */}
        <ambientLight intensity={0.2} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={1.5} 
          castShadow 
          shadow-bias={-0.0001}
          color="#fff8e7"
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#064e3b" />
        
        {/* Environment Reflection */}
        <Environment preset="city" background={false} />
        
        {/* Background Atmosphere */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <color attach="background" args={['#050505']} />
        
        {/* Main Subject */}
        <ArixTree config={config} />
        
        {/* Grounding Shadows */}
        <ContactShadows 
          resolution={1024} 
          scale={20} 
          blur={2} 
          opacity={0.5} 
          far={10} 
          color="#000000" 
        />

        {/* Post Processing for Cinematic Feel */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={1.2} 
            mipmapBlur 
            intensity={config.lightsOn ? 1.5 : 0.4} 
            radius={0.6}
          />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 3} 
          maxPolarAngle={Math.PI / 1.8}
          minDistance={5}
          maxDistance={15}
          autoRotate={true}
          autoRotateSpeed={config.rotationSpeed}
        />
      </Suspense>
    </Canvas>
  );
};

export default Scene;
