import React from "react";
import { motion } from "motion/react";
import { 
  Shield, 
  Heart, 
  Zap, 
  Sword, 
  Briefcase, 
  Activity, 
  User,
  Settings,
  Brain,
  Crosshair,
  Smartphone,
  Cpu
} from "lucide-react";
import { Character, StatName } from "../types";
import { cn } from "../lib/utils";

interface CharacterSheetProps {
  character: Character;
  onUpdate?: (char: Character) => void;
  onUpdateAutopilot?: (id: string, val: boolean) => void;
  isViewOnly?: boolean;
}

export function CharacterSheet({ character, onUpdate, onUpdateAutopilot, isViewOnly = false }: CharacterSheetProps) {
  const hpPercent = (character.hp.current / character.hp.max) * 100;
  const luckPercent = (character.luck.current / character.luck.max) * 100;

  const updateStat = (stat: StatName, val: number) => {
    if (isViewOnly || !onUpdate) return;
    onUpdate({
      ...character,
      stats: { ...character.stats, [stat]: val }
    });
  };

  const updateVitals = (field: 'current' | 'max', val: number, type: 'hp' | 'luck') => {
    if (isViewOnly || !onUpdate) return;
    onUpdate({
      ...character,
      [type]: { ...character[type], [field]: val }
    });
  };

  const updateSimpleField = (field: keyof Character, val: any) => {
    if (isViewOnly || !onUpdate) return;
    onUpdate({ ...character, [field]: val });
  };

  return (
    <div className="bg-black text-gray-200 p-8 font-sans max-w-6xl mx-auto border-x-4 border-cyber-cyan/20 shadow-2xl space-y-10 overflow-y-auto h-full custom-scrollbar selection:bg-cyber-cyan selection:text-black">
      {/* Hardware Decals */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-cyber-cyan/10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-cyber-cyan/10 pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start border-b-8 border-cyber-red pb-8 gap-8 relative">
        <div className="space-y-3 flex-1 w-full">
          <div className="flex items-center gap-4">
             <div className="text-[10px] uppercase font-black tracking-[0.6em] text-cyber-red bg-cyber-red/10 px-2 py-1">ASSET_CLASSIFICATION: {character.id.toUpperCase()}</div>
             <div className="h-[1px] flex-1 bg-cyber-red/20" />
          </div>
          <div className="flex items-baseline gap-4">
            <input 
              readOnly={isViewOnly}
              value={character.handle}
              onChange={(e) => updateSimpleField('handle', e.target.value)}
              className={cn(
                "text-7xl font-black italic uppercase tracking-tighter text-white bg-transparent outline-none w-full",
                !isViewOnly && "hover:bg-white/5 border-b-2 border-transparent focus:border-cyber-cyan"
              )}
            />
          </div>
          <div className="flex gap-6 items-center">
            <select
              disabled={isViewOnly}
              value={character.role}
              onChange={(e) => updateSimpleField('role', e.target.value)}
              className="bg-cyber-red text-black px-4 py-1 text-sm font-black uppercase italic border-none outline-none appearance-none cursor-pointer"
            >
               <option value="Solo">Solo</option>
               <option value="Netrunner">Netrunner</option>
               <option value="Tech">Tech</option>
               <option value="Medtech">Medtech</option>
               <option value="Media">Media</option>
               <option value="Exec">Exec</option>
               <option value="Lawman">Lawman</option>
               <option value="Fixer">Fixer</option>
               <option value="Nomad">Nomad</option>
               <option value="Rockerboy">Rockerboy</option>
            </select>
            <div className="h-4 w-[1px] bg-white/20" />
            <span className="text-[10px] font-mono text-cyber-blue uppercase tracking-widest font-black">Authentication: DISTINGUISHED_ACCESS</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          {!isViewOnly && (
            <div className="flex items-center gap-6 p-4 bg-white/5 border border-white/10 rounded-sm">
                <div className="text-right">
                    <div className="text-[10px] font-black uppercase text-cyber-cyan tracking-widest mb-1">Deep Dive Mode</div>
                    <div className={cn(
                        "text-xs font-mono font-bold uppercase",
                        character.isAutopiloted ? "text-cyber-red" : "text-cyber-cyan"
                    )}>
                        {character.isAutopiloted ? "EXTERNAL_OVERRIDE" : "MANUAL_BYPASS"}
                    </div>
                </div>
                <button 
                    onClick={() => onUpdateAutopilot?.(character.id, !character.isAutopiloted)}
                    className={cn(
                        "w-16 h-8 rounded-full relative transition-all duration-500 p-1",
                        character.isAutopiloted ? "bg-cyber-red shadow-[0_0_15px_rgba(255,0,60,0.4)]" : "bg-white/10"
                    )}
                >
                    <motion.div 
                        animate={{ x: character.isAutopiloted ? 32 : 0 }}
                        className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center",
                            character.isAutopiloted ? "bg-black" : "bg-gray-400"
                        )}
                    >
                        {character.isAutopiloted ? <Brain size={12} className="text-cyber-red" /> : <Settings size={12} className="text-black" />}
                    </motion.div>
                </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Core Stats & Vitals */}
        <div className="lg:col-span-4 space-y-10">
          {/* VITALS SECTION */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Heart size={16} className="text-cyber-red" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Integrity_Readout</h3>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="cyber-panel border-green-500 bg-green-500/5 p-6 rounded-sm relative group">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[9px] font-black uppercase text-green-500 tracking-widest">Hit Points</span>
                        <Activity size={14} className="text-green-500" />
                    </div>
                    <div className="flex items-baseline gap-2 mb-4">
                        <input 
                          type="number"
                          value={character.hp.current}
                          onChange={(e) => updateVitals('current', parseInt(e.target.value), 'hp')}
                          className="bg-transparent text-5xl font-black italic text-white w-20 outline-none"
                        />
                        <span className="text-2xl text-gray-600 font-black">/</span>
                        <input 
                          type="number"
                          value={character.hp.max}
                          onChange={(e) => updateVitals('max', parseInt(e.target.value), 'hp')}
                          className="bg-transparent text-2xl font-black text-gray-500 w-16 outline-none"
                        />
                    </div>
                    <div className="h-1.5 bg-white/5 w-full rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, hpPercent)}%` }}
                          className={cn("h-full", hpPercent < 30 ? "bg-cyber-red" : "bg-green-500")}
                        />
                    </div>
                </div>

                <div className="cyber-panel border-cyber-cyan bg-cyber-cyan/5 p-6 rounded-sm relative">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[9px] font-black uppercase text-cyber-cyan tracking-widest">Luck Pool</span>
                        <Zap size={14} className="text-cyber-cyan" />
                    </div>
                    <div className="flex items-baseline gap-2 mb-4">
                        <input 
                          type="number"
                          value={character.luck.current}
                          onChange={(e) => updateVitals('current', parseInt(e.target.value), 'luck')}
                          className="bg-transparent text-5xl font-black italic text-white w-20 outline-none"
                        />
                        <span className="text-2xl text-gray-600 font-black">/</span>
                        <input 
                          type="number"
                          value={character.luck.max}
                          onChange={(e) => updateVitals('max', parseInt(e.target.value), 'luck')}
                          className="bg-transparent text-2xl font-black text-gray-500 w-16 outline-none"
                        />
                    </div>
                    <div className="h-1.5 bg-white/5 w-full rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, luckPercent)}%` }}
                          className="h-full bg-cyber-cyan"
                        />
                    </div>
                </div>
             </div>
          </div>

          {/* ARMOR SECTION */}
          <div className="cyber-panel border-cyber-yellow bg-cyber-yellow/5 p-6 rounded-sm">
             <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <Shield size={18} className="text-cyber-yellow" />
                    <span className="text-[10px] font-black uppercase text-cyber-yellow tracking-[0.4em]">Subdermal_Plate</span>
                </div>
             </div>
             <div className="flex items-center gap-10">
                <div className="space-y-1">
                    <input 
                      type="number"
                      value={character.armor.sp}
                      onChange={(e) => updateSimpleField('armor', { ...character.armor, sp: parseInt(e.target.value) })}
                      className="text-6xl font-black italic text-white bg-transparent outline-none w-24"
                    />
                    <div className="text-[9px] font-mono uppercase text-gray-600 font-bold tracking-widest">Stopping_Power</div>
                </div>
                <div className="flex-1 space-y-2">
                    <input 
                      value={character.armor.name}
                      onChange={(e) => updateSimpleField('armor', { ...character.armor, name: e.target.value })}
                      className="text-sm font-black uppercase italic text-cyber-yellow/80 bg-transparent border-b border-cyber-yellow/20 outline-none w-full pb-1"
                      placeholder="Armor Name"
                    />
                    <div className="text-[8px] font-mono text-gray-700 uppercase font-bold">Standard_Issue_Hardware</div>
                </div>
             </div>
          </div>

          {/* STATS SECTION */}
          <div className="space-y-6 pt-4">
             <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="text-[10px] font-black uppercase text-cyber-blue tracking-[0.5em]">Attribute_Matrix</h3>
                <span className="text-[8px] font-mono text-gray-700">CORE_V1.1</span>
             </div>
             <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                {Object.values(StatName).map((stat) => (
                    <div key={stat} className="flex justify-between items-end border-b border-white/5 pb-2 group">
                        <span className="text-xs font-mono font-black text-cyber-blue uppercase tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity">{stat}</span>
                        <input 
                          type="number"
                          value={character.stats[stat as StatName]}
                          onChange={(e) => updateStat(stat as StatName, parseInt(e.target.value))}
                          className="bg-transparent text-2xl font-black text-white italic w-12 text-right outline-none hover:text-cyber-cyan focus:text-cyber-cyan"
                        />
                    </div>
                ))}
             </div>
          </div>
        </div>

        {/* Middle Column: Skills Inventory */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#050505] p-8 border-2 border-white/5 relative h-full">
            <div className="absolute top-0 right-0 p-4">
                <Settings size={14} className="text-gray-700" />
            </div>
            
            <div className="flex items-center gap-4 mb-8 border-b-2 border-white/10 pb-4">
                <Activity size={24} className="text-cyber-cyan" />
                <h3 className="text-xl font-black uppercase italic tracking-widest text-white">Skill_Repository</h3>
            </div>
            
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-6 custom-scrollbar">
                {character.skills.length > 0 ? character.skills.map((skill, idx) => (
                    <div key={idx} className="flex flex-col gap-2 p-3 hover:bg-white/[0.02] transition-colors border-b border-white/5 group">
                        <div className="flex justify-between items-center">
                            <div className="space-y-0.5">
                                <div className="text-sm font-mono font-black uppercase text-white group-hover:text-cyber-cyan transition-colors">{skill.name}</div>
                                <div className="text-[9px] font-mono text-gray-600 uppercase font-bold tracking-widest">Stat: {skill.stat}</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <input 
                                  type="number"
                                  value={skill.level}
                                  onChange={(e) => {
                                     const newSkills = [...character.skills];
                                     newSkills[idx] = { ...skill, level: parseInt(e.target.value) };
                                     updateSimpleField('skills', newSkills);
                                  }}
                                  className="w-10 text-xl font-black italic text-right bg-transparent outline-none text-cyber-cyan"
                                />
                            </div>
                        </div>
                        <div className="flex gap-1">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className={cn("h-1 flex-1 transition-all duration-500", i < skill.level ? "bg-cyber-cyan" : "bg-white/5")} />
                            ))}
                        </div>
                    </div>
                )) : (
                    <div className="text-xs font-mono text-gray-700 italic border-l-2 border-white/10 pl-4 py-8">
                       NO_ACTIVE_SKILLS_FOUND. 
                       <br/>INITIATE_TRAINING_PROTOCOL?
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Right Column: Weaponry & Cyberware */}
        <div className="lg:col-span-4 space-y-10">
          {/* WEAPONS */}
          <div className="space-y-6">
             <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                <Sword size={20} className="text-cyber-red" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-cyber-red">Weapon_Systems</h3>
             </div>
             <div className="space-y-4">
                {character.weapons.map((w, idx) => (
                    <div key={idx} className="p-6 bg-[#080505] border border-cyber-red/20 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-red/5 -rotate-45 translate-x-12 -translate-y-12" />
                        
                        <div className="flex justify-between items-start mb-4">
                            <input 
                              value={w.name}
                              onChange={(e) => {
                                 const newWeapons = [...character.weapons];
                                 newWeapons[idx] = { ...w, name: e.target.value };
                                 updateSimpleField('weapons', newWeapons);
                              }}
                              className="font-black uppercase text-lg italic text-white bg-transparent outline-none w-full mr-4"
                            />
                            <div className="flex flex-col items-end">
                                <input 
                                  value={w.damage}
                                  onChange={(e) => {
                                    const newWeapons = [...character.weapons];
                                    newWeapons[idx] = { ...w, damage: e.target.value };
                                    updateSimpleField('weapons', newWeapons);
                                  }}
                                  className="text-right text-cyber-red font-black italic bg-transparent outline-none w-16 text-lg"
                                />
                                <div className="text-[8px] font-mono text-cyber-red/40 uppercase font-black">DAM_CALC</div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                            <div className="space-y-1">
                                <div className="text-[9px] font-mono text-gray-600 font-bold uppercase">Ammo_Count</div>
                                <div className="flex items-baseline gap-1">
                                    <input 
                                      type="number"
                                      value={w.ammo}
                                      onChange={(e) => {
                                        const newWeapons = [...character.weapons];
                                        newWeapons[idx] = { ...w, ammo: parseInt(e.target.value) };
                                        updateSimpleField('weapons', newWeapons);
                                      }}
                                      className="w-10 bg-transparent text-lg font-black text-white outline-none"
                                    />
                                    <span className="text-gray-700">/</span>
                                    <input 
                                      type="number"
                                      value={w.maxAmmo}
                                      onChange={(e) => {
                                        const newWeapons = [...character.weapons];
                                        newWeapons[idx] = { ...w, maxAmmo: parseInt(e.target.value) };
                                        updateSimpleField('weapons', newWeapons);
                                      }}
                                      className="w-10 bg-transparent text-sm font-black text-gray-600 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[9px] font-mono text-gray-600 font-bold uppercase">Rate_Of_Fire</div>
                                <input 
                                  type="number"
                                  value={w.rof}
                                  onChange={(e) => {
                                    const newWeapons = [...character.weapons];
                                    newWeapons[idx] = { ...w, rof: parseInt(e.target.value) };
                                    updateSimpleField('weapons', newWeapons);
                                  }}
                                  className="w-12 bg-transparent text-lg font-black text-white outline-none"
                                />
                            </div>
                        </div>
                        
                        <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(w.ammo/w.maxAmmo)*100}%` }}
                              className="h-full bg-cyber-red"
                           />
                        </div>
                    </div>
                ))}
             </div>
          </div>

          {/* CYBERWARE */}
          <div className="space-y-6">
             <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                <Cpu size={20} className="text-green-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-green-500">Neural_Augments</h3>
             </div>
             <div className="space-y-3">
                {character.cyberware.length > 0 ? character.cyberware.map((c, idx) => (
                    <div key={idx} className="p-4 border-l-4 border-green-500 bg-green-500/5 group">
                        <input 
                           value={c.name}
                           onChange={(e) => {
                             const newCyber = [...character.cyberware];
                             newCyber[idx] = { ...c, name: e.target.value };
                             updateSimpleField('cyberware', newCyber);
                           }}
                           className="font-black uppercase text-xs text-green-500 bg-transparent outline-none w-full mb-1"
                        />
                        <textarea 
                           value={c.effect}
                           onChange={(e) => {
                             const newCyber = [...character.cyberware];
                             newCyber[idx] = { ...c, effect: e.target.value };
                             updateSimpleField('cyberware', newCyber);
                           }}
                           className="w-full bg-transparent text-[10px] text-gray-500 font-mono outline-none resize-none h-10"
                        />
                    </div>
                )) : (
                    <div className="text-[10px] font-mono text-gray-700 italic px-6 border-l-2 border-white/10 py-6">PURE_ORGANIC_STATE_DETECTED</div>
                )}
             </div>
          </div>

          {/* INVENTORY */}
          <div className="space-y-6">
             <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                <Briefcase size={18} className="text-cyber-blue" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-cyber-blue">Cargo_Manifest</h3>
             </div>
             <div className="grid grid-cols-2 gap-3">
                {character.gear.map((g, idx) => (
                    <div key={idx} className="relative group">
                       <input 
                          value={g.name}
                          onChange={(e) => {
                             const newGear = [...character.gear];
                             newGear[idx] = { ...g, name: e.target.value };
                             updateSimpleField('gear', newGear);
                          }}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 text-[10px] font-black uppercase text-gray-400 group-hover:text-cyber-blue group-hover:border-cyber-blue transition-all outline-none"
                       />
                    </div>
                ))}
             </div>
          </div>
        </div>

      </div>

      {/* Lifepath Narrative Section */}
      <div className="pt-12 mt-12 border-t-2 border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-cyber-yellow flex items-center justify-center rounded-sm">
                <User size={20} className="text-black" />
            </div>
            <div>
                <h3 className="text-lg font-black uppercase tracking-[0.3em] text-cyber-yellow italic">Lifepath_Background</h3>
                <div className="text-[8px] font-mono text-gray-700 uppercase font-black">SECURE_NARRATIVE_DATABASE//NC_ARCHIVES</div>
            </div>
          </div>
          <textarea 
            readOnly={isViewOnly}
            value={character.notes}
            onChange={(e) => updateSimpleField('notes', e.target.value)}
            className={cn(
              "w-full bg-[#050505] p-10 text-sm font-mono text-gray-400 leading-relaxed border border-white/5 italic min-h-[150px] outline-none",
              !isViewOnly && "focus:border-cyber-yellow/40 transition-colors"
            )}
            placeholder="Document biological history, family status, and tragic events here..."
          />
      </div>

      <div className="h-20" /> {/* Bottom Spacing */}
    </div>
  );
}

