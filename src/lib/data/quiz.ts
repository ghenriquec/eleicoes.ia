import { prisma } from "@/lib/db/client";

export async function listTopics() {
  return prisma.topic.findMany({ orderBy: { name: "asc" } });
}

export async function listQuestions() {
  return prisma.quizQuestion.findMany({
    orderBy: { order: "asc" },
    include: { options: { orderBy: { order: "asc" } }, topic: true },
  });
}

export async function listQuestionsForTopics(topicSlugs: string[]) {
  return prisma.quizQuestion.findMany({
    where: { topic: { slug: { in: topicSlugs } } },
    orderBy: { order: "asc" },
    include: { options: { orderBy: { order: "asc" } }, topic: true },
  });
}
