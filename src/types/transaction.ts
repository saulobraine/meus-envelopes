import { Transaction as PrismaTransaction, Envelope } from "@prisma/client";

export type Transaction = Omit<PrismaTransaction, "envelope"> & {
  envelope: Envelope | null;
};
