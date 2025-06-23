'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, opulentiaTheme, QuoteHero } from '@/lib/design/shadcn-theme';
import { TweakcnRuntime, useTweakcn } from '@/lib/design/tweakcn-runtime';
import BrowserEmbedOpulentia from '../../BrowserEmbed-opulentia';

export default function OpulentiaShowcase() {
  const { params, updateParams } = useTweakcn();
  const [activeTab, setActiveTab] = useState<'components' | 'theme' | 'browser'>('components');
  const [showDialog, setShowDialog] = useState(false);
  
  // Example data
  const tableData = [
    { id: 1, name: 'Quantum Browser', status: 'Active', performance: 98 },
    { id: 2, name: 'Kinesthetic Engine', status: 'Evolving', performance: 87 },
    { id: 3, name: 'Cognitive Bridge', status: 'Active', performance: 92 },
  ];
  
  return (
    <div className="min-h-screen bg-[var(--odl-background)] text-[var(--odl-text)]">
      {/* Import Design System CSS */}
      <style jsx global>{`
        @import url('/src/styles/opulentia-design-system.css');
      `}</style>
      
      {/* Hero Section */}
      <section className="py-20 px-8 text-center">
        <QuoteHero>OPULENT AUTONOMY</QuoteHero>
        <p className="odl-caption text-[var(--odl-sub-text)] mt-4 max-w-2xl mx-auto">
          Unified by Virgil-inspired minimalism, Denis dark-UI palette, and shadcn/tweakcn implementation
        </p>
      </section>
      
      {/* Navigation Tabs */}
      <div className="flex justify-center gap-2 px-8 mb-12">
        {(['components', 'theme', 'browser'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              opulentiaTheme.button.base,
              activeTab === tab 
                ? opulentiaTheme.button.variants.accent 
                : opulentiaTheme.button.variants.ghost,
              opulentiaTheme.button.sizes.md,
              "capitalize"
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Content Sections */}
      <div className="max-w-6xl mx-auto px-8 pb-20">
        <AnimatePresence mode="wait">
          {/* Components Tab */}
          {activeTab === 'components' && (
            <motion.div
              key="components"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Buttons Section */}
              <section>
                <h2 className="odl-h2 mb-6">Buttons</h2>
                <div className="flex flex-wrap gap-4">
                  <button className={cn(
                    opulentiaTheme.button.base,
                    opulentiaTheme.button.variants.default,
                    opulentiaTheme.button.sizes.md
                  )}>
                    Default Button
                  </button>
                  <button className={cn(
                    opulentiaTheme.button.base,
                    opulentiaTheme.button.variants.accent,
                    opulentiaTheme.button.sizes.md
                  )}>
                    Accent Button
                  </button>
                  <button className={cn(
                    opulentiaTheme.button.base,
                    opulentiaTheme.button.variants.ghost,
                    opulentiaTheme.button.sizes.md
                  )}>
                    Ghost Button
                  </button>
                  <button className={cn(
                    opulentiaTheme.button.base,
                    opulentiaTheme.button.variants.danger,
                    opulentiaTheme.button.sizes.md
                  )}>
                    Danger Button
                  </button>
                  <button className={cn(
                    opulentiaTheme.button.base,
                    opulentiaTheme.button.variants.quantum,
                    opulentiaTheme.button.sizes.md
                  )}>
                    Quantum Button
                  </button>
                </div>
              </section>
              
              {/* Cards Section */}
              <section>
                <h2 className="odl-h2 mb-6">Cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={cn(
                    opulentiaTheme.card.base,
                    opulentiaTheme.card.variants.default,
                    opulentiaTheme.card.sizes.default
                  )}>
                    <h3 className="font-semibold mb-2">Default Card</h3>
                    <p className="text-[var(--odl-sub-text)]">
                      Minimal visual elements with every pixel communicating purpose.
                    </p>
                  </div>
                  <div className={cn(
                    opulentiaTheme.card.base,
                    opulentiaTheme.card.variants.elevated,
                    opulentiaTheme.card.sizes.default
                  )}>
                    <h3 className="font-semibold mb-2">Elevated Card</h3>
                    <p className="text-[var(--odl-sub-text)]">
                      Enhanced shadow for visual hierarchy and depth.
                    </p>
                  </div>
                  <div className={cn(
                    opulentiaTheme.card.base,
                    opulentiaTheme.card.variants.quantum,
                    opulentiaTheme.card.sizes.default
                  )}>
                    <h3 className="font-semibold mb-2">Quantum Card</h3>
                    <p className="text-[var(--odl-sub-text)]">
                      Gradient background with kinesthetic hover effects.
                    </p>
                  </div>
                </div>
              </section>
              
              {/* Forms Section */}
              <section>
                <h2 className="odl-h2 mb-6">Forms</h2>
                <div className="max-w-md space-y-4">
                  <input
                    type="text"
                    placeholder="Default input"
                    className={cn(
                      opulentiaTheme.input.base,
                      opulentiaTheme.input.variants.default,
                      opulentiaTheme.input.sizes.default,
                      "w-full"
                    )}
                  />
                  <input
                    type="email"
                    placeholder="Error state input"
                    className={cn(
                      opulentiaTheme.input.base,
                      opulentiaTheme.input.variants.error,
                      opulentiaTheme.input.sizes.default,
                      "w-full"
                    )}
                  />
                  <textarea
                    placeholder="Textarea with Opulentia styling"
                    rows={4}
                    className={cn(
                      opulentiaTheme.input.base,
                      opulentiaTheme.input.variants.default,
                      opulentiaTheme.input.sizes.default,
                      "w-full resize-none"
                    )}
                  />
                </div>
              </section>
              
              {/* Table Section */}
              <section>
                <h2 className="odl-h2 mb-6">Table</h2>
                <div className={opulentiaTheme.table.wrapper}>
                  <table className={opulentiaTheme.table.table}>
                    <thead className={opulentiaTheme.table.header}>
                      <tr>
                        <th className={opulentiaTheme.table.headerCell}>Name</th>
                        <th className={opulentiaTheme.table.headerCell}>Status</th>
                        <th className={opulentiaTheme.table.headerCell}>Performance</th>
                      </tr>
                    </thead>
                    <tbody className={opulentiaTheme.table.body}>
                      {tableData.map((row) => (
                        <tr key={row.id} className={opulentiaTheme.table.row}>
                          <td className={opulentiaTheme.table.cell}>{row.name}</td>
                          <td className={opulentiaTheme.table.cell}>
                            <span className={cn(
                              opulentiaTheme.badge.base,
                              row.status === 'Active' 
                                ? opulentiaTheme.badge.variants.accent
                                : opulentiaTheme.badge.variants.quantum
                            )}>
                              {row.status}
                            </span>
                          </td>
                          <td className={opulentiaTheme.table.cell}>
                            <div className="flex items-center gap-2">
                              <div className={opulentiaTheme.progress.root}>
                                <motion.div 
                                  className={opulentiaTheme.progress.quantum}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${row.performance}%` }}
                                  transition={{ duration: 1, delay: 0.2 }}
                                />
                              </div>
                              <span className="text-sm">{row.performance}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              
              {/* Alerts Section */}
              <section>
                <h2 className="odl-h2 mb-6">Alerts</h2>
                <div className="space-y-4">
                  <div className={cn(
                    opulentiaTheme.alert.base,
                    opulentiaTheme.alert.variants.default
                  )}>
                    <strong>Default Alert:</strong> System information or neutral message.
                  </div>
                  <div className={cn(
                    opulentiaTheme.alert.base,
                    opulentiaTheme.alert.variants.warning
                  )}>
                    <strong>Warning Alert:</strong> Important information requiring attention.
                  </div>
                  <div className={cn(
                    opulentiaTheme.alert.base,
                    opulentiaTheme.alert.variants.success
                  )}>
                    <strong>Success Alert:</strong> Operation completed successfully.
                  </div>
                </div>
              </section>
            </motion.div>
          )}
          
          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <motion.div
              key="theme"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <h2 className="odl-h2">Runtime Theme Configuration</h2>
              
              {/* Color Palette */}
              <section className={cn(
                opulentiaTheme.card.base,
                opulentiaTheme.card.variants.default,
                opulentiaTheme.card.sizes.default
              )}>
                <h3 className="font-semibold mb-4">Color Palette</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Background', var: '--odl-background', value: '#0F0F0F' },
                    { name: 'Card', var: '--odl-card', value: '#141414' },
                    { name: 'Button', var: '--odl-button', value: '#1B1B1B' },
                    { name: 'Text', var: '--odl-text', value: '#EFEFEF' },
                    { name: 'Accent', var: '--odl-accent', value: '#FFAA6E' },
                    { name: 'Border', var: '--odl-border', value: '#080808' },
                  ].map((color) => (
                    <div key={color.name} className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-[var(--radius)] border border-[var(--odl-border)]"
                        style={{ backgroundColor: `var(${color.var}, ${color.value})` }}
                      />
                      <div>
                        <div className="text-sm font-medium">{color.name}</div>
                        <div className="text-xs text-[var(--odl-sub-text)]">{color.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              
              {/* tweakcn Controls */}
              <section className={cn(
                opulentiaTheme.card.base,
                opulentiaTheme.card.variants.default,
                opulentiaTheme.card.sizes.default
              )}>
                <h3 className="font-semibold mb-4">tweakcn Runtime Controls</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[var(--odl-sub-text)] block mb-2">
                      Accent Color
                    </label>
                    <input
                      type="color"
                      value={params.palette?.accent || '#FFAA6E'}
                      onChange={(e) => updateParams({
                        palette: { ...params.palette, accent: e.target.value }
                      })}
                      className="w-full h-10 rounded-[var(--radius)] cursor-pointer"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-[var(--odl-sub-text)]">
                      Quote Accent
                    </label>
                    <button
                      onClick={() => updateParams({
                        layout: { ...params.layout, quoteAccent: !params.layout?.quoteAccent }
                      })}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        params.layout?.quoteAccent 
                          ? "bg-[var(--odl-accent)]" 
                          : "bg-[var(--odl-button)]"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          params.layout?.quoteAccent ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (window.tweakcnRuntime) {
                        const theme = window.tweakcnRuntime.exportTheme();
                        console.log('Exported theme:', theme);
                        navigator.clipboard.writeText(theme);
                      }
                    }}
                    className={cn(
                      opulentiaTheme.button.base,
                      opulentiaTheme.button.variants.accent,
                      opulentiaTheme.button.sizes.md,
                      "w-full"
                    )}
                  >
                    Export Theme JSON
                  </button>
                </div>
              </section>
            </motion.div>
          )}
          
          {/* Browser Tab */}
          {activeTab === 'browser' && (
            <motion.div
              key="browser"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="odl-h2 mb-6">Quantum Browser Experience</h2>
              <BrowserEmbedOpulentia
                screenshot="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                url="https://opulentia.design"
                mode="quantum"
                controls="adaptive"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Dialog Example */}
      <AnimatePresence>
        {showDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={opulentiaTheme.dialog.overlay}
              onClick={() => setShowDialog(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={opulentiaTheme.dialog.content}
            >
              <h3 className={opulentiaTheme.dialog.header}>
                Opulentia Design System
              </h3>
              <p className="text-[var(--odl-sub-text)] my-4">
                This dialog demonstrates the modal component with proper backdrop blur and animations.
              </p>
              <div className={opulentiaTheme.dialog.footer}>
                <button
                  onClick={() => setShowDialog(false)}
                  className={cn(
                    opulentiaTheme.button.base,
                    opulentiaTheme.button.variants.ghost,
                    opulentiaTheme.button.sizes.md
                  )}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowDialog(false)}
                  className={cn(
                    opulentiaTheme.button.base,
                    opulentiaTheme.button.variants.accent,
                    opulentiaTheme.button.sizes.md
                  )}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Floating Action Button */}
      <button
        onClick={() => setShowDialog(true)}
        className={cn(
          opulentiaTheme.button.base,
          opulentiaTheme.button.variants.quantum,
          "fixed bottom-8 right-8 !rounded-full w-14 h-14 shadow-quantum"
        )}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14m-7-7h14" />
        </svg>
      </button>
    </div>
  );
}