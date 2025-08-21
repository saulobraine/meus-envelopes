// Mocks devem vir antes das importações
jest.mock("@/lib/prisma", () => ({
  prisma: {
    envelope: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/supabase/server", () => ({
  getAuthenticatedUser: jest.fn(),
}));

import { create } from "../../envelope/create";
import { revalidatePath } from "../../../../test-utils/next-mocks";

describe("create - Envelope", () => {
  const mockFormData = new FormData();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormData.set("name", "Teste Envelope");
    mockFormData.set("value", "1000");
    mockFormData.set("type", "MONETARY");

    const { getAuthenticatedUser } = require("@/lib/supabase/server");
    getAuthenticatedUser.mockResolvedValue({
      user: { id: "test-user-123", email: "test@example.com" },
    });
  });

  it("deve criar um envelope com sucesso", async () => {
    // Importar o Prisma mockado
    const { prisma } = require("@/lib/prisma");

    // Configurar mocks
    prisma.envelope.findFirst.mockResolvedValue(null);
    prisma.envelope.create.mockResolvedValue({});

    await create(mockFormData);

    expect(prisma.envelope.findFirst).toHaveBeenCalledWith({
      where: {
        name: "Teste Envelope",
        userId: "test-user-123",
      },
    });

    expect(prisma.envelope.create).toHaveBeenCalledWith({
      data: {
        name: "Teste Envelope",
        value: 1000,
        type: "MONETARY",
        userId: "test-user-123",
      },
    });

    // Verificar se o cache foi revalidado
    const { revalidatePath } = require("next/cache");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("deve criar um envelope com tipo PERCENTAGE", async () => {
    const { prisma } = require("@/lib/prisma");

    mockFormData.set("type", "PERCENTAGE");
    mockFormData.set("value", "25");

    prisma.envelope.findFirst.mockResolvedValue(null);
    prisma.envelope.create.mockResolvedValue({});

    await create(mockFormData);

    expect(prisma.envelope.create).toHaveBeenCalledWith({
      data: {
        name: "Teste Envelope",
        value: 25,
        type: "PERCENTAGE",
        userId: "test-user-123",
      },
    });
  });

  it("deve lançar erro se já existir envelope com o mesmo nome", async () => {
    const { prisma } = require("@/lib/prisma");

    prisma.envelope.findFirst.mockResolvedValue({
      id: "existing-envelope",
      name: "Teste Envelope",
      userId: "test-user-123",
    });

    await expect(create(mockFormData)).rejects.toThrow(
      "Já existe um envelope com este nome."
    );

    expect(prisma.envelope.create).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o nome estiver vazio", async () => {
    mockFormData.set("name", "");

    await expect(create(mockFormData)).rejects.toThrow();

    const { prisma } = require("@/lib/prisma");
    expect(prisma.envelope.findFirst).not.toHaveBeenCalled();
    expect(prisma.envelope.create).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o valor não for um número válido", async () => {
    mockFormData.set("value", "valor-invalido");

    await expect(create(mockFormData)).rejects.toThrow();

    const { prisma } = require("@/lib/prisma");
    expect(prisma.envelope.findFirst).not.toHaveBeenCalled();
    expect(prisma.envelope.create).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o tipo não for válido", async () => {
    mockFormData.set("type", "TIPO_INVALIDO");

    await expect(create(mockFormData)).rejects.toThrow();

    const { prisma } = require("@/lib/prisma");
    expect(prisma.envelope.findFirst).not.toHaveBeenCalled();
    expect(prisma.envelope.create).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o usuário não estiver autenticado", async () => {
    const { getAuthenticatedUser } = require("@/lib/supabase/server");
    getAuthenticatedUser.mockRejectedValue(
      new Error("User not authenticated.")
    );

    await expect(create(mockFormData)).rejects.toThrow(
      "User not authenticated."
    );

    const { prisma } = require("@/lib/prisma");
    expect(prisma.envelope.findFirst).not.toHaveBeenCalled();
    expect(prisma.envelope.create).not.toHaveBeenCalled();
  });
});
