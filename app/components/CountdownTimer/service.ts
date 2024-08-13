import type { SchedulePayload } from "@/types/schedule";
import axios from "axios";

export const schedule = async (payload: SchedulePayload) => {
    const response = await axios.post<SchedulePayload, { remindMessages: string[]}>('/api/schedule', {
        ...payload
      });
    return response;
};
