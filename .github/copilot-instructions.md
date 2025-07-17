## Instruções Personalizadas para o Repositório AgroNexus

### Regras Gerais para GitHub Copilot

- **Não crie ou altere arquivos README.md automaticamente.**
- **Não altere arquivos de instrução deste diretório sem solicitação explícita.**
- **Não crie conexões reais com a API durante desenvolvimento.**
- **Quando for gerar código para o frontend, utilize apenas informações que já estão disponíveis na API (modelos, exemplos, tipos).**

### Ambiente Python

- Sempre que for executar comandos Python (manage.py, scripts, etc.), ative o ambiente virtual antes:
  - Windows:
    ```cmd
    venv\Scripts\activate
    ```
  - Linux/Mac:
    ```bash
    source venv/bin/activate
    ```
- Nunca rode comandos Python sem ativar o ambiente virtual.

### Integração Frontend/Backend

- O frontend (Next.js) deve consumir apenas dados e estruturas já definidos na API do backend.
- Não implemente chamadas reais à API sem autorização.
- Para mockar dados no frontend, siga os exemplos e tipos definidos nos arquivos da API.

### Padrões de Modificação

- Antes de modificar ou criar código, verifique se há instruções específicas para o arquivo ou padrão.
- Siga rigorosamente as instruções dos arquivos de regras e instruções do repositório.

### Exemplos de Comandos

- Ativar ambiente virtual:
  ```cmd
  venv\Scripts\activate
  ```
- Rodar backend:
  ```cmd
  python manage.py runserver
  ```
- Rodar frontend:
  ```cmd
  npm run dev
  ```

---
