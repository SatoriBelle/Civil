const METADATA_REGEX = /0x\w+(?=a165627a7a72305820(?:\w{64})0029$)/;

/**
 * Compares two hex arrays of smart-contracts deployed code
 * Deployed bytecode can't be compared 1:1, because of the metadata hash at the end
 * See http://solidity.readthedocs.io/en/v0.4.21/metadata.html
 */
export function isDeployedBytecodeEqual(deployed1: string, deployed2: string): boolean {
  if (deployed1 === deployed2) {
    return true;
  }
  const withoutMeta1 = deployed1.match(METADATA_REGEX);
  const withoutMeta2 = deployed2.match(METADATA_REGEX);
  // Didn't find the hash, just different bytecodes
  if (!withoutMeta1 || !withoutMeta2 || !withoutMeta1.length || !withoutMeta2.length) {
    return false;
  }
  return withoutMeta1[0] === withoutMeta2[0];
}

export function is0x0Address(address: string): boolean {
  return address === "0x0" || address === "0x0000000000000000000000000000000000000000";
}

export function is0x0Hash(hash: string): boolean {
  return hash === "0x0" || hash === "0x0000000000000000000000000000000000000000000000000000000000000000";
}

export function estimateRawHex(hex: string): number {
  let h = hex;
  if (hex.substr(0, 2) === "0x") {
    h = hex.substr(2);
  }
  const bytes = h.match(/.{2}/g) || [];
  return Math.floor(
    bytes.reduce((acc, item) => {
      if (item === "00") {
        return acc + 4;
      } else {
        return acc + 68;
      }
    }, 0) * 1.15,
  );
}
