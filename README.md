# ⚡ AfiliadoAI PRO — Guia Completo de Configuração

---

## 📁 ESTRUTURA DO PROJETO

```
afiliadoai/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx          ← App principal (todas as telas)
│   ├── index.js         ← Entrada React
│   ├── firebase.js      ← Banco de dados Firebase
│   ├── mercadolivre.js  ← API do Mercado Livre
│   └── services.js      ← WhatsApp, Links, QR Code
├── .env.example         ← Modelo de variáveis
├── package.json
└── vercel.json
```

---

## 🔥 PASSO 1 — FIREBASE (Banco de Dados)

### 1.1 Criar projeto
1. Acesse: https://console.firebase.google.com
2. Clique "Criar um projeto" → Nome: afiliadoai → Criar
3. Menu esquerdo → Firestore Database → Criar banco
4. Modo de teste → Região: southamerica-east1 (São Paulo) → Ativar

### 1.2 Ativar autenticação anônima
1. Menu → Authentication → Primeiros passos
2. Clique em Anônimo → Ativar → Salvar

### 1.3 Pegar credenciais
1. Engrenagem → Configurações do projeto
2. Role até Seus apps → clique </> (Web)
3. Nome: afiliadoai-web → Registrar app
4. Copie o objeto firebaseConfig

### 1.4 Colar em src/firebase.js
Substitua cada campo "COLE_AQUI_..." pelo valor copiado.

---

## 🛒 PASSO 2 — MERCADO LIVRE API

### 2.1 Criar aplicação
1. Acesse: https://developers.mercadolivre.com.br
2. Login com sua conta ML → Criar aplicação
3. Nome: AfiliadoAI | URL redirect: https://afiliadoai.vercel.app
4. Copie o App ID e Secret Key

### 2.2 Gerar Access Token
1. Na página do app → Gerar Token de Teste
2. Copie o access_token

### 2.3 Colar em src/mercadolivre.js
Substitua: const ML_ACCESS_TOKEN = "COLE_AQUI_SEU_ACCESS_TOKEN";

---

## 🌐 PASSO 3 — VERCEL (Publicar online)

### 3.1 GitHub
1. github.com → criar conta
2. Novo repositório: afiliadoai
3. Subir todos os arquivos desta pasta

### 3.2 Vercel
1. vercel.com → login com GitHub
2. Add New Project → afiliadoai
3. Environment Variables — adicionar:
   REACT_APP_FIREBASE_API_KEY
   REACT_APP_FIREBASE_AUTH_DOMAIN
   REACT_APP_FIREBASE_PROJECT_ID
   REACT_APP_FIREBASE_STORAGE_BUCKET
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID
   REACT_APP_FIREBASE_APP_ID
   REACT_APP_ML_ACCESS_TOKEN
   REACT_APP_MEU_LINK_AFILIADO = https://meli.la/17XoYuZ
4. Deploy → aguarda ~3 min
5. App online em: https://afiliadoai.vercel.app

---

## O QUE FUNCIONA APOS CONFIGURAR

- Buscar produtos reais do Mercado Livre
- Importar produto por link
- Salvar cliques e vendas no Firebase
- Dashboard com dados reais
- WhatsApp com link real de afiliado
- Encurtador de links (TinyURL gratuito)
- QR Code do produto
- Roteiro viral com IA

Qualquer duvida, volte ao Claude e diga:
"Preciso de ajuda com o passo X do AfiliadoAI"
