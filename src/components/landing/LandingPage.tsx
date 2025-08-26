"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Loader2,
  TrendingUp,
  Shield,
  BarChart3,
  Wallet,
  Target,
  Users,
  Star,
  CheckCircle,
  PieChart,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Componente do ícone do Google
const GoogleIcon = () => (
  <svg
    className="w-5 h-5 mr-2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export function LandingPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const supabase = createClient();

  // Refs para animações GSAP
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const statsRef = useRef(null);
  const ctaCardRef = useRef(null);
  const featuresRef = useRef(null);
  const benefitsRef = useRef(null);
  const finalCtaRef = useRef(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        console.error("Erro ao autenticar com Google:", error);
      } else if (data.url) {
        // Para OAuth externo, precisamos usar window.location
        window.location.href = data.url;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80; // Altura aproximada do header
      const elementPosition = element.offsetTop - headerHeight;

      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    // Registrar ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Animações de entrada
    const tl = gsap.timeline();

    // Hero section animations
    tl.fromTo(
      titleRef.current,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    )
      .fromTo(
        subtitleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
        "-=0.5"
      )
      .fromTo(
        statsRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      )
      .fromTo(
        ctaCardRef.current,
        { y: 50, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" },
        "-=0.2"
      );

    // Scroll-triggered animations
    gsap.fromTo(
      featuresRef.current,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      }
    );

    gsap.fromTo(
      benefitsRef.current,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: benefitsRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      }
    );

    gsap.fromTo(
      finalCtaRef.current,
      { y: 100, opacity: 0, scale: 0.95 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: finalCtaRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      }
    );

    // Animações dos cards de recursos
    gsap.utils.toArray(".feature-card").forEach((card, index) => {
      gsap.fromTo(
        card as Element,
        { y: 50, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
          delay: index * 0.1,
          scrollTrigger: {
            trigger: card as Element,
            start: "top 90%",
            end: "bottom 10%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // Animações dos benefícios
    gsap.utils.toArray(".benefit-item").forEach((item, index) => {
      gsap.fromTo(
        item as Element,
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          delay: index * 0.1,
          scrollTrigger: {
            trigger: item as Element,
            start: "top 90%",
            end: "bottom 10%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // Animações hover para cards e botões
    gsap.utils.toArray(".hover-scale").forEach((element) => {
      (element as Element).addEventListener("mouseenter", () => {
        gsap.to(element as Element, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out",
        });
      });

      (element as Element).addEventListener("mouseleave", () => {
        gsap.to(element as Element, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      });
    });

    // Animação do header no scroll
    gsap.to(".header-bg", {
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          if (self.progress > 0.1) {
            gsap.to(".header-bg", {
              backgroundColor: "rgba(var(--background), 0.9)",
              backdropFilter: "blur(20px)",
              duration: 0.3,
            });
          } else {
            gsap.to(".header-bg", {
              backgroundColor: "transparent",
              backdropFilter: "blur(0px)",
              duration: 0.3,
            });
          }
        },
      },
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Detectar seção ativa baseado no scroll
      const sections = [
        { id: "hero", offset: 0 },
        { id: "recursos", offset: 100 },
        { id: "beneficios", offset: 100 },
        { id: "cta", offset: 100 },
      ];

      const currentScroll = window.scrollY + 100; // Offset para detecção

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (
          section &&
          currentScroll >= section.offsetTop - sections[i].offset
        ) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup function
    return () => {
      window.removeEventListener("scroll", handleScroll);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const features = [
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Dashboard Intuitivo",
      description:
        "Visualize suas finanças de forma clara e organizada com gráficos e relatórios detalhados.",
    },
    {
      icon: <Wallet className="h-8 w-8 text-primary" />,
      title: "Gestão de Envelopes",
      description:
        "Organize seu dinheiro em categorias e controle seus gastos com o método de envelopes.",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Análises Avançadas",
      description:
        "Entenda seus padrões de gastos e tome decisões financeiras mais inteligentes.",
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Segurança Total",
      description:
        "Seus dados estão protegidos com as melhores práticas de segurança do mercado.",
    },
  ];

  const stats = [
    {
      icon: <Users className="h-6 w-6" />,
      value: "10.000+",
      label: "Usuários ativos",
    },
    {
      icon: <Target className="h-6 w-6" />,
      value: "95%",
      label: "Melhoria no controle",
    },
    {
      icon: <Star className="h-6 w-6" />,
      value: "4.9",
      label: "Avaliação média",
    },
  ];

  const benefits = [
    "Controle total de gastos",
    "Planejamento financeiro eficiente",
    "Relatórios detalhados",
    "Interface moderna e intuitiva",
    "Sincronização em tempo real",
    "Suporte especializado",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <header
        className={`header-bg fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "backdrop-blur-md bg-background/80 border-b border-border/20"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center hover-scale">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg md:text-xl font-bold">Meus Envelopes</h1>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => scrollToSection("recursos")}
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  activeSection === "recursos"
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Recursos
              </button>
              <button
                onClick={() => scrollToSection("beneficios")}
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  activeSection === "beneficios"
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Benefícios
              </button>
              <button
                onClick={() => scrollToSection("cta")}
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  activeSection === "cta"
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Começar
              </button>
            </nav>
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                size="sm"
                className="text-sm md:text-base px-3 md:px-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                {isLoading ? "Aguarde..." : "Entrar"}
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div
        ref={heroRef}
        id="hero"
        className="container mx-auto px-4 md:px-6 pt-20 md:pt-28 pb-8"
      >
        <div className="text-center mb-16 md:mb-24">
          <div className="max-w-4xl mx-auto">
            <h2
              ref={titleRef}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight"
            >
              Transforme suas Finanças
            </h2>
            <p
              ref={subtitleRef}
              className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              A plataforma mais inteligente para controlar seus gastos, planejar
              seu futuro e alcançar suas metas financeiras.
            </p>

            <div
              ref={statsRef}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 mb-12 md:mb-16"
            >
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-2 p-4 md:p-6 rounded-lg bg-card/50 backdrop-blur border border-border/50 hover-scale"
                >
                  <div className="p-2 md:p-3 rounded-full bg-primary/10 text-primary">
                    {stat.icon}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card
            ref={ctaCardRef}
            className="max-w-sm md:max-w-md mx-auto shadow-xl border border-primary/20 bg-card/80 backdrop-blur-sm"
          >
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl md:text-2xl">
                Comece Gratuitamente
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Transforme sua vida financeira hoje mesmo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleGoogleSignIn}
                size="lg"
                className="w-full h-12 text-base hover-scale"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Continuar com Google
              </Button>
            </CardContent>
          </Card>
        </div>

        <div ref={featuresRef} id="recursos" className="mb-16 md:mb-24">
          <div className="text-center mb-12 md:mb-16">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Recursos Poderosos
            </h3>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Ferramentas avançadas para transformar sua gestão financeira
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-16">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="feature-card p-6 md:p-8 bg-card/50 backdrop-blur border border-border/50 hover-scale group"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 md:p-4 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-lg md:text-xl font-semibold mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div ref={benefitsRef} id="beneficios" className="mb-16 md:mb-24">
          <div className="text-center mb-12 md:mb-16">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Por que escolher Meus Envelopes?
            </h3>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              A solução completa para transformar sua relação com o dinheiro
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center mb-12 md:mb-16">
            <div className="space-y-4 md:space-y-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="benefit-item flex items-center space-x-3 hover-scale"
                >
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-500 flex-shrink-0" />
                  <span className="text-base md:text-lg">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="relative animate-scale-in">
              <Card className="p-4 md:p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover-scale">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <PieChart className="h-4 w-4 md:h-5 md:w-5" /> Visão Geral
                    dos Gastos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-primary rounded-full" />
                        <span className="text-sm">Alimentação</span>
                      </div>
                      <span className="font-medium text-sm md:text-base">
                        R$ 1.200
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span className="text-sm">Transporte</span>
                      </div>
                      <span className="font-medium text-sm md:text-base">
                        R$ 800
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="text-sm">Entretenimento</span>
                      </div>
                      <span className="font-medium text-sm md:text-base">
                        R$ 400
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-6 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary via-blue-500 to-green-500 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div ref={finalCtaRef} id="cta" className="text-center mb-12 md:mb-16">
          <Card className="max-w-4xl mx-auto p-6 md:p-12 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20 hover-scale">
            <CardContent className="space-y-4 md:space-y-6">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                Pronto para transformar sua vida financeira?
              </h3>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Junte-se a milhares de pessoas que já estão no controle das suas
                finanças
              </p>
              <Button
                onClick={handleGoogleSignIn}
                size="lg"
                className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 h-auto hover-scale"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Começar Agora - É Grátis
              </Button>
            </CardContent>
          </Card>
        </div>

        <footer className="text-center text-muted-foreground border-t border-border/50 pt-8">
          <p>
            &copy; {new Date().getFullYear()} Meus Envelopes. Todos os direitos.
            Feito com ❤️ por{" "}
            <a
              href="https://braine.dev"
              target="_blank"
              className="text-primary font-bold hover:text-secondary"
            >
              Braine
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;
