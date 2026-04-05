# 📰 DiF News - Style Guide

## Identidade Visual Minimalista

### Conceito
**DiF News** é um boletim semanal elegante e minimalista para profissionais do ecossistema contábil e financeiro. Design sofisticado, sem ruído visual, foco no conteúdo.

---

## 🎨 Paleta de Cores

### Cores Primárias
```
Ouro: #D4AF37 (accent, detalhe sofisticado)
Preto: #1a1a1a (tipografia principal)
Cinza: #666, #999, #bbb (hierarquia)
Branco: #ffffff (fundo principal)
Cinza Light: #fafafa (fundo secundário)
```

### Uso
- **#D4AF37**: Apenas em detalhes estratégicos (linhas, acentos, números)
- **#1a1a1a**: Títulos e conteúdo principal
- **#666**: Corpo de texto
- **#999**: Metadata, datas, segmentos
- Nunca usar cores como fundo cheio (apenas 10-15% do espaço)

---

## ✏️ Tipografia

### Fontes
```
Sistema Font Stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
(Nativa do dispositivo do usuário = mais rápido)
```

### Tamanhos e Pesos
```
Header (DiF News)        → 12px, uppercase, letter-spacing 1.2px
Título da Seção         → 32px, weight 300, letter-spacing -0.5px
Título do Artigo        → 16px, weight 600, line-height 1.4
Corpo (Preview)         → 13px, weight 400, color #666
Metadata                → 11px, weight 400, color #999
CTA Button              → 12px, weight 600, letter-spacing 1px
```

### Características
- **Weight 300**: Elegância e leveza (títulos principais)
- **Weight 600**: Hierarquia e leitura (títulos secundários)
- **Letter-spacing**: Refinamento (uppercase words)
- **Line-height 1.6-1.8**: Respiração visual

---

## 🔲 Layout e Espaçamento

### Email Newsletter
```
┌─────────────────────────────────────┐
│ HEADER (48px padding)              │
│  DiF News                           │
│  Destaques da Semana                │
│  ────────────────── (2px line)     │
├─────────────────────────────────────┤
│ CONTENT (48px padding)             │
│                                     │
│ Intro text...                       │
│                                     │
│ 01  Título do Artigo                │
│     Preview do artigo...            │
│     LER ARTIGO →                    │
│                                     │
│ 02  Título do Artigo                │
│     Preview do artigo...            │
│     LER ARTIGO →                    │
│                                     │
│ [Explorar Todas as Notícias]        │
├─────────────────────────────────────┤
│ FOOTER (32px padding)               │
│ Preferências | Desinscrever         │
│ © 2026 DiF News                     │
└─────────────────────────────────────┘
```

### Espaçamento Padrão
```
- Topo/Rodapé: 48px
- Lateral: 32px
- Entre artigos: 32px
- Entre seções: 40px (com border top/bottom)
- Entre linhas: 1.6 (corpo), 1.4 (títulos)
```

---

## 🎯 Componentes

### Numeração de Artigos
```
Simples e sofisticada:
  01, 02, 03... (font-weight: 300, color: #D4AF37)

Alternativa (não usar):
  ❌ 1. Article (muito pesado)
  ❌ • Article (muito casual)
  ❌ # Article (muito técnico)
```

### Links
```
Cor: #D4AF37
Estilo: Uppercase + arrow
Exemplo: "LER ARTIGO →"

Nunca:
  ❌ "Clique aqui"
  ❌ "Read more" (em português)
  ❌ Underline
```

### Linhas Divisórias
```
Cor: #D4AF37 com 10% opacity (#D4AF3718)
Espessura: 1px
Uso: Separar seções

Exemplo:
  Antes: border-bottom: 1px solid #D4AF3718;
  Depois: border-top: 1px solid #D4AF3718;
```

### Botão CTA
```
Estilo: Minimalista
- Fundo: #D4AF37
- Texto: Preto (not white - sofisticado)
- Padding: 14px 32px
- Border-radius: 2px (quase reto)
- Font-size: 12px uppercase
- Letter-spacing: 1px
- Hover: opacity 0.9 (sem cor flutuante)

Exemplo: "Explorar Todas as Notícias"
```

---

## 📧 Email Template - Estrutura

### Header (Responsivo)
```html
<div class="header">
  <div class="header-subtitle">DiF News</div>
  <h1 class="header-title">Destaques da Semana</h1>
  <div class="header-accent"></div>
</div>
```

