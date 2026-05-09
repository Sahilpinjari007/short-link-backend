import dotenv from 'dotenv';

dotenv.config();

export const env = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI as string,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
};