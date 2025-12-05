import React from 'react';
import { TreeConfig, ThemeColor } from '../types';

interface OverlayProps {
  config: TreeConfig;
  setConfig: React.Dispatch<React.SetStateAction<TreeConfig>>;
}

const Overlay: React.FC<OverlayProps> = ({ config, setConfig }) => {
  const toggleLights = () => setConfig(prev => ({ ...prev, lightsOn: !prev.lightsOn }));
  const toggleParticles = () => setConfig(prev => ({ ...prev, showParticles: !prev.showParticles }));
  const toggleAssembly = () => setConfig(prev => ({ ...prev, isAssembled: !prev.isAssembled }));
  
  const handleThemeChange = (theme: ThemeColor) => {
    setConfig(prev => ({ ...prev, theme }));
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 z-10">
      {/* Header */}
      <header className="flex flex-col items-start pointer-events-auto">
        <h1 className="text-5xl md:text-7xl font-serif italic text-yellow-400 drop-shadow-[0_2px_15px_rgba(255,215,0,0.6)] tracking-wide">
          LT BUSBAR
        </h1>
        <h2 className="text-sm md:text-base font-sans uppercase tracking-[0.4em] text-yellow-200/80 mt-1 ml-2">
          MACHINERY
        </h2>
      </header>

      {/* Main Interaction Action */}
      <div className="absolute top-1/2 left-6 md:left-12 -translate-y-1/2 pointer-events-auto">
        <button
          onClick={toggleAssembly}
          className={`group flex items-center space-x-4 transition-all duration-700 ${config.isAssembled ? 'opacity-80 hover:opacity-100' : 'opacity-100'}`}
        >
          <div className={`w-16 h-16 rounded-full border border-yellow-500/50 flex items-center justify-center backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:border-yellow-400 ${config.isAssembled ? 'bg-black/20' : 'bg-yellow-500/20 animate-pulse'}`}>
            <div className={`w-3 h-3 bg-yellow-400 rounded-full transition-all duration-500 ${config.isAssembled ? 'scale-100' : 'scale-150 shadow-[0_0_20px_rgba(250,204,21,0.8)]'}`} />
          </div>
          <div className="flex flex-col">
             <span className="text-yellow-100 font-serif text-xl italic">{config.isAssembled ? 'Deconstruct' : 'Assemble'}</span>
             <span className="text-yellow-500/60 text-[10px] uppercase tracking-widest">Interactive Mode</span>
          </div>
        </button>
      </div>

      {/* Controls */}
      <div className="self-end md:self-auto md:w-80 pointer-events-auto backdrop-blur-md bg-black/60 border border-white/10 rounded-2xl p-6 shadow-2xl transition-all hover:bg-black/70 hover:border-yellow-500/30">
        <div className="space-y-6">
          
          {/* Theme Selector */}
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-400 mb-3 block font-sans">Material Theme</label>
            <div className="flex gap-3">
              {(['emerald', 'sapphire', 'ruby', 'obsidian'] as ThemeColor[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeChange(theme)}
                  className={`w-10 h-10 rounded-full border-2 transition-all duration-500 transform hover:scale-110 focus:outline-none relative overflow-hidden ${
                    config.theme === theme 
                      ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)] scale-110' 
                      : 'border-white/10 hover:border-white/40 grayscale hover:grayscale-0'
                  }`}
                  style={{
                     backgroundColor: 
                       theme === 'emerald' ? '#064e3b' :
                       theme === 'sapphire' ? '#1e3a8a' :
                       theme === 'ruby' ? '#7f1d1d' : '#111827'
                  }}
                  title={theme.charAt(0).toUpperCase() + theme.slice(1)}
                >
                  {/* Sheen effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Toggles */}
          <div className="flex justify-between items-center group">
             <span className="text-sm text-yellow-100/80 font-serif italic group-hover:text-yellow-400 transition-colors">Illumination</span>
             <button 
                onClick={toggleLights}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-500 ${config.lightsOn ? 'bg-yellow-600/80' : 'bg-white/10'}`}
             >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-500 ${config.lightsOn ? 'translate-x-6' : 'translate-x-0'}`} />
             </button>
          </div>

          <div className="flex justify-between items-center group">
             <span className="text-sm text-yellow-100/80 font-serif italic group-hover:text-yellow-400 transition-colors">Magic Dust</span>
             <button 
                onClick={toggleParticles}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-500 ${config.showParticles ? 'bg-yellow-600/80' : 'bg-white/10'}`}
             >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-500 ${config.showParticles ? 'translate-x-6' : 'translate-x-0'}`} />
             </button>
          </div>
          
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 left-0 w-full text-center pointer-events-none">
        <p className="text-[10px] md:text-xs text-white/20 tracking-[0.3em] uppercase font-sans">
          LT BUSBAR MACHINERY • WebGL Experience
        </p>
      </footer>
    </div>
  );
};

export default Overlay;
