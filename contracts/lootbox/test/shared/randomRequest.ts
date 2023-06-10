import { randomBytes, hexlify } from "ethers";

// this works not only on ERC721 but also on Lottery
export async function randomRequest(rndInstance: any, vrfInstance: any) {
  const eventFilter = vrfInstance.filters.RandomnessRequestId();
  const events = await vrfInstance.queryFilter(eventFilter);
  for (const e of events) {
    await vrfInstance.callBackWithRandomness(e.args[0], hexlify(randomBytes(32)), await rndInstance.getAddress());
  }
}
