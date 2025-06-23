'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Prompt-Kit Inspired Components
interface CognitiveSuggestion {
  id: string;
  text: string;
  confidence: number;
  type: 'navigation' | 'interaction' | 'exploration' | 'synthesis';
  gradient?: number;
}

interface StreamingThought {
  content: string;
  isComplete: boolean;
  timestamp: number;
  quality: number;
}

// ANN-Self-Evolver Types
interface ExecutionContext {
  executionId: string;
  layerId: string;
  quality: number;
  cost: {
    tokens: number;
    compute: number;
  };
  gradients: Map<string, number>;
}

interface LayerHealth {
  layerId: string;
  status: 'healthy' | 'degraded' | 'critical';
  metrics: {
    latency: number;
    errorRate: number;
    throughput: number;
  };
}

// Context for Cognitive-Kinesthetic Integration
const CognitiveContext = createContext<{
  suggestions: CognitiveSuggestion[];
  thoughts: StreamingThought[];
  executionContext: ExecutionContext;
  layerHealth: LayerHealth[];
  updateGradient: (action: string, quality: number) => void;
  addThought: (thought: StreamingThought) => void;
} | null>(null);

export const useCognitive = () => {
  const context = useContext(CognitiveContext);
  if (!context) throw new Error('useCognitive must be used within CognitiveProvider');
  return context;
};

// Prompt-Kit Style Message Component
interface CognitiveMessageProps {
  role: 'browser' | 'user' | 'system';
  content: string;
  isStreaming?: boolean;
  gradientScore?: number;
  onAction?: (action: string) => void;
}

export const CognitiveMessage: React.FC<CognitiveMessageProps> = ({
  role,
  content,
  isStreaming = false,
  gradientScore = 0,
  onAction
}) => {
  const getAvatar = () => {
    switch (role) {
      case 'browser':
        return (
          <motion.div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="2" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="none" stroke="white" strokeWidth="2" />
            </svg>
          </motion.div>
        );
      case 'user':
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">U</span>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
            <span className="text-white text-sm">S</span>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 p-4 rounded-lg",
        role === 'user' ? "bg-gray-800/50" : "bg-purple-900/20"
      )}
    >
      {getAvatar()}
      <div className="flex-1">
        <div className="text-white">
          {isStreaming ? (
            <StreamingText text={content} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {content}
            </motion.div>
          )}
        </div>
        
        {gradientScore > 0 && (
          <motion.div
            className="mt-2 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-xs text-purple-400">Quality Score:</span>
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${gradientScore * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs text-purple-400">{Math.round(gradientScore * 100)}%</span>
          </motion.div>
        )}
        
        {onAction && (
          <div className="mt-2 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction('copy')}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              Copy
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction('regenerate')}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              Regenerate
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Streaming Text Component (Prompt-Kit Style)
const StreamingText: React.FC<{ text: string }> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <span>
      {displayedText}
      {currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-4 bg-purple-500 ml-0.5"
        />
      )}
    </span>
  );
};

// Reasoning Component (Prompt-Kit Inspired)
interface ReasoningProps {
  isOpen: boolean;
  thoughts: StreamingThought[];
  onClose: () => void;
}

