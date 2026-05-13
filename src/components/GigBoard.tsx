import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal, 
  Target, 
  DollarSign, 
  Zap, 
  ChevronRight,
  ShieldAlert,
  MapPin,
  Eye,
  EyeOff,
  X,
  Cpu,
  User,
  Activity,
  Search,
  Lock,
  Wifi,
  BarChart3
} from "lucide-react";
import { Gig } from "../types";
import { cn } from "../lib/utils";

interface GigBoardProps {
  gigs?: Gig[];
  onSelect: (gig: Gig) => void;
  isLoading?: boolean;
}

const mockGigsData: Gig[] = [
  {
    id: "GIG_01",
    title: "Black ICE & Blue Blood",
    teaser: "A high-ranking Militech exec needs a hard drive retrieved from a burning dataterm in the Combat Zone.",
    reward: "5000",
    difficulty: "MAJOR",
    fixer: "Rogue Amendiares",
    district: "Combat Zone",
    hook: "Rogue hits your agent with a priority-one chime. Militech is leaking, and they're paying top eddies to keep the spigot tight.",
    objectives: [
      "Infiltrate the burning dataterm building.",
      "Extract the Militech-labeled drive.",
      "Drop the drive at the Afterlife dead-drop."
    ],
    twist: "The 'exec' is actually a rogue AI trying to delete records of its own creation."
  },
  {
    id: "GIG_02",
    title: "Midnight Chrome Express",
    teaser: "Courier job. Deliver a tech-case from Heywood to the Badlands. Keep the speed up.",
    reward: "2500",
    difficulty: "TYPICAL",
    fixer: "Mr. Hands",
    district: "Heywood",
    hook: "Hands has a client who's in a hurry. A delicate piece of tech needs a ride out of the city before the morning sun hits the smog.",
    objectives: [
      "Meet the contact at the El Coyote Cojo.",
      "Break through the city borders via the South Gate.",
      "Deliver the package to the 'Wraiths' territory edge."
    ],
    twist: "The package is a localized EMP device set to detonate if it stops moving."
  },
  {
    id: "GIG_03",
    title: "Ghost in the Machine",
    teaser: "Someone is ghosting the local Net. A shadow-runner is hitting Ziggurat servers.",
    reward: "8000",
    difficulty: "DEADLY",
    fixer: "Nix",
    district: "Little China",
    hook: "The request comes in over a black-channel. A rogue Netrunner has taken over a Ziggurat relay tower.",
    objectives: [
      "Locate the hidden relay terminal.",
      "Identify the Netrunner's physical location.",
      "Neutralize the threat and scrub the ghost-link."
    ],
    twist: "The Netrunner is actually a pre-Crash data-construct trapped in the relay."
  }
];

