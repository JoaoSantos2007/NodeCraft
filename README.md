# NodeCraft API

NodeCraft é uma **API backend em Node.js** projetada para **criar, gerenciar e executar instâncias de servidores de jogos** de forma segura, escalável e automatizada, utilizando **Docker** como base de isolamento e execução.

Inicialmente desenvolvida para controle de servidores **Minecraft**, a NodeCraft evoluiu para um projeto mais amplo, com suporte planejado (e em expansão) para outros jogos como **Counter-Strike**, **Terraria**, **Kerbal Space Program** e **Hytale**.

Este projeto foi pensado como uma plataforma completa de *game server management*, incluindo autenticação robusta, autorização granular, backups automáticos e documentação completa da API.

---

## 🚀 Principais Funcionalidades

* 🐳 **Gerenciamento de servidores via Docker**

  * Criação, inicialização, parada e remoção de instâncias
  * Isolamento completo por container

* 🎮 **Suporte a múltiplos jogos**

  * Minecraft (principal e estável)
  * Counter-Strike *(em breve)*
  * Terraria *(em breve)*
  * Kerbal Space Program *(em breve)*
  * Hytale *(planejado como segundo principal)*

* 🔐 **Sistema de Autenticação e Segurança**

  * JWT (Access Token)
  * Refresh Tokens
  * Validação de e-mail
  * Recuperação de senha

* 🧑‍⚖️ **Sistema de Autorização**

  * Controle de permissões
  * Acesso baseado em papéis (roles)

* 💾 **Backups Automatizados**

  * Backups de instâncias
  * Armazenamento em **buckets** (compatível com S3 ou similares)

* 🗄️ **Banco de Dados**

  * SQLite (leve, simples e eficiente para o escopo atual)

* 📄 **Documentação Completa da API**

  * Swagger / OpenAPI

* 🧹 **Padronização de Código**

  * ESLint para manter qualidade e consistência

---

## 🧱 Arquitetura Geral

* **API**: Node.js
* **Execução de jogos**: Docker
* **Banco de dados**: SQLite
* **Autenticação**: JWT + Refresh Tokens
* **Documentação**: Swagger
* **Backups**: Buckets externos

A API **não roda dentro de containers**, mas é responsável por **criar e gerenciar containers Docker** dinamicamente para cada instância de jogo.

---

## 📁 Estrutura do Projeto

```
/config           # Arquivos de configuração
/instances        # Dados persistentes das instâncias de jogos
/logs             # Logs da aplicação
/temp             # Arquivos temporários

/src
 ├── controllers  # Lógica dos endpoints
 ├── errors       # Tratamento de erros customizados
 ├── middlewares  # Middlewares (auth, validações, etc)
 ├── models       # Modelos do banco de dados
 ├── routes       # Rotas da API
 ├── runtime      # Execução e controle das instâncias
 ├── schemas      # Schemas (Swagger / validações)
 ├── templates    # Templates de e-mails e outros
 ├── utils        # Funções utilitárias
 └── validators   # Validações de dados
```

---

## ⚙️ Configuração

O arquivo principal de configuração da API é:

```
/config.json
```

Nele você pode definir, por exemplo:

* Configurações do servidor HTTP
* Chaves JWT
* Tempo de expiração de tokens
* Configurações do banco de dados
* Credenciais de e-mail
* Configuração de buckets para backups
* Parâmetros de execução dos containers Docker

> ⚠️ **Importante:** Nunca exponha seu `config.json` em repositórios públicos.

---

## ▶️ Instalação e Execução

### Pré-requisitos

* Node.js (versão recomendada: LTS)
* Docker
* Docker Compose *(opcional, dependendo do setup)*

### Instalação

```bash
npm install
```

### Execução

```bash
npm run dev
# ou
npm start
```

---

## 📘 Documentação da API (Swagger)

A API é totalmente documentada utilizando **Swagger (OpenAPI)**.

Após iniciar o servidor, acesse:

```
http://localhost:<porta>/docs
```

> O Swagger descreve todos os endpoints, autenticação, parâmetros, respostas e exemplos.

---

## 🔐 Autenticação

* Login retorna **Access Token (JWT)** e **Refresh Token**
* Access Token usado para autenticação nas rotas protegidas
* Refresh Token usado para renovação de sessão

Fluxo seguro e preparado para aplicações web e mobile.

---

## 💡 Casos de Uso

* Painel de controle de servidores de jogos
* Hospedagem automatizada de servidores
* Ambientes de estudo, testes ou produção
* Base para plataformas de *game hosting*

---

## 🛣️ Roadmap

* [x] Minecraft estável
* [ ] Counter-Strike
* [ ] Terraria
* [ ] Kerbal Space Program
* [ ] Hytale
* [ ] Sistema de plugins por jogo
* [ ] Painel web administrativo
* [ ] Suporte a múltiplos bancos de dados

---

## 🧑‍💻 Autor

**João Pedro Tomaz dos Santos**
Desenvolvedor Backend / Node.js

---

## 📜 Licença

Este projeto está licenciado sob a licença **MIT**.

Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## ⭐ Considerações Finais

NodeCraft é um dos principais projetos do autor, focado em **arquitetura limpa**, **segurança**, **escalabilidade** e **flexibilidade**, servindo tanto como solução prática quanto como base sólida para futuras expansões.

Contribuições, ideias e feedbacks são sempre bem-vindos 🚀
