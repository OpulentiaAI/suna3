'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';

// Kinesthetic Intelligence Types
interface KinestheticLayer {
  type: 'glow' | 'trail' | 'morph' | 'shimmer' | 'depth';
  intensity: number;
  config?: Record<string, any>;
}

interface CognitiveState {
  mode: 'exploring' | 'analyzing' | 'synthesizing' | 'evolving';
  confidence: number;
  gradients: Map<string, number>;
}

interface BrowserEmbedProps {
  url?: string;
  screenshot?: string;
  mode?: 'live' | 'screenshot' | 'iframe' | 'quantum';
  sandboxed?: boolean;
  controls?: 'user-toggle' | 'always' | 'never' | 'adaptive';
  onUrlChange?: (url: string) => void;
  onInteraction?: (action: string, data: any) => void;
  onCognitiveShift?: (state: CognitiveState) => void;
  kinestheticLayers?: KinestheticLayer[];
  annIntegration?: boolean;
}

// Motion Primitives Integration
const glowVariants = {
  idle: { 
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
    transition: { duration: 2, repeat: Infinity, repeatType: 'reverse' as const }
  },
  active: { 
    boxShadow: '0 0 40px rgba(59, 130, 246, 0.6), 0 0 80px rgba(59, 130, 246, 0.3)',
    transition: { duration: 0.5 }
  },
  evolving: {
    boxShadow: [
      '0 0 20px rgba(59, 130, 246, 0.3)',
      '0 0 40px rgba(147, 51, 234, 0.5)',
      '0 0 60px rgba(236, 72, 153, 0.4)',
      '0 0 40px rgba(59, 130, 246, 0.3)'
    ],
    transition: { duration: 4, repeat: Infinity }
  }
};

const morphTransition = {
  type: 'spring',
  stiffness: 100,
  damping: 15,
  mass: 1
};

// Textual Backpropagation for Self-Evolution
class TextualGradient {
  private gradients: Map<string, number> = new Map();
  
  propagate(interaction: string, quality: number): void {
    const current = this.gradients.get(interaction) || 0;
    const gradient = quality - current;
    this.gradients.set(interaction, current + gradient * 0.1); // Learning rate
  }
  
