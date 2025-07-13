import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

// Get canister IDs from dfx
const backend = execSync("dfx canister id finalproj_backend").toString().trim();
const ii = execSync("dfx canister id internet_identity").toString().trim();

// Create .env file content
const envContent = `
VITE_DFX_NETWORK=local
VITE_CANISTER_ID_FINALPROJ_BACKEND=${backend}
VITE_CANISTER_ID_INTERNET_IDENTITY=${ii}
VITE_IC_HOST_LOCAL=http://localhost:4943
VITE_IC_HOST_MAINNET=https://ic0.app
`;

// Write .env
writeFileSync(".env", envContent);

console.log("✅ .env updated with:");
console.log(envContent);
