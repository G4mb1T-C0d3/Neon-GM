import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Terminal, Cpu, Zap, AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";

interface NetrunMinigameProps {
  onClose: () => void;
  onSuccess: () => void;
  onFailure: () => void;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
}

const HEX_CODES = ["1C", "55", "BD", "E9", "7A", "E1", "FF"];

export function NetrunMinigame({ onClose, onSuccess, onFailure, difficulty = "EASY" }: NetrunMinigameProps) {
  const gridSize = difficulty === "EASY" ? 5 : difficulty === "MEDIUM" ? 6 : 7;
  const sequenceLength = difficulty === "EASY" ? 3 : difficulty === "MEDIUM" ? 4 : 5;
  const timerStart = difficulty === "EASY" ? 30 : difficulty === "MEDIUM" ? 45 : 60;

  const [grid, setGrid] = useState<string[][]>([]);
  const [targetSequence, setTargetSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [currentRow, setCurrentRow] = useState<number | null>(0); // null means col selection
  const [currentCol, setCurrentCol] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(timerStart);
  const [status, setStatus] = useState<"PLAYING" | "SUCCESS" | "FAILURE">("PLAYING");
  const [selectedIndices, setSelectedIndices] = useState<Set<string>>(new Set());

  // Initialize
  useEffect(() => {
    const newGrid = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => HEX_CODES[Math.floor(Math.random() * HEX_CODES.length)])
    );
    setGrid(newGrid);

    // Random sequence from grid path
    const seq: string[] = [];
    let r = 0, c = 0;
    let isRow = true;
    for (let i = 0; i < sequenceLength; i++) {
        if (isRow) {
            c = Math.floor(Math.random() * gridSize);
        } else {
            r = Math.floor(Math.random() * gridSize);
        }
        seq.push(newGrid[r][c]);
        isRow = !isRow;
    }
    setTargetSequence(seq);
  }, [gridSize, sequenceLength]);

  // Timer
  useEffect(() => {
    if (status !== "PLAYING") return;
    if (timeLeft <= 0) {
      setStatus("FAILURE");
      setTimeout(onFailure, 1500);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, status, onFailure]);

  const handleCellClick = (r: number, c: number) => {
    if (status !== "PLAYING") return;
    
    // Validate selection mode
    if (currentRow !== null && r !== currentRow) return;
    if (currentCol !== null && c !== currentCol) return;

    const cellId = `${r}-${c}`;
    if (selectedIndices.has(cellId)) return;

    const val = grid[r][c];
    const newUserSeq = [...userSequence, val];
    setUserSequence(newUserSeq);
    setSelectedIndices(new Set(selectedIndices).add(cellId));

    // Check sequence
    const isCorrectSoFar = newUserSeq.every((v, i) => v === targetSequence[i]);
    
    if (newUserSeq.length === targetSequence.length) {
      if (isCorrectSoFar) {
        setStatus("SUCCESS");
        setTimeout(onSuccess, 1500);
      } else {
        setStatus("FAILURE");
        setTimeout(onFailure, 1500);
      }
    } else if (!isCorrectSoFar && newUserSeq.length >= targetSequence.length) {
        setStatus("FAILURE");
        setTimeout(onFailure, 1500);
    }

    // Toggle orientation
    if (currentRow !== null) {
      setCurrentRow(null);
      setCurrentCol(c);
    } else {
      setCurrentCol(null);
      setCurrentRow(r);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
    >
      <div className="cyber-panel-cyan w-full max-w-5xl bg-cyber-bg border-cyber-cyan p-0 flex flex-col h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-cyber-cyan/30 flex justify-between items-center bg-cyber-cyan/5">
           <div className="flex items-center gap-4">
              <Terminal className="text-cyber-cyan" size={24} />
              <div>
                 <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">Neural Breach Protocol</h2>
                 <p className="text-[10px] font-mono text-cyber-cyan tracking-[0.2em] font-bold uppercase">ICE LEVEL: {difficulty}</p>
              </div>
           </div>
           <div className="flex items-center gap-6">
              <div className="text-right">
                 <div className={cn("text-2xl font-mono font-black", timeLeft < 10 ? "text-cyber-red animate-pulse" : "text-cyber-cyan")}>
                   {timeLeft}s
                 </div>
                 <div className="text-[8px] font-mono text-cyber-cyan/60 uppercase font-black">Buffer Time Remaining</div>
              </div>
              <button onClick={onClose} className="p-2 text-cyber-cyan/60 hover:text-white transition-colors">
                 <X size={24} />
              </button>
           </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
           {/* Matrix Grid */}
           <div className="flex-1 p-8 bg-black/40 relative overflow-hidden flex items-center justify-center">
              <div 
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
              >
                {grid.map((row, r) => 
                  row.map((cell, c) => {
                    const isRowActive = currentRow === r;
                    const isColActive = currentCol === c;
                    const isSelected = selectedIndices.has(`${r}-${c}`);
                    const isSelectable = (isRowActive || isColActive) && !isSelected;

                    return (
                      <button
                        key={`${r}-${c}`}
                        onClick={() => handleCellClick(r, c)}
                        disabled={!isSelectable || status !== "PLAYING"}
                        className={cn(
                          "w-12 h-12 md:w-16 md:h-16 flex items-center justify-center font-mono font-black text-sm md:text-lg transition-all relative border",
                          isSelected ? "bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan opacity-40 shadow-[0_0_10px_rgba(0,243,255,0.3)]" :
                          isSelectable ? "bg-white/5 border-white/20 text-white hover:bg-cyber-cyan hover:text-black hover:border-cyber-cyan cursor-pointer shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]" :
                          (isRowActive || isColActive) ? "bg-white/[0.02] border-white/5 text-gray-600" :
                          "bg-transparent border-transparent text-gray-800"
                        )}
                      >
                        {cell}
                        {isSelectable && (
                          <motion.div 
                            layoutId="selector"
                            className="absolute inset-0 border-2 border-cyber-cyan animate-pulse pointer-events-none"
                          />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
              
              {/* Grid Background Effect */}
              <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#00f3ff_1px,transparent_1px)] [background-size:20px_20px]" />
           </div>

           {/* Side Info */}
           <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-cyber-cyan/20 p-8 space-y-10 bg-black/60 overflow-y-auto">
              <div>
                 <label className="text-[10px] font-mono text-cyber-cyan uppercase font-black tracking-[0.3em] block mb-4">Required Sequence</label>
                 <div className="flex flex-wrap gap-3">
                    {targetSequence.map((hex, i) => (
                      <div 
                        key={i}
                        className={cn(
                          "w-12 h-12 flex items-center justify-center border-2 font-mono font-black transition-all",
                          userSequence[i] === hex ? "bg-green-500 border-green-400 text-black shadow-[0_0_15px_rgba(34,197,94,0.5)]" :
                          userSequence[i] ? "bg-cyber-red border-cyber-red text-white" :
                          "bg-black border-cyber-cyan/30 text-cyber-cyan/40"
                        )}
                      >
                         {hex}
                      </div>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-xs font-mono text-cyber-cyan/60 uppercase font-bold">
                    <Cpu size={14} /> System Logs
                 </div>
                 <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar font-mono text-[10px]">
                    {userSequence.map((val, i) => (
                      <div key={i} className="text-green-400 flex justify-between">
                         <span>SEC_ENTRY_MATCHED: [{val}]</span>
                         <span className="opacity-50">OK</span>
                      </div>
                    ))}
                    {status === "FAILURE" && <div className="text-cyber-red animate-pulse">CRITICAL_ERROR: SYSTEM_LOCKED</div>}
                    {status === "SUCCESS" && <div className="text-cyber-cyan animate-pulse">ACCESS_GRANTED: ICE_SHATTERED</div>}
                 </div>
              </div>

              {status !== "PLAYING" && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "p-6 text-center border-2 font-black italic uppercase text-lg",
                    status === "SUCCESS" ? "bg-green-500/20 border-green-500 text-green-500" : "bg-cyber-red/20 border-cyber-red text-cyber-red"
                  )}
                >
                  {status === "SUCCESS" ? (
                    <div className="flex flex-col items-center gap-2">
                       <ShieldCheck size={32} />
                       ICE SHATTERED
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                       <AlertTriangle size={32} />
                       CONNECTION REFUSED
                    </div>
                  )}
                </motion.div>
              )}
           </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-cyber-cyan/10 border-t border-cyber-cyan/20 flex justify-center">
           <p className="text-[9px] font-mono text-cyber-cyan/60 uppercase tracking-[0.4em] font-black italic">
             Warning: Neural feedback can cause permanent synaptic burnout. Proceed with caution.
           </p>
        </div>
      </div>
    </motion.div>
  );
}
