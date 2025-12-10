const swaggerJsDoc = require("swagger-jsdoc");
const { SERVER_URL } = require("./env.config");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Linkora API Documentation",
      version: "1.0.0",
      description: "API documentation for Linkora Social Media Platform",
    },
    servers: [
      {
        url: SERVER_URL,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  // Path to the API docs inside routes
  apis: ["./routes/*.js"], // you can change based on your structure
};

const swaggerSpec = swaggerJsDoc(options);
module.exports = swaggerSpec;
