export enum StatName {
  INT = "INT",
  REF = "REF",
  DEX = "DEX",
  TECH = "TECH",
  COOL = "COOL",
  WILL = "WILL",
  LUCK = "LUCK",
  MOVE = "MOVE",
  BODY = "BODY",
  EMP = "EMP",
}

export type Stats = Record<StatName, number>;

export interface Skill {
  name: string;
  stat: StatName;
  level: number;
}

export interface Weapon {
  name: string;
  damage: string; // e.g., "3d6"
  ammo: number;
  maxAmmo: number;
  rof: number;
  notes?: string;
}

export interface Armor {
  name: string;
  sp: number; // Stopping Power
}

export interface Cyberware {
  name: string;
  effect: string;
}

export interface Gear {
  name: string;
  notes: string;
}

export interface Character {
  id: string;
  handle: string;
  role: string;
  stats: Stats;
  skills: Skill[];
  weapons: Weapon[];
  armor: Armor;
  cyberware: Cyberware[];
  gear: Gear[];
  hp: {
    current: number;
    max: number;
  };
  luck: {
    current: number;
    max: number;
  };
  deathSave: number;
  notes: string;
  isAutopiloted?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: "narrative" | "combat" | "system";
  content: string;
  sender: "GM" | "Player" | "System";
}

export interface Gig {
  id: string;
  title: string;
  teaser: string;
  reward: string;
  difficulty: "EASY" | "TYPICAL" | "MAJOR" | "DEADLY";
  fixer: string;
  district: string;
  hook: string;
  objectives: string[];
  twist: string;
}

export interface GameState {
  characters: Character[];
  activeCombat: boolean;
  initiativeOrder: { characterId: string; roll: number }[];
  currentTurnIndex: number;
  round: number;
  logs: LogEntry[];
  availableGigs?: Gig[];
  isCrewLocked?: boolean;
}
