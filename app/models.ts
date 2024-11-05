// Base entity types
export interface Entity {
  id: string;
  type: EntityType;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string; // Creator of the entity
}

export enum EntityType {
  PROMPT = 'prompt',
  TEXT = 'text',
  // Add more entity types as needed
}

export enum VotableType {
  NUMBER = 'NUMBER',
  SLIDER = 'SLIDER',
  ENUM = 'ENUM',
  BOOL = 'BOOL'
}

export type NumberConfig = {
  min: number
  max: number
}

export type SliderConfig = {
  min: number
  max: number
  step: number
}

export type EnumConfig = {
  options: string[]
}

export type BoolConfig = {
  yesLabel?: string
  noLabel?: string
}

export type VotableConfig = NumberConfig | SliderConfig | EnumConfig | BoolConfig

export interface Votable {
  id: string
  entityId: string
  type: VotableType
  config: VotableConfig // JSON string of VotableConfig
  label: string
  createdAt: string
  updatedAt: string
}

export interface Vote {
  id: string;
  votableId: string;
  userId: string;
  value: string | number; // The actual vote value
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VotableStats {
  votableId: string
  totalVotes: number
  // For NUMBER and SLIDER types
  average?: number
  median?: number
  min?: number
  max?: number
  // For ENUM types
  distribution?: Record<string, number>
}

export interface EntityStats {
  entityId: string
  votableStats: VotableStats[]
  updatedAt: Date
}
