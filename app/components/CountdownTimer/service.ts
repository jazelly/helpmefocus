import type { SchedulePayload } from "@/types/schedule";
import axios from "axios";

export const schedule = async (payload: SchedulePayload) => {
  const response = await axios.post<
    { remindMessages: string[] }
  >("/api/schedule", {
    ...payload,
  });
  return response;
};
