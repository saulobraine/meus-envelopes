import { remove } from "../../envelope/remove";

// Mock das dependências
jest.mock("@/lib/prisma", () => ({
  prisma: {
    envelope: {
      delete: jest.fn(),
    },
  },
}));

jest.mock("@/lib/supabase/server", () => ({
  getAuthenticatedUser: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("remove - Envelope", () => {
  const mockUser = { id: "user-123" };
  const envelopeId = "envelope-123";

  beforeEach(() => {
    jest.clearAllMocks();
    const { getAuthenticatedUser } = require("@/lib/supabase/server");
    getAuthenticatedUser.mockResolvedValue({ user: mockUser });
  });

  it("deve remover um envelope com sucesso", async () => {
    const { prisma } = require("@/lib/prisma");

    prisma.envelope.delete.mockResolvedValue({} as any);

    await remove(envelopeId);

    expect(prisma.envelope.delete).toHaveBeenCalledWith({
      where: {
        id: envelopeId,
        userId: { in: [mockUser.id] },
        isDeletable: true,
      },
    });

    const { revalidatePath } = require("next/cache");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("deve verificar se o envelope pertence ao usuário correto", async () => {
    const { prisma } = require("@/lib/prisma");

    prisma.envelope.delete.mockResolvedValue({} as any);

    await remove(envelopeId);

    expect(prisma.envelope.delete).toHaveBeenCalledWith({
      where: {
        id: envelopeId,
        userId: { in: [mockUser.id] },
        isDeletable: true,
      },
    });
  });

  it("deve verificar se o envelope é deletável", async () => {
    const { prisma } = require("@/lib/prisma");

    prisma.envelope.delete.mockResolvedValue({} as any);

    await remove(envelopeId);

    expect(prisma.envelope.delete).toHaveBeenCalledWith({
      where: {
        id: envelopeId,
        userId: { in: [mockUser.id] },
        isDeletable: true,
      },
    });
  });

  it("deve lançar erro se o usuário não estiver autenticado", async () => {
    const { getAuthenticatedUser } = require("@/lib/supabase/server");
    getAuthenticatedUser.mockRejectedValue(
      new Error("User not authenticated.")
    );

    await expect(remove(envelopeId)).rejects.toThrow("User not authenticated.");

    const { prisma } = require("@/lib/prisma");
    const { revalidatePath } = require("next/cache");
    expect(prisma.envelope.delete).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o envelope não for encontrado", async () => {
    const { prisma } = require("@/lib/prisma");

    prisma.envelope.delete.mockRejectedValue(
      new Error("Record to delete does not exist")
    );

    await expect(remove("id-inexistente")).rejects.toThrow(
      "Record to delete does not exist"
    );

    const { revalidatePath } = require("next/cache");
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o envelope não for deletável", async () => {
    const { prisma } = require("@/lib/prisma");

    prisma.envelope.delete.mockRejectedValue(
      new Error("Cannot delete non-deletable envelope")
    );

    await expect(remove(envelopeId)).rejects.toThrow(
      "Cannot delete non-deletable envelope"
    );

    const { revalidatePath } = require("next/cache");
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o envelope não pertencer ao usuário", async () => {
    const { prisma } = require("@/lib/prisma");

    prisma.envelope.delete.mockRejectedValue(new Error("Access denied"));

    await expect(remove(envelopeId)).rejects.toThrow("Access denied");

    const { revalidatePath } = require("next/cache");
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("deve funcionar com diferentes IDs de envelope", async () => {
    const { prisma } = require("@/lib/prisma");

    prisma.envelope.delete.mockResolvedValue({} as any);

    const differentIds = ["envelope-1", "envelope-2", "envelope-abc123"];

    for (const id of differentIds) {
      await remove(id);

      expect(prisma.envelope.delete).toHaveBeenCalledWith({
        where: {
          id,
          userId: { in: [mockUser.id] },
          isDeletable: true,
        },
      });
    }

    const { revalidatePath } = require("next/cache");
    expect(revalidatePath).toHaveBeenCalledTimes(differentIds.length);
  });

  it("deve revalidar o cache após remoção bem-sucedida", async () => {
    const { prisma } = require("@/lib/prisma");

    prisma.envelope.delete.mockResolvedValue({} as any);

    await remove(envelopeId);

    const { revalidatePath } = require("next/cache");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});
