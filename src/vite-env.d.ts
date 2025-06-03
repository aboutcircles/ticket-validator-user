/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NFT_CONTRACT_ADDRESS: string;
  readonly VITE_SUPPORT_EMAIL: string;
  readonly VITE_PURCHASE_URL: string;
  // Add more environment variables as needed
}

// Do not change this interface name
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
