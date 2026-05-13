import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Activity, 
  Code, 
  Briefcase,
  Zap,
  CheckCircle2,
  Sword,
  Shield,
  Info,
  HelpCircle,
  Play,
  FileDown,
  RefreshCw
} from "lucide-react";
import { Character, StatName, Skill } from "../types";
import { ROLES, STARTING_WEAPONS, STARTING_GEAR, DEFAULT_SKILLS } from "../data/characterOptions";
import { cn } from "../lib/utils";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface CharacterBuilderProps {
  onClose: () => void;
  onComplete: (character: Character) => void;
}

type CreationMethod = "STREETRAT" | "EDGERUNNER" | "COMPLETE";
type Step = "METHOD" | "BIO" | "STATS" | "SKILLS" | "GEAR" | "REVIEW";

const STAT_DESCRIPTIONS: Record<StatName, string> = {
  [StatName.INT]: "Intellectual capacity. Affects planning, memory, and deduction.",
  [StatName.REF]: "Reflexes and coordination. Critical for combat and driving.",
  [StatName.DEX]: "Dexterity and balance. Important for stealth and athletics.",
  [StatName.TECH]: "Technical ability. Used for repairing and hacking.",
  [StatName.COOL]: "Composure under pressure. Affects social standing and resisting fear.",
  [StatName.WILL]: "Determination. Affects HP and resisting mental stress.",
  [StatName.LUCK]: "A pool of points you can spend to improve any roll.",
  [StatName.MOVE]: "Speed and movement distance during your turn.",
  [StatName.BODY]: "Physical size and toughness. Affects HP and death saves.",
  [StatName.EMP]: "Empathy and social skill. Declines as you add cyberware."
};

