import swaggerJsdoc from 'swagger-jsdoc';

// Configuração do Swagger — descreve a API para gerar a documentação automática
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Project Management API',
      version: '1.0.0',
      description: 'API para gerenciamento de projetos, clientes, leads e faturamento',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Servidor local' },
    ],
    // Define o esquema de autenticação JWT usado em todas as rotas protegidas
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT obtido no login',
        },
      },
    },
    // Aplica autenticação por padrão em todos os endpoints
    security: [{ bearerAuth: [] }],
  },
  // Onde o swagger-jsdoc vai procurar os comentários de documentação
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
