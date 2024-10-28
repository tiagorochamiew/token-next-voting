import { AbiCoder } from "ethers";

const abiCoder = new AbiCoder();

export function ParseMintLogs(data: string) {
  const decoded = abiCoder.decode(["uint256", "uint256"], data);
  const id = decoded[0].toString();
  const tokens = decoded[1].toString();
  return { id, tokens };
}
