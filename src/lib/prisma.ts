import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

import { env } from "@/env";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const prismaClientSingleton = () => new PrismaClient({ adapter });

declare const globalThis: {
  prismaGlobal?: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
