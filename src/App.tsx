import React, { useState, useEffect, useRef } from "react";
import { 
  Dices, 
  Users, 
  Terminal, 
  Shield, 
  Zap, 
  Plus, 
  Save, 
  Heart,
  Loader2,
  ChevronRight,
  X,
  Volume2,
  VolumeX,
  RefreshCw,
  Layout,
  Monitor,
  Activity,
  Target,
  Brain,
  DollarSign,
  Globe,
  Radio,
  Cpu,
  BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StatName, Character, GameState, LogEntry, Gig } from "./types";
import { cn } from "./lib/utils";
import { geminiService } from "./services/gemini";
import { DiceRoller } from "./components/DiceRoller";
import { GigBoard } from "./components/GigBoard";
import { CharacterSheet } from "./components/CharacterSheet";
import { CharacterBuilder } from "./components/CharacterBuilder";

const INITIAL_LOGS: LogEntry[] = [
  {
    id: "boot-log",
    timestamp: Date.now(),
    type: "system",
    content: "SYSTEM_ONLINE: NEURAL_UPLINK_ESTABLISHED // NIGHT_CITY_INTERFACE_V4.2",
    sender: "System"
  }
];

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    characters: [],
    activeCombat: false,
    initiativeOrder: [],
    currentTurnIndex: 0,
    round: 1,
    logs: INITIAL_LOGS,
    isCrewLocked: false
  });

  const [inputText, setInputText] = useState("");
  const [isGMLoading, setIsGMLoading] = useState(false);
  const [isDiceOpen, setIsDiceOpen] = useState(false);
  const [isGigBoardOpen, setIsGigBoardOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [gameState.logs]);

  // Handle Board Key Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        if (gameState.availableGigs) setIsGigBoardOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.availableGigs]);

  const handleStartSession = async (mode: 'NEW' | 'RESUME') => {
    setIsReady(true);
    if (mode === 'NEW') {
      const resetState: GameState = {
        characters: [],
        activeCombat: false,
        initiativeOrder: [],
        currentTurnIndex: 0,
        round: 1,
        logs: INITIAL_LOGS,
        isCrewLocked: false
      };
      setGameState(resetState);
      localStorage.removeItem("NEON_GM_STATE");
      setIsBuilderOpen(true);
    } else {
      const saved = localStorage.getItem("NEON_GM_STATE");
      if (saved) {
        try {
          setGameState(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to load state", e);
        }
      }
    }
  };

  const saveGame = () => {
    localStorage.setItem("NEON_GM_STATE", JSON.stringify(gameState));
  };

  const handleSendMessage = async (msg?: string) => {
    const text = msg || inputText;
    if (!text?.trim() || isGMLoading) return;

    const playerMsg: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type: "narrative",
      content: text,
      sender: "Player"
    };

    setGameState(prev => ({ ...prev, logs: [...prev.logs, playerMsg] }));
    setInputText("");
    setIsGMLoading(true);

    try {
      const response = await geminiService.sendMessage(text, gameState);
      
      // Extract Gig Data
      const gigMatch = response.match(/GIG_DATA:\s*({[\s\S]*?})/);
      let availableGigs = gameState.availableGigs;
      if (gigMatch) {
        try {
          const gigJson = JSON.parse(gigMatch[1]);
          if (gigJson.gigs) {
            availableGigs = gigJson.gigs;
          }
        } catch (e) {}
      }

      // Clean Response
      let cleanResponse = response.replace(/GIG_DATA:\s*{[\s\S]*?}/, "").trim();
      cleanResponse = cleanResponse.replace(/_([^_]+)_/g, '$1'); 
      cleanResponse = cleanResponse.replace(/\(([^)]+)\)/g, ''); 
      cleanResponse = cleanResponse.replace(/_/g, ' '); 

      const gmMsg: LogEntry = {
        id: Math.random().toString(36).substring(2, 11),
        timestamp: Date.now(),
        type: "narrative",
        content: cleanResponse,
        sender: "GM"
      };

      setGameState(prev => {
        const newState = { ...prev, logs: [...prev.logs, gmMsg], availableGigs };
        localStorage.setItem("NEON_GM_STATE", JSON.stringify(newState));
        return newState;
      });

    } catch (error: any) {
      console.error("GM Error:", error);
    } finally {
      setIsGMLoading(false);
      setIsSkipping(false);
    }
  };

  const handleSelectGig = (gig: Gig) => {
    setGameState(prev => ({ ...prev, availableGigs: undefined }));
    setIsGigBoardOpen(false);
    handleSendMessage(`CONTRACT_ACCEPTED: ${gig.title}. LOAD_MISSION_PARAMETERS.`);
  };

  const handleCharacterCreated = (char: Character) => {
    setGameState(prev => ({ ...prev, characters: [...prev.characters, char] }));
    setIsBuilderOpen(false);
    handleSendMessage(`${char.handle} (${char.role}) HAS JOINED THE CREW.`);
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden text-gray-300 font-sans selection:bg-cyber-red selection:text-white">
      {/* GLOBAL UI FX */}
      <div className="fixed inset-0 pointer-events-none z-[999] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      {!isReady ? (
        <LandingPage onStart={handleStartSession} />
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* LEFT SIDEBAR: ROSTER */}
          <aside className="w-full lg:w-80 bg-black border-r-2 border-white/5 flex flex-col shrink-0">
            <div className="h-14 flex items-center px-6 border-b border-white/5 bg-cyber-bg/50">
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyber-red rounded-full animate-pulse shadow-[0_0_10px_#ff003c]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Neural_Hub</span>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Users size={12} className="text-cyber-cyan" /> active_crew
                  </h2>
                  <span className="text-[8px] font-mono text-gray-700">{gameState.characters.length}/5</span>
                </div>

                <div className="space-y-3">
                  {gameState.characters.map(char => (
                    <CharacterCard 
                      key={char.id} 
                      character={char} 
                      isActive={selectedCharId === char.id}
                      onClick={() => setSelectedCharId(char.id)} 
                    />
                  ))}
                  
                  {gameState.characters.length < 5 && (
                    <button 
                      onClick={() => setIsBuilderOpen(true)}
                      className="w-full py-4 border-2 border-dashed border-white/5 text-gray-600 hover:text-cyber-cyan hover:border-cyber-cyan/50 hover:bg-cyber-cyan/5 transition-all flex flex-col items-center gap-2 group"
                    >
                      <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Recruit_Asset</span>
                    </button>
                  )}
                </div>
              </div>

              {gameState.characters.length >= 2 && (
                <div className="space-y-3">
                   {!gameState.isCrewLocked ? (
                     <button 
                       onClick={() => {
                        setGameState(prev => ({ ...prev, isCrewLocked: true }));
                        handleSendMessage("CREW_LOCKED: Analyze team and initialize job matching.");
                       }}
                       disabled={isGMLoading}
                       className="w-full py-4 bg-cyber-red text-white text-[10px] font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,0,60,0.2)] disabled:opacity-50"
                     >
                        <Shield size={16} />
                        {isGMLoading ? "Locking..." : "Lock_Crew_Matrix"}
                     </button>
                   ) : (
                     <button 
                       onClick={() => setIsGigBoardOpen(true)}
                       disabled={!gameState.availableGigs}
                       className={cn(
                         "w-full py-4 font-black uppercase text-[10px] italic flex items-center justify-center gap-3 transition-all shadow-lg select-none",
                         gameState.availableGigs 
                           ? "bg-cyber-cyan text-black hover:bg-white animate-pulse shadow-[0_0_20px_rgba(0,243,255,0.4)]" 
                           : "bg-gray-800 text-gray-500 cursor-not-allowed"
                       )}
                     >
                        <Globe size={16} />
                        {gameState.availableGigs ? "Access_Gig_Board" : "Finding_Contracts..."}
                     </button>
                   )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/5 bg-black">
               <div className="flex items-center justify-between text-[8px] font-mono text-gray-600 uppercase font-black">
                  <span>Latency: 4ms</span>
                  <Activity size={10} className="text-cyber-cyan" />
               </div>
            </div>
          </aside>

          {/* MAIN Narrative AREA */}
          <main className="flex-1 flex flex-col bg-[#050505] relative">
            {/* Header */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md z-10">
               <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                    <Radio size={16} className="text-cyber-red animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Live_Narration_Link</span>
                  </div>
                  <div className="hidden md:flex items-center gap-6 text-[9px] font-mono text-gray-500 uppercase font-black">
                    <span className="text-cyber-yellow">Eddies: 0</span>
                    <span>Mode: Story</span>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-gray-600 hover:text-white transition-colors">
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <button onClick={saveGame} className="p-2 text-gray-600 hover:text-cyber-cyan transition-colors" title="Save">
                    <Save size={18} />
                  </button>
                  <button onClick={() => { if(confirm("ABORT SESSION?")) window.location.reload(); }} className="p-2 text-gray-600 hover:text-cyber-red transition-colors" title="Reset">
                    <RefreshCw size={18} />
                  </button>
               </div>
            </div>

            {/* Logs Area */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-12 pb-20">
                {gameState.logs.map((log, idx) => (
                  <LogMessage 
                    key={log.id} 
                    log={log} 
                    isLast={idx === gameState.logs.length - 1} 
                    isSkipping={isSkipping}
                  />
                ))}
                
                {isGMLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-cyber-red/20 border border-cyber-red flex items-center justify-center shrink-0">
                      <Loader2 size={24} className="text-cyber-red animate-spin" />
                    </div>
                    <div className="flex-1 bg-cyber-red/5 border-l-4 border-cyber-red p-6 flex justify-between items-center">
                       <span className="text-[10px] font-black text-cyber-red uppercase italic animate-pulse tracking-[0.2em]">Neural_Processing_Pulse...</span>
                       <button 
                        onClick={() => setIsSkipping(true)}
                        className="px-4 py-1.5 bg-cyber-red/20 border border-cyber-red text-[8px] font-black text-cyber-red uppercase italic hover:bg-cyber-red hover:text-black transition-all"
                       >
                         Skip_Transmission
                       </button>
                    </div>
                  </motion.div>
                )}
                <div ref={logEndRef} className="h-10" />
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-8 bg-black border-t-2 border-white/5">
              <div className="max-w-4xl mx-auto flex flex-col gap-6">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="relative group"
                >
                  <div className="absolute top-2 left-6 text-[8px] font-black text-cyber-cyan uppercase italic opacity-50 group-focus-within:opacity-100 transition-opacity">Neural_Input_Socket</div>
                  <input 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={isGMLoading}
                    placeholder="Enter command or intent..."
                    className="w-full bg-[#050505] border-2 border-white/5 p-6 pt-10 font-mono text-lg text-cyber-cyan focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan/20 transition-all placeholder:text-gray-800"
                  />
                  <button 
                    type="submit"
                    disabled={!inputText.trim() || isGMLoading}
                    className="absolute right-4 bottom-4 p-3 bg-cyber-cyan text-black hover:bg-white transition-all disabled:opacity-10"
                  >
                    <ChevronRight size={24} />
                  </button>
                </form>

                <div className="flex flex-wrap gap-4">
                  <button onClick={() => setIsDiceOpen(true)} className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase text-gray-500 hover:text-white hover:border-white transition-all">
                    <Dices size={16} /> Dice_Uplink
                  </button>
                  <button onClick={() => handleSendMessage("CHECK_STATS")} className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase text-gray-500 hover:text-white hover:border-white transition-all">
                    <BarChart3 size={16} /> Rule_Ref
                  </button>
                  {gameState.availableGigs && (
                    <button 
                      onClick={() => setIsGigBoardOpen(true)}
                      className="flex items-center gap-3 px-8 py-3 bg-cyber-cyan text-black text-[10px] font-black uppercase italic tracking-widest hover:bg-white transition-all animate-pulse"
                    >
                      <Globe size={18} /> Gig_Deck_Interface
                    </button>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* OVERLAYS */}
      <AnimatePresence>
        {isGigBoardOpen && gameState.availableGigs && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col"
          >
             <div className="h-16 bg-black border-b-2 border-cyber-cyan flex items-center justify-between px-8">
                <div className="flex items-center gap-4">
                   <Target size={24} className="text-cyber-cyan animate-pulse" />
                   <h2 className="text-xl font-black italic uppercase tracking-[0.3em] text-white">Neural_Job_Market // {gameState.availableGigs.length}_Leads</h2>
                </div>
                <button onClick={() => setIsGigBoardOpen(false)} className="p-2 text-gray-500 hover:text-white transition-colors bg-white/5 border border-white/10 rounded-sm">
                   <X size={24} />
                </button>
             </div>
             <div className="flex-1 overflow-hidden">
                <GigBoard gigs={gameState.availableGigs} onSelect={handleSelectGig} isLoading={isGMLoading} />
             </div>
          </motion.div>
        )}

        {isDiceOpen && <DiceRoller onClose={() => setIsDiceOpen(false)} onRoll={(res) => handleSendMessage(`ROLL_RESULT: ${res}`)} />}
        
        {isBuilderOpen && <CharacterBuilder onClose={() => setIsBuilderOpen(false)} onComplete={handleCharacterCreated} />}

        {selectedCharId && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col"
          >
             <div className="h-16 bg-black border-b-2 border-cyber-cyan flex items-center justify-between px-8">
                <div className="flex items-center gap-4">
                   <Brain size={24} className="text-cyber-cyan" />
                   <h2 className="text-xl font-black italic uppercase italic text-white tracking-widest">Neural_Link: {gameState.characters.find(c => c.id === selectedCharId)?.handle}</h2>
                </div>
                <button onClick={() => setSelectedCharId(null)} className="flex items-center gap-2 px-6 py-2 bg-cyber-red text-black font-black uppercase text-[10px] italic hover:bg-white transition-all shadow-[0_0_20px_rgba(255,0,60,0.3)]">
                   <X size={18} /> DECOUPLE_BIO_FEED
                </button>
             </div>
             <div className="flex-1 overflow-hidden">
                <CharacterSheet 
                  character={gameState.characters.find(c => c.id === selectedCharId)!} 
                  onUpdate={(char) => setGameState(prev => ({ ...prev, characters: prev.characters.map(c => c.id === char.id ? char : c) }))}
                  onUpdateAutopilot={(id, auto) => setGameState(prev => ({ ...prev, characters: prev.characters.map(c => c.id === id ? { ...c, isAutopiloted: auto } : c) }))}
                />
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LandingPage({ onStart }: { onStart: (mode: 'NEW' | 'RESUME') => void }) {
  const hasSavedGame = localStorage.getItem("NEON_GM_STATE") !== null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,60,0.1)_0%,transparent_70%)] animate-pulse" />
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-16 z-10"
      >
        <div className="space-y-4">
          <div className="text-[10px] font-black text-cyber-red uppercase tracking-[0.8em] animate-pulse">Initializing_Interface</div>
          <h1 className="text-9xl font-black italic uppercase tracking-tighter text-white glitch-text filter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            NEON GM
          </h1>
          <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Protocol 40.1 // Cyberpunk RED AI GM</div>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 justify-center">
          <button 
            onClick={() => onStart('NEW')}
            className="group relative px-12 py-6 bg-cyber-red text-white text-xl font-black italic uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[0_0_50px_rgba(255,0,60,0.3)] overflow-hidden"
            style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}
          >
            <span className="relative z-10 flex items-center gap-4">
              <Plus size={24} /> New_Life
            </span>
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
          </button>

          {hasSavedGame && (
            <button 
              onClick={() => onStart('RESUME')}
              className="group relative px-12 py-6 bg-cyber-cyan text-black text-xl font-black italic uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_50px_rgba(0,243,255,0.3)] overflow-hidden"
              style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}
            >
              <span className="relative z-10 flex items-center gap-4">
                <RefreshCw size={24} /> Neural_Sync
              </span>
              <div className="absolute inset-0 bg-white/40 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            </button>
          )}
        </div>
      </motion.div>

      {/* FOOTER INFO */}
      <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
        <div className="space-y-1">
          <div className="text-[7px] font-mono text-gray-700 uppercase">Version_Link</div>
          <div className="text-[9px] font-black text-gray-500">AIS-CORE-PULSE // PROD</div>
        </div>
        <div className="text-right space-y-1">
          <div className="text-[7px] font-mono text-gray-700 uppercase">System_Status</div>
          <div className="text-[9px] font-black text-green-500 animate-pulse">OPERATIONAL</div>
        </div>
      </div>
    </div>
  );
}

