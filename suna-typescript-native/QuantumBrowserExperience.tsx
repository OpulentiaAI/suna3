'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BrowserEmbedEnhanced from './BrowserEmbed-enhanced';
import {
  CognitiveProvider,
  CognitiveMessage,
  CognitiveReasoning,
  CognitivePromptSuggestions,
  LayerHealthMonitor,
  useCognitive
} from './BrowserEmbed-cognitive-bridge';
import { cn } from '@/lib/utils';

// ANN-Self-Evolver Integration Types
interface QuantumBrowserState {
  url: string;
  screenshot?: string;
  cognitiveMode: 'exploring' | 'analyzing' | 'synthesizing' | 'evolving';
  kinestheticIntensity: number;
  evolutionCycle: number;
  qualityScore: number;
  costMetrics: {
    tokens: number;
    compute: number;
    memory: number;
  };
}

interface GradientUpdate {
  timestamp: number;
  action: string;
  previousQuality: number;
  newQuality: number;
  gradient: number;
  convergenceRate: number;
}

// Poseidon Event Bus Integration
class PoseidonEventBus {
  private events: Map<string, Function[]> = new Map();
  
  emit(event: string, data: any) {
    const handlers = this.events.get(event) || [];
    handlers.forEach(handler => handler(data));
  }
  
  on(event: string, handler: Function) {
    const handlers = this.events.get(event) || [];
    this.events.set(event, [...handlers, handler]);
  }
  
  off(event: string, handler: Function) {
    const handlers = this.events.get(event) || [];
    this.events.set(event, handlers.filter(h => h !== handler));
  }
}

