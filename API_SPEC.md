# Especificação da API REST

Base URL: `http://localhost:3000/api`

## Endpoints

### GET `/api/news`
Retorna notícias publicadas com paginação

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10, max: 50)
- `segment` (investimento|contabilidade|all)
- `sort` (latest|popular)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Banco Central mantém Selic...",
      "excerpt": "...",
      "content": "...",
      "image": "...",
      "segment": "investimento",
      "tone": "profissional",
      "source": "CNN",
      "sourceUrl": "...",
      "publishedAt": "2026-04-03T10:30:00Z",
      "views": 1250
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "pages": 15
  }
}
```

---

### GET `/api/news/:id`
Detalhes de uma notícia específica

**Response:**
```json
{
  "id": 1,
  "title": "...",
  "content": "...",
  "image": "...",
  "segment": "investimento",
  "sourceUrl": "...",
  "publishedAt": "2026-04-03T10:30:00Z",
  "related": [ /* array de IDs relacionadas */ ]
}
```

---

### GET `/api/segments`
Lista todos os segmentos

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Investimento",
      "description": "Notícias sobre mercado, ações, investimentos",
      "count": 45,
      "color": "#006FD8"
    }
  ]
}
```

---

### GET `/api/segments/:name/news`
Notícias de um segmento específico

**Query Parameters:** `page`, `limit`, `sort`

---

### GET `/api/stats`
Estatísticas do portal

**Response:**
```json
{
  "totalNews": 1250,
  "todayNews": 25,
  "bySegment": {
    "investimento": 450,
    "contabilidade": 380,
    "estrategia": 420
  },
  "lastUpdate": "2026-04-03T14:30:00Z"
}
```

---

### POST `/api/admin/process` (Admin)
Inicia processamento manual

**Body:**
```json
{
  "force": false,
  "segment": "all"
}
```

---

### GET `/api/admin/logs` (Admin)
Log de processamento

**Query Parameters:** `limit`, `offset`, `status` (pending|success|error)

---

## Erros

```json
{
  "error": {
    "code": "INVALID_SEGMENT",
    "message": "Segment not found",
    "status": 404
  }
}
```

### Status Codes
- `200` OK
- `201` Created
- `400` Bad Request
- `404` Not Found
- `500` Internal Server Error
