# JSON Server API

## Iniciar o servidor

```bash
node server.js
```

O servidor estará disponível em `http://localhost:3000`

## Endpoints Disponíveis

### 1. Autenticação - Login
**POST** `/autenticacao/login`

**Body:**
```json
{
  "email": "tadeu@caixa.com",
  "senha": "123456"
}
```

**Resposta (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "clienteId": 1
}
```

**Usuários disponíveis:**
- tadeu@caixa.com / 123456 (Perfil Conservador)
- maria@caixa.com / 123456 (Perfil Moderado)
- joao@caixa.com / 123456 (Perfil Agressivo)

---

### 2. Perfil de Risco do Cliente
**GET** `/perfil-risco/:clienteId`

**Exemplo:** `/perfil-risco/1`

**Resposta (200):**
```json
{
  "clienteId": 1,
  "nome": "Tadeu Lopes",
  "perfilRisco": {
    "id": 1,
    "name": "Conservador",
    "description": "Perfil que prioriza a segurança e a preservação do capital"
  }
}
```

---

### 3. Produtos Recomendados por Perfil
**GET** `/produtos-recomendados/:perfil`

**Exemplo:** `/produtos-recomendados/1`

**Resposta (200):**
```json
[
  {
    "id": 1,
    "nome": "Poupança CAIXA",
    "tipo": "Renda Fixa",
    "taxaAnual": 0.06,
    "risco": "Baixo",
    "aplicacaoMinima": 10,
    "liquidez": "Imediata",
    "riskProfileId": 1
  }
]
```

---

### 4. Simular Investimento
**POST** `/simular-investimento`

**Body:**
```json
{
  "productId": 1,
  "valor": 10000,
  "prazoMeses": 12
}
```

**Resposta (200):**
```json
{
  "produto": "Poupança CAIXA",
  "valorInvestido": 10000,
  "prazoMeses": 12,
  "taxaAnual": 0.06,
  "taxaMensal": 0.004867,
  "valorFinal": 10600,
  "rendimentoTotal": 600,
  "detalheMensal": [
    {
      "mes": 1,
      "saldoInicial": 10000,
      "rendimento": 48.67,
      "saldoFinal": 10048.67
    }
  ]
}
```

---

### 5. Investimentos do Cliente
**GET** `/investimentos/:clienteId`

**Exemplo:** `/investimentos/1`

**Resposta (200):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "productId": 1,
    "valor": 5000,
    "dataInicio": "2024-01-15",
    "prazoMeses": 12,
    "valorAtual": 5300,
    "produto": {
      "id": 1,
      "nome": "Poupança CAIXA",
      "tipo": "Renda Fixa",
      "taxaAnual": 0.06
    }
  }
]
```

---

### 6. Recursos Padrão (JSON Server)

- **GET** `/users` - Lista todos os usuários
- **GET** `/users/:id` - Detalhes de um usuário
- **GET** `/products` - Lista todos os produtos
- **GET** `/products/:id` - Detalhes de um produto
- **GET** `/riskProfiles` - Lista todos os perfis de risco
- **GET** `/riskProfiles/:id` - Detalhes de um perfil

## Testando com cURL

```bash
# Login
curl -X POST http://localhost:3000/autenticacao/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"tadeu@caixa.com\",\"senha\":\"123456\"}"

# Perfil de risco
curl http://localhost:3000/perfil-risco/1

# Produtos recomendados
curl http://localhost:3000/produtos-recomendados/1

# Simular investimento
curl -X POST http://localhost:3000/simular-investimento \
  -H "Content-Type: application/json" \
  -d "{\"productId\":1,\"valor\":10000,\"prazoMeses\":12}"
```
