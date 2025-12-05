import React, { useState } from 'react';
import Scene from './components/Scene';
import Overlay from './components/Overlay';
import { TreeConfig } from './types';

const App: React.FC = () => {
  const [config, setConfig] = useState<TreeConfig>({
    theme: 'emerald',
    rotationSpeed: 0.8,
    lightsOn: true,
    showParticles: true,
    isAssembled: true,
  });

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Dynamic Background Gradient */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))]"
        style={{
          '--tw-gradient-from': config.theme === 'emerald' ? '#064e3b' : 
                                config.theme === 'sapphire' ? '#1e3a8a' :
                                config.theme === 'ruby' ? '#7f1d1d' : '#1f2937',
          '--tw-gradient-to': '#000000',
          '--tw-gradient-stops': 'var(--tw-gradient-from), #000000 70%'
        } as React.CSSProperties}
      />
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene config={config} />
      </div>

      {/* UI Overlay Layer */}
      <Overlay config={config} setConfig={setConfig} />
    </div>
  );
};

export default App;
