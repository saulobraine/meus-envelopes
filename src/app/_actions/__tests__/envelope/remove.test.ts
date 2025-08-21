import { remove } from "../../envelope/remove";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({ user: mockUser });
  });

  it("deve remover um envelope com sucesso", async () => {
    (prisma.envelope.delete as jest.Mock).mockResolvedValue({} as Record<string, unknown>);

    await remove(envelopeId);

    expect(prisma.envelope.delete).toHaveBeenCalledWith({
      where: {
        id: envelopeId,
        userId: { in: [mockUser.id] },
        isDeletable: true,
      },
    });

    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("deve verificar se o envelope pertence ao usuário correto", async () => {
    (prisma.envelope.delete as jest.Mock).mockResolvedValue({} as Record<string, unknown>);

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
    (prisma.envelope.delete as jest.Mock).mockResolvedValue({} as Record<string, unknown>);

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
    (getAuthenticatedUser as jest.Mock).mockRejectedValue(
      new Error("User not authenticated.")
    );

    await expect(remove(envelopeId)).rejects.toThrow("User not authenticated.");

    expect(prisma.envelope.delete).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o envelope não for encontrado", async () => {
    (prisma.envelope.delete as jest.Mock).mockRejectedValue(
      new Error("Record to delete does not exist")
    );

    await expect(remove("id-inexistente")).rejects.toThrow(
      "Record to delete does not exist"
    );

    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o envelope não for deletável", async () => {
    (prisma.envelope.delete as jest.Mock).mockRejectedValue(
      new Error("Cannot delete non-deletable envelope")
    );

    await expect(remove(envelopeId)).rejects.toThrow(
      "Cannot delete non-deletable envelope"
    );

    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o envelope não pertencer ao usuário", async () => {
    (prisma.envelope.delete as jest.Mock).mockRejectedValue(new Error("Access denied"));

    await expect(remove(envelopeId)).rejects.toThrow("Access denied");

    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("deve funcionar com diferentes IDs de envelope", async () => {
    (prisma.envelope.delete as jest.Mock).mockResolvedValue({} as Record<string, unknown>);

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

    expect(revalidatePath).toHaveBeenCalledTimes(differentIds.length);
  });

  it("deve revalidar o cache após remoção bem-sucedida", async () => {
    (prisma.envelope.delete as jest.Mock).mockResolvedValue({} as Record<string, unknown>);

    await remove(envelopeId);

    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});