export function CharacterBuilder({ onClose, onComplete }: CharacterBuilderProps) {
  const [step, setStep] = useState<Step>("METHOD");
  const [method, setMethod] = useState<CreationMethod | null>(null);
  const [handle, setHandle] = useState("");
  const [role, setRole] = useState(ROLES[0].name);
  const reviewRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const [stats, setStats] = useState<Record<StatName, number>>({
    [StatName.INT]: 4, [StatName.REF]: 4, [StatName.DEX]: 4, [StatName.TECH]: 4,
    [StatName.COOL]: 4, [StatName.WILL]: 4, [StatName.LUCK]: 4, [StatName.MOVE]: 4,
    [StatName.BODY]: 4, [StatName.EMP]: 4
  });
  const STAT_POINTS_TOTAL = 62;
  const currentStatPoints = Object.values(stats).reduce((a, b) => (a as number) + (b as number), 0) as number;

  const [skills, setSkills] = useState<Record<string, number>>(
    DEFAULT_SKILLS.reduce((acc, skill) => ({ ...acc, [skill]: 2 }), {})
  );
  const SKILL_POINTS_TOTAL = 40;
  const currentSkillPoints = Object.values(skills).reduce((a, b) => (a as number) + (b as number), 0) as number;

  const [selectedWeapons, setSelectedWeapons] = useState<string[]>([]);
  const [selectedGear, setSelectedGear] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState<string | null>(null);

  const applyStreetrat = (rName: string) => {
    const r = ROLES.find(x => x.name === rName);
    if (r) {
      setStats(r.suggestedStats);
      // Pick top 2 suggested weapons or just first 2 from list
      setSelectedWeapons([STARTING_WEAPONS[0].name, STARTING_WEAPONS[2].name].slice(0, 2));
      // Pick first 3 gear
      setSelectedGear(STARTING_GEAR.slice(0, 3).map(g => g.name));
    }
  };

  const handleNext = () => {
    if (step === "METHOD" && method) setStep("BIO");
    else if (step === "BIO") {
      if (method === "STREETRAT") {
        applyStreetrat(role);
        setStep("GEAR");
      } else if (method === "EDGERUNNER") {
        applyStreetrat(role);
        setStep("STATS");
      } else {
        setStep("STATS");
      }
    }
    else if (step === "STATS") {
      if (method === "EDGERUNNER") setStep("GEAR");
      else setStep("SKILLS");
    }
    else if (step === "SKILLS") setStep("GEAR");
    else if (step === "GEAR") setStep("REVIEW");
  };

  const handleBack = () => {
    if (step === "BIO") setStep("METHOD");
    else if (step === "STATS") setStep("BIO");
    else if (step === "SKILLS") setStep("STATS");
    else if (step === "GEAR") {
      if (method === "STREETRAT") setStep("BIO");
      else if (method === "EDGERUNNER") setStep("STATS");
      else setStep("SKILLS");
    }
    else if (step === "REVIEW") setStep("GEAR");
  };

  const exportToPDF = async () => {
    if (!reviewRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reviewRef.current, {
        backgroundColor: "#000000",
        scale: 2,
        logging: false
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`Cyberpunk_RED_${handle}_Sheet.pdf`);
    } catch (e) {
      console.error("PDF Export failed", e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFinish = () => {
    const finalCharacter: Character = {
      id: Math.random().toString(36).substring(2, 9),
      handle,
      role,
      stats,
      skills: Object.entries(skills).map(([name, level]) => ({
        name,
        level: level as number,
        stat: StatName.INT // In a full version, we'd map these correctly
      })),
      weapons: STARTING_WEAPONS.filter(w => selectedWeapons.includes(w.name)),
      armor: { name: "Light Armorjack", sp: 11 },
      cyberware: [],
      gear: STARTING_GEAR.filter(g => selectedGear.includes(g.name)),
      hp: { 
        current: 10 + 5 * (Math.ceil(((stats[StatName.BODY] as number) + (stats[StatName.WILL] as number)) / 2)), 
        max: 10 + 5 * (Math.ceil(((stats[StatName.BODY] as number) + (stats[StatName.WILL] as number)) / 2)) 
      },
      luck: { current: stats[StatName.LUCK] as number, max: stats[StatName.LUCK] as number },
      deathSave: stats[StatName.BODY] as number,
      notes: ""
    };
    onComplete(finalCharacter);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl"
    >
      <div className="cyber-panel w-full max-w-4xl h-[90vh] flex flex-col bg-cyber-bg border-cyber-cyan p-0 overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-cyber-blue/30 flex justify-between items-center bg-black/40">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-cyber-cyan flex items-center justify-center rounded-sm">
                 <User className="text-black" size={24} />
              </div>
              <div>
                 <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">Neural Uplink: Character Creation</h2>
                 <p className="text-[10px] font-mono text-cyber-blue tracking-widest font-bold uppercase">Step {step}: System Configuration</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 text-cyber-blue hover:text-white transition-colors">
              <X size={24} />
           </button>
        </div>

        {/* Progress Bar */}
        <div className="flex w-full h-1 bg-cyber-blue/10">
           {["METHOD", "BIO", "STATS", "SKILLS", "GEAR", "REVIEW"].map((s, idx) => (
             <div 
               key={s} 
               className={cn(
                 "flex-1 transition-all duration-500",
                 idx <= ["METHOD", "BIO", "STATS", "SKILLS", "GEAR", "REVIEW"].indexOf(step) ? "bg-cyber-cyan" : "bg-transparent"
               )}
             />
           ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           <AnimatePresence mode="wait">
              {step === "METHOD" && (
                <motion.div 
                   key="method"
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 1.05 }}
                   className="h-full flex flex-col items-center justify-center text-center space-y-8"
                >
                   <div className="w-20 h-20 bg-cyber-blue/20 rounded-full flex items-center justify-center border-2 border-cyber-blue animate-pulse">
                      <Zap size={40} className="text-cyber-cyan" />
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Select Creation Protocol</h3>
                      <p className="text-gray-400 font-mono text-xs uppercase tracking-widest max-w-md mx-auto">
                         Choose your entry method into Night City. Different levels of complexity for different choombas.
                      </p>
                   </div>
 
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                      {[
                        { id: "STREETRAT", label: "Streetrat", sublabel: "Templates", color: "text-green-500", desc: "Fastest. Use pre-calculated templates." },
                        { id: "EDGERUNNER", label: "Edgerunner", sublabel: "Fast Archetype", color: "text-cyber-cyan", desc: "Fast. Role-based defaults with stat review." },
                        { id: "COMPLETE", label: "Complete", sublabel: "Custom Pack", color: "text-cyber-yellow", desc: "Full control. Manual point allocation." }
                      ].map((m) => (
                        <button 
                          key={m.id}
                          onClick={() => { setMethod(m.id as CreationMethod); handleNext(); }}
                          className={cn(
                            "p-6 border-2 font-black italic uppercase transition-all text-left group relative overflow-hidden",
                            method === m.id ? "bg-white text-black border-white" : "bg-white/5 border-cyber-blue/30 text-cyber-blue hover:text-white"
                          )}
                        >
                           <div className={cn("text-xl mb-1", m.id === method ? "text-black" : m.color)}>{m.label}</div>
                           <div className="text-[9px] font-mono opacity-80 mb-4">{m.sublabel}</div>
                           <p className="text-[10px] leading-tight opacity-60 normal-case font-medium">{m.desc}</p>
                           <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                              <Shield size={60} />
                           </div>
                        </button>
                      ))}
                   </div>
                </motion.div>
              )}

              {step === "BIO" && (
                <motion.div 
                  key="bio"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                   <div className="space-y-4">
                      <label className="text-xs font-mono text-cyber-blue uppercase font-black tracking-widest block">Edgerunner Handle</label>
                      <input 
                        className="w-full bg-white/[0.03] border-b-2 border-cyber-blue p-4 text-2xl font-black text-cyber-cyan placeholder:text-cyber-blue/20 italic focus:outline-none focus:border-cyber-cyan transition-all"
                        placeholder="Enter Alias..."
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                      />
                   </div>

                   <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-cyber-blue/20 pb-2">
                        <label className="text-xs font-mono text-cyber-blue uppercase font-black tracking-widest block">Choose Your Role</label>
                        {method !== "COMPLETE" && (
                           <span className="text-[9px] font-mono text-cyber-yellow bg-cyber-yellow/10 px-2 py-0.5 animate-pulse">GUIDE ACTIVE: ROLE SELECTION</span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                         {ROLES.map(r => (
                           <button 
                             key={r.name}
                             onClick={() => setRole(r.name)}
                             onMouseEnter={() => method !== "COMPLETE" && setShowInfo(r.name)}
                             onMouseLeave={() => setShowInfo(null)}
                             className={cn(
                               "p-6 border text-left transition-all relative group overflow-hidden",
                               role === r.name ? "bg-cyber-cyan text-black border-cyber-cyan" : "bg-white/[0.02] border-white/10 text-gray-400 hover:border-cyber-cyan/50"
                             )}
                           >
                              <div className="flex justify-between items-start">
                                 <div className="font-black italic uppercase text-lg mb-1">{r.name}</div>
                                 {method !== "COMPLETE" && <Info size={14} className="opacity-40" />}
                              </div>
                              <p className="text-[10px] leading-tight opacity-70 mb-4">{r.description}</p>
                              <div className={cn(
                                "text-[9px] font-mono font-black uppercase p-1 inline-block",
                                role === r.name ? "bg-black/20" : "bg-cyber-blue/20 text-cyber-blue"
                              )}>
                                {r.roleAbilityName}: {r.roleAbilityDescription}
                              </div>
                              <AnimatePresence>
                                 {showInfo === r.name && (
                                   <motion.div 
                                     initial={{ opacity: 0, y: 10 }}
                                     animate={{ opacity: 1, y: 0 }}
                                     className="absolute inset-0 bg-cyber-yellow text-black p-4 z-10 flex items-center justify-center text-center font-bold text-xs uppercase"
                                   >
                                      Best for players who like {r.name === 'Solo' ? 'pure combat' : r.name === 'Netrunner' ? 'hacking' : 'social manipulation'}.
                                   </motion.div>
                                 )}
                              </AnimatePresence>
                           </button>
                         ))}
                      </div>
                   </div>
                </motion.div>
              )}

              {step === "STATS" && (
                <motion.div 
                   key="stats"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-8"
                >
                   <div className="flex justify-between items-end border-b border-cyber-blue/20 pb-4">
                      <div>
                         <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Attribute Allocation</h3>
                         <p className="text-xs text-cyber-blue font-mono uppercase tracking-widest">Base Physical and Mental Constraints</p>
                      </div>
                      <div className="text-right">
                         <div className={cn(
                           "text-3xl font-black",
                           currentStatPoints > STAT_POINTS_TOTAL ? "text-cyber-red" : "text-cyber-cyan"
                         )}>
                            {STAT_POINTS_TOTAL - currentStatPoints}
                         </div>
                         <div className="text-[8px] font-mono text-cyber-blue uppercase font-black">Points Remaining</div>
                      </div>
                   </div>

                   {method !== "COMPLETE" && (
                      <div className="space-y-4">
                        <div className="p-4 bg-cyber-yellow/10 border border-cyber-yellow/30 rounded-sm flex gap-4 items-start">
                           <Play size={20} className="text-cyber-yellow mt-1 shrink-0" />
                           <div className="space-y-2">
                             <p className="text-[11px] text-cyber-yellow font-mono leading-relaxed">
                                <span className="font-black">PRO-TIP:</span> Aim for 6-8 in your primary stats (REF for combat, INT for tech folks). 4 is average. 2 is weak.
                             </p>
                             <button 
                               onClick={() => {
                                 const suggested = ROLES.find(r => r.name === role)?.suggestedStats;
                                 if (suggested) setStats(suggested);
                               }}
                               className="text-[9px] font-mono font-black uppercase bg-cyber-yellow text-black px-2 py-1 hover:bg-white transition-colors"
                             >
                                Apply Suggested Distribution for {role}
                             </button>
                           </div>
                        </div>
                      </div>
                   )}

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      {Object.keys(stats).map((stat) => (
                        <div key={stat} className="flex items-center justify-between group relative">
                           <div 
                             className="flex-1 cursor-help"
                             onMouseEnter={() => method !== "COMPLETE" && setShowInfo(stat)}
                             onMouseLeave={() => setShowInfo(null)}
                           >
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-cyber-blue uppercase font-black tracking-widest">{stat}</span>
                                {method !== "COMPLETE" && (
                                   <div className="flex items-center gap-2">
                                     <HelpCircle size={10} className="opacity-30" />
                                     <span className="text-[7px] text-cyber-yellow bg-cyber-yellow/10 px-1 font-black">
                                       REC: {ROLES.find(r => r.name === role)?.suggestedStats[stat as StatName] || "-"}
                                     </span>
                                   </div>
                                )}
                              </div>
                              <div className="text-[8px] text-gray-500 uppercase font-bold mt-0.5">Constraint Factor</div>
                              
                              <AnimatePresence>
                                 {showInfo === stat && (
                                   <motion.div 
                                     initial={{ opacity: 0, scale: 0.9 }}
                                     animate={{ opacity: 1, scale: 1 }}
                                     className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-cyber-blue border border-cyber-cyan text-white text-[10px] font-mono z-50 shadow-2xl"
                                   >
                                      {STAT_DESCRIPTIONS[stat as StatName]}
                                   </motion.div>
                                 )}
                              </AnimatePresence>
                           </div>
                           <div className="flex items-center gap-4">
                              <button 
                                onClick={() => setStats(prev => ({ ...prev, [stat]: Math.max(2, prev[stat as StatName] - 1) }))}
                                className="w-8 h-8 rounded-sm bg-white/5 flex items-center justify-center hover:bg-cyber-red transition-colors"
                              >-</button>
                              <span className="w-8 text-center text-xl font-black text-white italic">{stats[stat as StatName]}</span>
                              <button 
                                onClick={() => setStats(prev => ({ ...prev, [stat]: Math.min(8, prev[stat as StatName] + 1) }))}
                                className="w-8 h-8 rounded-sm bg-white/5 flex items-center justify-center hover:bg-cyber-cyan hover:text-black transition-colors"
                              >+</button>
                           </div>
                        </div>
                      ))}
                   </div>
                </motion.div>
              )}

              {step === "SKILLS" && (
                <motion.div 
                   key="skills"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-8"
                >
                   <div className="flex justify-between items-end border-b border-cyber-blue/20 pb-4">
                      <div>
                         <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Skill Proficiency</h3>
                         <p className="text-xs text-cyber-blue font-mono uppercase tracking-widest">Training and Experiential Data</p>
                      </div>
                      <div className="text-right">
                         <div className={cn(
                           "text-3xl font-black",
                           currentSkillPoints > SKILL_POINTS_TOTAL ? "text-cyber-red" : "text-cyber-cyan"
                         )}>
                            {SKILL_POINTS_TOTAL - currentSkillPoints}
                         </div>
                         <div className="text-[8px] font-mono text-cyber-blue uppercase font-black">Points Remaining</div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar px-1">
                      {DEFAULT_SKILLS.map((skill) => (
                        <div key={skill} className="flex items-center justify-between py-2 border-b border-white/[0.03]">
                           <span className="text-[11px] font-mono text-gray-300 uppercase font-black">{skill}</span>
                           <div className="flex items-center gap-3">
                              <button 
                                onClick={() => setSkills(prev => ({ ...prev, [skill]: Math.max(0, prev[skill] - 1) }))}
                                className="w-6 h-6 rounded-sm bg-white/5 flex items-center justify-center hover:bg-cyber-red transition-colors text-xs"
                              >-</button>
                              <span className="w-6 text-center text-sm font-black text-cyber-cyan">{skills[skill]}</span>
                              <button 
                                onClick={() => setSkills(prev => ({ ...prev, [skill]: Math.min(6, prev[skill] + 1) }))}
                                className="w-6 h-6 rounded-sm bg-white/5 flex items-center justify-center hover:bg-cyber-cyan hover:text-black transition-colors text-xs"
                              >+</button>
                           </div>
                        </div>
                      ))}
                   </div>
                </motion.div>
              )}

              {step === "GEAR" && (
                <motion.div 
                   key="gear"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-8"
                >
                   <div className="space-y-6">
                      <label className="text-xs font-mono text-cyber-blue uppercase font-black tracking-widest block border-b border-cyber-blue/20 pb-2">Primary Armament (Max 2)</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {STARTING_WEAPONS.map(w => (
                           <button 
                             key={w.name}
                             onClick={() => {
                               if (selectedWeapons.includes(w.name)) {
                                 setSelectedWeapons(prev => prev.filter(n => n !== w.name));
                               } else if (selectedWeapons.length < 2) {
                                 setSelectedWeapons(prev => [...prev, w.name]);
                               }
                             }}
                             className={cn(
                               "p-4 border text-left transition-all relative",
                               selectedWeapons.includes(w.name) ? "bg-cyber-cyan/[0.1] border-cyber-cyan text-cyber-cyan" : "bg-white/[0.02] border-white/10 text-gray-400"
                             )}
                           >
                              <div className="font-black uppercase text-sm">{w.name}</div>
                              <div className="text-[10px] text-cyber-blue font-mono mt-1">{w.damage} // DMG</div>
                              {selectedWeapons.includes(w.name) && <CheckCircle2 size={16} className="absolute top-4 right-4" />}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-6">
                      <label className="text-xs font-mono text-cyber-blue uppercase font-black tracking-widest block border-b border-cyber-blue/20 pb-2">Utility Field Gear (Max 3)</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                         {STARTING_GEAR.map(g => (
                           <button 
                             key={g.name}
                             onClick={() => {
                               if (selectedGear.includes(g.name)) {
                                 setSelectedGear(prev => prev.filter(n => n !== g.name));
                               } else if (selectedGear.length < 3) {
                                 setSelectedGear(prev => [...prev, g.name]);
                               }
                             }}
                             className={cn(
                               "p-3 border text-left transition-all relative px-4",
                               selectedGear.includes(g.name) ? "bg-cyber-cyan/[0.1] border-cyber-cyan text-cyber-cyan" : "bg-white/[0.02] border-white/10 text-gray-400"
                             )}
                           >
                              <div className="font-black uppercase text-[10px]">{g.name}</div>
                              {selectedGear.includes(g.name) && <CheckCircle2 size={12} className="absolute top-2 right-2" />}
                           </button>
                         ))}
                      </div>
                   </div>
                </motion.div>
              )}

              {step === "REVIEW" && (
                <motion.div 
                   key="review"
                   ref={reviewRef}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-10 p-4 bg-black"
                >
                   <div className="text-center space-y-4">
                      <div className="inline-block p-4 bg-cyber-cyan shadow-[0_0_30px_rgba(0,243,255,0.3)] mb-4">
                         <Activity size={48} className="text-black" />
                      </div>
                      <h2 className="text-4xl font-black italic uppercase tracking-tighter glitch-text">{handle}</h2>
                      <p className="text-xs font-mono text-cyber-blue uppercase font-black tracking-[0.4em]">Ready for Off-Net Deployment</p>
                      
                      <button 
                        onClick={exportToPDF}
                        disabled={isExporting}
                        className="mt-4 flex items-center gap-2 mx-auto text-[10px] uppercase font-black tracking-widest text-cyber-cyan border border-cyber-cyan/30 px-4 py-2 hover:bg-cyber-cyan hover:text-black transition-all"
                      >
                        {isExporting ? <RefreshCw size={14} className="animate-spin" /> : <FileDown size={14} />}
                        {isExporting ? "Compiling PDF..." : "Export Character Sheet (PDF)"}
                      </button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="cyber-panel bg-white/[0.02] border-cyber-blue/30 p-6">
                         <div className="text-[10px] font-mono text-cyber-blue uppercase font-black mb-4 flex items-center gap-2">
                            <Activity size={12} /> Biometrics
                         </div>
                         <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                               <span className="text-gray-500 font-mono">ROLE</span>
                               <span className="font-black text-white uppercase italic">{role}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                               <span className="text-gray-500 font-mono">AVG ATT</span>
                               <span className="font-black text-cyber-cyan">{(currentStatPoints/10).toFixed(1)}</span>
                            </div>
                         </div>
                      </div>

                      <div className="cyber-panel bg-white/[0.02] border-cyber-blue/30 p-6">
                         <div className="text-[10px] font-mono text-cyber-blue uppercase font-black mb-4 flex items-center gap-2">
                            <Sword size={12} /> Weapons Map
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {selectedWeapons.map(w => (
                              <span key={w} className="text-[9px] font-black bg-cyber-red/20 text-cyber-red px-2 py-1 uppercase">{w}</span>
                            ))}
                         </div>
                      </div>

                      <div className="cyber-panel bg-white/[0.02] border-cyber-blue/30 p-6">
                         <div className="text-[10px] font-mono text-cyber-blue uppercase font-black mb-4 flex items-center gap-2">
                            <Briefcase size={12} /> Gear Trace
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {selectedGear.map(g => (
                              <span key={g} className="text-[9px] font-black bg-cyber-cyan/10 text-cyber-blue px-2 py-1 uppercase border border-cyber-blue/30">{g}</span>
                            ))}
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-cyber-blue/30 bg-black/60 flex justify-between items-center bg-black/80">
           <button 
             onClick={handleBack}
             disabled={step === "BIO"}
             className="flex items-center gap-2 text-xs font-mono text-cyber-blue uppercase font-black tracking-widest disabled:opacity-30 hover:text-white transition-colors"
           >
              <ChevronLeft size={16} /> Back
           </button>
           
           {step === "REVIEW" ? (
              <button 
                onClick={handleFinish}
                className="cyber-button px-12 py-4 bg-cyber-cyan text-black shadow-[0_0_20px_rgba(0,243,255,0.4)]"
              >
                DEPLOY EDGERUNNER
              </button>
           ) : (
              <button 
                onClick={handleNext}
                disabled={
                  (step === "BIO" && !handle) || 
                  (step === "STATS" && currentStatPoints > STAT_POINTS_TOTAL) ||
                  (step === "SKILLS" && currentSkillPoints > SKILL_POINTS_TOTAL)
                }
                className="cyber-button px-12 py-4 disabled:opacity-30"
              >
                <span className="flex items-center gap-2">
                  Continue <ChevronRight size={16} />
                </span>
              </button>
           )}
        </div>
      </div>
    </motion.div>
  );
}
