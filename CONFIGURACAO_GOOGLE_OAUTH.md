# Configuração do Google OAuth para Lista de Compras

## Problema Identificado

O erro `idpiframe_initialization_failed` ocorre porque o domínio atual não está registrado como uma origem autorizada no Google Cloud Console.

## Solução: Configurar Origens Autorizadas

### 1. Acesse o Google Cloud Console

1. Vá para [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione seu projeto ou crie um novo
3. Navegue para **APIs & Services** > **Credentials**

### 2. Configure o OAuth 2.0 Client ID

1. Encontre seu Client ID: `61677669740-s27okg6q5drbumg3v018c0hckh22euqn.apps.googleusercontent.com`
2. Clique no ícone de edição (lápis)
3. Na seção **Authorized JavaScript origins**, adicione:

**Para desenvolvimento local:**
```
http://localhost:3000
http://localhost:3001
http://127.0.0.1:3000
http://127.0.0.1:3001
```

**Para produção (substitua pelo seu domínio):**
```
https://seudominio.com
https://www.seudominio.com
```

### 3. Habilitar APIs Necessárias

Certifique-se de que as seguintes APIs estão habilitadas:

1. **Google Sheets API**
   - Vá para **APIs & Services** > **Library**
   - Procure por "Google Sheets API"
   - Clique em "Enable"

2. **Google Drive API**
   - Procure por "Google Drive API"
   - Clique em "Enable"

### 4. Configurar Tela de Consentimento OAuth

1. Vá para **APIs & Services** > **OAuth consent screen**
2. Configure as informações básicas:
   - **Application name**: Lista de Compras
   - **User support email**: seu email
   - **Developer contact information**: seu email

3. Na seção **Scopes**, adicione:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive.file`

### 5. Testar Localmente

Após configurar as origens autorizadas:

1. Aguarde alguns minutos para as mudanças propagarem
2. Acesse `http://localhost:3000` ou `http://localhost:3001`
3. Teste o login com Google

## Funcionalidades Implementadas

### ✅ Autenticação Google OAuth2
- Login seguro com conta Google
- Permissões para Google Sheets e Drive

### ✅ Criação Automática de Planilha
- Ao fazer login, uma planilha é criada automaticamente no Google Drive do usuário
- Estrutura com abas "Itens" e "Historico"
- Cabeçalhos configurados automaticamente

### ✅ Sincronização de Dados
- Dados salvos localmente (localStorage) como fallback
- Sincronização automática com Google Sheets quando disponível
- Indicador visual do status de sincronização

### ✅ Funcionalidades da Lista
- Adicionar itens com categoria, quantidade e preço
- Marcar itens como comprados
- Remover itens da lista
- Finalizar compra e mover para histórico

### ✅ Histórico e Estatísticas
- Histórico completo de compras
- Estatísticas de gastos por categoria
- Filtros por período

## Estrutura da Planilha Criada

### Aba "Itens"
| ID | Nome | Quantidade | Categoria | Preco | Status | DataCriacao |
|----|------|------------|-----------|-------|--------|-------------|

### Aba "Historico"
| Data | Item | Quantidade | Preco | Categoria | Loja | Total | ID |
|------|------|------------|-------|-----------|------|-------|----| 

## Deploy em Produção

Para fazer deploy em produção:

1. **Configure o domínio de produção** no Google Cloud Console
2. **Atualize as variáveis de ambiente** se necessário
3. **Faça o build de produção**:
   ```bash
   npm run build
   ```
4. **Deploy** da pasta `build` para seu servidor

## Troubleshooting

### Erro: "Not a valid origin"
- Verifique se o domínio está nas origens autorizadas
- Aguarde alguns minutos após adicionar novas origens

### Erro: "Access blocked"
- Verifique se as APIs estão habilitadas
- Confirme se os scopes estão corretos na tela de consentimento

### Planilha não é criada
- Verifique se o usuário tem permissão para criar arquivos no Drive
- Confirme se a Google Drive API está habilitada

## Contato

Se precisar de ajuda adicional, verifique:
- Console do navegador para erros específicos
- Logs do Google Cloud Console
- Documentação oficial do Google OAuth 2.0

