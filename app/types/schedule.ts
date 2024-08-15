export interface SchedulePayload {
  toneLevel: number;
  intervalMinutes: number;
  totalMinutes: number;
  prompt: string;
}

export interface ScheduleResponse {
  remindMessages: string[];
}

export interface ScheduleError {
  error: string;
}