// Main Quantum Browser Component
const QuantumBrowserContent: React.FC = () => {
  const cognitive = useCognitive();
  const [browserState, setBrowserState] = useState<QuantumBrowserState>({
    url: '',
    cognitiveMode: 'exploring',
    kinestheticIntensity: 0.5,
    evolutionCycle: 0,
    qualityScore: 0.5,
    costMetrics: { tokens: 0, compute: 0, memory: 0 }
  });
  
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'browser' | 'user' | 'system';
    content: string;
    timestamp: number;
    gradientScore?: number;
  }>>([]);
  
  const [showReasoning, setShowReasoning] = useState(false);
  const [gradientHistory, setGradientHistory] = useState<GradientUpdate[]>([]);
  const [isEvolutionActive, setIsEvolutionActive] = useState(true);
  
  const eventBus = useRef(new PoseidonEventBus());
  const evolutionInterval = useRef<NodeJS.Timeout>();
  
  // Initialize event listeners
  useEffect(() => {
    const handleExecutionComplete = (data: any) => {
      cognitive.addThought({
        content: `Execution ${data.executionId} completed with quality ${data.quality}`,
        isComplete: true,
        timestamp: Date.now(),
        quality: data.quality
      });
    };
    
    const handleGradientGenerated = (data: any) => {
      setGradientHistory(prev => [...prev, data]);
      cognitive.updateGradient(data.action, data.newQuality);
    };
    
    eventBus.current.on('execution.completed', handleExecutionComplete);
    eventBus.current.on('gradient.generated', handleGradientGenerated);
    
    return () => {
      eventBus.current.off('execution.completed', handleExecutionComplete);
      eventBus.current.off('gradient.generated', handleGradientGenerated);
    };
  }, [cognitive]);
  
  // Evolution Cycle
  useEffect(() => {
    if (!isEvolutionActive) return;
    
    evolutionInterval.current = setInterval(() => {
      setBrowserState(prev => {
        const newCycle = prev.evolutionCycle + 1;
        const qualityImprovement = Math.random() * 0.05;
        const newQuality = Math.min(prev.qualityScore + qualityImprovement, 1);
        
        // Emit evolution event
        eventBus.current.emit('evolution.cycle', {
          cycle: newCycle,
          quality: newQuality,
          mode: prev.cognitiveMode
        });
        
        // Progress through cognitive modes
        let newMode = prev.cognitiveMode;
        if (newQuality > 0.8 && prev.cognitiveMode !== 'evolving') {
          newMode = 'evolving';
        } else if (newQuality > 0.6 && prev.cognitiveMode === 'exploring') {
          newMode = 'analyzing';
        } else if (newQuality > 0.7 && prev.cognitiveMode === 'analyzing') {
          newMode = 'synthesizing';
        }
        
        return {
          ...prev,
          evolutionCycle: newCycle,
          qualityScore: newQuality,
          cognitiveMode: newMode,
          kinestheticIntensity: Math.min(prev.kinestheticIntensity + 0.02, 1),
          costMetrics: {
            tokens: prev.costMetrics.tokens + Math.floor(Math.random() * 100),
            compute: prev.costMetrics.compute + Math.random() * 0.1,
            memory: prev.costMetrics.memory + Math.random() * 10
          }
        };
      });
    }, 3000);
    
    return () => {
      if (evolutionInterval.current) {
        clearInterval(evolutionInterval.current);
      }
    };
  }, [isEvolutionActive]);
  
  // Handle browser interactions
  const handleUrlChange = useCallback((url: string) => {
    setBrowserState(prev => ({ ...prev, url }));
    
    const message = {
      id: `msg-${Date.now()}`,
      role: 'browser' as const,
      content: `Navigating to ${url} in ${browserState.cognitiveMode} mode...`,
      timestamp: Date.now(),
      gradientScore: browserState.qualityScore
    };
    
    setMessages(prev => [...prev, message]);
    
    // Simulate gradient update
    eventBus.current.emit('gradient.generated', {
      timestamp: Date.now(),
      action: 'navigation',
      previousQuality: browserState.qualityScore,
      newQuality: browserState.qualityScore + 0.05,
      gradient: 0.05,
      convergenceRate: 0.8
    });
  }, [browserState.cognitiveMode, browserState.qualityScore]);
  
  const handleInteraction = useCallback((action: string, data: any) => {
    cognitive.addThought({
      content: `User performed ${action} with data: ${JSON.stringify(data)}`,
      isComplete: true,
      timestamp: Date.now(),
      quality: browserState.qualityScore
    });
    
    eventBus.current.emit('interaction.tracked', { action, data, quality: browserState.qualityScore });
  }, [cognitive, browserState.qualityScore]);
  
  const handleSuggestionSelect = useCallback((suggestion: any) => {
    const message = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: suggestion.text,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, message]);
    
    // Process suggestion through cognitive engine
    setTimeout(() => {
      const response = {
        id: `msg-${Date.now()}`,
        role: 'browser' as const,
        content: `Processing "${suggestion.text}" through ${browserState.cognitiveMode} engine...`,
        timestamp: Date.now(),
        gradientScore: suggestion.confidence
      };
      
      setMessages(prev => [...prev, response]);
    }, 500);
  }, [browserState.cognitiveMode]);
  
  // Render gradient visualization
  const renderGradientVisualization = () => {
    const recentGradients = gradientHistory.slice(-10);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 rounded-lg p-4 border border-purple-600/30"
      >
        <h3 className="text-sm font-medium text-purple-300 mb-3">Gradient Flow Visualization</h3>
        <div className="h-32 relative">
          <svg className="w-full h-full">
            <defs>
              <linearGradient id="gradientFill" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(147, 51, 234)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(y => (
              <line
                key={y}
                x1="0"
                y1={`${y}%`}
                x2="100%"
                y2={`${y}%`}
                stroke="rgba(255,255,255,0.1)"
                strokeDasharray="5,5"
              />
            ))}
            
            {/* Gradient path */}
            <motion.path
              d={`M ${recentGradients.map((g, i) => 
                `${(i / (recentGradients.length - 1)) * 100}%,${100 - (g.newQuality * 100)}%`
              ).join(' L ')}`}
              fill="none"
              stroke="url(#gradientFill)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1 }}
            />
            
            {/* Data points */}
            {recentGradients.map((g, i) => (
              <motion.circle
                key={i}
                cx={`${(i / (recentGradients.length - 1)) * 100}%`}
                cy={`${100 - (g.newQuality * 100)}%`}
                r="4"
                fill="rgb(147, 51, 234)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
              />
            ))}
          </svg>
          
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
            <span>Past</span>
            <span>Time →</span>
            <span>Now</span>
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-purple-400">
            Convergence Rate: {(gradientHistory[gradientHistory.length - 1]?.convergenceRate * 100 || 0).toFixed(1)}%
          </span>
          <span className="text-blue-400">
            Quality: {(browserState.qualityScore * 100).toFixed(1)}%
          </span>
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="flex h-screen bg-gray-950">
      {/* Left Panel - Browser View */}
      <div className="flex-1 flex flex-col p-6 gap-6">
        <BrowserEmbedEnhanced
          url={browserState.url}
          screenshot={browserState.screenshot}
          mode="quantum"
          controls="adaptive"
          onUrlChange={handleUrlChange}
          onInteraction={handleInteraction}
          onCognitiveShift={(state) => {
            setBrowserState(prev => ({
              ...prev,
              cognitiveMode: state.mode,
              qualityScore: state.confidence
            }));
          }}
          kinestheticLayers={[
            { type: 'glow', intensity: browserState.kinestheticIntensity },
            { type: 'morph', intensity: browserState.kinestheticIntensity * 0.8 },
            { type: 'shimmer', intensity: browserState.kinestheticIntensity * 0.6 },
            { type: 'depth', intensity: browserState.kinestheticIntensity * 0.4 }
          ]}
          annIntegration={true}
        />
        
        <CognitivePromptSuggestions
          suggestions={cognitive.suggestions}
          onSelect={handleSuggestionSelect}
        />
      </div>
      
      {/* Right Panel - Cognitive Interface */}
      <div className="w-96 bg-gray-900/50 border-l border-gray-700/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Quantum Cognitive Engine</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsEvolutionActive(!isEvolutionActive)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                isEvolutionActive 
                  ? "bg-green-600/20 text-green-400 border border-green-600/30"
                  : "bg-gray-600/20 text-gray-400 border border-gray-600/30"
              )}
            >
              {isEvolutionActive ? 'Evolution Active' : 'Evolution Paused'}
            </motion.button>
          </div>
          
          {/* Metrics */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-400">Tokens</div>
              <div className="text-sm font-medium text-white">
                {browserState.costMetrics.tokens.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-400">Compute</div>
              <div className="text-sm font-medium text-white">
                {browserState.costMetrics.compute.toFixed(2)} vCPU
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-400">Memory</div>
              <div className="text-sm font-medium text-white">
                {browserState.costMetrics.memory.toFixed(1)} MB
              </div>
            </div>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <CognitiveMessage
              key={message.id}
              role={message.role}
              content={message.content}
              gradientScore={message.gradientScore}
              onAction={(action) => {
                console.log('Message action:', action);
              }}
            />
          ))}
          
          {/* Reasoning Panel */}
          <div>
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="text-sm text-purple-400 hover:text-purple-300 mb-2"
            >
              {showReasoning ? 'Hide' : 'Show'} Cognitive Processing
            </button>
            
            <CognitiveReasoning
              isOpen={showReasoning}
              thoughts={cognitive.thoughts}
              onClose={() => setShowReasoning(false)}
            />
          </div>
        </div>
        
        {/* Bottom Panels */}
        <div className="p-4 space-y-4 border-t border-gray-700/50">
          {renderGradientVisualization()}
          <LayerHealthMonitor layers={cognitive.layerHealth} />
          
          {/* Evolution Status */}
          <motion.div
            className="bg-purple-900/20 rounded-lg p-4 border border-purple-600/30"
            animate={{
              borderColor: [
                'rgba(147, 51, 234, 0.3)',
                'rgba(59, 130, 246, 0.3)',
                'rgba(236, 72, 153, 0.3)',
                'rgba(147, 51, 234, 0.3)'
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-300">Evolution Cycle</span>
              <span className="text-sm text-purple-400">#{browserState.evolutionCycle}</span>
            </div>
            
            <div className="text-xs text-gray-400">
              Current Mode: <span className="text-purple-400 font-medium">
                {browserState.cognitiveMode}
              </span>
            </div>
            
            <motion.div
              className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                style={{ width: `${(browserState.evolutionCycle % 10) * 10}%` }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Main Export Component
export default function QuantumBrowserExperience() {
  return (
    <CognitiveProvider>
      <QuantumBrowserContent />
    </CognitiveProvider>
  );
}