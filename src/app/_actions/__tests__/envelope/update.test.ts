import { update } from "../../envelope/update";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Mock das dependências
jest.mock("@/lib/prisma", () => ({
  prisma: {
    envelope: {
      update: jest.fn(),
    },
  },
}));

jest.mock("@/lib/supabase/server", () => ({
  getAuthenticatedUser: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("update - Envelope", () => {
  const mockUser = { id: "user-123" };
  const mockFormData = new FormData();
  const envelopeId = "envelope-123";

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormData.set("name", "Envelope Atualizado");
    mockFormData.set("value", "2000");
    mockFormData.set("type", "MONETARY");

    (getAuthenticatedUser as jest.Mock).mockResolvedValue({ user: mockUser });
  });

  it("deve atualizar um envelope com sucesso", async () => {
    (prisma.envelope.update as jest.Mock).mockResolvedValue({} as Record<string, unknown>);

    await update(envelopeId, mockFormData);

    expect(prisma.envelope.update).toHaveBeenCalledWith({
      where: {
        id: envelopeId,
        userId: { in: [mockUser.id] },
      },
      data: {
        name: "Envelope Atualizado",
        value: 2000,
        type: "MONETARY",
      },
    });

    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("deve atualizar um envelope com tipo PERCENTAGE", async () => {
    mockFormData.set("type", "PERCENTAGE");
    mockFormData.set("value", "30");

    (prisma.envelope.update as jest.Mock).mockResolvedValue({} as Record<string, unknown>);

    await update(envelopeId, mockFormData);

    expect(prisma.envelope.update).toHaveBeenCalledWith({
      where: {
        id: envelopeId,
        userId: { in: [mockUser.id] },
      },
      data: {
        name: "Envelope Atualizado",
        value: 30,
        type: "PERCENTAGE",
      },
    });
  });

  it("deve atualizar envelope com valores decimais", async () => {
    mockFormData.set("value", "1500.50");

    (prisma.envelope.update as jest.Mock).mockResolvedValue({} as Record<string, unknown>);

    await update(envelopeId, mockFormData);

    expect(prisma.envelope.update).toHaveBeenCalledWith({
      where: {
        id: envelopeId,
        userId: { in: [mockUser.id] },
      },
      data: {
        name: "Envelope Atualizado",
        value: 1500.5,
        type: "MONETARY",
      },
    });
  });

  it("deve lançar erro se o nome estiver vazio", async () => {
    mockFormData.set("name", "");

    await expect(update(envelopeId, mockFormData)).rejects.toThrow();

    expect(prisma.envelope.update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o valor não for um número válido", async () => {
    mockFormData.set("value", "valor-invalido");

    await expect(update(envelopeId, mockFormData)).rejects.toThrow();

    expect(prisma.envelope.update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o tipo não for válido", async () => {
    mockFormData.set("type", "TIPO_INVALIDO");

    await expect(update(envelopeId, mockFormData)).rejects.toThrow();

    expect(prisma.envelope.update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o usuário não estiver autenticado", async () => {
    (getAuthenticatedUser as jest.Mock).mockRejectedValue(
      new Error("User not authenticated.")
    );

    await expect(update(envelopeId, mockFormData)).rejects.toThrow(
      "User not authenticated."
    );

    expect(prisma.envelope.update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o ID do envelope for inválido", async () => {
    (prisma.envelope.update as jest.Mock).mockRejectedValue(
      new Error("Record to update not found")
    );

    await expect(update("id-invalido", mockFormData)).rejects.toThrow(
      "Record to update not found"
    );

    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("deve verificar se o envelope pertence ao usuário correto", async () => {
    (prisma.envelope.update as jest.Mock).mockResolvedValue({} as Record<string, unknown>);

    await update(envelopeId, mockFormData);

    expect(prisma.envelope.update).toHaveBeenCalledWith({
      where: {
        id: envelopeId,
        userId: { in: [mockUser.id] },
      },
      data: expect.any(Object),
    });
  });
});
