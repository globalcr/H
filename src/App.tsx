/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Shield, ShieldAlert, History, Trash2, Smartphone, Info } from 'lucide-react';

interface TapEvent {
  id: number;
  timestamp: number;
  status: 'accepted' | 'ignored';
  delay: number;
}

export default function App() {
  const [duration, setDuration] = useState(0.05); // Default 0.05s
  const [taps, setTaps] = useState<TapEvent[]>([]);
  const lastTapTimeRef = useRef<number>(0);
  const touchAreaRef = useRef<HTMLDivElement>(null);

  const handleTouch = (e: React.TouchEvent | React.MouseEvent) => {
    const now = performance.now();
    const timeSinceLastTap = (now - lastTapTimeRef.current) / 1000;
    const isIgnored = timeSinceLastTap < duration;

    const newTap: TapEvent = {
      id: Date.now(),
      timestamp: now,
      status: isIgnored ? 'ignored' : 'accepted',
      delay: timeSinceLastTap
    };

    if (!isIgnored) {
      lastTapTimeRef.current = now;
      if (window.navigator.vibrate) {
        window.navigator.vibrate(10);
      }
    }

    setTaps(prev => [newTap, ...prev].slice(0, 50));
  };

  const clearHistory = () => setTaps([]);

  // OnePlus System Instructions
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500/10">
      {/* Header */}
      <header className="px-8 pt-12 pb-6 max-w-2xl mx-auto">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">TapGuard</h1>
            <p className="text-sm text-slate-500 mt-1 italic">Ignore repeated input noise</p>
          </div>
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 hover:text-blue-600 transition-all active:scale-95"
          >
            <Info size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        
        {/* Settings Card */}
        <section className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="font-semibold text-slate-700">Tap Duration</h3>
              <p className="text-xs text-slate-400">Sensitivity threshold</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-mono font-bold text-blue-600">
                {duration.toFixed(2)}
                <span className="text-xs ml-0.5 text-slate-400 font-sans">sec</span>
              </span>
            </div>
          </div>
          
          <div className="relative w-full py-4">
            <input 
              type="range"
              min="0.01"
              max="0.10"
              step="0.001"
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600 h-range"
            />
          </div>
          
          <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            <span>0.01s (Fast)</span>
            <span>0.10s (Strict)</span>
          </div>
        </section>

        {/* Live Test Area */}
        <section className="relative">
          <div 
            ref={touchAreaRef}
            onMouseDown={handleTouch}
            onTouchStart={handleTouch}
            className="w-full aspect-square md:aspect-video rounded-[32px] border border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group select-none relative active:bg-slate-50/50"
          >
            <div className="p-5 bg-slate-50 rounded-full mb-4 group-active:scale-95 transition-transform border border-slate-100">
              <Smartphone className="text-slate-400" size={32} />
            </div>
            <p className="text-slate-400 font-medium text-xs uppercase tracking-widest">Tap to test filters</p>
            
            <AnimatePresence>
              {taps.slice(0, 1).map(tap => (
                <motion.div
                  key={tap.id}
                  initial={{ opacity: 0.6, scale: 0 }}
                  animate={{ opacity: 0, scale: 2 }}
                  exit={{ opacity: 0 }}
                  className={`absolute inset-0 z-0 pointer-events-none ${
                    tap.status === 'accepted' ? 'bg-blue-600/10' : 'bg-rose-500/10'
                  }`}
                  transition={{ duration: 0.6 }}
                />
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Info Box */}
        <div className="p-5 flex items-start gap-4 bg-blue-50 rounded-2xl border border-blue-100">
          <div className="w-6 h-6 bg-blue-200/50 rounded-full flex items-center justify-center mt-0.5 shrink-0">
            <span className="text-blue-700 font-bold text-[10px]">i</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-800 uppercase tracking-tighter">Precision Optimized</h4>
            <p className="text-[11px] text-blue-600/80 leading-relaxed mt-1">
              Test your device's touch delay against our software filter before applying system settings.
            </p>
          </div>
        </div>

        {/* History Log */}
        <section className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <History size={16} className="text-slate-400" />
              <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-[0.15em]">Activity Log</h3>
            </div>
            <button 
              onClick={clearHistory}
              className="text-slate-300 hover:text-rose-500 p-2 transition-all active:scale-90"
              title="Clear log"
            >
              <Trash2 size={16} />
            </button>
          </div>
          
          <div className="max-h-60 overflow-y-auto bg-white">
            {taps.length === 0 ? (
              <div className="py-12 text-center text-slate-300 text-[11px] font-medium uppercase tracking-widest">
                Waiting for input...
              </div>
            ) : (
              taps.map((tap) => (
                <div key={tap.id} className="px-6 py-4 flex items-center justify-between border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      tap.status === 'accepted' ? 'bg-blue-500' : 'bg-rose-400'
                    }`} />
                    <span className={`text-[12px] font-medium ${
                      tap.status === 'accepted' ? 'text-slate-700' : 'text-slate-400'
                    }`}>
                      {tap.status === 'accepted' ? 'Input Accepted' : 'Input Filtered'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                      {tap.delay < 999 ? tap.delay.toFixed(3) : '>1'}s
                    </span>
                    {tap.status === 'ignored' && (
                      <span className="text-[9px] font-bold text-rose-500 px-1.5 py-0.5 rounded-md border border-rose-100 bg-rose-50 uppercase tracking-tight">
                        Shadow
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* System Instructions Modal */}
        <AnimatePresence>
          {showInfo && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md p-6 flex items-center justify-center"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white border border-slate-100 rounded-[40px] p-10 max-w-md w-full shadow-2xl relative"
              >
                <h2 className="text-3xl font-bold mb-8 text-slate-900 flex items-center gap-3">
                  <Shield className="text-blue-600" /> OnePlus Guide
                </h2>
                
                <p className="text-slate-500 text-sm mb-8 leading-relaxed italic">
                  Apply these parameters system-wide in OxygenOS:
                </p>
                
                <div className="space-y-4">
                  {[
                    "Settings > System Settings",
                    "Accessibility > Physical",
                    "Touch Accommodations",
                    "Enable 'Ignore Repeated Taps'",
                    "Set Duration to matched value"
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4 items-center group">
                      <div className="flex-shrink-0 w-8 h-8 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-bold text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {i + 1}
                      </div>
                      <span className="text-slate-600 text-[13px] font-medium">{step}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-10">
                  <button 
                    onClick={() => setShowInfo(false)}
                    className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl shadow-xl shadow-slate-900/10 transition-all active:scale-95 hover:bg-black"
                  >
                    Close & Continue
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="p-12 text-center">
        <p className="text-[10px] text-slate-300 font-medium uppercase tracking-[0.3em]">
          TapGuard Enterprise • v1.0.4
        </p>
        <div className="h-1.5 w-32 bg-slate-200 rounded-full mx-auto mt-8 opacity-50"></div>
      </footer>
    </div>
  );
}
