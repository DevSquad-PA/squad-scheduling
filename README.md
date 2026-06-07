<div align="center">

# 🏥 Squad Scheduling

### Gestão de clínicas, profissionais e agendamentos em uma única plataforma

Aplicação web full stack para organizar a rotina de clínicas e consultórios, com
controle de acesso por função, gestão de profissionais e acompanhamento de consultas.

[![Next.js][next-badge]][next-url]
[![React][react-badge]][react-url]
[![TypeScript][typescript-badge]][typescript-url]
[![Tailwind CSS][tailwind-badge]][tailwind-url]
[![Prisma][prisma-badge]][prisma-url]
[![PostgreSQL][postgres-badge]][postgres-url]

</div>

---

## 📋 Sobre o projeto

O **Squad Scheduling** centraliza processos essenciais de uma clínica em uma
interface moderna e responsiva. A plataforma permite administrar agendamentos,
profissionais e colaboradores, mantendo os dados de cada clínica isolados e
aplicando permissões de acordo com o perfil do utilizador.

O projeto utiliza o **App Router** do Next.js, Server Actions com validação
tipada, autenticação baseada em sessão e PostgreSQL como banco de dados.

## ✨ Funcionalidades

- 📅 **Gestão de agendamentos:** criação, edição, cancelamento, pesquisa e
  filtragem por data.
- 🩺 **Gestão de profissionais:** cadastro de especialidades e serviços
  prestados por cada profissional.
- 👥 **Gestão de colaboradores:** administração dos membros vinculados à
  clínica.
- 🔐 **Autenticação:** cadastro e login com e-mail e senha por meio do
  Better Auth.
- 🛡️ **Controle de acesso:** permissões específicas para Administrador,
  Atendimento e Médico.
- 🏢 **Contexto por clínica:** profissionais, pacientes, colaboradores e
  consultas associados à organização correta.
- 🖼️ **Avatar de utilizador:** upload de imagens para o Supabase Storage.
- 📱 **Interface responsiva:** componentes acessíveis e adaptados a
  diferentes tamanhos de tela.
- ✅ **Validação tipada:** formulários e operações de servidor validados com
  Zod e next-safe-action.

## 🧰 Tecnologias

<div align="center">

<a href="https://nextjs.org/" title="Next.js">
  <img src="https://skillicons.dev/icons?i=nextjs" alt="Next.js" width="48" height="48" />
</a>
<a href="https://react.dev/" title="React">
  <img src="https://skillicons.dev/icons?i=react" alt="React" width="48" height="48" />
</a>
<a href="https://www.typescriptlang.org/" title="TypeScript">
  <img src="https://skillicons.dev/icons?i=ts" alt="TypeScript" width="48" height="48" />
</a>
<a href="https://tailwindcss.com/" title="Tailwind CSS">
  <img src="https://skillicons.dev/icons?i=tailwind" alt="Tailwind CSS" width="48" height="48" />
</a>
<a href="https://www.prisma.io/" title="Prisma">
  <img src="https://skillicons.dev/icons?i=prisma" alt="Prisma" width="48" height="48" />
</a>
<a href="https://www.postgresql.org/" title="PostgreSQL">
  <img src="https://skillicons.dev/icons?i=postgres" alt="PostgreSQL" width="48" height="48" />
</a>
<a href="https://supabase.com/" title="Supabase">
  <img src="https://skillicons.dev/icons?i=supabase" alt="Supabase" width="48" height="48" />
</a>
<a href="https://nodejs.org/" title="Node.js">
  <img src="https://skillicons.dev/icons?i=nodejs" alt="Node.js" width="48" height="48" />
</a>

</div>

<br />

| Área | Tecnologias |
| --- | --- |
| **Aplicação** | Next.js 16, React 19, TypeScript 5 |
| **Interface** | Tailwind CSS 4, shadcn/ui, Radix UI, Base UI, Lucide React |
| **Formulários** | React Hook Form, Zod |
| **Dados no cliente** | TanStack Query |
| **Servidor** | React Server Components, Server Actions, next-safe-action |
| **Banco de dados** | PostgreSQL, Prisma ORM 7 |
| **Autenticação** | Better Auth |
| **Armazenamento** | Supabase Storage |
| **Qualidade** | ESLint, Prettier |

