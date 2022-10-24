// Load environment variables from the .env file.
import * as dotenv from 'dotenv'
dotenv.config()

if (process.env.PORT) {
    const parsedPort = parseInt(process.env.PORT, 10);
    if (!Number.isInteger(parsedPort)) {
        throw new Error('Environment variable $PORT must be an integer');
    } else if (parsedPort < 1 || parsedPort > 65535) {
        throw new Error('Environment variable $PORT must be a valid port number');
    }
}

export const port = process.env.PORT || 3000;
export const secretKey = process.env.TASKED_SECRET_KEY;
export const databaseUrl = process.env.DATABASE_URL || 'mongodb://127.0.0.1/qroket'