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
- Sempre Verifique o models e depois a views.py para entender os dados disponíveis.
- Utilize os modelos e exemplos já definidos na API para criar ou modificar o frontend.
- O frontend (Next.js) deve consumir apenas dados e estruturas já definidos na API do backend.
- Não implemente chamadas reais à API sem autorização.
- Para mockar dados no frontend, siga os exemplos e tipos definidos nos arquivos da API.
- Utilize os modelos e exemplos já existentes para garantir consistência.
- Ultilize o que esta em "@/components/layout/dashboard-layout" para o layout do frontend, evitando criar novos componentes de layout.
- Mantenha o layout consistente com o design já implementado, utilizando os componentes existentes e o Shadcn UI.
- utilize a forma de mostrar as informações que já esta implementada no frontend, como tabelas, cards e badges, de frontend\src\app\lotes. Implementando novos componentes apenas quando necessário e seguindo o padrão já existente, seguindo o padrao de cores e estilos do Shadcn UI, fazendo o CRUD de forma consistente com o que ja esta implementado, posiçao do botão de adicionar, botões de ação, Header, Footer, etc.

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
