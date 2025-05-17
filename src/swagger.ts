

import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SkinSense API",
      version: "1.0.0",
      description: "API documentation for the SkinSense backend",
    },
    servers: [
      {
        url: "http://13.48.138.216",
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
      schemas: {
        UserProfile: {
          type: "object",
          properties: {
            age: {
              type: "integer",
              example: 25,
            },
            gender: {
              type: "string",
              example: "Male",
            },
            bloodType: {
              type: "string",
              example: "O+",
            },
            phone: {
              type: "string",
              example: "+201234567890",
            },
            profilePhotoUrl: {
              type: "string",
              example: "https://example.com/photo.jpg",
            },
            location: {
              type: "object",
              properties: {
                latitude: {
                  type: "number",
                  example: 30.0444,
                },
                longitude: {
                  type: "number",
                  example: 31.2357,
                },
                address: {
                  type: "string",
                  example: "Cairo, Egypt",
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/**/*.ts"], 
};

const specs = swaggerJsDoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};