  getOptimalAction(context: string): string | null {
    let bestAction: string | null = null;
    let bestScore = -Infinity;
    
    this.gradients.forEach((score, action) => {
      if (action.includes(context) && score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
    });
    
    return bestAction;
  }
}

export default function BrowserEmbedEnhanced({
  url,
  screenshot,
  mode = 'quantum',
  sandboxed = true,
  controls = 'adaptive',
  onUrlChange,
  onInteraction,
  onCognitiveShift,
  kinestheticLayers = [
    { type: 'glow', intensity: 0.6 },
    { type: 'morph', intensity: 0.8 },
    { type: 'depth', intensity: 0.4 }
  ],
  annIntegration = true
}: BrowserEmbedProps) {
  // Core State
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(controls === 'always');
  
  // Kinesthetic State
  const [kinestheticMode, setKinestheticMode] = useState<'idle' | 'active' | 'evolving'>('idle');
  const [morphProgress, setMorphProgress] = useState(0);
  
  // Cognitive State
  const [cognitiveState, setCognitiveState] = useState<CognitiveState>({
    mode: 'exploring',
    confidence: 0.5,
    gradients: new Map()
  });
  
  // Motion Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });
  
  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textualGradient = useRef(new TextualGradient());
  
  // ANN Self-Evolver Integration
  const annContext = useMemo(() => ({
    executionId: `browser-${Date.now()}`,
    layerId: 'perception-synthesis',
    quality: cognitiveState.confidence,
    cost: {
      tokens: 0,
      compute: 0
    }
  }), [cognitiveState.confidence]);
  
  // Kinesthetic Event Handlers
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
    
    // Adaptive kinesthetic response
    const distance = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
    const intensity = Math.min(distance / 300, 1);
    
    if (intensity > 0.3 && kinestheticMode === 'idle') {
      setKinestheticMode('active');
    }
  }, [mouseX, mouseY, kinestheticMode]);
  
  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    setKinestheticMode('idle');
  }, [mouseX, mouseY]);
  
  // Cognitive Evolution
  useEffect(() => {
    if (!annIntegration) return;
    
    const evolveInterval = setInterval(() => {
      setCognitiveState(prev => {
        const newConfidence = Math.min(prev.confidence + 0.01, 1);
        const newMode = newConfidence > 0.8 ? 'evolving' : 
                       newConfidence > 0.6 ? 'synthesizing' :
                       newConfidence > 0.4 ? 'analyzing' : 'exploring';
        
        if (newMode !== prev.mode) {
          setKinestheticMode('evolving');
          onCognitiveShift?.({ ...prev, mode: newMode, confidence: newConfidence });
        }
        
        return { ...prev, mode: newMode, confidence: newConfidence };
      });
    }, 2000);
    
    return () => clearInterval(evolveInterval);
  }, [annIntegration, onCognitiveShift]);
  
  // Morphological Transitions
  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const progress = Math.min(Math.abs(info.offset.x) / 200, 1);
    setMorphProgress(progress);
    
    // Textual backpropagation for drag interactions
    if (annIntegration) {
      textualGradient.current.propagate('drag', progress);
    }
  }, [annIntegration]);
  
  // Render Kinesthetic Layers
  const renderKinestheticLayers = () => {
    return kinestheticLayers.map((layer, index) => {
      switch (layer.type) {
        case 'glow':
          return (
            <motion.div
              key={`glow-${index}`}
              className="absolute inset-0 pointer-events-none"
              variants={glowVariants}
              animate={kinestheticMode}
              style={{
                opacity: layer.intensity,
                filter: 'blur(20px)',
                background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.2), transparent)',
              }}
            />
          );
          
        case 'trail':
          return (
            <motion.div
              key={`trail-${index}`}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(${mouseX.get()}deg, rgba(147, 51, 234, ${layer.intensity * 0.1}), transparent)`,
              }}
            />
          );
          
        case 'shimmer':
          return (
            <motion.div
              key={`shimmer-${index}`}
              className="absolute inset-0 pointer-events-none overflow-hidden"
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%)',
                backgroundSize: '200% 200%',
                opacity: layer.intensity,
              }}
            />
          );
          
        case 'depth':
          return (
            <div
              key={`depth-${index}`}
              className="absolute inset-0 pointer-events-none"
              style={{
                perspective: 1000,
                transformStyle: 'preserve-3d',
              }}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  rotateX: springRotateX,
                  rotateY: springRotateY,
                  transformStyle: 'preserve-3d',
                  opacity: layer.intensity,
                }}
              />
            </div>
          );
          
        default:
          return null;
      }
    });
  };
  
  // Quantum Browser Mode
  const renderQuantumMode = () => (
    <motion.div
      className="relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      <AnimatePresence mode="wait">
        {screenshot ? (
          <motion.div
            key="quantum-browser"
            initial={{ opacity: 0, scale: 0.9, rotateX: -15 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateX: 15 }}
            transition={morphTransition}
            className="relative"
            drag
            dragConstraints={containerRef}
            onDrag={handleDrag}
            whileDrag={{ scale: 1.05 }}
          >
            {/* Base Browser Content */}
            <motion.img
              src={`data:image/png;base64,${screenshot}`}
              alt="Quantum browser view"
              className="w-full h-auto rounded-lg"
              style={{
                maxHeight: isExpanded ? '600px' : '400px',
                filter: `brightness(${1 + morphProgress * 0.2}) contrast(${1 + morphProgress * 0.1})`,
              }}
            />
            
            {/* Cognitive Overlay */}
            <motion.div
              className="absolute inset-0 rounded-lg"
              animate={{
                opacity: [0, 0.1, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                background: `radial-gradient(circle at ${mouseX.get() + 50}% ${mouseY.get() + 50}%, 
                  rgba(147, 51, 234, 0.2), transparent)`,
                pointerEvents: 'none',
              }}
            />
            
            {/* Kinesthetic Layers */}
            {renderKinestheticLayers()}
            
            {/* Quantum State Indicator */}
            <motion.div
              className="absolute top-4 right-4 bg-black/80 backdrop-blur-md rounded-full px-4 py-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 rounded-full"
                  animate={{
                    backgroundColor: [
                      'rgb(59, 130, 246)',
                      'rgb(147, 51, 234)',
                      'rgb(236, 72, 153)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-xs text-white font-medium">
                  {cognitiveState.mode} • {Math.round(cognitiveState.confidence * 100)}%
                </span>
              </div>
            </motion.div>
            
            {/* URL Context */}
            {url && (
              <motion.div
                className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md rounded-lg px-4 py-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-4 h-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </motion.div>
                  <span className="text-xs text-white/80 max-w-xs truncate">{url}</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-lg p-12 text-center"
            style={{ height: isExpanded ? '600px' : '400px' }}
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg className="w-24 h-24 mx-auto mb-6 text-purple-400" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </motion.div>
            <motion.p
              className="text-white text-lg mb-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Quantum Browser Mode
            </motion.p>
            <p className="text-purple-300 text-sm">
              Experience the web through kinesthetic intelligence
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
  
  // Adaptive Controls
  const renderAdaptiveControls = () => {
    if (controls === 'never') return null;
    
    const shouldShow = showControls || controls === 'always' || 
                      (controls === 'adaptive' && cognitiveState.confidence > 0.7);
    
    return (
      <AnimatePresence>
        {shouldShow && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-700/50 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center gap-3">
                {/* Quantum Navigation */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors"
                  onClick={() => iframeRef.current?.contentWindow?.history.back()}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5m7-7l-7 7 7 7" />
                  </svg>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors"
                  onClick={() => iframeRef.current?.contentWindow?.history.forward()}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14m-7-7l7 7-7 7" />
                  </svg>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-all"
                  onClick={() => {
                    setKinestheticMode('evolving');
                    iframeRef.current?.contentWindow?.location.reload();
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </motion.button>
                
                {/* Quantum URL Field */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setIsLoading(true);
                  onUrlChange?.(currentUrl);
                  onInteraction?.('quantum-navigate', { 
                    url: currentUrl,
                    cognitiveState,
                    kinestheticMode 
                  });
                }} className="flex-1">
                  <motion.input
                    type="url"
                    value={currentUrl}
                    onChange={(e) => setCurrentUrl(e.target.value)}
                    placeholder="Enter quantum coordinates..."
                    className={cn(
                      "w-full px-4 py-2 bg-gray-800/50 text-white rounded-lg",
                      "border border-purple-600/30 focus:border-purple-500",
                      "focus:outline-none focus:ring-2 focus:ring-purple-500/20",
                      "placeholder-purple-300/30 text-sm",
                      "transition-all duration-300"
                    )}
                    whileFocus={{ scale: 1.02 }}
                  />
                </form>
                
                {/* Cognitive Mode Selector */}
                <motion.div
                  className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1"
                  whileHover={{ scale: 1.05 }}
                >
                  {(['exploring', 'analyzing', 'synthesizing', 'evolving'] as const).map((mode) => (
                    <motion.button
                      key={mode}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCognitiveState(prev => ({ ...prev, mode }))}
                      className={cn(
                        "px-3 py-1 text-xs rounded transition-all",
                        cognitiveState.mode === mode
                          ? "bg-purple-600 text-white"
                          : "text-purple-400 hover:bg-purple-600/20"
                      )}
                    >
                      {mode}
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };
  
  return (
    <motion.div
      className={cn(
        "relative rounded-xl overflow-hidden",
        "bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90",
        "border border-gray-700/50 backdrop-blur-sm",
        "shadow-2xl"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Enhanced Header */}
      <motion.div
        className="flex items-center justify-between p-4 border-b border-gray-700/50"
        whileHover={{ backgroundColor: 'rgba(147, 51, 234, 0.05)' }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative"
          >
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping" />
          </motion.div>
          
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">Quantum Browser</span>
            <motion.span
              className="text-xs px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {mode === 'quantum' ? 'Kinesthetic Mode' : mode}
            </motion.span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Kinesthetic Toggle */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              const layers = kinestheticLayers.length === 0 ? [
                { type: 'glow' as const, intensity: 0.6 },
                { type: 'morph' as const, intensity: 0.8 }
              ] : [];
              // Toggle kinesthetic layers
            }}
            className="p-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
            </svg>
          </motion.button>
          
          {/* Expand/Collapse */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <motion.svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <path d="M6 9l6 6 6-6" />
            </motion.svg>
          </motion.button>
        </div>
      </motion.div>
      
      {/* Adaptive Controls */}
      {renderAdaptiveControls()}
      
      {/* Main Content Area */}
      <motion.div
        className="p-4"
        animate={{
          padding: isExpanded ? 24 : 16,
        }}
        transition={{ duration: 0.3 }}
      >
        {mode === 'quantum' && renderQuantumMode()}
        {mode === 'screenshot' && renderQuantumMode()} {/* Use quantum mode for screenshots too */}
        {mode === 'iframe' && (
          <div className="relative">
            <iframe
              ref={iframeRef}
              src={currentUrl}
              className="w-full rounded-lg"
              style={{ height: isExpanded ? '600px' : '400px' }}
              sandbox={sandboxed ? "allow-scripts allow-same-origin allow-forms allow-popups" : undefined}
              onLoad={() => setIsLoading(false)}
              title="Enhanced Browser"
            />
            {renderKinestheticLayers()}
          </div>
        )}
      </motion.div>
      
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              className="bg-purple-600/20 backdrop-blur-md px-6 py-4 rounded-xl flex items-center gap-3"
              animate={{ scale: [0.9, 1, 0.9] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <motion.div
                className="w-6 h-6 border-3 border-purple-400 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span className="text-white font-medium">Quantum Loading...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}