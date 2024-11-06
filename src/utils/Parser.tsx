import { SaleRequest } from "@/interfaces/Events";
import { AbiCoder, ethers, Log } from "ethers";

const abiCoder = new AbiCoder();

export function ParseMintLogs(data: string) {
  const decoded = abiCoder.decode(["uint256", "uint256"], data);
  const id = decoded[0].toString();
  const tokens = decoded[1].toString();
  return { id, tokens };
}

export function ParseActiveEventLogs(data: string) {
  const decoded = abiCoder.decode(["uint32", "uint256"], data);
  const id = decoded[0].toString();
  return id;
}

export async function parseTransactionLogs(
  logs: Log[]
): Promise<SaleRequest[]> {
  const parsedLogs: SaleRequest[] = [];
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();

  for (const log of logs) {
    try {
      const seller = ethers.getAddress(
        ethers
          .hexlify(log.topics[1])
          .replace("0x000000000000000000000000", "0x")
      );
      const buyer = ethers.getAddress(
        ethers
          .hexlify(log.topics[2])
          .replace("0x000000000000000000000000", "0x")
      );

      const decodedData = abiCoder.decode(
        [
          "uint256", // assetId
          "uint256", // tokens
          "uint256", // funds
          "bool", // bySeller
          "bool", // byBuyer
          "bool", // isConfirmed
          "bool", // isFinished
          "bool", // isWithdraw
        ],
        log.data
      );

      // console.log("Decoded transaction:", {
      //   seller,
      //   buyer,
      //   assetId: decodedData[0],
      //   tokens: decodedData[1],
      //   funds: decodedData[2],
      //   bySeller: decodedData[3],
      //   byBuyer: decodedData[4],
      //   isConfirmed: decodedData[5],
      //   isFinished: decodedData[6],
      //   isWithdraw: decodedData[7],
      // });

      parsedLogs.push({
        koltenaId: Number(decodedData[0]),
        buyer,
        seller,
        tokens: Number(decodedData[1]),
        funds: Number(decodedData[2]),
        sellerApproved: decodedData[3],
        buyerProposed: decodedData[4],
        isConfirmed: decodedData[5],
        isFinished: decodedData[6],
        isWithdraw: decodedData[7],
      });
    } catch (error) {
      console.error("Error parsing log:", error, "for log:", log);
    }
  }

  return parsedLogs;
}
