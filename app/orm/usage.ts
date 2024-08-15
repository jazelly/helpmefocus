import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AddUsageParams {
  ip: string;
  token: number;
  question: string;
  answerList: string[];
}

export const addUsage = async ({
  ip,
  token,
  question,
  answerList,
}: AddUsageParams) => {
  const usageRecord = await prisma.usage.create({
    data: { ip, token, prompt: question, answer: JSON.stringify(answerList) },
  });
  return usageRecord;
};
