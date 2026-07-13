import { createWalletClient, createPublicClient, http, parseUnits, encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bsc } from "viem/chains";

export const PLATFORM_ADDRESS = "0xa4F3F3b4934137C3FaB6Bf9111b5EAb017822C1C" as const;
const USDT_BSC = "0x55d398326f99059fF775485246999027B3197955" as const;

const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

export const publicClient = createPublicClient({
  chain: bsc,
  transport: http("https://bsc-dataseed1.binance.org"),
});

export async function sendUSDT(toAddress: string, amount: number): Promise<string> {
  const pk = process.env.PLATFORM_WALLET_PRIVATE_KEY as `0x${string}`;
  if (!pk) throw new Error("PLATFORM_WALLET_PRIVATE_KEY not set");

  const account = privateKeyToAccount(pk);
  const walletClient = createWalletClient({ account, chain: bsc, transport: http("https://bsc-dataseed1.binance.org") });

  const amountWei = parseUnits(amount.toFixed(6), 18);

  const data = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [toAddress as `0x${string}`, amountWei],
  });

  const hash = await walletClient.sendTransaction({
    to: USDT_BSC,
    data,
  });

  return hash;
}

export async function getPlatformUSDTBalance(): Promise<number> {
  const raw = await publicClient.readContract({
    address: USDT_BSC,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [PLATFORM_ADDRESS],
  });
  return Number(raw) / 1e18;
}
