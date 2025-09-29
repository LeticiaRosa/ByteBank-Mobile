# Templates de E-mail - ByteBank

Este diretório contém os templates de e-mail para o ByteBank.

## Arquivos Disponíveis

### 1. `confirmation.html` - Template Completo

- Design moderno e profissional
- Responsivo para mobile
- Inclui elementos de segurança
- Gradient de cores da marca
- Seção de benefícios
- Links para redes sociais e suporte

### 2. `confirmation-simple.html` - Template Simples

- Design minimalista
- Focado na ação principal
- Menor tamanho de arquivo
- Ideal para e-mails transacionais

### 3. `confirmation.txt` - Versão Texto

- Fallback para clientes que não suportam HTML
- Todas as informações essenciais
- Formatação simples e clara

## Variáveis Disponíveis

Os templates suportam as seguintes variáveis:

- `{{ .Name }}` - Nome do usuário
- `{{ .Email }}` - E-mail do usuário
- `{{ .ConfirmationURL }}` - Link de confirmação

## Configuração no Supabase

Para usar estes templates no Supabase Auth, você precisa:

1. Acessar o painel do Supabase
2. Ir em Authentication > Email Templates
3. Selecionar "Confirm signup"
4. Colar o conteúdo do template desejado
5. Configurar as variáveis necessárias

### Exemplo de configuração:

```html
<!-- Cole o conteúdo de confirmation.html ou confirmation-simple.html -->
```

## Personalizações

### Cores da Marca

- Azul Principal: #667eea
- Roxo Secundário: #764ba2
- Cinza Texto: #2d3748
- Cinza Claro: #4a5568

### Fontes

- Sistema: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto

### Responsividade

- Breakpoint mobile: 600px
- Container máximo: 600px
- Padding responsivo

## Testes

Para testar os templates:

1. Abra os arquivos HTML em um navegador
2. Use ferramentas como Litmus ou Email on Acid
3. Teste em diferentes clientes de e-mail
4. Verifique a responsividade

## Boas Práticas

- Sempre inclua versão texto (fallback)
- Teste em múltiplos clientes de e-mail
- Mantenha o design simples e focado
- Use imagens com moderação
- Inclua informações de segurança
- Adicione links de suporte

## Suporte

Para dúvidas sobre os templates de e-mail, consulte a documentação do Supabase Auth ou entre em contato com a equipe de desenvolvimento.
