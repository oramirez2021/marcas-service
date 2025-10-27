import * as Joi from 'joi';

export const validationSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(3001),

    // Database configuration
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(1521),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),

    // Oracle configuration
    ORACLE_HOME: Joi.string().required(),
    LD_LIBRARY_PATH: Joi.string().optional(),

    // JWT configuration
    JWT_SECRET: Joi.string().default('secret'),
    JWT_EXPIRES_IN: Joi.string().default('1h'),

    // CORS configuration
    CORS_ORIGIN: Joi.string().default('*'),

    // Cognito configuration (optional)
    COGNITO_JWKS_URI: Joi.string().optional(),
    COGNITO_ISSUER: Joi.string().optional(),
    COGNITO_CLIENT_ID: Joi.string().optional(),
});
