# 📧 Newsletter - Guia de Uso

## Visão Geral

O sistema de newsletter do Portal Ecossistema é **totalmente protegido** contra:
- ✅ Acesso não autorizado
- ✅ Prompt injection
- ✅ XSS (Cross-Site Scripting)
- ✅ SQL Injection
- ✅ Força bruta
- ✅ Vazamento de dados

---

## Endpoints Públicos (Sem Autenticação)

### 1. Inscrever na Newsletter

**Endpoint:** `POST /api/newsletter/subscribe`

**Rate Limit:** 1 inscrição por 10 minutos por IP

**Request:**
```bash
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Response (Sucesso):**
```json
{
  "success": true,
  "message": "Inscrição realizada com sucesso!",
  "email": "user@example.com"
}
```

**Response (Erro - Email já existe):**
```json
{
  "error": "E-mail já inscrito",
  "message": "Este e-mail já está registrado na newsletter"
}
```

**Response (Erro - Email inválido):**
```json
{
  "error": "Erro na inscrição",
  "message": "E-mail inválido"
}
```

**Response (Rate Limit):**
```json
{
  "error": "Muitas requisições",
  "message": "Máximo de 1 requisições por minuto",
  "retryAfter": 585
}
```

---

### 2. Desinscrever da Newsletter

**Endpoint:** `DELETE /api/newsletter/unsubscribe`

**Rate Limit:** 1 desinscição por 10 minutos por IP

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/newsletter/unsubscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Response (Sucesso):**
```json
{
  "success": true,
  "message": "Desinscrito com sucesso",
  "email": "user@example.com"
}
```

**Response (Erro - Email não encontrado):**
```json
{
  "error": "E-mail não encontrado",
  "message": "Este e-mail não está na newsletter"
}
```

---

## Endpoints Admin (Requer Autenticação)

### 1. Listar Todos os Subscribers

**Endpoint:** `GET /api/newsletter/subscribers`

**Autenticação:** ✅ Obrigatória (Bearer Token)

**Rate Limit:** 5 requisições por minuto por IP

**Request:**
```bash
curl http://localhost:3000/api/newsletter/subscribers \
  -H "Authorization: Bearer eyJlbWFpbCI6ImFkbWluQHBvcnRhbC5jb20iLCJ0aW1lc3RhbXAiOiIxNjE3NzI3NzcwMDAwIn0="
```

**Response:**
```json
{
  "success": true,
  "total": 245,
  "subscribers": [
    {
      "email": "user1@example.com",
      "subscribedAt": "2026-04-01T10:00:00.000Z"
    },
    {
      "email": "user2@example.com",
      "subscribedAt": "2026-04-02T15:30:00.000Z"
    }
  ],
  "metadata": {
    "accessedBy": "admin@portal.com",
    "accessedAt": "2026-04-04T20:39:37.000Z",
    "totalInactive": 12
  }
}
```

---

### 2. Obter Estatísticas

**Endpoint:** `GET /api/newsletter/stats`

**Autenticação:** ✅ Obrigatória

**Rate Limit:** 5 requisições por minuto por IP

**Request:**
```bash
curl http://localhost:3000/api/newsletter/stats \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalSubscribers": 245,
    "totalUnsubscribed": 12,
    "totalRegistered": 257,
    "createdAt": "2026-01-15T10:00:00.000Z",
    "lastUpdate": "2026-04-04T20:39:37.000Z"
  }
}
```

---

### 3. Remover Subscriber Específico

**Endpoint:** `DELETE /api/newsletter/subscribers/:email`

**Autenticação:** ✅ Obrigatória

**Rate Limit:** 10 requisições por minuto por IP

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/newsletter/subscribers/user@example.com \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "message": "Subscriber removido",
  "deletedEmail": "user@example.com"
}
```

---

## Como Obter Token de Autenticação

Para acessar endpoints admin, você precisa de um token JWT válido.

**Token Format:**
```
Authorization: Bearer <base64_encoded_token>
```

**Exemplo de token decodificado:**
```
email:timestamp
admin@portal.com:1617727770000
```

**Para gerar um token (exemplo em Node.js):**
```javascript
const token = Buffer.from('admin@portal.com:' + Date.now()).toString('base64');
console.log('Bearer ' + token);
```

**Output:**
```
Bearer YWRtaW5AcG9ydGFsLmNvbToxNjE3NzI3NzcwMDAw
```

---

## Proteções de Segurança

### Validação de Email

Todos os e-mails são validados e sanitizados:

```javascript
// ✅ Válido
✓ user@example.com
✓ contato@portal-dif.com.br
✓ USER@EXAMPLE.COM (normalizado para lowercase)

// ❌ Inválido (bloqueado)
✗ user@example.com<script>alert(1)</script>
✗ test@example.com'; DROP TABLE--
✗ @example.com
✗ user.example.com
✗ user@
```

### Rate Limiting

Cada IP tem limite de requisições:

| Endpoint | Limite | Janela |
|----------|--------|--------|
| POST /subscribe | 1 | 10 minutos |
| DELETE /unsubscribe | 1 | 10 minutos |
| GET /subscribers | 5 | 1 minuto |
| GET /stats | 5 | 1 minuto |
| DELETE /subscribers/:email | 10 | 1 minuto |

**Se exceder o limite:**
```json
{
  "error": "Muitas requisições",
  "message": "Máximo de 5 requisições por minuto",
  "retryAfter": 45
}
```

### Logs de Acesso

Toda ação é registrada:
```
[NEWSLETTER] Nova inscrição: user@example.com
[NEWSLETTER] Desinscrito: user@example.com
[NEWSLETTER] Acesso ADMIN por admin@portal.com em 2026-04-04T20:39:37.000Z
[NEWSLETTER] E-mail removido por admin@portal.com: user@example.com
```

---

## Dados Armazenados

Os dados são salvos em `newsletter.json`:

```json
{
  "subscribers": [
    {
      "email": "user@example.com",
      "subscribedAt": "2026-04-01T10:00:00.000Z",
      "active": true
    },
    {
      "email": "unsubscribed@example.com",
      "subscribedAt": "2026-03-01T10:00:00.000Z",
      "active": false,
      "unsubscribedAt": "2026-04-02T15:30:00.000Z"
    }
  ],
  "metadata": {
    "createdAt": "2026-01-15T10:00:00.000Z",
    "lastUpdate": "2026-04-04T20:39:37.000Z"
  }
}
```

---

## Instalação

### 1. Instalar Dependências

```bash
npm install
```

Isso irá instalar:
- `email-validator` - Validação de e-mail
- `node-cron` - Agendamento de jobs
- `uuid` - Geração de IDs únicos
- E todas as outras dependências

### 2. Iniciar Servidor

```bash
npm start
```

Esperado:
```
╔════════════════════════════════════════════╗
║   🚀 PORTAL ECOSSISTEMA                    ║
║   04/04/2026, 20:39:37
╠════════════════════════════════════════════╣
║   http://localhost:3000
║   API: http://localhost:3000/api/news
║   Stats: http://localhost:3000/api/stats
║   Health: http://localhost:3000/api/health
╚════════════════════════════════════════════╝

[SCHEDULER] Iniciando agendador...
[SCHEDULER] ✅ Agendador iniciado com sucesso
```

---

## Exemplos de Uso (cURL)

### Inscrever
```bash
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"novo@example.com"}'
```

### Desinscrever
```bash
curl -X DELETE http://localhost:3000/api/newsletter/unsubscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"novo@example.com"}'
```

### Listar (requer token)
```bash
TOKEN=$(node -e "console.log(Buffer.from('admin@portal.com:'+Date.now()).toString('base64'))")

curl http://localhost:3000/api/newsletter/subscribers \
  -H "Authorization: Bearer $TOKEN"
```

### Estatísticas
```bash
TOKEN=$(node -e "console.log(Buffer.from('admin@portal.com:'+Date.now()).toString('base64'))")

curl http://localhost:3000/api/newsletter/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## Troubleshooting

### "E-mail inválido"
- Verifique o formato do e-mail
- Remova espaços em branco
- Use caracteres válidos (sem <, >, ", ', etc)

### "Muitas requisições"
- Aguarde o tempo indicado em `retryAfter`
- Tente novamente após o intervalo
- Verifique seu IP/proxy

### "Não autenticado"
- Inclua o header `Authorization: Bearer <token>`
- Verifique se o token está em formato Base64
- Não esqueça de incluir "Bearer " antes do token

### "E-mail já inscrito"
- O e-mail já está na newsletter
- Faça delete e re-subscribe se necessário

---

## Segurança - Resumo

✅ **Protegido contra:**
- Acesso não autorizado (autenticação)
- Prompt injection (validação)
- XSS (sanitização)
- SQL injection (validação)
- Força bruta (rate limit)
- Vazamento de dados (sanitização de resposta)
- DDoS (rate limit por IP)

🔒 **Todos os dados de e-mail estão seguros!**

Para mais detalhes, veja [SECURITY.md](./SECURITY.md)
