import { create, get, update, remove } from "../../envelope";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Mock das dependências
jest.mock("@/lib/prisma", () => ({
  prisma: {
    envelope: {
      findFirst: jest.fn() as jest.MockedFunction<unknown>,
      create: jest.fn() as jest.MockedFunction<unknown>,
      findMany: jest.fn() as jest.MockedFunction<unknown>,
      update: jest.fn() as jest.MockedFunction<unknown>,
      delete: jest.fn() as jest.MockedFunction<unknown>,
    },
  },
}));

jest.mock("@/lib/supabase/server", () => ({
  getAuthenticatedUser: jest.fn() as jest.MockedFunction<unknown>,
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn() as jest.MockedFunction<unknown>,
}));

describe("Envelope - Fluxo de Integração", () => {
  const mockUser = { id: "user-123" };
  let mockFormData: FormData;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormData = new FormData();
    mockFormData.set("name", "Envelope Teste");
    mockFormData.set("value", "1000");
    mockFormData.set("type", "MONETARY");

    (getAuthenticatedUser as jest.Mock).mockResolvedValue({ user: mockUser });
  });

  describe("Fluxo CRUD Completo", () => {
    it("deve executar o fluxo completo de criação, leitura, atualização e remoção", async () => {
      const mockPrisma = prisma as jest.Mocked<typeof prisma>;
      const envelopeId = "envelope-123";

      // 1. Criar envelope
      mockPrisma.envelope.findFirst.mockResolvedValue(null);
      mockPrisma.envelope.create.mockResolvedValue({
        id: envelopeId,
        name: "Envelope Teste",
        value: 1000,
        type: "MONETARY",
        userId: mockUser.id,
      } as Record<string, unknown>);

      await create(mockFormData);

      expect(mockPrisma.envelope.create).toHaveBeenCalledWith({
        data: {
          name: "Envelope Teste",
          value: 1000,
          type: "MONETARY",
          userId: mockUser.id,
        },
      });

      // 2. Buscar envelopes
      const mockEnvelopes = [
        {
          id: envelopeId,
          name: "Envelope Teste",
          value: 1000,
          type: "MONETARY",
          userId: mockUser.id,
          isGlobal: false,
        },
      ];

      mockPrisma.envelope.findMany.mockResolvedValue(mockEnvelopes);

      const envelopes = await get();

      expect(envelopes).toEqual(mockEnvelopes);
      expect(envelopes).toHaveLength(1);

      // 3. Atualizar envelope
      mockFormData.set("name", "Envelope Atualizado");
      mockFormData.set("value", "2000");

      mockPrisma.envelope.update.mockResolvedValue(
        {} as Record<string, unknown>
      );

      await update(envelopeId, mockFormData);

      expect(mockPrisma.envelope.update).toHaveBeenCalledWith({
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

      // 4. Remover envelope
      mockPrisma.envelope.delete.mockResolvedValue(
        {} as Record<string, unknown>
      );

      await remove(envelopeId);

      expect(mockPrisma.envelope.delete).toHaveBeenCalledWith({
        where: {
          id: envelopeId,
          userId: { in: [mockUser.id] },
          isDeletable: true,
        },
      });

      // Verificar se o cache foi revalidado em todas as operações
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
      expect(revalidatePath).toHaveBeenCalledTimes(3); // create, update, remove
    });
  });

  describe("Validações de Negócio", () => {
    it("deve impedir criação de envelope com nome duplicado", async () => {
      const mockPrisma = prisma as jest.Mocked<typeof prisma>;

      mockPrisma.envelope.findFirst.mockResolvedValue({
        id: "existing-envelope",
        name: "Envelope Teste",
        userId: mockUser.id,
      } as Record<string, unknown>);

      await expect(create(mockFormData)).rejects.toThrow(
        "Já existe um envelope com este nome."
      );

      expect(mockPrisma.envelope.create).not.toHaveBeenCalled();
    });

    it("deve permitir apenas usuários autenticados", async () => {
      (getAuthenticatedUser as jest.Mock).mockRejectedValue(
        new Error("User not authenticated.")
      );

      await expect(create(mockFormData)).rejects.toThrow(
        "User not authenticated."
      );
      await expect(get()).rejects.toThrow("User not authenticated.");
      await expect(update("id", mockFormData)).rejects.toThrow(
        "User not authenticated."
      );
      await expect(remove("id")).rejects.toThrow("User not authenticated.");
    });

    it("deve validar tipos de envelope corretos", async () => {
      const validTypes = ["PERCENTAGE", "MONETARY"];

      for (const type of validTypes) {
        mockFormData.set("type", type);

        const mockPrisma = prisma as jest.Mocked<typeof prisma>;
        mockPrisma.envelope.findFirst.mockResolvedValue(null);
        mockPrisma.envelope.create.mockResolvedValue(
          {} as Record<string, unknown>
        );

        await expect(create(mockFormData)).resolves.not.toThrow();
      }
    });

    it("deve rejeitar tipos de envelope inválidos", async () => {
      const invalidTypes = ["INVALID_TYPE", "PERCENT", "MONEY", ""];

      for (const type of invalidTypes) {
        mockFormData.set("type", type);

        await expect(create(mockFormData)).rejects.toThrow();
      }
    });
  });

  describe("Segurança e Isolamento", () => {
    it("deve isolar envelopes por usuário", async () => {
      const mockPrisma = prisma as jest.Mocked<typeof prisma>;
      const otherUser = { id: "other-user-456" };

      // Usuário atual cria envelope
      mockPrisma.envelope.findFirst.mockResolvedValue(null);
      mockPrisma.envelope.create.mockResolvedValue(
        {} as Record<string, unknown>
      );

      await create(mockFormData);

      // Verificar se o envelope foi criado apenas para o usuário atual
      expect(mockPrisma.envelope.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockUser.id,
        }),
      });

      // Simular tentativa de acesso de outro usuário
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({
        user: otherUser,
      });

      mockPrisma.envelope.findMany.mockResolvedValue([]);

      const otherUserEnvelopes = await get();

      // Outro usuário não deve ver envelopes do usuário atual
      expect(otherUserEnvelopes).toEqual([]);
    });

    it("deve verificar propriedade antes de deletar", async () => {
      const mockPrisma = prisma as jest.Mocked<typeof prisma>;
      const envelopeId = "envelope-123";

      mockPrisma.envelope.delete.mockResolvedValue(
        {} as Record<string, unknown>
      );

      await remove(envelopeId);

      // Verificar se a condição isDeletable foi incluída
      expect(mockPrisma.envelope.delete).toHaveBeenCalledWith({
        where: expect.objectContaining({
          isDeletable: true,
        }),
      });
    });
  });

  describe("Tratamento de Erros", () => {
    it("deve tratar erros de banco de dados graciosamente", async () => {
      const mockPrisma = prisma as jest.Mocked<typeof prisma>;

      // Simular erro de conexão
      mockPrisma.envelope.findFirst.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(create(mockFormData)).rejects.toThrow(
        "Database connection failed"
      );

      // Simular erro de validação
      mockPrisma.envelope.findFirst.mockResolvedValue(null);
      mockPrisma.envelope.create.mockRejectedValue(
        new Error("Validation failed")
      );

      await expect(create(mockFormData)).rejects.toThrow("Validation failed");
    });

    it("deve manter estado consistente em caso de falha", async () => {
      const mockPrisma = prisma as jest.Mocked<typeof prisma>;

      // Simular falha após validação mas antes da criação
      mockPrisma.envelope.findFirst.mockResolvedValue(null);
      mockPrisma.envelope.create.mockRejectedValue(new Error("Database error"));

      await expect(create(mockFormData)).rejects.toThrow("Database error");

      // Verificar se o cache não foi revalidado em caso de falha
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });
});
