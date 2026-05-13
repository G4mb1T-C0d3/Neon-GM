import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Dices } from "lucide-react";
import { rollDice, cn } from "../lib/utils";

interface DiceRollerProps {
  onClose: () => void;
  onRoll: (result: string) => void;
}

export function DiceRoller({ onClose, onRoll }: DiceRollerProps) {
  const [history, setHistory] = useState<{ formula: string; total: number; rolls: number[] }[]>([]);

  const handleRoll = (formula: string) => {
    const result = rollDice(formula);
    const log = { formula, ...result };
    setHistory([log, ...history].slice(0, 5));
    onRoll(`${formula}: ${result.total} (${result.rolls.join(", ")})`);
  };

  const commonRolls = ["1d10", "1d6", "2d6", "3d6", "4d6", "5d6"];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="cyber-panel max-w-md w-full bg-black border-cyber-cyan p-8 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-cyber-cyan hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-8 text-cyber-cyan">
           <Dices size={28} />
           <h2 className="text-xl font-black uppercase tracking-[0.2em] italic">Probability Matrix</h2>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
           {commonRolls.map(formula => (
             <button 
               key={formula}
               onClick={() => handleRoll(formula)}
               className="py-3 border-2 border-cyber-cyan/30 text-cyber-cyan font-mono hover:bg-cyber-cyan hover:text-black hover:border-cyber-cyan transition-all uppercase text-xs font-bold"
             >
               {formula}
             </button>
           ))}
        </div>

        <div className="space-y-4">
           <div className="text-[10px] font-mono text-cyber-blue uppercase tracking-widest font-black flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyber-blue rounded-full" />
              Recent Trajectories
           </div>
           <div className="space-y-2 min-h-[160px] bg-white/[0.02] p-4 rounded-sm border border-white/5">
              {history.length === 0 ? (
                <div className="text-cyber-blue/30 italic text-xs font-mono text-center py-10 uppercase tracking-widest">
                  No data points recorded
                </div>
              ) : (
                <AnimatePresence>
                  {history.map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
                    >
                       <span className="text-xs font-mono text-cyber-blue">{h.formula}</span>
                       <div className="flex items-center gap-3">
                          <span className="text-[10px] text-white/40 font-mono">[{h.rolls.join(",")}]</span>
                          <span className="text-sm font-black text-cyber-red">{h.total}</span>
                       </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
           </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 cyber-button py-4"
        >
          CLOSE INTERFACE
        </button>
      </div>
    </motion.div>
  );
}
