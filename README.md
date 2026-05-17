# 🏥 Squad Scheduling

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-7.5-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql)

O **Squad Scheduling** é um sistema moderno, rápido e seguro para gestão de clínicas e consultórios. Desenvolvido para centralizar o controle de agendamentos e a administração de equipes médicas de forma intuitiva.

---

## ✨ Funcionalidades Principais

*   📅 **Gestão de Agendamentos:** Criação, edição e cancelamento de consultas, com validações de fuso horário em tempo real para evitar agendamentos no passado.
*   👨‍⚕️ **Equipe Médica:** Cadastro completo de profissionais (médicos), vinculação automática por clínica e controle de especialidades/serviços.
*   🔐 **Autenticação Segura:** Login robusto utilizando [Better Auth](https://better-auth.com/), controle de permissões e hierarquia de acesso (ex: Papel de "Médico").
*   ⚡ **Alta Performance:** Construído inteiramente com **Server Actions** do Next.js e tipagem forte usando Zod para garantir que dados incorretos nunca cheguem ao banco.
*   🎨 **Interface Premium:** Design limpo, responsivo e acessível feito com [Shadcn UI](https://ui.shadcn.com/) e Tailwind CSS.

---

## 🛠️ Stack Tecnológica

**Frontend:**
*   **Next.js 16** (App Router)
*   **React 19**
*   **Tailwind CSS v4**
*   **Shadcn UI / Radix UI** (Componentes acessíveis)

**Backend & Dados:**
*   **Next.js Server Actions** (com `next-safe-action`)
*   **Zod** (Validação de schemas)
*   **Prisma ORM** (Modelagem e tipagem do banco)
*   **PostgreSQL** via Supabase (Banco de dados relacional)
*   **Better Auth** (Autenticação)

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
Certifique-se de ter instalado na sua máquina:
*   [Node.js](https://nodejs.org/) (versão 20 ou superior recomendada)
*   [PostgreSQL](https://www.postgresql.org/) rodando localmente ou uma conta no [Supabase](https://supabase.com/).

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/DevSquad-PA/squad-scheduling.git
    cd squad-scheduling
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configuração de Variáveis de Ambiente:**
    Crie um arquivo `.env` ou `.env.local` na raiz do projeto com base nas necessidades do sistema. Você precisará de, no mínimo, uma URL de banco de dados:
    ```env
    DATABASE_URL="postgresql://usuario:senha@localhost:5432/squad_scheduling"
    ```

4.  **Configuração do Banco de Dados:**
    Gere o cliente do Prisma e sincronize a estrutura do banco:
    ```bash
    npx prisma generate
    npx prisma db push
    ```
    *(Dica: Se houver dados de seed disponíveis, você pode rodar `npx prisma db seed` para popular o banco inicialmente).*

5.  **Inicie o Servidor de Desenvolvimento:**
    ```bash
    npm run dev
    ```

6.  **Acesse a aplicação:**
    Abra o seu navegador em [http://localhost:3000](http://localhost:3000).

---

## 📂 Estrutura do Projeto

*   `/app`: Rotas da aplicação (Frontend), incluindo as páginas protegidas (`/app/(protected)`).
*   `/actions`: Server Actions (Lógica de negócio do backend e validações isoladas).
*   `/components`: Componentes reutilizáveis (Shadcn UI, botões, modais).
*   `/server/prisma`: Configurações, schema (`schema.prisma`) e scripts de inicialização (Seed) do banco de dados.
*   `/lib`: Utilitários gerais, configurações de autenticação e instância do banco.
*   `/types`: Definições de tipagem TypeScript para consistência global.

---

<div align="center">
  Feito com ❤️ pelo <a href="https://github.com/DevSquad-PA">DevSquad-PA</a>
</div>
