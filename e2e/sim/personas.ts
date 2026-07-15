import type { NetworkKey } from "./profiles";

export type WebRole = "owner" | "admin";
export type BehaviorProfile =
  | "cautious"
  | "impatient"
  | "confused"
  | "curious"
  | "experienced"
  | "distracted"
  | "low-literacy"
  | "keyboard-only"
  | "slow-reader";

export interface Persona {
  id: string;
  label: string;
  role: WebRole;
  profile: BehaviorProfile;
  /** think-time multiplier — higher = reads/hesitates longer. */
  patience: number;
  network: NetworkKey;
  language: "en" | "fr";
  mistakeRate: number; // 0..1 probability of a wrong click
  abandonRate: number; // 0..1 probability of abandoning a form
  seed: number;
}

export const PERSONAS: Record<string, Persona> = {
  administrator: {
    id: "p-admin-owner",
    label: "Non-technical school administrator",
    role: "owner",
    profile: "confused",
    patience: 1.4,
    network: "fast",
    language: "en",
    mistakeRate: 0.2,
    abandonRate: 0.15,
    seed: 1001,
  },
  superadmin: {
    id: "p-superadmin",
    label: "Super administrator",
    role: "admin",
    profile: "experienced",
    patience: 1.0,
    network: "fast",
    language: "en",
    mistakeRate: 0.1,
    abandonRate: 0.05,
    seed: 1002,
  },
  mobileLowLiteracy: {
    id: "p-mobile-lowlit",
    label: "Low-literacy user on a cheap Android over slow 3G",
    role: "owner",
    profile: "low-literacy",
    patience: 1.8,
    network: "slow3g",
    language: "en",
    mistakeRate: 0.35,
    abandonRate: 0.3,
    seed: 1003,
  },
  impatient: {
    id: "p-impatient",
    label: "Impatient user (double-clicks, refreshes, abandons)",
    role: "owner",
    profile: "impatient",
    patience: 0.4,
    network: "fast",
    language: "en",
    mistakeRate: 0.3,
    abandonRate: 0.4,
    seed: 1004,
  },
  curious: {
    id: "p-curious",
    label: "Curious / unpredictable explorer",
    role: "owner",
    profile: "curious",
    patience: 1.2,
    network: "fast",
    language: "en",
    mistakeRate: 0.25,
    abandonRate: 0.1,
    seed: 1005,
  },
};