## 🏗️ Arquitetura

```text
squad-scheduling/
├── actions/              # Server Actions e regras de negócio
├── app/                  # Rotas, layouts e páginas do App Router
│   ├── (protected)/      # Área autenticada da aplicação
│   └── api/auth/         # Endpoint do Better Auth
├── components/           # Componentes reutilizáveis e elementos de UI
├── data/                 # Consultas e acesso aos dados da aplicação
├── hooks/                # Hooks React compartilhados
├── lib/                  # Auth, Prisma, permissões e utilitários
├── providers/            # Providers globais da aplicação
├── server/prisma/        # Schema e seed do banco de dados
├── types/                # Tipos TypeScript por domínio
└── public/               # Arquivos estáticos
```

## 🚀 Execução local

### Pré-requisitos

- [Node.js](https://nodejs.org/) 20.9 ou superior
- [npm](https://www.npmjs.com/)
- Uma instância do [PostgreSQL](https://www.postgresql.org/)
- Um projeto no [Supabase](https://supabase.com/) para upload de avatares

### 1. Clone o repositório

```bash
git clone https://github.com/DevSquad-PA/squad-scheduling.git
cd squad-scheduling
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de dados PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/squad_scheduling"

# URL pública da aplicação
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Supabase Storage
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key"
SUPABASE_STORAGE_BUCKET="avatars"
```

> [!IMPORTANT]
> A `SUPABASE_SERVICE_ROLE_KEY` possui acesso privilegiado e nunca deve ser
> exposta no navegador ou adicionada ao controle de versão.

### 4. Prepare o banco de dados

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

O seed cria os dados iniciais necessários para explorar a aplicação.

### 5. Acesse a conta de desenvolvimento

Após executar o seed, utilize:

```text
E-mail: dev@squadscheduling.local
Senha:  Admin@123
```

> [!NOTE]
> Essas credenciais destinam-se somente ao ambiente local de desenvolvimento.

### 6. Inicie o servidor

```bash
npm run dev
```

A aplicação estará disponível em
[http://localhost:3000](http://localhost:3000).

## 📜 Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera a build otimizada para produção |
| `npm run start` | Executa a build de produção |
| `npm run lint` | Analisa o código com ESLint |
| `npx prisma studio` | Abre a interface visual do banco de dados |
| `npx prisma db seed` | Insere os dados iniciais |

## 🔒 Perfis e permissões

| Perfil | Visualizar | Criar | Editar | Excluir |
| --- | :---: | :---: | :---: | :---: |
| **Administrador** | ✅ | ✅ | ✅ | ✅ |
| **Atendimento** | ✅ | ✅ | ✅ | ❌ |
| **Médico** | ✅ | ❌ | ❌ | ❌ |

Profissionais com o perfil **Médico** visualizam somente os próprios
agendamentos.

## 🤝 Contribuição

1. Faça um fork do projeto.
2. Crie uma branch: `git checkout -b feature/minha-funcionalidade`.
3. Faça as alterações e valide com `npm run lint` e `npm run build`.
4. Crie um commit seguindo um padrão descritivo.
5. Envie a branch e abra um Pull Request.

---

<div align="center">

Desenvolvido por [DevSquad-PA](https://github.com/DevSquad-PA).

</div>

[next-badge]: https://img.shields.io/badge/Next.js-16.1-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[next-url]: https://nextjs.org/
[react-badge]: https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=0B1F2A
[react-url]: https://react.dev/
[typescript-badge]: https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[typescript-url]: https://www.typescriptlang.org/
[tailwind-badge]: https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white
[tailwind-url]: https://tailwindcss.com/
[prisma-badge]: https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white
[prisma-url]: https://www.prisma.io/
[postgres-badge]: https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white
[postgres-url]: https://www.postgresql.org/
