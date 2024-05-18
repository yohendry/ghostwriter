import { Server } from "socket.io";
import type { BaseInputs, Blog } from "../types";
import { arraySchemaType } from "../server";

export interface ServerToClientEvents {
  accepted: () => void;
  startTitle: (started: boolean) => void;
  confirmTitle: (titles: arraySchemaType) => void;
  startSummary: () => void;
  confirmSummary: (blog: Blog) => void;
  startTOC: (started: boolean) => void;
  confirmTOC: (blog: Blog) => void;
  startGenerating: (started: boolean) => void;
  contentGenerated: ({blog, filePath} : { blog: string, filePath: string }) => void;
  chatOut: (output: string) => void;
}

export interface ClientToServerEvents {
  userBaseInputs: (inputs: BaseInputs) => void;
  confirmedTitle: (title: string) => void;
  confirmedSummary: (blog: Blog) => void;
  confirmedTOC: (blog: Blog) => void;
  chatIn: (input: string) => void
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {

}

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>();

export default io;
