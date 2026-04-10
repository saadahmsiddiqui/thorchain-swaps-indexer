import { config } from 'dotenv';

config();

export const THORCHAIN_NODE_URL = process.env.THORCHAIN_NODE_URL;
export const MAYACHAIN_NODE_URL = process.env.MAYACHAIN_NODE_URL;
export const THOR_POOLS_BASE_URL = process.env.THOR_POOLS_BASE_URL;