export function GigBoard({ gigs = mockGigsData, onSelect, isLoading }: GigBoardProps) {
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [showTwist, setShowTwist] = useState(false);
  const [filters, setFilters] = useState({
    fixer: "ALL",
    threat: "ALL",
    district: "ALL"
  });

  const uniqueFixers = ["ALL", ...Array.from(new Set(gigs.map(g => g.fixer)))];
  const uniqueDistricts = ["ALL", ...Array.from(new Set(gigs.map(g => g.district)))];
  const threatLevels = ["ALL", "EASY", "TYPICAL", "MAJOR", "DEADLY"];

  const filteredGigs = gigs.filter(gig => {
    if (filters.fixer !== "ALL" && gig.fixer !== filters.fixer) return false;
    if (filters.threat !== "ALL" && gig.difficulty !== filters.threat) return false;
    if (filters.district !== "ALL" && gig.district !== filters.district) return false;
    return true;
  });

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 bg-[#0a0a0a] text-white p-6 relative overflow-hidden font-sans">
      {/* Background scanline effect */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      
      {/* FILTER SIDEBAR */}
      <aside className="w-full lg:w-64 flex flex-col gap-6 z-10">
        <div className="bg-[#121212]/80 backdrop-blur-md border border-white/10 p-4 rounded-sm shadow-[0_0_20px_rgba(255,0,60,0.05)]">
          <div className="flex items-center gap-2 mb-6 border-b border-cyber-red/30 pb-2">
            <Search size={16} className="text-cyber-red" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyber-red">Fixer_Net_Filter</h2>
          </div>

          <div className="space-y-6">
            <FilterSection 
              label="Fixer_ID" 
              options={uniqueFixers} 
              active={filters.fixer} 
              onChange={(val) => setFilters(f => ({ ...f, fixer: val }))} 
              icon={<User size={12} />}
            />
            <FilterSection 
              label="Threat_Matrix" 
              options={threatLevels} 
              active={filters.threat} 
              onChange={(val) => setFilters(f => ({ ...f, threat: val }))} 
              icon={<ShieldAlert size={12} />}
              accent="red"
            />
            <FilterSection 
              label="Zone_Sector" 
              options={uniqueDistricts} 
              active={filters.district} 
              onChange={(val) => setFilters(f => ({ ...f, district: val }))} 
              icon={<MapPin size={12} />}
              accent="amber"
            />
          </div>
        </div>

        <div className="mt-auto bg-cyber-red/5 border border-cyber-red/20 p-4 rounded-sm">
          <div className="flex items-center gap-2 text-cyber-red mb-2">
            <Wifi size={14} className="animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-widest">Connection_Stable</span>
          </div>
          <p className="text-[7px] font-mono text-gray-500 uppercase leading-tight">
            Uplink: 82.19.44.201<br />
            Lat: 0.04ms<br />
            Encrypt: AES-1024-XG
          </p>
        </div>
      </aside>

      {/* GIG GRID */}
      <main className="flex-1 overflow-y-auto custom-scrollbar z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
          <AnimatePresence mode="popLayout">
            {filteredGigs.map((gig, idx) => (
              <GigCard 
                key={gig.id} 
                gig={gig} 
                onClick={() => setSelectedGig(gig)}
                index={idx}
              />
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* GIG DETAIL MODAL */}
      <AnimatePresence>
        {selectedGig && (
          <GigDetailModal 
            gig={selectedGig} 
            showTwist={showTwist}
            setShowTwist={setShowTwist}
            onClose={() => {
              setSelectedGig(null);
              setShowTwist(false);
            }}
            onAccept={() => {
              onSelect(selectedGig);
              setSelectedGig(null);
            }}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterSection({ label, options, active, onChange, icon, accent = "cyan" }: any) {
  const getAccentClass = (opt: string) => {
    if (active !== opt) return "border-white/5 text-gray-500 hover:border-white/20";
    if (accent === "red") return "border-cyber-red text-cyber-red bg-cyber-red/10 shadow-[0_0_10px_rgba(255,0,60,0.2)]";
    if (accent === "amber") return "border-amber-500 text-amber-500 bg-amber-500/10 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
    return "border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10 shadow-[0_0_10px_rgba(0,243,255,0.2)]";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[8px] font-mono font-black text-gray-600 uppercase tracking-widest">
        {icon} {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "px-2 py-1 text-[8px] font-black uppercase tracking-tighter border transition-all rounded-sm",
              getAccentClass(opt)
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function GigCard({ gig, onClick, index }: { gig: Gig; onClick: () => void; index: number; key?: React.Key }) {
  const diffColor = 
    gig.difficulty === "EASY" ? "text-green-500" :
    gig.difficulty === "TYPICAL" ? "text-cyber-cyan" :
    gig.difficulty === "MAJOR" ? "text-amber-500" :
    "text-cyber-red";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="group relative bg-[#121212]/60 backdrop-blur-sm border border-white/10 p-6 cursor-pointer overflow-hidden transition-all hover:border-cyber-cyan/50 hover:shadow-[0_0_30px_rgba(0,243,255,0.1)]"
      style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)" }}
    >
      {/* Glitch Overlay on Hover */}
      <div className="absolute inset-0 bg-cyber-cyan/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/5 rounded-sm">
            <Activity size={16} className="text-cyber-cyan" />
          </div>
          <div>
            <div className={cn("text-[8px] font-bold uppercase tracking-widest", diffColor)}>
              {gig.difficulty}
            </div>
            <h3 className="text-sm font-black italic uppercase italic tracking-wider text-white group-hover:text-cyber-cyan transition-colors">
              {gig.title}
            </h3>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-black italic text-cyber-yellow group-hover:scale-110 transition-transform flex items-center justify-end">
            {gig.reward}<span className="text-[10px] ml-1 opacity-50 font-bold uppercase">Eb</span>
          </div>
        </div>
      </div>

      <p className="text-[10px] font-mono text-gray-400 line-clamp-2 mb-6 h-8 italic">
        "{gig.teaser}"
      </p>

      {/* Progress Bar */}
      <div className="space-y-1 mt-auto">
        <div className="flex justify-between text-[7px] font-mono text-gray-500 uppercase font-black">
          <span>Complexity_Stream</span>
          <span>STABLE</span>
        </div>
        <div className="h-1 bg-white/5 overflow-hidden relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "70%" }}
            className="h-full bg-cyber-cyan shadow-[0_0_10px_#00f3ff]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[8px] text-gray-400 font-bold uppercase">
            <User size={10} className="text-cyber-cyan" /> {gig.fixer.split(' ')[0]}
          </div>
          <div className="flex items-center gap-1 text-[8px] text-gray-400 font-bold uppercase">
            <MapPin size={10} className="text-cyber-red" /> {gig.district}
          </div>
        </div>
        <ChevronRight size={14} className="text-cyber-cyan group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Clipped corner accent */}
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/5 group-hover:border-cyber-cyan/30 transition-colors" />
    </motion.div>
  );
}

function GigDetailModal({ gig, showTwist, setShowTwist, onClose, onAccept, isLoading }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-4xl bg-[#0a0a0a] border-2 border-cyber-cyan shadow-[0_0_100px_rgba(0,243,255,0.2)] rounded-sm flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-cyber-cyan/10 border-b border-cyber-cyan/30 px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black border border-cyber-cyan flex items-center justify-center animate-pulse">
              <Terminal size={20} className="text-cyber-cyan" />
            </div>
            <div>
              <div className="text-[8px] font-black text-cyber-cyan uppercase tracking-[0.4em]">Secure_Link_Established</div>
              <h2 className="text-xl font-black italic uppercase italic text-white tracking-wider">{gig.title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors bg-white/5 border border-white/10 rounded-sm">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-cyber-cyan text-[10px] font-black uppercase italic">
                  <Activity size={14} /> The_Hook
                </div>
                <p className="text-xl font-mono text-gray-200 leading-relaxed italic border-l-4 border-cyber-cyan/30 pl-6 py-2 bg-white/[0.02]">
                  "{gig.hook}"
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase italic">
                  <Target size={14} /> The_Job
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {gig.objectives.map((obj: string, i: number) => (
                    <div key={i} className="flex gap-4 items-center bg-white/5 border border-white/10 p-4 rounded-sm hover:bg-white/[0.08] transition-colors group">
                      <div className="w-6 h-6 bg-black border border-white/20 text-[10px] font-black flex items-center justify-center group-hover:border-cyber-cyan">
                        {i + 1}
                      </div>
                      <p className="text-[11px] font-mono text-gray-300">{obj}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <InfoBlock label="Fixer_Node" value={gig.fixer} icon={<User size={12} />} />
              <InfoBlock label="Sector_Link" value={gig.district} icon={<MapPin size={12} />} />
              <InfoBlock label="Contract_Reward" value={`${gig.reward} Eb`} icon={<DollarSign size={12} />} accent="yellow" />
              <InfoBlock label="Threat_Level" value={gig.difficulty} icon={<ShieldAlert size={12} />} accent="red" />
            </div>
          </div>

          <div className="pt-10 border-t border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-cyber-red text-[10px] font-black uppercase italic">
                <Lock size={14} /> GM_REVELATION
              </div>
              <button 
                onClick={() => setShowTwist(!showTwist)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-[8px] font-black uppercase transition-all rounded-sm border",
                  showTwist ? "bg-cyber-red text-white border-cyber-red" : "bg-white/5 text-gray-500 border-white/10 hover:text-white"
                )}
              >
                {showTwist ? <EyeOff size={12} /> : <Eye size={12} />} {showTwist ? "Hide_Intel" : "Reveal_Intel"}
              </button>
            </div>
            
            <AnimatePresence>
              {showTwist && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-cyber-red/5 border-l-4 border-cyber-red p-6 italic text-cyber-red font-mono text-sm leading-loose shadow-[0_0_20px_rgba(255,0,60,0.1)]"
                >
                  <span className="text-[9px] font-black uppercase block mb-2 opacity-50 underline">CRITICAL_SYSTEM_WARNING:</span>
                  {gig.twist}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-black border-t border-white/10 p-6 flex gap-4 shrink-0">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-white/5 border border-white/10 text-gray-500 font-black uppercase tracking-[0.2em] text-[10px] italic hover:bg-white hover:text-black transition-all"
          >
            Abort_Uplink
          </button>
          <button 
            onClick={onAccept}
            disabled={isLoading}
            className="flex-[2] py-4 bg-cyber-cyan text-black font-black uppercase tracking-[0.4em] text-[10px] italic hover:bg-white transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? <Cpu className="animate-spin" size={14} /> : <Terminal size={14} />}
              {isLoading ? "Synchronizing..." : "Accept_Contract"}
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <motion.div 
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.5 }}
              className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
            />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoBlock({ label, value, icon, accent = "cyan" }: any) {
  const accentColor = accent === "red" ? "text-cyber-red" : accent === "yellow" ? "text-cyber-yellow" : "text-cyber-cyan";
  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-sm space-y-1">
      <div className="text-[7px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
        {icon} {label}
      </div>
      <div className={cn("text-xs font-black uppercase italic tracking-wider", accentColor)}>{value}</div>
    </div>
  );
}
