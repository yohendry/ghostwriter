import type { ROLE_KEYS } from "./prompts/userChoice";

export type Content = {
  title?: string;
  keywords?: string[];
  summary?: string;
  content?: string;
};
export type Blog = {
  title: string;
  summary: string;
  keywords: string[];
  tags: string[];
  slug: string;
  toc: Content[];
};
export const OUTGOING_EVENTS = {
  accepted: "accepted",
  startTitle: "startTitle",
  confirmTitle: "confirmTitle",
  startSummary: "startSummary",
  confirmSummary: "confirmSummary",
  startTOC: "startTOC",
  confirmTOC: "confirmTOC",
  startGenerating: "startGenerating",
  contentGenerated: "contentGenerated",
  chatOut: "chatOut"
} as const;

export const INCOMING_EVENTS = {
  connection: "connection",
  userBaseInputs: "userBaseInputs",
  confirmedTitle: "confirmedTitle",
  confirmedSummary: "confirmedSummary",
  confirmedTOC: "confirmedTOC",
  chatIn: "chatIn"
} as const;

export type BaseInputs = {
  title: string;
  context: string;
  role: ROLE_KEYS;
};


