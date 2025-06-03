// src/App.tsx
import { useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { ExternalLink } from "lucide-react";

// Use environment variables with fallbacks for development/testing
const NFT_CONTRACT_ADDRESS =
  import.meta.env.VITE_NFT_CONTRACT_ADDRESS ||
  "0x9340184741D938453bF66D77d551Cc04Ab2F4925"; // Fallback address for development
const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL || "support@aboutcircles.com"; // Fallback support email
const PURCHASE_URL =
  "https://app.metri.xyz/transfer/0x1145d7f127c438286cf499CD9e869253266672e1/crc/1";

// ABI inclusive of how the unlock protocol handles
const ABI = [
  "function getHasValidKey(address) view returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function keyExpirationTimestampFor(address) view returns (uint256)",
];

// Interface for NFT details
interface NFTDetails {
  contractName: string;
  eventName: string;
  keyExpiration?: string;
}

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [isValidTicket, setIsValidTicket] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null);
  const [showContractInfo, setShowContractInfo] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  const checkTicketValidity = async () => {
    if (!walletAddress.trim()) return;

    setIsLoading(true);
    setIsValidTicket(null);
    setErrorInfo(null);

    let normalizedAddress;
    try {
      normalizedAddress = ethers.getAddress(walletAddress);
    } catch (error) {
      setErrorInfo("Invalid wallet address format");
      setIsLoading(false);
      return;
    }

    try {
      // Always use a direct RPC provider - simpler and more reliable
      const provider = new ethers.JsonRpcProvider(
        "https://rpc.gnosischain.com",
      );
      const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, ABI, provider);

      // Step 1: Try getHasValidKey
      try {
        const hasValidKey = await contract.getHasValidKey(normalizedAddress);
        setIsValidTicket(hasValidKey);

        if (!hasValidKey) {
          // Step 2: Check balance
          try {
            const balance = await contract.balanceOf(normalizedAddress);
            if (balance > 0) {
              // Step 3: Check if the key is expired
              try {
                const expiration =
                  await contract.keyExpirationTimestampFor(normalizedAddress);
                const now = Math.floor(Date.now() / 1000);
                if (expiration < now) {
                  setErrorInfo("Your key has expired");
                } else {
                  setErrorInfo("You own a key but it appears to be invalid");
                }
              } catch (expError: any) {
                console.error("Error checking expiration:", expError);
                setErrorInfo("Error checking key expiration");
              }
            } else {
              setErrorInfo("No ticket found for this address");
            }
          } catch (balanceError: any) {
            console.error("Error checking balance:", balanceError);
            setErrorInfo("Error checking key ownership");
          }
        }

        if (hasValidKey) {
          // Set NFT details for a valid ticket
          setNftDetails({
            contractName: "DappCon25 Ticket",
            eventName: "DappCon 2025",
            keyExpiration: "16th-18th June, 2025",
          });
        }
      } catch (validKeyError: any) {
        console.error("Error in getHasValidKey:", validKeyError);
        if (validKeyError.message) {
          if (validKeyError.message.includes("call revert exception")) {
            setErrorInfo(
              "Contract call failed - the contract might not support this method",
            );
          } else if (validKeyError.message.includes("network")) {
            setErrorInfo("Network connection error - please try again");
          } else {
            setErrorInfo(`Error: ${validKeyError.message}`);
          }
        }
        setIsValidTicket(false);
      }
    } catch (error: any) {
      console.error("General validation error:", error);
      setIsValidTicket(false);
      setErrorInfo(`Error: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // // Function to handle purchase button click
  // const handlePurchase = () => {
  //   window.open(PURCHASE_URL, "_blank");
  // };

  // Function to toggle contract info
  const toggleContractInfo = () => {
    setShowContractInfo(!showContractInfo);
  };

  // Reset function
  const resetForm = () => {
    setWalletAddress("");
    setIsValidTicket(null);
    setErrorInfo(null);
    setNftDetails(null);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large black blob - top left */}
        <div className="absolute -top-60 -left-32 w-96 h-96 bg-black rounded-full opacity-80"></div>

        {/* Medium black blob - bottom right */}
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-black rounded-full opacity-60"></div>

        {/* Small accent blob - top right */}
        <div className="absolute -top-4 -right-28 w-64 h-64 bg-[#FFB800] rounded-full opacity-40"></div>

        {/* Geometric lines */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg mx-auto text-center space-y-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img
                src="/dappcon-25-logo.png"
                alt="DappCon25 Logo"
                className="w-20 h-20 object-contain"
              />
              {/* Glow effect */}
              <div className="absolute inset-0 w-20 h-20 bg-[#FFB800] rounded-lg opacity-20 blur-xl"></div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-black tracking-tight">
              DappCon25
            </h1>
            <h2 className="text-xl sm:text-2xl font-medium text-gray-600">
              Ticket Checker
            </h2>
          </div>

          {/* Input Section */}
          <div className="space-y-8 bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-100 shadow-2xl">
            <div className="space-y-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter Wallet Address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full h-14 px-6 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-[#FFB800] focus:ring-0 text-black placeholder:text-gray-400 transition-all duration-300"
                  onKeyPress={(e) => e.key === "Enter" && checkTicketValidity()}
                />
                {/* Input glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#FFB800]/20 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none group-focus-within:opacity-100"></div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={checkTicketValidity}
                  disabled={!walletAddress.trim() || isLoading}
                  className="h-14 px-8 bg-[#FFB800] hover:bg-[#E6A600] text-black font-semibold rounded-2xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      <span>Validating...</span>
                    </div>
                  ) : (
                    "Validate Ticket"
                  )}
                </Button>
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="h-14 px-8 bg-transparent hover:bg-gray-50 text-black border-2 border-gray-300 hover:border-gray-400 font-semibold rounded-2xl transition-all duration-300"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Error Messages */}
          {errorInfo && (
            <div className="p-8 rounded-3xl border-2 backdrop-blur-sm transition-all duration-500 bg-red-50/80 border-red-200 shadow-red-100 shadow-2xl">
              <div className="space-y-4">
                <p className="text-xl font-bold text-red-800">❌ {errorInfo}</p>
              </div>
            </div>
          )}

          {/* Validation Success */}
          {isValidTicket === true && !errorInfo && (
            <div className="p-8 rounded-3xl border-2 backdrop-blur-sm transition-all duration-500 bg-green-50/80 border-green-200 shadow-green-100 shadow-2xl">
              <div className="space-y-4">
                <p className="text-xl font-bold text-green-800">
                  ✅ Valid DappCon25 NFT Ticket Found!
                </p>
                {nftDetails && (
                  <div className="space-y-3 text-left bg-white/60 rounded-2xl p-6">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">
                          Event:
                        </span>
                        <span className="text-gray-900">
                          {nftDetails.eventName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">
                          Date:
                        </span>
                        <span className="text-gray-900">
                          {nftDetails.keyExpiration}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">
                          Venue:
                        </span>
                        <span className="text-gray-900">
                          Radialsystem, Berlin
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Valid Ticket Result */}
          {isValidTicket === false && !errorInfo && (
            <div className="p-8 rounded-3xl border-2 backdrop-blur-sm transition-all duration-500 bg-red-50/80 border-red-200 shadow-red-100 shadow-2xl">
              <div className="space-y-4">
                <p className="text-xl font-bold text-red-800">
                  ❌ No valid ticket found for this wallet address
                </p>
              </div>
            </div>
          )}

          {/* Support Link */}
          <div className="text-center">
            <p className="text-gray-600 text-lg">
              Need help?{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-[#FFB800] hover:text-[#E6A600] font-semibold underline transition-colors duration-300"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>

        {/* View Contract Link */}
        <div className="absolute bottom-8 right-8">
          <button
            onClick={toggleContractInfo}
            className="text-gray-500 hover:text-[#FFB800] text-sm font-medium transition-colors duration-300 flex items-center space-x-2"
          >
            <span>{showContractInfo ? "Hide contract" : "View contract"}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* Contract Info Overlay */}
        {showContractInfo && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[80vh] overflow-auto shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Contract Information</h3>
                <button
                  onClick={toggleContractInfo}
                  className="text-gray-500 hover:text-black"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="font-semibold mb-1">NFT Contract Address:</p>
                  <p className="text-sm break-all font-mono">
                    {NFT_CONTRACT_ADDRESS}
                  </p>
                  <p className="text-xs italic text-gray-500 mt-1">
                    Using {NFT_CONTRACT_ADDRESS}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="font-semibold mb-1">Network:</p>
                  <p>Gnosis Chain</p>
                </div>

                {nftDetails && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="font-semibold mb-1">Contract Name:</p>
                    <p>{nftDetails.contractName}</p>
                    <p className="font-semibold mb-1 mt-3">Event:</p>
                    <p>{nftDetails.eventName}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
