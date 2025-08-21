import { update } from "../../envelope/update";
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

    const { getAuthenticatedUser } = require("@/lib/supabase/server");
    getAuthenticatedUser.mockResolvedValue({ user: mockUser });
  });

  it("deve atualizar um envelope com sucesso", async () => {
    const { prisma } = require("@/lib/prisma");

    prisma.envelope.update.mockResolvedValue({} as any);

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
    const { prisma } = require("@/lib/prisma");

    mockFormData.set("type", "PERCENTAGE");
    mockFormData.set("value", "30");

    prisma.envelope.update.mockResolvedValue({} as any);

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
    const { prisma } = require("@/lib/prisma");

    mockFormData.set("value", "1500.50");

    prisma.envelope.update.mockResolvedValue({} as any);

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

    const { prisma } = require("@/lib/prisma");
    const { revalidatePath } = require("next/cache");
    expect(prisma.envelope.update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o valor não for um número válido", async () => {
    mockFormData.set("value", "valor-invalido");

    await expect(update(envelopeId, mockFormData)).rejects.toThrow();

    const { prisma } = require("@/lib/prisma");
    const { revalidatePath } = require("next/cache");
    expect(prisma.envelope.update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o tipo não for válido", async () => {
    mockFormData.set("type", "TIPO_INVALIDO");

    await expect(update(envelopeId, mockFormData)).rejects.toThrow();

    const { prisma } = require("@/lib/prisma");
    const { revalidatePath } = require("next/cache");
    expect(prisma.envelope.update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o usuário não estiver autenticado", async () => {
    const { getAuthenticatedUser } = require("@/lib/supabase/server");
    getAuthenticatedUser.mockRejectedValue(
      new Error("User not authenticated.")
    );

    await expect(update(envelopeId, mockFormData)).rejects.toThrow(
      "User not authenticated."
    );

    const { prisma } = require("@/lib/prisma");
    const { revalidatePath } = require("next/cache");
    expect(prisma.envelope.update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o ID do envelope for inválido", async () => {
    const { prisma } = require("@/lib/prisma");

    prisma.envelope.update.mockRejectedValue(
      new Error("Record to update not found")
    );

    await expect(update("id-invalido", mockFormData)).rejects.toThrow(
      "Record to update not found"
    );

    const { revalidatePath } = require("next/cache");
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("deve verificar se o envelope pertence ao usuário correto", async () => {
    const { prisma } = require("@/lib/prisma");

    prisma.envelope.update.mockResolvedValue({} as any);

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
