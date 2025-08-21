import { get } from "../../envelope/get";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";

// Mock das dependências
jest.mock("@/lib/prisma", () => ({
  prisma: {
    envelope: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock("@/lib/supabase/server", () => ({
  getAuthenticatedUser: jest.fn(),
}));

describe("get - Envelope", () => {
  const mockUser = { id: "user-123" };

  beforeEach(() => {
    jest.clearAllMocks();
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({ user: mockUser });
  });

  it("deve retornar envelopes do usuário e globais ordenados por nome", async () => {
    const mockPrisma = prisma as jest.Mocked<typeof prisma>;
    const mockEnvelopes = [
      { id: "1", name: "Alimentação", userId: "user-123", isGlobal: false },
      { id: "2", name: "Remuneração", userId: null, isGlobal: true },
      { id: "3", name: "Transporte", userId: "user-123", isGlobal: false },
    ];

    mockPrisma.envelope.findMany.mockResolvedValue(mockEnvelopes);

    const result = await get();

    expect(mockPrisma.envelope.findMany).toHaveBeenCalledWith({
      where: {
        OR: [{ userId: "user-123" }, { isGlobal: true }],
      },
      orderBy: { name: "asc" },
    });

    expect(result).toEqual(mockEnvelopes);
  });

  it("deve retornar apenas envelopes globais se o usuário não tiver envelopes próprios", async () => {
    const mockPrisma = prisma as jest.Mocked<typeof prisma>;
    const mockEnvelopes = [
      { id: "1", name: "Remuneração", userId: null, isGlobal: true },
    ];

    mockPrisma.envelope.findMany.mockResolvedValue(mockEnvelopes);

    const result = await get();

    expect(result).toEqual(mockEnvelopes);
    expect(result).toHaveLength(1);
  });

  it("deve retornar array vazio se não houver envelopes", async () => {
    const mockPrisma = prisma as jest.Mocked<typeof prisma>;

    mockPrisma.envelope.findMany.mockResolvedValue([]);

    const result = await get();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it("deve lançar erro se o usuário não estiver autenticado", async () => {
    (getAuthenticatedUser as jest.Mock).mockRejectedValue(
      new Error("User not authenticated.")
    );

    await expect(get()).rejects.toThrow("User not authenticated.");

    expect(prisma.envelope.findMany).not.toHaveBeenCalled();
  });

  it("deve retornar envelopes com estrutura correta", async () => {
    const mockPrisma = prisma as jest.Mocked<typeof prisma>;
    const mockEnvelopes = [
      {
        id: "1",
        name: "Alimentação",
        value: 500,
        type: "MONETARY",
        userId: "user-123",
        isGlobal: false,
        isDeletable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockPrisma.envelope.findMany.mockResolvedValue(mockEnvelopes);

    const result = await get();

    expect(result[0]).toHaveProperty("id");
    expect(result[0]).toHaveProperty("name");
    expect(result[0]).toHaveProperty("value");
    expect(result[0]).toHaveProperty("type");
    expect(result[0]).toHaveProperty("userId");
    expect(result[0]).toHaveProperty("isGlobal");
    expect(result[0]).toHaveProperty("isDeletable");
    expect(result[0]).toHaveProperty("createdAt");
    expect(result[0]).toHaveProperty("updatedAt");
  });
});