### Introdução
```
Padrão: "Olá. Aqui estão as notícias mais importantes 
         da semana para o ecossistema contábil e financeiro."

Características:
- Simples, direta, profissional
- Font-size: 13px
- Color: #666
- Margin-bottom: 40px
```

### Artigo (Loop)
```html
<tr>
  <td style="padding: 32px 0; border-bottom: 1px solid #D4AF3718;">
    <div style="display: flex; gap: 16px;">
      
      <!-- NÚMERO (01, 02, 03...) -->
      <div style="color: #D4AF37; font-size: 20px; 
                  font-weight: 300; min-width: 20px;">
        01
      </div>
      
      <!-- CONTEÚDO -->
      <div>
        <h3>Título do Artigo (16px, weight 600)</h3>
        <p>Preview do artigo em 150 caracteres (13px, #666)</p>
        <a href="#">LER ARTIGO →</a>
      </div>
      
    </div>
  </td>
</tr>
```

### Footer
```html
<div class="footer">
  <div class="footer-links">
    <a href="#">Preferências</a>
    <a href="#">Desinscrever</a>
  </div>
  <div class="copyright">
    © 2026 DiF News · Portal de Notícias para 
    o Ecossistema Contábil
  </div>
</div>
```

---

## 🎪 Exemplos de Design

### ❌ Antes (Muito Visual)
```
📰 PORTAL DIF
🚀 DESTAQUES DA SEMANA 🎯

1️⃣ 💰 Selic em alta: impacto para sua carteira
   🔴 Urgente | 📊 Investimento
   Clique aqui para ler
   ⭐⭐⭐⭐⭐

[CLIQUE PARA ACESSAR O PORTAL AGORA!]

© DiF Portugal | [Pref] [Unsub]
```

### ✅ Depois (Minimalista Sofisticado)
```
DiF News
Destaques da Semana
────────────────

Olá. Aqui estão as notícias mais importantes 
da semana para o ecossistema contábil e financeiro.

01  Selic em alta: impacto para sua carteira
    O Banco Central manteve taxa em 10,5%...
    LER ARTIGO →

02  Nova resolução do CFC para 2026
    Impacta compliance e conformidade fiscal...
    LER ARTIGO →

[Explorar Todas as Notícias]

────────────────
Preferências | Desinscrever
© 2026 DiF News · Portal de Notícias para 
o Ecossistema Contábil
```

---

## 📱 Responsividade

### Desktop (600px max)
```
Padding lateral: 32px
Espaçamento: Full
Tipografia: Conforme definido
```

### Mobile (320px)
```
Padding lateral: 20px (automático)
Espaçamento: Mantém 32px vertical
Tipografia: Mesmos tamanhos (font escalável)
Flex layout: Adapta automáticamente
```

---

## 🎯 Princípios de Design

1. **Menos é Mais**
   - Apenas #D4AF37 em 10-15% do espaço visual
   - Nenhum emoji no layout principal
   - Apenas 1 fonte sistema

2. **Hierarquia Clara**
   - Font-weight diferencia títulos
   - Espaçamento cria respiração
   - Números guiam a leitura

3. **Profissionalismo**
   - Uppercase letters com letter-spacing
   - Linhas sutis (#D4AF3718)
   - CTA sem efeitos visuais pesados

4. **Velocidade**
   - Font sistema (mais rápido)
   - Minhas imagens (apenas artigo)
   - CSS minimalista

5. **Elegância**
   - Tipografia weight 300 (leveza)
   - Border-radius 2px (quase reto)
   - Cores restritas (4 cores)

---

## 🚀 Implementação

### CSS Classe
```css
.header-title {
  font-size: 32px;
  font-weight: 300;
  color: #1a1a1a;
  letter-spacing: -0.5px;
  margin-bottom: 8px;
}

.header-accent {
  width: 40px;
  height: 2px;
  background: #D4AF37;
  margin: 16px auto 0;
}

.cta-button {
  background: #D4AF37;
  color: #000;
  padding: 14px 32px;
  text-decoration: none;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 1px;
  display: inline-block;
  border-radius: 2px;
}
```

---

## ✨ Resultado Final

**DiF News** é um boletim que comunica:
- ✅ Profissionalismo (sem barulho)
- ✅ Elegância (detalhes sofisticados)
- ✅ Clareza (hierarquia visual)
- ✅ Confiança (design minimalista)

**Não é:**
- ❌ Colorido
- ❌ Com muitos emojis
- ❌ Casual demais
- ❌ Pesado visualmente

**Para:** Contadores, CFOs, executivos, profissionais financeiros
**Tom:** Profissional, direto, confiável
**Frequência:** Semanal (terça 9AM)
