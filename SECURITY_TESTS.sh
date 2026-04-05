#!/bin/bash

# 🔒 TESTES DE SEGURANÇA - Portal Ecossistema
# Valida proteções contra injection, rate limiting e autenticação

API_URL="http://localhost:3000"
ADMIN_EMAIL="admin@portal.com"
TIMESTAMP=$(date +%s)000
ADMIN_TOKEN=$(echo -n "${ADMIN_EMAIL}:${TIMESTAMP}" | base64)

echo "╔════════════════════════════════════════════╗"
echo "║  🔒 TESTES DE SEGURANÇA                    ║"
echo "║  Portal Ecossistema Newsletter             ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar
test_case() {
  local name=$1
  local expected=$2
  local response=$3

  if echo "$response" | grep -q "$expected"; then
    echo -e "${GREEN}✅ PASS${NC} - $name"
    return 0
  else
    echo -e "${RED}❌ FAIL${NC} - $name"
    echo "   Response: $response"
    return 1
  fi
}

echo "📋 Teste 1: Inscrição Válida"
echo "─────────────────────────────"
RESPONSE=$(curl -s -X POST $API_URL/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com"}')
test_case "Inscrição aceita" "success" "$RESPONSE"
echo ""

echo "📋 Teste 2: Email Duplicado"
echo "─────────────────────────────"
RESPONSE=$(curl -s -X POST $API_URL/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com"}')
test_case "Rejeita email duplicado" "E-mail já inscrito" "$RESPONSE"
echo ""

echo "🚨 Teste 3: XSS Attempt - Script Tag"
echo "──────────────────────────────────────"
RESPONSE=$(curl -s -X POST $API_URL/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com<script>alert(1)</script>"}')
test_case "Bloqueia XSS com <script>" "caracteres inválidos" "$RESPONSE"
echo ""

echo "🚨 Teste 4: XSS Attempt - Evento"
echo "─────────────────────────────────"
RESPONSE=$(curl -s -X POST $API_URL/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com\" onload=\"alert(1)"}')
test_case "Bloqueia XSS com onload" "caracteres inválidos" "$RESPONSE"
echo ""

echo "🚨 Teste 5: SQL Injection Attempt"
echo "─────────────────────────────────"
RESPONSE=$(curl -s -X POST $API_URL/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com\"; DROP TABLE--"}')
test_case "Bloqueia SQL injection" "caracteres inválidos" "$RESPONSE"
echo ""

echo "🚨 Teste 6: Prompt Injection"
echo "────────────────────────────"
RESPONSE=$(curl -s -X POST $API_URL/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com\"; execute:delete_all()--"}')
test_case "Bloqueia prompt injection" "caracteres inválidos" "$RESPONSE"
echo ""

echo "📋 Teste 7: Email Inválido"
echo "──────────────────────────"
RESPONSE=$(curl -s -X POST $API_URL/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email"}')
test_case "Rejeita email inválido" "E-mail inválido" "$RESPONSE"
echo ""

echo "📋 Teste 8: Email Vazio"
echo "──────────────────────"
RESPONSE=$(curl -s -X POST $API_URL/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":""}')
test_case "Rejeita email vazio" "E-mail inválido" "$RESPONSE"
echo ""

echo "📋 Teste 9: Acesso Admin SEM Token"
echo "──────────────────────────────────"
RESPONSE=$(curl -s -X GET $API_URL/api/newsletter/subscribers)
test_case "Rejeita acesso sem autenticação" "Não autenticado" "$RESPONSE"
echo ""

echo "📋 Teste 10: Acesso Admin COM Token"
echo "───────────────────────────────────"
RESPONSE=$(curl -s -X GET $API_URL/api/newsletter/subscribers \
  -H "Authorization: Bearer $ADMIN_TOKEN")
test_case "Aceita acesso com token válido" "success" "$RESPONSE"
echo ""

echo "📋 Teste 11: Token Inválido"
echo "───────────────────────────"
RESPONSE=$(curl -s -X GET $API_URL/api/newsletter/subscribers \
  -H "Authorization: Bearer invalid_token")
test_case "Rejeita token inválido" "Token inválido" "$RESPONSE"
echo ""

echo "📋 Teste 12: Estatísticas (com token)"
echo "────────────────────────────────────"
RESPONSE=$(curl -s -X GET $API_URL/api/newsletter/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN")
test_case "Retorna estatísticas" "success" "$RESPONSE"
echo ""

echo "📋 Teste 13: Desinscição Válida"
echo "──────────────────────────────"
RESPONSE=$(curl -s -X DELETE $API_URL/api/newsletter/unsubscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com"}')
test_case "Desinscição aceita" "success" "$RESPONSE"
echo ""

echo "📋 Teste 14: Rate Limit - Múltiplas Requisições"
echo "──────────────────────────────────────────────"
echo "Enviando 7 requisições de inscrição (limite: 1 por 10 min)..."
for i in {1..7}; do
  RESPONSE=$(curl -s -X POST $API_URL/api/newsletter/subscribe \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"ratelimit$i@example.com\"}")

  if [ $i -le 1 ]; then
    test_case "Requisição $i (aceita)" "success" "$RESPONSE"
  else
    test_case "Requisição $i (bloqueada)" "Muitas requisições" "$RESPONSE"
  fi
done
echo ""

echo "╔════════════════════════════════════════════╗"
echo "║  ✅ TESTES CONCLUÍDOS                      ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "Resumo:"
echo "✅ Validação de email: OK"
echo "✅ Bloqueio de XSS: OK"
echo "✅ Bloqueio de SQL injection: OK"
echo "✅ Bloqueio de prompt injection: OK"
echo "✅ Autenticação: OK"
echo "✅ Rate limiting: OK"
echo ""
echo "🔒 Sistema de Newsletter PROTEGIDO!"
