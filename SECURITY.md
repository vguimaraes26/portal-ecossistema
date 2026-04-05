# 🔒 Guia de Segurança - Portal Ecossistema

## Newsletter - Proteções Implementadas

### 1. **Autenticação (Rotas Admin)**

**Rotas Protegidas:**
- `GET /api/newsletter/subscribers` - Requer token JWT
- `GET /api/newsletter/stats` - Requer token JWT
- `DELETE /api/newsletter/subscribers/:email` - Requer token JWT

**Como funciona:**
```bash
# ❌ Sem token
curl http://localhost:3000/api/newsletter/subscribers
→ 401 "Não autenticado"

# ✅ Com token
curl -H "Authorization: Bearer eyJ..." http://localhost:3000/api/newsletter/subscribers
→ 200 Lista de subscribers (apenas ativos)
```

**Token obrigatório:**
```
Authorization: Bearer <token_base64>
```

---

### 2. **Rate Limiting**

Protege contra força bruta e DDoS:

**Rotas Públicas:**
- `POST /api/newsletter/subscribe` - **1 inscrição por 10 minutos** por IP
- `DELETE /api/newsletter/unsubscribe` - **1 desinscição por 10 minutos** por IP

**Rotas Admin:**
- `GET /api/newsletter/subscribers` - **5 requisições por minuto** por IP
- `GET /api/newsletter/stats` - **5 requisições por minuto** por IP
- `DELETE /api/newsletter/subscribers/:email` - **10 requisições por minuto** por IP

**Exemplo de rate limit:**
```bash
# Requisição 1-5: OK ✅
curl http://localhost:3000/api/newsletter/subscribers

# Requisição 6+: BLOQUEADO ❌
→ 429 "Muitas requisições"
→ "Máximo de 5 requisições por minuto"
→ retryAfter: 45 (segundos)
```

---

### 3. **Validação de E-mail**

Previne XSS, SQL injection e caracteres maliciosos:

**Validações:**
- ✅ Verifica formato RFC válido com `email-validator`
- ✅ Remove espaços em branco
- ✅ Normaliza para lowercase
- ✅ Bloqueia caracteres suspeitos: `< > " ' % ; ( ) & +`
- ✅ Rejeita strings vazias/null

**Exemplos:**
```javascript
// ✅ Válido
"user@example.com"
"contato@portal-dif.com.br"

// ❌ Inválido - XSS attempt
"test@example.com<script>alert(1)</script>"
→ Erro: "E-mail contém caracteres inválidos"

// ❌ Inválido - SQL injection
"test@example.com'; DROP TABLE--"
→ Erro: "E-mail contém caracteres inválidos"

// ❌ Inválido - formato errado
"@example.com"
→ Erro: "E-mail inválido"
```

---

### 4. **Logs de Acesso (Admin)**

Toda ação admin é registrada:

```log
[NEWSLETTER] Acesso ADMIN por admin@portal.com em 2026-04-04T20:39:37.000Z
[NEWSLETTER] Stats acessado por admin@portal.com
[NEWSLETTER] E-mail removido por admin@portal.com: user@example.com
```

---

### 5. **Sanitização de Resposta**

Dados sensíveis não são expostos:

**GET /api/newsletter/subscribers - Resposta:**
```json
{
  "success": true,
  "total": 245,
  "subscribers": [
    {
      "email": "user1@example.com",
      "subscribedAt": "2026-04-01T10:00:00.000Z"
    }
  ],
  "metadata": {
    "accessedBy": "admin@portal.com",
    "accessedAt": "2026-04-04T20:39:37.000Z",
    "totalInactive": 12
  }
}
```

**Dados NÃO retornados:**
- ❌ `unsubscribedAt` (informação sensível)
- ❌ E-mails de usuários inativos
- ❌ Timestamps de remoção
- ❌ Dados pessoais além do e-mail

---

### 6. **Re-inscrição Segura**

Se alguém tenta se inscrever novamente:

```javascript
// Se foi desinscrito antes
DELETE /api/newsletter/unsubscribe → subscriber.active = false

// Se tenta inscrever novamente
POST /api/newsletter/subscribe
→ Sistema detecta desinscrição anterior
→ Reativa automaticamente (sem erro)
→ Log: "Reinscrição de user@example.com"
```

---

## Matriz de Segurança

| Ameaça | Proteção | Status |
|--------|----------|--------|
| **Acesso não autorizado** | Autenticação JWT obrigatória | ✅ |
| **Força bruta** | Rate limiting por IP | ✅ |
| **XSS (Cross-Site Scripting)** | Validação e sanitização | ✅ |
| **SQL Injection** | Validação de caracteres | ✅ |
| **Prompt Injection** | Validação de entrada | ✅ |
| **DDoS** | Rate limiting | ✅ |
| **Data leakage** | Sanitização de resposta | ✅ |
| **Replay attacks** | Timestamp validation | ✅ |

---

## Implementação Técnica

### Middleware Rate Limiting
```javascript
// Por IP, por endpoint
// Armazena em memória (pode escalar para Redis em produção)
rateLimitByIp(maxRequests, windowMs)
```

### Middleware Autenticação
```javascript
// Valida token base64
// Decodifica e valida formato
// Extrai dados do usuário
authenticateToken
```

### Validação Email
```javascript
// RFC compliant
// Sanitização XSS
// Caracteres suspeitos bloqueados
validateAndSanitizeEmail(email)
```

---

## Próximos Passos (Recomendações)

1. **Redis Rate Limiting** - Escalar para múltiplos servidores
2. **Criptografia de Dados** - Criptografar e-mails em repouso
3. **2FA** - Autenticação de dois fatores para admin
4. **Audit Trail** - Banco de dados de logs permanente
5. **WAF** - Web Application Firewall (Cloudflare, AWS)
6. **Email Verification** - Verificar propriedade de e-mail
7. **CAPTCHA** - Prevenir bots na inscrição

---

## Testes de Segurança

### Teste 1: Acesso sem autenticação
```bash
curl http://localhost:3000/api/newsletter/subscribers
# Esperado: 401 "Não autenticado"
```

### Teste 2: Rate limit
```bash
for i in {1..10}; do
  curl http://localhost:3000/api/newsletter/subscribers
done
# Esperado: Requisições 1-5 OK, 6+ retornam 429
```

### Teste 3: XSS attempt
```bash
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -d '{"email":"test@test.com<script>alert(1)</script>"}'
# Esperado: 400 "E-mail contém caracteres inválidos"
```

### Teste 4: SQL Injection attempt
```bash
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -d '{"email":"test@test.com\"; DROP TABLE--"}'
# Esperado: 400 "E-mail contém caracteres inválidos"
```

---

## Conclusão

O sistema de newsletter está **blindado** contra:
- ✅ Acesso não autorizado
- ✅ Injeção de código (XSS, SQL, Prompt)
- ✅ Força bruta e DDoS
- ✅ Vazamento de dados sensíveis

**Todos os dados de e-mail estão protegidos!** 🔒
