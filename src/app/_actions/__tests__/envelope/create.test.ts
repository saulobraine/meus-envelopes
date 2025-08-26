// Mocks devem vir antes das importações
jest.mock("@/lib/prisma", () => ({
  prisma: {
    envelope: {
      findFirst: jest.fn() as jest.MockedFunction<unknown>,
      create: jest.fn() as jest.MockedFunction<unknown>,
    },
  },
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn() as jest.MockedFunction<unknown>,
}));

jest.mock("@/lib/supabase/server", () => ({
  getAuthenticatedUser: jest.fn() as jest.MockedFunction<unknown>,
}));

import { create } from "@/app/_actions/envelope";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

describe("create - Envelope", () => {
  const mockFormData = new FormData();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormData.set("name", "Teste Envelope");
    mockFormData.set("value", "1000");
    mockFormData.set("type", "MONETARY");

    getAuthenticatedUser.mockResolvedValue({
      user: { id: "test-user-123", email: "test@example.com" },
    });
  });

  it("deve criar um envelope com sucesso", async () => {
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
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("deve criar um envelope com tipo PERCENTAGE", async () => {
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

    expect(prisma.envelope.findFirst).not.toHaveBeenCalled();
    expect(prisma.envelope.create).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o valor não for um número válido", async () => {
    mockFormData.set("value", "valor-invalido");

    await expect(create(mockFormData)).rejects.toThrow();

    expect(prisma.envelope.findFirst).not.toHaveBeenCalled();
    expect(prisma.envelope.create).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o tipo não for válido", async () => {
    mockFormData.set("type", "TIPO_INVALIDO");

    await expect(create(mockFormData)).rejects.toThrow();

    expect(prisma.envelope.findFirst).not.toHaveBeenCalled();
    expect(prisma.envelope.create).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o usuário não estiver autenticado", async () => {
    getAuthenticatedUser.mockRejectedValue(
      new Error("User not authenticated.")
    );

    await expect(create(mockFormData)).rejects.toThrow(
      "User not authenticated."
    );

    expect(prisma.envelope.findFirst).not.toHaveBeenCalled();
    expect(prisma.envelope.create).not.toHaveBeenCalled();
  });
});
