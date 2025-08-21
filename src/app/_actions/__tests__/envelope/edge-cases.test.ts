import { create, get, update, remove } from "../../envelope";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Mock das dependências
jest.mock("@/lib/prisma", () => ({
  prisma: {
    envelope: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
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

describe("Envelope - Casos de Borda e Cenários Especiais", () => {
  const mockUser = { id: "user-123" };

  beforeEach(() => {
    jest.clearAllMocks();
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({ user: mockUser });
  });

  describe("Casos de Borda - Valores Extremos", () => {
    it("deve lidar com valores monetários muito grandes", async () => {
      const mockPrisma = prisma as jest.Mocked<typeof prisma>;
      const mockFormData = new FormData();
      mockFormData.set("name", "Mega Investimento");
      mockFormData.set("value", "999999999999.99");
      mockFormData.set("type", "MONETARY");

      mockPrisma.envelope.findFirst.mockResolvedValue(null);
      mockPrisma.envelope.create.mockResolvedValue({} as any);

      await expect(create(mockFormData)).resolves.not.toThrow();

      expect(mockPrisma.envelope.create).toHaveBeenCalledWith({
        data: {
          name: "Mega Investimento",
          value: 999999999999.99,
          type: "MONETARY",
          userId: mockUser.id,
        },
      });
    });

    it("deve lidar com valores percentuais de 100%", async () => {
      const mockPrisma = prisma as jest.Mocked<typeof prisma>;
      const mockFormData = new FormData();
      mockFormData.set("name", "Orçamento Total");
      mockFormData.set("value", "100");
      mockFormData.set("type", "PERCENTAGE");

      mockPrisma.envelope.findFirst.mockResolvedValue(null);
      mockPrisma.envelope.create.mockResolvedValue({} as any);

      await expect(create(mockFormData)).resolves.not.toThrow();

      expect(mockPrisma.envelope.create).toHaveBeenCalledWith({
        data: {
          name: "Orçamento Total",
          value: 100,
          type: "PERCENTAGE",
          userId: mockUser.id,
        },
      });
    });

    it("deve lidar com valores zero", async () => {
      const mockPrisma = prisma as jest.Mocked<typeof prisma>;
      const mockFormData = new FormData();
      mockFormData.set("name", "Envelope Vazio");
      mockFormData.set("value", "0");
      mockFormData.set("type", "MONETARY");

      mockPrisma.envelope.findFirst.mockResolvedValue(null);
      mockPrisma.envelope.create.mockResolvedValue({} as any);

      await expect(create(mockFormData)).resolves.not.toThrow();

      expect(mockPrisma.envelope.create).toHaveBeenCalledWith({
        data: {
          name: "Envelope Vazio",
          value: 0,
          type: "MONETARY",
          userId: mockUser.id,
        },
      });
    });

    it("deve lidar com valores negativos", async () => {
      const mockPrisma = prisma as jest.Mocked<typeof prisma>;
      const mockFormData = new FormData();
      mockFormData.set("name", "Débitos");
      mockFormData.set("value", "-1500");
      mockFormData.set("type", "MONETARY");

      mockPrisma.envelope.findFirst.mockResolvedValue(null);
      mockPrisma.envelope.create.mockResolvedValue({} as any);

      await expect(create(mockFormData)).resolves.not.toThrow();

      expect(mockPrisma.envelope.create).toHaveBeenCalledWith({
        data: {
          name: "Débitos",
          value: -1500,
          type: "MONETARY",
          userId: mockUser.id,
        },
      });
    });
  });

  describe("Casos de Borda - Nomes de Envelope", () => {
    it("deve aceitar nomes muito longos", async () => {
      const mockPrisma = prisma as jest.Mocked<typeof prisma>;
      const mockFormData = new FormData();
      const longName =
        "Este é um nome de envelope extremamente longo que pode conter muitas palavras e caracteres para testar os limites do sistema de validação";
      mockFormData.set("name", longName);
      mockFormData.set("value", "1000");
      mockFormData.set("type", "MONETARY");

      mockPrisma.envelope.findFirst.mockResolvedValue(null);
      mockPrisma.envelope.create.mockResolvedValue({} as any);

      await expect(create(mockFormData)).resolves.not.toThrow();

      expect(mockPrisma.envelope.create).toHaveBeenCalledWith({
        data: {
          name: longName,
          value: 1000,
          type: "MONETARY",
          userId: mockUser.id,
        },
      });
    });

    it("deve aceitar nomes com caracteres especiais", async () => {
      const mockPrisma = prisma as jest.Mocked<typeof prisma>;
      const specialNames = [
        "Envelope com @#$%^&*()",
        "Categoria com çãõéê",
        "Nome com emojis 🎯💰📊",
        "Envelope com quebras de linha\n",
        "Nome com tabs\t\t",
      ];

      for (const name of specialNames) {
        const mockFormData = new FormData();
        mockFormData.set("name", name);
        mockFormData.set("value", "1000");
        mockFormData.set("type", "MONETARY");

        mockPrisma.envelope.findFirst.mockResolvedValue(null);
        mockPrisma.envelope.create.mockResolvedValue({} as any);

        await expect(create(mockFormData)).resolves.not.toThrow();
      }
    });

    it("deve aceitar nomes com números e símbolos", async () => {
      const mockPrisma = prisma as jest.Mocked<typeof prisma>;
      const numericNames = [
        "Envelope 123",
        "Categoria #1",
        "Meta 2024-2025",
        "Plano A/B",
        "Orçamento Q1-Q4",
      ];

      for (const name of numericNames) {
        const mockFormData = new FormData();
        mockFormData.set("name", name);
        mockFormData.set("value", "1000");
        mockFormData.set("type", "MONETARY");

        mockPrisma.envelope.findFirst.mockResolvedValue(null);
        mockPrisma.envelope.create.mockResolvedValue({} as any);

        await expect(create(mockFormData)).resolves.not.toThrow();
      }
    });
  });

  describe("Casos de Borda - Concorrência e Estados", () => {
    it("deve lidar com múltiplas tentativas de criação simultânea", async () => {
      const mockPrisma = prisma as jest.Mocked<typeof prisma>;
      const mockFormData = new FormData();
      mockFormData.set("name", "Envelope Concorrente");
      mockFormData.set("value", "1000");
      mockFormData.set("type", "MONETARY");

      // Primeira tentativa - envelope não existe
      mockPrisma.envelope.findFirst.mockResolvedValueOnce(null);
      // Segunda tentativa - envelope já foi criado
      mockPrisma.envelope.findFirst.mockResolvedValueOnce({
        id: "envelope-123",
        name: "Envelope Concorrente",
        userId: mockUser.id,
      } as any);

      mockPrisma.envelope.create.mockResolvedValue({} as any);

      // Primeira criação deve funcionar
      await expect(create(mockFormData)).resolves.not.toThrow();

      // Segunda criação deve falhar
      await expect(create(mockFormData)).rejects.toThrow(
        "Já existe um envelope com este nome."
      );
    });

    it("deve lidar com falhas intermitentes do banco", async () => {
      const mockPrisma = prisma as jest.Mocked<typeof prisma>;
      const mockFormData = new FormData();
      mockFormData.set("name", "Envelope Resiliente");
      mockFormData.set("value", "1000");
      mockFormData.set("type", "MONETARY");

      // Primeira tentativa falha
      mockPrisma.envelope.findFirst.mockRejectedValueOnce(
        new Error("Connection timeout")
      );
      // Segunda tentativa funciona
      mockPrisma.envelope.findFirst.mockResolvedValueOnce(null);
      mockPrisma.envelope.create.mockResolvedValue({} as any);

      // Primeira tentativa deve falhar
      await expect(create(mockFormData)).rejects.toThrow("Connection timeout");

      // Segunda tentativa deve funcionar
      await expect(create(mockFormData)).resolves.not.toThrow();
    });

    it("deve lidar com usuário que muda durante a operação", async () => {
      const mockPrisma = prisma as jest.Mocked<typeof prisma>;
      const mockFormData = new FormData();
      mockFormData.set("name", "Envelope Teste");
      mockFormData.set("value", "1000");
      mockFormData.set("type", "MONETARY");

      // Usuário autenticado inicialmente
      (getAuthenticatedUser as jest.Mock).mockResolvedValueOnce({
        user: mockUser,
      });
      // Usuário não autenticado na segunda chamada
      (getAuthenticatedUser as jest.Mock).mockRejectedValueOnce(
        new Error("User not authenticated")
      );

      mockPrisma.envelope.findFirst.mockResolvedValue(null);
      mockPrisma.envelope.create.mockResolvedValue({} as any);

      // Primeira operação deve funcionar
      await expect(create(mockFormData)).resolves.not.toThrow();

      // Segunda operação deve falhar
      await expect(create(mockFormData)).rejects.toThrow(
        "User not authenticated"
      );
    });
  });

  describe("Casos de Borda - Dados de Entrada", () => {
    it("deve lidar com FormData vazio", async () => {
      const emptyFormData = new FormData();

      await expect(create(emptyFormData)).rejects.toThrow();
    });

    it("deve lidar com FormData com campos undefined", async () => {
      const mockFormData = new FormData();
      mockFormData.set("name", "Teste");
      mockFormData.set("value", "1000");
      // Campo type não definido

      await expect(create(mockFormData)).rejects.toThrow();
    });

    it("deve lidar com FormData com campos null", async () => {
      const mockFormData = new FormData();
      mockFormData.set("name", "Teste");
      mockFormData.set("value", "1000");
      mockFormData.set("type", "MONETARY");

      // Simular campo null
      const originalGet = mockFormData.get;
      mockFormData.get = jest.fn((key) => {
        if (key === "name") return null;
        return originalGet.call(mockFormData, key);
      });

      await expect(create(mockFormData)).rejects.toThrow();
    });

    it("deve lidar com valores de string vazios", async () => {
      const mockFormData = new FormData();
      mockFormData.set("name", ""); // String vazia deve falhar
      mockFormData.set("value", "1000");
      mockFormData.set("type", "MONETARY");

      await expect(create(mockFormData)).rejects.toThrow();
    });

    it("deve lidar com valores numéricos como strings vazias", async () => {
      const mockFormData = new FormData();
      mockFormData.set("name", "Teste");
      mockFormData.set("value", ""); // Valor vazio se torna 0 com z.coerce.number()
      mockFormData.set("type", "MONETARY");

      // z.coerce.number() converte string vazia para 0, então deve funcionar
      await expect(create(mockFormData)).resolves.not.toThrow();
    });
  });

  describe("Casos de Borda - Operações de Banco", () => {
    it("deve lidar com envelope que não existe na atualização", async () => {
      const mockPrisma = prisma as jest.Mocked<typeof prisma>;
      const mockFormData = new FormData();
      mockFormData.set("name", "Envelope Atualizado");
      mockFormData.set("value", "2000");
      mockFormData.set("type", "MONETARY");

      mockPrisma.envelope.update.mockRejectedValue(
        new Error("Record to update not found")
      );

      await expect(update("id-inexistente", mockFormData)).rejects.toThrow(
        "Record to update not found"
      );
    });

    it("deve lidar com envelope que não pode ser deletado", async () => {
      const mockPrisma = prisma as jest.Mocked<typeof prisma>;

      mockPrisma.envelope.delete.mockRejectedValue(
        new Error("Cannot delete non-deletable envelope")
      );

      await expect(remove("envelope-não-deletável")).rejects.toThrow(
        "Cannot delete non-deletable envelope"
      );
    });

    it("deve lidar com falha na revalidação do cache", async () => {
      const mockPrisma = prisma as jest.Mocked<typeof prisma>;
      const mockFormData = new FormData();
      mockFormData.set("name", "Teste");
      mockFormData.set("value", "1000");
      mockFormData.set("type", "MONETARY");

      mockPrisma.envelope.findFirst.mockResolvedValue(null);
      mockPrisma.envelope.create.mockResolvedValue({} as any);

      // Simular falha na revalidação
      (revalidatePath as jest.Mock).mockImplementation(() => {
        throw new Error("Cache revalidation failed");
      });

      // Se a revalidação falha, a função toda falha
      await expect(create(mockFormData)).rejects.toThrow(
        "Cache revalidation failed"
      );
    });
  });
});
