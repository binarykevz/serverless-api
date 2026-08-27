# Media API — Cloudflare Workers Edition

Serverless Media REST API running on **Cloudflare Workers** with:
- ⚡ Edge deployment worldwide
- 🪣 Native Cloudflare R2 storage (no AWS SDK)
- 🗄️ Turso/libSQL for metadata
- 🔐 Admin-only authentication
- 🎲 Random media endpoint

## Prerequisites

- [Bun](https://bun.sh)
- [Cloudflare account](https://dash.cloudflare.com) with R2 enabled
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) authenticated

## Setup

### 1. Install dependencies

```bash
bun install
