import { StatName } from "../types";

export interface RoleOption {
  name: string;
  description: string;
  roleAbilityName: string;
  roleAbilityDescription: string;
  suggestedStats: Record<StatName, number>;
}

export const ROLES: RoleOption[] = [
  {
    name: "Solo",
    description: "Professional killers, bodyguards, and mercenaries.",
    roleAbilityName: "Combat Awareness",
    roleAbilityDescription: "Add +4 to any Initiative roll you make.",
    suggestedStats: {
      [StatName.INT]: 4, [StatName.REF]: 8, [StatName.DEX]: 7, [StatName.TECH]: 4,
      [StatName.COOL]: 6, [StatName.WILL]: 6, [StatName.LUCK]: 4, [StatName.MOVE]: 7,
      [StatName.BODY]: 8, [StatName.EMP]: 3
    }
  },
  {
    name: "Rockerboy",
    description: "Rebel artists who use music and charisma to influence the masses.",
    roleAbilityName: "Charismatic Impact",
    roleAbilityDescription: "Receive a +2 to any EMP or COOL based Skill Check made against fans.",
    suggestedStats: {
      [StatName.INT]: 6, [StatName.REF]: 6, [StatName.DEX]: 6, [StatName.TECH]: 4,
      [StatName.COOL]: 8, [StatName.WILL]: 6, [StatName.LUCK]: 5, [StatName.MOVE]: 5,
      [StatName.BODY]: 4, [StatName.EMP]: 8
    }
  },
  {
    name: "Tech",
    description: "Renegade mechanics and inventors who can fix or build anything.",
    roleAbilityName: "Maker",
    roleAbilityDescription: "Boost Electronics/Security Tech Skill by +4.",
    suggestedStats: {
      [StatName.INT]: 7, [StatName.REF]: 6, [StatName.DEX]: 5, [StatName.TECH]: 8,
      [StatName.COOL]: 5, [StatName.WILL]: 6, [StatName.LUCK]: 6, [StatName.MOVE]: 5,
      [StatName.BODY]: 5, [StatName.EMP]: 4
    }
  },
  {
    name: "Medtech",
    description: "Healers and ripperdocs who keep the crew alive.",
    roleAbilityName: "Medicine",
    roleAbilityDescription: "Access to the Surgery Skill and cryotechnology.",
    suggestedStats: {
      [StatName.INT]: 8, [StatName.REF]: 5, [StatName.DEX]: 5, [StatName.TECH]: 7,
      [StatName.COOL]: 5, [StatName.WILL]: 7, [StatName.LUCK]: 5, [StatName.MOVE]: 4,
      [StatName.BODY]: 6, [StatName.EMP]: 5
    }
  },
  {
    name: "Media",
    description: "Journalists and truth-seekers in a world of corporate lies.",
    roleAbilityName: "Credibility",
    roleAbilityDescription: "Learn rumors pertinent to your current situation on rolls higher than 4.",
    suggestedStats: {
      [StatName.INT]: 8, [StatName.REF]: 5, [StatName.DEX]: 4, [StatName.TECH]: 4,
      [StatName.COOL]: 7, [StatName.WILL]: 7, [StatName.LUCK]: 6, [StatName.MOVE]: 5,
      [StatName.BODY]: 4, [StatName.EMP]: 7
    }
  },
];

export const STARTING_WEAPONS = [
  { name: "Heavy Pistol", damage: "3d6", ammo: 8, maxAmmo: 8, rof: 2, notes: "Reliable sidearm." },
  { name: "Very Heavy Pistol", damage: "4d6", ammo: 8, maxAmmo: 8, rof: 1, notes: "Heavy stopping power." },
  { name: "Assault Rifle", damage: "5d6", ammo: 25, maxAmmo: 25, rof: 1, notes: "Standard military rifle." },
  { name: "Shotgun", damage: "5d6", ammo: 4, maxAmmo: 4, rof: 1, notes: "Close range devastation." },
  { name: "Heavy Melee Weapon", damage: "3d6", ammo: 0, maxAmmo: 0, rof: 2, notes: "Sword or baseball bat." },
];

export const STARTING_GEAR = [
  { name: "Agent", notes: "Self-adaptive AI smartphone." },
  { name: "Flashlight", notes: "100m beam." },
  { name: "Duct Tape", notes: "For fixing anything." },
  { name: "Glow Paint", notes: "Glows in the dark." },
  { name: "Video Camera", notes: "Records 12 hours." },
];

export const DEFAULT_SKILLS = [
  "Athletics",
  "Brawling",
  "Concentration",
  "Conversation",
  "Education",
  "Evasion",
  "First Aid",
  "Handgun",
  "Human Perception",
  "Local Expert",
  "Melee Weapon",
  "Perception",
  "Persuasion",
  "Stealth",
  "Streetwise",
  "Wardrobe and Style"
];