function LogMessage({ log, isLast, isSkipping }: { log: LogEntry; isLast: boolean; isSkipping: boolean; key?: React.Key }) {
  const isGM = log.sender === "GM";
  const isSystem = log.sender === "System";

  return (
    <motion.div 
      initial={{ opacity: 0, x: isGM ? -30 : (isSystem ? 0 : 30) }} 
      animate={{ opacity: 1, x: 0 }}
      className={cn("flex gap-6", isGM ? "flex-row" : (isSystem ? "flex-row" : "flex-row-reverse"))}
    >
      {!isSystem && (
        <div className={cn(
          "w-12 h-12 border-2 flex items-center justify-center shrink-0",
          isGM ? "border-cyber-red bg-cyber-red/5" : "border-cyber-cyan bg-cyber-cyan/5"
        )}>
          {isGM ? <Terminal className="text-cyber-red" /> : <Users className="text-cyber-cyan" />}
        </div>
      )}

      <div className={cn("flex-1", isSystem ? "w-full" : "max-w-[85%]")}>
        {isSystem ? (
          <div className="border border-white/5 py-3 px-6 text-center text-[10px] font-mono font-black uppercase text-cyber-blue italic bg-cyber-blue/5">
            // {log.content} //
          </div>
        ) : (
          <div className={cn("space-y-3", !isGM && "text-right")}>
            <div className="flex items-center gap-3 opacity-30 group-hover:opacity-100 transition-opacity justify-end flex-row-reverse">
              <span className="text-[8px] font-mono text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className={cn("text-[8px] font-black uppercase tracking-widest", isGM ? "text-cyber-red" : "text-cyber-cyan")}>{log.sender}</span>
            </div>
            <div className={cn(
              "p-8 text-sm leading-relaxed border-l-4 font-mono shadow-2xl",
              isGM 
                ? "bg-[#121212]/80 border-cyber-red backdrop-blur-sm italic text-gray-200" 
                : "bg-cyber-cyan/5 border-cyber-cyan text-cyber-cyan italic"
            )}>
              {isGM ? (
                <TypewriterText text={log.content} speed={12} shouldSkip={isLast && isSkipping} />
              ) : (
                log.content
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TypewriterText({ text, speed = 20, shouldSkip }: { text: string; speed?: number; shouldSkip?: boolean }) {
  const [displayedText, setDisplayedText] = useState(shouldSkip ? text : "");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (shouldSkip) {
      setDisplayedText(text);
      return;
    }

    let i = 0;
    const type = () => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
        timerRef.current = setTimeout(type, speed);
      }
    };
    
    type();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [text, speed, shouldSkip]);

  return <div>{displayedText}</div>;
}

function CharacterCard({ character, isActive, onClick }: { character: Character; isActive?: boolean; onClick: () => void; key?: React.Key }) {
  const hpPercent = (character.hp.current / character.hp.max) * 100;
  
  return (
    <motion.div 
      onClick={onClick}
      whileHover={{ x: 5 }}
      className={cn(
        "bg-white/[0.03] border p-4 cursor-pointer relative transition-all group",
        isActive ? "border-cyber-cyan bg-cyber-cyan/10 shadow-[0_0_20px_rgba(0,243,255,0.1)]" : "border-white/5"
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-xs font-black text-white italic uppercase tracking-wider">{character.handle}</div>
          <div className="text-[8px] font-mono text-cyber-blue font-black uppercase mt-0.5">{character.role}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-[10px] font-black text-white flex items-center gap-1.5">
            <Heart size={10} className={cn("transition-colors", hpPercent < 50 ? "text-cyber-red animate-pulse" : "text-green-500")} />
            {character.hp.current}
          </div>
        </div>
      </div>

      <div className="h-[3px] bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${hpPercent}%` }}
          className={cn("h-full transition-colors", hpPercent < 50 ? "bg-cyber-red" : "bg-green-500")}
        />
      </div>

      {isActive && (
        <div className="absolute top-0 right-0 w-1.5 h-full bg-cyber-cyan" />
      )}
    </motion.div>
  );
}
