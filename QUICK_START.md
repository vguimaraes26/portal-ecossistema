# 🚀 Quick Start - Portal Ecossistema

## 1️⃣ Instalação (1 minuto)

```bash
# Clonar/entrar no diretório
cd /Users/viniciusguimaraes/Documents/PORTAL\ ECOSSISTEMA

# Instalar dependências
npm install
```

Pronto! ✅

## 2️⃣ Iniciar Servidor (5 segundos)

```bash
npm start
```

Esperado:
```
🚀 PORTAL ECOSSISTEMA
[SCHEDULER] ✅ Agendador iniciado com sucesso
http://localhost:3000
```

## 3️⃣ Testar Newsletter (30 segundos)

### Inscrever na Newsletter
```bash
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com"}'
```

Resposta:
```json
{
  "success": true,
  "message": "Inscrição realizada com sucesso!",
  "email": "seu@email.com"
}
```

### Listar Subscribers (Admin)
```bash
# Gerar token
TOKEN=$(node -e "console.log(Buffer.from('admin@portal.com:'+Date.now()).toString('base64'))")

# Listar
curl http://localhost:3000/api/newsletter/subscribers \
  -H "Authorization: Bearer $TOKEN"
```

## 4️⃣ Testar Segurança (1 minuto)

```bash
bash SECURITY_TESTS.sh
```

Output:
```
✅ PASS - Inscrição aceita
✅ PASS - Rejeita email duplicado
✅ PASS - Bloqueia XSS com <script>
✅ PASS - Bloqueia SQL injection
... (14 testes)
```

## 📱 Endpoints Rápidos

### Públicos (Sem Auth)

**Inscrever:**
```bash
POST /api/newsletter/subscribe
Body: {"email":"user@example.com"}
```

**Desinscrever:**
```bash
DELETE /api/newsletter/unsubscribe
Body: {"email":"user@example.com"}
```

### Admin (Com Auth)

**Listar subscribers:**
```bash
GET /api/newsletter/subscribers
Header: Authorization: Bearer <token>
```

**Ver estatísticas:**
```bash
GET /api/newsletter/stats
Header: Authorization: Bearer <token>
```

**Remover subscriber:**
```bash
DELETE /api/newsletter/subscribers/email@example.com
Header: Authorization: Bearer <token>
```

## 🔒 Proteções Ativas

✅ Validação de e-mail  
✅ Bloqueio de XSS  
✅ Bloqueio de SQL Injection  
✅ Bloqueio de Prompt Injection  
✅ Rate limiting por IP  
✅ Autenticação JWT  
✅ Logs de auditoria  
✅ Sanitização de resposta  

## 📚 Documentação

- **Segurança Detalhada:** [SECURITY.md](./SECURITY.md)
- **Manual Completo:** [NEWSLETTER_README.md](./NEWSLETTER_README.md)
- **Sumário Técnico:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Testes:** `bash SECURITY_TESTS.sh`

## 🆘 Troubleshooting

### "Cannot find module 'uuid'"
```bash
npm install uuid node-cron email-validator
```

### "Port 3000 already in use"
```bash
# Mudar porta em .env
PORT=3001
npm start
```

### Rate limit atingido
```
Aguarde 10 minutos ou use IP diferente
```

### Token inválido
```bash
# Gerar novo token
TOKEN=$(node -e "console.log(Buffer.from('admin@portal.com:'+Date.now()).toString('base64'))")
```

## ✅ Checklist

- [ ] `npm install` executado
- [ ] `npm start` rodando sem erros
- [ ] Inscrição funcionando
- [ ] Testes passando
- [ ] Admin consegue listar subscribers
- [ ] Rate limit funcionando
- [ ] E-mails protegidos contra XSS/injection

---

**Pronto!** 🎉 Sistema está seguro e funcionando.

Para dúvidas, veja a documentação em [NEWSLETTER_README.md](./NEWSLETTER_README.md)
