/* --- STATE --- */
export interface ClientState {
  versionMajor: number;
  versionMinor: number;
  versionPatch: number;
  platform: string;
  hostname: string;
  isConnected: boolean;
  recorders: { [key: string]: RecorderState };
  parser: {
    queueLength: number;
    currentSession: {
      recorderType: string;
      filepath: string;
      progress: number;
      sessionType: string;
      trackName: string;
    };
  };
}

export interface MessageCountDataPoint {
  timestamp: number;
  count: number;
}

export interface RecorderState {
  recorderId: string;
  recorderType: RecorderType;
  inPort: number;
  forwardingEnabled: boolean;
  outPort: number;
  outAddress: string;
  status: RecorderStatus;
  filepath: string;
  lastHeartbeat: number;
  messageCounts: MessageCountDataPoint[];
  sessionTime: number;
  sessionType: SessionType | '';
  trackName: string;
}

export interface RecorderConfig {
  recorderId: string;
  recorderType: RecorderType;
  inPort: number;
  forwardingEnabled: boolean;
  outPort: number;
  outAddress: string;
}

export enum RecorderStatus {
  UNKNOWN = 0,
  READY = 1,
  INITIALISING = 2,
  RECORDING = 3,
  STOPPING = 4,
  STOPPED = 5,
  ERROR = 6,
}

export enum RecorderType {
  F12024 = 'F12024',
  F12023 = 'F12023',
  F12022 = 'F12022',
  F12021 = 'F12021',
  rFactor2 = 'rFactor2',
  iRacing = 'iRacing',
}

export enum SessionType {
  Practice = 'Practice',
  Qualifying = 'Qualifying',
  Race = 'Race',
}
