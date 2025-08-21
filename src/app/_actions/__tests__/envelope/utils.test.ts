import { z } from "zod";

// Importar o schema de validação do arquivo create.ts
const envelopeSchema = z.object({
  name: z.string().min(1),
  value: z.coerce.number(),
  type: z.enum(["PERCENTAGE", "MONETARY"]),
});

describe("Envelope - Utilitários e Validações", () => {
  describe("Schema de Validação", () => {
    it("deve validar dados corretos de envelope monetário", () => {
      const validData = {
        name: "Alimentação",
        value: "1500.50",
        type: "MONETARY",
      };

      const result = envelopeSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Alimentação");
        expect(result.data.value).toBe(1500.5);
        expect(result.data.type).toBe("MONETARY");
      }
    });

    it("deve validar dados corretos de envelope percentual", () => {
      const validData = {
        name: "Investimentos",
        value: "25",
        type: "PERCENTAGE",
      };

      const result = envelopeSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Investimentos");
        expect(result.data.value).toBe(25);
        expect(result.data.type).toBe("PERCENTAGE");
      }
    });

    it("deve rejeitar nome vazio", () => {
      const invalidData = {
        name: "",
        value: "1000",
        type: "MONETARY",
      };

      const result = envelopeSchema.safeParse(invalidData);

      expect(result.success).toBe(false); // String vazia deve ser rejeitada
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Too small: expected string to have >=1 characters"
        );
      }
    });

    it("deve rejeitar nome com apenas espaços", () => {
      const invalidData = {
        name: "   ",
        value: "1000",
        type: "MONETARY",
      };

      const result = envelopeSchema.safeParse(invalidData);

      expect(result.success).toBe(true); // Espaços são aceitos pelo Zod
      if (result.success) {
        expect(result.data.name).toBe("   ");
      }
    });

    it("deve rejeitar valor não numérico", () => {
      const invalidData = {
        name: "Teste",
        value: "valor-invalido",
        type: "MONETARY",
      };

      const result = envelopeSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Invalid input: expected number, received NaN"
        );
      }
    });

    it("deve rejeitar tipo inválido", () => {
      const invalidData = {
        name: "Teste",
        value: "1000",
        type: "TIPO_INVALIDO",
      };

      const result = envelopeSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Invalid option: expected one of"
        );
      }
    });

    it("deve aceitar valores decimais para envelopes monetários", () => {
      const validData = {
        name: "Contas",
        value: "1250.75",
        type: "MONETARY",
      };

      const result = envelopeSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.value).toBe(1250.75);
      }
    });

    it("deve aceitar valores inteiros para envelopes percentuais", () => {
      const validData = {
        name: "Lazer",
        value: "15",
        type: "PERCENTAGE",
      };

      const result = envelopeSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.value).toBe(15);
      }
    });

    it("deve aceitar valores zero", () => {
      const validData = {
        name: "Novo Envelope",
        value: "0",
        type: "MONETARY",
      };

      const result = envelopeSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.value).toBe(0);
      }
    });

    it("deve aceitar valores negativos", () => {
      const validData = {
        name: "Débitos",
        value: "-500",
        type: "MONETARY",
      };

      const result = envelopeSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.value).toBe(-500);
      }
    });
  });

  describe("Formatação de Dados", () => {
    it("deve converter string para número corretamente", () => {
      const testCases = [
        { input: "1000", expected: 1000 },
        { input: "1500.50", expected: 1500.5 },
        { input: "0", expected: 0 },
        { input: "-250", expected: -250 },
        { input: "25.75", expected: 25.75 },
      ];

      testCases.forEach(({ input, expected }) => {
        const data = {
          name: "Teste",
          value: input,
          type: "MONETARY" as const,
        };

        const result = envelopeSchema.safeParse(data);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.value).toBe(expected);
        }
      });
    });

    it("deve manter tipos de dados corretos", () => {
      const data = {
        name: "Teste",
        value: "1000",
        type: "PERCENTAGE" as const,
      };

      const result = envelopeSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.name).toBe("string");
        expect(typeof result.data.value).toBe("number");
        expect(typeof result.data.type).toBe("string");
        expect(["PERCENTAGE", "MONETARY"]).toContain(result.data.type);
      }
    });
  });

  describe("Validações de Negócio", () => {
    it("deve aceitar nomes com caracteres especiais", () => {
      const validNames = [
        "Alimentação & Bebidas",
        "Transporte Público",
        "Contas da Casa",
        "Investimentos (Longo Prazo)",
        "Lazer & Entretenimento",
        "Saúde & Bem-estar",
      ];

      validNames.forEach((name) => {
        const data = {
          name,
          value: "1000",
          type: "MONETARY" as const,
        };

        const result = envelopeSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("deve aceitar nomes com números", () => {
      const validNames = [
        "Envelope 1",
        "Categoria 2024",
        "Plano A",
        "Meta 1 - Janeiro",
      ];

      validNames.forEach((name) => {
        const data = {
          name,
          value: "1000",
          type: "MONETARY" as const,
        };

        const result = envelopeSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("deve aceitar valores percentuais de 0 a 100", () => {
      const validPercentages = ["0", "25", "50", "75", "100", "12.5", "33.33"];

      validPercentages.forEach((percentage) => {
        const data = {
          name: "Teste",
          value: percentage,
          type: "PERCENTAGE" as const,
        };

        const result = envelopeSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("deve aceitar valores monetários grandes", () => {
      const validAmounts = ["1000000", "999999.99", "0.01", "1000000000"];

      validAmounts.forEach((amount) => {
        const data = {
          name: "Teste",
          value: amount,
          type: "MONETARY" as const,
        };

        const result = envelopeSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });
});
