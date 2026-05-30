# Copa do Mundo 2026 — Bracket interativo

> 🇬🇧 [English version](README.md)

SPA em React que exibe o chaveamento completo da Copa do Mundo FIFA 2026, com atualização em tempo real via Socket.IO.

## Funcionalidades

- **Fase de grupos** — 12 grupos com 6 partidas cada, classificação automática por pontos, saldo de gols e confronto direto (regras FIFA)
- **Melhores terceiros** — seleção automática dos 8 melhores terceiros colocados
- **Fase eliminatória** — chave R32 → R16 → QF → SF → Final com atualização automática dos confrontos
- **Tempo real** — resultados sincronizados via Socket.IO a cada 6 segundos (football-data.org)
- **Probabilidades de vitória** — exibidas ao lado de cada time (api-football, atualizado a cada hora)
- **Badge de status** — cada partida indica se está agendada, ao vivo ou encerrada
- **Datas e horários** — localizados no fuso horário do usuário via `Intl.DateTimeFormat`
- **Multi-idioma** — Português, English, Français, Español (detecção automática pelo navegador)
- **Inputs bloqueados** — partidas encerradas com resultado da API têm o placar travado

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 19 + Vite 8 |
| Tempo real | Socket.IO client |
| Bandeiras | flag-icons (ISO 3166-1 alpha-2) |
| Estilo | CSS puro com variáveis |
| API de partidas | [football-data.org](https://www.football-data.org/) (via copa-2026-api) |
| API de probabilidades | [api-football](https://www.api-football.com/) (via copa-2026-api) |

## Estrutura do projeto

```
src/
├── components/
│   ├── Flag.jsx                  # Renderiza bandeira por código ISO
│   ├── LiveBadge.jsx             # Indicador de conexão Socket.IO
│   ├── group/
│   │   ├── GroupMatchCard.jsx    # Card de partida da fase de grupos
│   │   ├── GroupPanel.jsx        # Painel completo de um grupo
│   │   └── GroupStandings.jsx    # Tabela de classificação do grupo
│   └── bracket/
│       ├── BestThirds.jsx        # Barra dos melhores terceiros
│       ├── BracketConnector.jsx  # Linhas SVG entre rodadas
│       ├── KOMatchCard.jsx       # Card de partida eliminatória
│       └── RoundColumn.jsx       # Coluna de uma rodada do mata-mata
├── services/
│   ├── groupStats.js             # Cálculo de pontos, saldo, confronto direto
│   ├── bracket.js                # Lógica do chaveamento eliminatório
│   └── dateFormat.js             # Formatação de datas por idioma
├── constants/
│   └── bracket.js                # BASE_SLOT, TOTAL_H, CONN_W
├── data.js                       # Times, grupos, datas e pareamentos R32
├── i18n.jsx                      # Traduções e seletor de idioma
├── matchMapper.js                # Mapeia football-data.org → estado do app
├── predictionsMapper.js          # Mapeia api-football → probabilidades
├── useMatchData.js               # Hook Socket.IO (matches + predictions)
└── App.jsx                       # Composição e estado global
```

## Desenvolvimento

### Pré-requisitos

- Node.js 20+
- [copa-2026-api](../copa-2026-api) rodando localmente

### Instalação

```bash
npm install
```

### Variáveis de ambiente

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:3001
```

### Iniciar em modo desenvolvimento

```bash
npm run dev
# http://localhost:5174
```

### Build para produção

```bash
npm run build
npm run preview
```

## Conexão com a API

O front conecta via Socket.IO ao endereço definido em `VITE_API_URL`. Os eventos recebidos são:

| Evento | Conteúdo | Frequência |
|--------|----------|-----------|
| `matches` | Partidas + placares + datas + status | A cada 6s (durante jogos) |
| `predictions` | Probabilidades de vitória por partida | A cada 1h |

Ao conectar, o servidor envia imediatamente o cache em memória — sem aguardar o próximo ciclo do poller.

## Regras de classificação (FIFA)

Dentro de cada grupo, os times são ordenados por:

1. Pontos
2. Saldo de gols (geral)
3. Gols marcados (geral)
4. Pontos no confronto direto
5. Saldo de gols no confronto direto
6. Gols marcados no confronto direto
