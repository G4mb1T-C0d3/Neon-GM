import React from "react";
import { motion } from "motion/react";
import { X, Shield, Sword, Cpu, Package, Info, Trash2, Edit3, Save } from "lucide-react";
import { Character } from "../types";
import { cn } from "../lib/utils";
import { CharacterSheet } from "./CharacterSheet";

interface CharacterModalProps {
  character: Character;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onUpdateNote?: (id: string, notes: string) => void;
  onUpdateAutopilot?: (id: string, val: boolean) => void;
}

export function CharacterModal({ character, onClose, onDelete, onUpdateNote, onUpdateAutopilot }: CharacterModalProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-3xl"
    >
      <div className="relative w-full max-w-6xl h-full flex flex-col bg-cyber-bg border-4 border-cyber-cyan shadow-[0_0_50px_rgba(0,243,255,0.2)] overflow-hidden">
        {/* Hardware Border Decor */}
        <div className="absolute top-2 left-2 flex gap-1">
            <div className="w-1.5 h-1.5 bg-black rounded-full border border-white/20" />
            <div className="w-1.5 h-1.5 bg-black rounded-full border border-white/20" />
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
            <div className="w-1.5 h-1.5 bg-black rounded-full border border-white/20" />
            <div className="w-1.5 h-1.5 bg-black rounded-full border border-white/20" />
        </div>

        {/* Modal Header */}
        <div className="p-4 border-b border-cyber-cyan/30 flex justify-between items-center bg-black/60">
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-cyber-cyan font-black uppercase tracking-[0.5em]">SYSTEM_INSPECTION: ASSET_SHEET://{character.handle.toUpperCase()}</span>
           </div>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                   if (confirm(`CRITICAL: Remove ${character.handle} from active duty? Data recovery impossible.`)) {
                     onDelete?.(character.id);
                     onClose();
                   }
                }}
                className="p-2 text-cyber-red/60 hover:text-cyber-red transition-colors"
                title="TERMINATE ASSET"
              >
                <Trash2 size={20} />
              </button>
              <button onClick={onClose} className="p-2 text-cyber-cyan hover:text-white transition-colors">
                <X size={24} />
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-hidden">
           <CharacterSheet 
             character={character} 
             onUpdateAutopilot={onUpdateAutopilot}
           />
        </div>

        {/* Modal Footer / Fast Actions */}
        <div className="p-4 bg-black/80 border-t border-cyber-cyan/20 flex justify-between items-center px-8">
           <div className="flex gap-6 text-[10px] font-mono text-cyber-cyan/40 uppercase font-black">
              <span className="flex items-center gap-2 animate-pulse"><div className="w-1 h-1 bg-cyber-cyan" /> UPLINK_STABLE</span>
              <span>DATA_ENCRYPTED: AES-256-KNC</span>
           </div>
           <div className="text-[10px] font-mono text-gray-600">
              © 2045 ZIGGURAT NEURAL INTERFACES
           </div>
        </div>
      </div>
    </motion.div>
  );
}
