# VetCare

Sistema de gestao veterinaria desenvolvido como projeto academico, dividido entre Frontend (HTML, CSS e JavaScript), Backend (Java 21 com Spring Boot 4, Spring Web, Spring Data JPA, Validation, Swagger e Maven) e Banco de Dados Relacional (PostgreSQL 18 com pgAdmin 4).

O projeto esta organizado em tres pastas principais na raiz: `backend` (contendo os pacotes `config`, `controller`, `dto`, `entity`, `exception`, `repository` e `service`), `frontend` (interface web) e `docs` (documentacao e requisitos).

Para rodar o projeto localmente, tenha instalado o Git, JDK 21, PostgreSQL e IntelliJ IDEA. Clone o repositorio (`git clone https://github.com`), abra o pgAdmin 4 e crie um banco de dados chamado exatamente `vetcare`. Em seguida, abra a pasta `VetCare/backend` no IntelliJ, crie o arquivo `application-local.properties` dentro de `src/main/resources/` contendo apenas a linha `spring.datasource.password=SUA_SENHA_AQUI` (este arquivo ja e ignorado pelo Git) e execute a classe principal `VetcareApplication.java`.

Com o servidor rodando na porta 8080, a documentacao e os testes da API podem ser acessados no navegador pelo endereco `http://localhost:8080/swagger-ui/index.html`.


