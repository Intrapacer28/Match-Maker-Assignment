import base58 from "bs58";

const testConversion = (base58Key: string) => {
  try {
    // Decode the Base58 key
    const privateKeyBytes = base58.decode(base58Key);

    // Check the length
    console.log("Decoded Byte Array Length:", privateKeyBytes.length);
  } catch (error) {
    console.error("Error decoding Base58 key:", error);
  }
};

// Replace this with your Base58-encoded key
const base58Key = "23RCKVPjLMqjsp4icn5S7gsd5Ux5ryYPtyTDhCnpYsHdpARGaDovPj8e9DxRNoiitfYbHMrjxEHZrpSMB6vrif9i";
testConversion(base58Key);