export const CognitiveReasoning: React.FC<ReasoningProps> = ({ isOpen, thoughts, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="bg-purple-900/10 border border-purple-600/30 rounded-lg p-4 mt-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-purple-300">Cognitive Processing</h4>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-purple-400 hover:text-purple-300"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {thoughts.map((thought, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-sm text-gray-300"
                >
                  <span className="text-purple-400 mr-2">→</span>
                  {thought.content}
                  {thought.quality > 0.8 && (
                    <span className="ml-2 text-xs text-green-400">✓ High confidence</span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Prompt Suggestions Component
interface PromptSuggestionsProps {
  suggestions: CognitiveSuggestion[];
  onSelect: (suggestion: CognitiveSuggestion) => void;
}

export const CognitivePromptSuggestions: React.FC<PromptSuggestionsProps> = ({ 
  suggestions, 
  onSelect 
}) => {
  const getTypeColor = (type: CognitiveSuggestion['type']) => {
    switch (type) {
      case 'navigation': return 'from-blue-500 to-cyan-500';
      case 'interaction': return 'from-purple-500 to-pink-500';
      case 'exploration': return 'from-green-500 to-emerald-500';
      case 'synthesis': return 'from-orange-500 to-red-500';
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-4">
      {suggestions.map((suggestion) => (
        <motion.button
          key={suggestion.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(suggestion)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium text-white",
            "bg-gradient-to-r backdrop-blur-sm",
            "border border-white/10",
            "transition-all duration-300",
            "relative overflow-hidden"
          )}
          style={{
            background: `linear-gradient(to right, ${getTypeColor(suggestion.type).split(' ')[0].replace('from-', '')}, ${getTypeColor(suggestion.type).split(' ')[2].replace('to-', '')})`,
            opacity: 0.8 + (suggestion.confidence * 0.2)
          }}
        >
          <span className="relative z-10">{suggestion.text}</span>
          {suggestion.gradient && suggestion.gradient > 0 && (
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
};

// ANN Layer Health Monitor
interface LayerHealthMonitorProps {
  layers: LayerHealth[];
}

export const LayerHealthMonitor: React.FC<LayerHealthMonitorProps> = ({ layers }) => {
  const getStatusColor = (status: LayerHealth['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-400/20';
      case 'degraded': return 'text-yellow-400 bg-yellow-400/20';
      case 'critical': return 'text-red-400 bg-red-400/20';
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Layer Health Status</h3>
      <div className="space-y-2">
        {layers.map((layer) => (
          <motion.div
            key={layer.layerId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <motion.div
                className={cn(
                  "w-2 h-2 rounded-full",
                  getStatusColor(layer.status).split(' ')[1]
                )}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs text-gray-400">{layer.layerId}</span>
            </div>
            
            <div className="flex items-center gap-4 text-xs">
              <span className="text-gray-500">
                {layer.metrics.latency}ms
              </span>
              <span className="text-gray-500">
                {(layer.metrics.errorRate * 100).toFixed(1)}% err
              </span>
              <span className={cn("px-2 py-1 rounded", getStatusColor(layer.status))}>
                {layer.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Cognitive Provider Component
export const CognitiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [suggestions, setSuggestions] = useState<CognitiveSuggestion[]>([
    { id: '1', text: 'Explore deeper', confidence: 0.9, type: 'exploration' },
    { id: '2', text: 'Navigate back', confidence: 0.7, type: 'navigation' },
    { id: '3', text: 'Synthesize findings', confidence: 0.8, type: 'synthesis' },
  ]);
  
  const [thoughts, setThoughts] = useState<StreamingThought[]>([]);
  const [executionContext, setExecutionContext] = useState<ExecutionContext>({
    executionId: `exec-${Date.now()}`,
    layerId: 'cognitive-bridge',
    quality: 0.85,
    cost: { tokens: 0, compute: 0 },
    gradients: new Map()
  });
  
  const [layerHealth, setLayerHealth] = useState<LayerHealth[]>([
    {
      layerId: 'perception-synthesis',
      status: 'healthy',
      metrics: { latency: 45, errorRate: 0.001, throughput: 1000 }
    },
    {
      layerId: 'cognitive-bridge',
      status: 'healthy',
      metrics: { latency: 23, errorRate: 0.002, throughput: 1500 }
    },
    {
      layerId: 'kinesthetic-engine',
      status: 'degraded',
      metrics: { latency: 89, errorRate: 0.045, throughput: 800 }
    }
  ]);

  const updateGradient = useCallback((action: string, quality: number) => {
    setExecutionContext(prev => {
      const newGradients = new Map(prev.gradients);
      const current = newGradients.get(action) || 0;
      newGradients.set(action, current + (quality - current) * 0.1);
      
      return {
        ...prev,
        gradients: newGradients,
        quality: Math.min(prev.quality + 0.01, 1)
      };
    });
  }, []);

  const addThought = useCallback((thought: StreamingThought) => {
    setThoughts(prev => [...prev, thought]);
  }, []);

  // Simulate cognitive evolution
  useEffect(() => {
    const interval = setInterval(() => {
      // Update suggestions based on gradients
      setSuggestions(prev => prev.map(s => ({
        ...s,
        confidence: Math.min(s.confidence + (Math.random() - 0.5) * 0.1, 1),
        gradient: executionContext.gradients.get(s.text) || 0
      })));
      
      // Update layer health
      setLayerHealth(prev => prev.map(layer => ({
        ...layer,
        metrics: {
          latency: Math.max(10, layer.metrics.latency + (Math.random() - 0.5) * 10),
          errorRate: Math.max(0, Math.min(0.1, layer.metrics.errorRate + (Math.random() - 0.5) * 0.01)),
          throughput: Math.max(100, layer.metrics.throughput + (Math.random() - 0.5) * 100)
        },
        status: layer.metrics.errorRate > 0.05 ? 'critical' : 
                layer.metrics.errorRate > 0.02 ? 'degraded' : 'healthy'
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, [executionContext.gradients]);

  return (
    <CognitiveContext.Provider value={{
      suggestions,
      thoughts,
      executionContext,
      layerHealth,
      updateGradient,
      addThought
    }}>
      {children}
    </CognitiveContext.Provider>
  );
};

// Export all components
export default {
  CognitiveProvider,
  CognitiveMessage,
  CognitiveReasoning,
  CognitivePromptSuggestions,
  LayerHealthMonitor,
  useCognitive
};