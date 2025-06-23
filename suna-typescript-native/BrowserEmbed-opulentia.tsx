'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, PanInfo } from 'framer-motion';
import { cn, opulentiaTheme } from '@/lib/design/shadcn-theme';
import { useTweakcn } from '@/lib/design/tweakcn-runtime';

// Enhanced BrowserEmbed with Opulentia Design System
interface BrowserEmbedOpulentiaProps {
  url?: string;
  screenshot?: string;
  mode?: 'live' | 'screenshot' | 'iframe' | 'quantum';
  sandboxed?: boolean;
  controls?: 'user-toggle' | 'always' | 'never' | 'adaptive';
  onUrlChange?: (url: string) => void;
  onInteraction?: (action: string, data: any) => void;
  onCognitiveShift?: (state: any) => void;
  className?: string;
}

export default function BrowserEmbedOpulentia({
  url,
  screenshot,
  mode = 'quantum',
  sandboxed = true,
  controls = 'adaptive',
  onUrlChange,
  onInteraction,
  onCognitiveShift,
  className
}: BrowserEmbedOpulentiaProps) {
  const { params: tweakcnParams } = useTweakcn();
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(controls === 'always');
  const [kinestheticMode, setKinestheticMode] = useState<'idle' | 'active' | 'evolving'>('idle');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Motion values for kinesthetic interactions
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });
  
  // Apply quantum features based on tweakcn params
  const quantumEnabled = tweakcnParams.features?.quantumMode ?? true;
  const kinestheticEnabled = tweakcnParams.features?.kinestheticLayers ?? true;
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || !kinestheticEnabled) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
    
    const distance = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
    const intensity = Math.min(distance / 300, 1);
    
    if (intensity > 0.3 && kinestheticMode === 'idle') {
      setKinestheticMode('active');
    }
  }, [mouseX, mouseY, kinestheticMode, kinestheticEnabled]);
  
  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    setKinestheticMode('idle');
  }, [mouseX, mouseY]);
  
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUrl) {
      setIsLoading(true);
      onUrlChange?.(currentUrl);
      onInteraction?.('navigate', { url: currentUrl });
    }
  };
  
  // Render kinesthetic layers with Opulentia styling
  const renderKinestheticLayers = () => {
    if (!kinestheticEnabled) return null;
    
    return (
      <>
        {/* Glow Layer */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-[var(--radius)]"
          variants={{
            idle: { 
              boxShadow: '0 0 20px var(--odl-accent, #FFAA6E)',
              opacity: 0.3
            },
            active: { 
              boxShadow: '0 0 40px var(--odl-accent, #FFAA6E), 0 0 80px var(--odl-accent, #FFAA6E)',
              opacity: 0.6
            },
            evolving: {
              boxShadow: [
                '0 0 20px var(--odl-accent, #FFAA6E)',
                '0 0 40px var(--chart-2, #FF6B6B)',
                '0 0 60px var(--chart-3, #4ECDC4)',
                '0 0 40px var(--odl-accent, #FFAA6E)'
              ],
              opacity: [0.3, 0.5, 0.6, 0.3]
            }
          }}
          animate={kinestheticMode}
          transition={{ 
            duration: kinestheticMode === 'evolving' ? 4 : 0.5,
            repeat: kinestheticMode === 'evolving' ? Infinity : 0
          }}
        />
        
        {/* Shimmer Layer */}
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-[var(--radius)]"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.05) 50%, transparent 60%)',
            backgroundSize: '200% 200%',
            opacity: kinestheticMode === 'active' ? 1 : 0,
          }}
        />
      </>
    );
  };
  
  // Render quantum browser content
  const renderQuantumContent = () => (
    <motion.div
      className="relative h-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      <AnimatePresence mode="wait">
        {screenshot ? (
          <motion.div
            key="quantum-browser"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
            className="relative h-full"
            style={{
              rotateX: kinestheticEnabled ? springRotateX : 0,
              rotateY: kinestheticEnabled ? springRotateY : 0,
              transformStyle: 'preserve-3d',
            }}
          >
            <img
              src={`data:image/png;base64,${screenshot}`}
              alt="Browser view"
              className="w-full h-full object-contain rounded-[var(--radius)]"
              style={{
                maxHeight: isExpanded ? '600px' : '400px',
              }}
            />
            
            {renderKinestheticLayers()}
            
            {/* Quantum Status Badge */}
            <motion.div
              className={cn(
                opulentiaTheme.badge.base,
                opulentiaTheme.badge.variants.quantum,
                "absolute top-4 right-4"
              )}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-white mr-2"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Quantum Mode
            </motion.div>
            
            {/* URL Display */}
            {url && (
              <motion.div
                className={cn(
                  "absolute bottom-4 left-4",
                  "bg-[var(--odl-background)]/80 backdrop-blur-md",
                  "rounded-[var(--radius)] px-4 py-2",
                  "border border-[var(--odl-border)]"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-xs text-[var(--odl-sub-text)] max-w-xs truncate block">
                  {url}
                </span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "flex flex-col items-center justify-center h-full",
              "bg-gradient-to-br from-[var(--odl-card)] to-[var(--odl-background)]",
              "rounded-[var(--radius-lg)] p-12"
            )}
            style={{ minHeight: isExpanded ? '600px' : '400px' }}
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-6"
            >
              <svg className="w-24 h-24 text-[var(--odl-accent)]" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </motion.div>
            <h3 className="odl-h2 text-[var(--odl-text)] mb-2">
              Quantum Browser
            </h3>
            <p className="odl-caption text-[var(--odl-sub-text)]">
              Experience the web through kinesthetic intelligence
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
  
  return (
    <motion.div
      className={cn(
        opulentiaTheme.card.base,
        opulentiaTheme.card.variants.quantum,
        "overflow-hidden",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--odl-border)]">
        <div className="flex items-center gap-3">
          <motion.div
            className="relative"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping" />
          </motion.div>
          
          <h4 className="text-[var(--odl-text)] font-semibold">
            {mode === 'quantum' ? 'Quantum Browser' : 'Browser View'}
          </h4>
          
          {quantumEnabled && (
            <span className={cn(
              opulentiaTheme.badge.base,
              opulentiaTheme.badge.variants.accent,
              "text-xs"
            )}>
              Enhanced
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {controls === 'user-toggle' && (
            <button
              onClick={() => setShowControls(!showControls)}
              className={cn(
                opulentiaTheme.button.base,
                opulentiaTheme.button.variants.ghost,
                opulentiaTheme.button.sizes.icon
              )}
              aria-label="Toggle controls"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
              </svg>
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              opulentiaTheme.button.base,
              opulentiaTheme.button.variants.ghost,
              opulentiaTheme.button.sizes.icon
            )}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
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
          </button>
        </div>
      </div>
      
      {/* Controls */}
      <AnimatePresence>
        {(showControls || controls === 'always') && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-b border-[var(--odl-border)] overflow-hidden"
          >
            <div className="p-4">
              <form onSubmit={handleUrlSubmit} className="flex gap-2">
                <input
                  type="url"
                  value={currentUrl}
                  onChange={(e) => setCurrentUrl(e.target.value)}
                  placeholder="Enter quantum coordinates..."
                  className={cn(
                    opulentiaTheme.input.base,
                    opulentiaTheme.input.variants.default,
                    opulentiaTheme.input.sizes.default,
                    "flex-1"
                  )}
                />
                <button
                  type="submit"
                  className={cn(
                    opulentiaTheme.button.base,
                    opulentiaTheme.button.variants.accent,
                    opulentiaTheme.button.sizes.md
                  )}
                >
                  Navigate
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Content */}
      <div className="p-4">
        {mode === 'quantum' && renderQuantumContent()}
        {mode === 'screenshot' && renderQuantumContent()}
        {mode === 'iframe' && (
          <div className="relative">
            <iframe
              ref={iframeRef}
              src={currentUrl}
              className="w-full rounded-[var(--radius)]"
              style={{ height: isExpanded ? '600px' : '400px' }}
              sandbox={sandboxed ? "allow-scripts allow-same-origin allow-forms allow-popups" : undefined}
              onLoad={() => setIsLoading(false)}
              title="Browser Frame"
            />
            {renderKinestheticLayers()}
          </div>
        )}
      </div>
      
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
              className={cn(
                "flex items-center gap-3",
                "bg-[var(--odl-card)]/90 backdrop-blur-md",
                "px-6 py-4 rounded-[var(--radius-lg)]",
                "border border-[var(--odl-accent)]"
              )}
              animate={{ scale: [0.95, 1, 0.95] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <motion.div
                className="w-6 h-6 border-3 border-[var(--odl-accent)] border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span className="text-[var(--odl-text)] font-medium">
                Quantum Loading...
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}