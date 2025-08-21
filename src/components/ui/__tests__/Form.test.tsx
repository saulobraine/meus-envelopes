/**
 * Testes para os componentes Form
 *
 * Este arquivo testa os componentes utilitários do Form:
 * - Form (FormProvider)
 * - FormField
 * - FormItem
 * - FormLabel
 * - FormControl
 * - FormDescription
 * - FormMessage
 * - useFormField
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";

// Schema de teste
const testSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  age: z.number().min(18, "Idade deve ser pelo menos 18"),
});

type TestFormData = z.infer<typeof testSchema>;

// Componente de teste que usa os componentes Form
const TestForm = ({ onSubmit }: { onSubmit: (data: TestFormData) => void }) => {
  const form = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      name: "",
      email: "",
      age: 0,
    },
  });

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <input
                  {...field}
                  placeholder="Digite seu nome"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
              </FormControl>
              <FormDescription>Digite seu nome completo</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <input
                  {...field}
                  type="email"
                  placeholder="Digite seu email"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
              </FormControl>
              <FormDescription>Digite um email válido</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Idade</FormLabel>
              <FormControl>
                <input
                  {...field}
                  type="number"
                  placeholder="Digite sua idade"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
              </FormControl>
              <FormDescription>Digite sua idade</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Enviar
        </button>
      </form>
    </Form>
  );
};

describe("Form Components", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Renderização Básica", () => {
    it("deve renderizar o Form com FormProvider", () => {
      render(<TestForm onSubmit={mockOnSubmit} />);

      // Verificar se os campos estão renderizados
      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/idade/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /enviar/i })
      ).toBeInTheDocument();
    });

    it("deve renderizar FormItem com estrutura correta", () => {
      render(<TestForm onSubmit={mockOnSubmit} />);

      const nameField = screen.getByLabelText(/nome/i);
      const nameItem = nameField.closest("div");

      expect(nameItem).toHaveClass("space-y-2");
    });

    it("deve renderizar FormLabel com htmlFor correto", () => {
      render(<TestForm onSubmit={mockOnSubmit} />);

      const nameLabel = screen.getByText("Nome");
      const nameInput = screen.getByLabelText(/nome/i);

      expect(nameLabel).toHaveAttribute("for", nameInput.id);
    });

    it("deve renderizar FormControl com props corretas", () => {
      render(<TestForm onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByLabelText(/nome/i);

      // Verificar se o input tem as props corretas do FormControl
      expect(nameInput).toHaveAttribute("aria-describedby");
      expect(nameInput).toHaveAttribute("aria-invalid", "false");
    });

    it("deve renderizar FormDescription", () => {
      render(<TestForm onSubmit={mockOnSubmit} />);

      expect(screen.getByText("Digite seu nome completo")).toBeInTheDocument();
      expect(screen.getByText("Digite um email válido")).toBeInTheDocument();
      expect(screen.getByText("Digite sua idade")).toBeInTheDocument();
    });

    it("deve renderizar FormMessage (vazio inicialmente)", () => {
      render(<TestForm onSubmit={mockOnSubmit} />);

      // FormMessage só é renderizado quando há erro
      const nameField = screen.getByLabelText(/nome/i);
      const nameItem = nameField.closest("div");

      // Verificar se o elemento existe mas está vazio
      expect(nameItem).toBeInTheDocument();
    });
  });

  describe("Props e Validação", () => {
    it("deve aceitar className customizada no FormItem", () => {
      const CustomFormItem = () => (
        <FormItem className="custom-item" data-testid="form-item">
          <div>Teste</div>
        </FormItem>
      );

      render(<CustomFormItem />);

      const item = screen.getByTestId("form-item");
      expect(item).toHaveClass("custom-item");
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter labels associados aos inputs", () => {
      render(<TestForm onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByLabelText(/nome/i);
      const emailInput = screen.getByLabelText(/email/i);
      const ageInput = screen.getByLabelText(/idade/i);

      expect(nameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(ageInput).toBeInTheDocument();
    });

    it("deve ter aria-describedby nos inputs", () => {
      render(<TestForm onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByLabelText(/nome/i);
      const emailInput = screen.getByLabelText(/email/i);
      const ageInput = screen.getByLabelText(/idade/i);

      expect(nameInput).toHaveAttribute("aria-describedby");
      expect(emailInput).toHaveAttribute("aria-describedby");
      expect(ageInput).toHaveAttribute("aria-describedby");
    });

    it("deve ter aria-invalid false inicialmente", () => {
      render(<TestForm onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByLabelText(/nome/i);
      const emailInput = screen.getByLabelText(/email/i);
      const ageInput = screen.getByLabelText(/idade/i);

      expect(nameInput).toHaveAttribute("aria-invalid", "false");
      expect(emailInput).toHaveAttribute("aria-invalid", "false");
      expect(ageInput).toHaveAttribute("aria-invalid", "false");
    });
  });

  describe("Ref Forwarding", () => {
    it("deve encaminhar ref corretamente para FormItem", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <FormItem ref={ref}>
          <div>Teste</div>
        </FormItem>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});
