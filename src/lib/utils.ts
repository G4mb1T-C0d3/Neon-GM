import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function rollDice(diceString: string): { total: number; rolls: number[] } {
  // Simple parser for "3d6+2"
  const match = diceString.toLowerCase().match(/(\d+)d(\d+)([+-]\d+)?/);
  if (!match) return { total: 0, rolls: [] };

  const count = parseInt(match[1]);
  const sides = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;

  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }

  const total = rolls.reduce((sum, r) => sum + r, 0) + modifier;
  return { total, rolls };
}

export function rollD10(modifier = 0): { total: number; roll: number; isCriticalSuccess: boolean; isCriticalFailure: boolean; exploded?: number } {
  let roll = Math.floor(Math.random() * 10) + 1;
  let isCriticalSuccess = roll === 10;
  let isCriticalFailure = roll === 1;
  let exploded = 0;

  if (isCriticalSuccess) {
    exploded = Math.floor(Math.random() * 10) + 1;
  } else if (isCriticalFailure) {
    exploded = Math.floor(Math.random() * 10) + 1;
  }

  const total = roll + (isCriticalSuccess ? exploded : isCriticalFailure ? -exploded : 0) + modifier;
  return { total, roll, isCriticalSuccess, isCriticalFailure, exploded: exploded || undefined };
}
