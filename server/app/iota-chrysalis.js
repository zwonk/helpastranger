const { ClientBuilder } = require("@iota/client");
const { Bip39, Converter, Ed25519Seed } = require("iota-js-chrysalis-tmp"); //require("@iota/iota.js");
const crypto = require("./crypto.js");

const { v4: uuidv4 } = require("uuid");

const API = process.env.iotaNode_chrysalis;
const IOTA_DUST_OUTPUT_ALLOWANCE = process.env.IOTA_DUST_OUTPUT_ALLOWANCE;

const DEFAULT_IOTA_ERROR =
  "There seems to be an issue with the iota network. Try again later.";

const client = new ClientBuilder()
  .node(API)
  .brokerOptions({ timeout: 50 })
  .localPow(false)
  .build();

function Iota() {}

async function iotaHandler(promise) {
  try {
    const result = await promise;
    return result;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      throw err;
    } else {
      return { error: err.message || DEFAULT_IOTA_ERROR };
    }
  }
}

Iota.generateSeed = () => {
  const mnemonic = Bip39.randomMnemonic().toString();

  // Generate the seed from the mnenomic
  const baseSeed = Ed25519Seed.fromMnemonic(mnemonic);
  const seed = Converter.bytesToHex(baseSeed.toBytes());

  return { mnemonic, seed };
};

Iota.isValidAddress = (address) => true;

Iota.getAllAddresses = async (priv_key) => {
  const seed = crypto.decrypt(priv_key);
  const addresses = await client
    .getAddresses(seed)
    .accountIndex(0)
    .range(0, 5)
    .get();
  return addresses;
};

Iota.getAddress = async (priv_key, decrypted_priv_key) => {
  return iotaHandler(
    (async () => {
      const seed = decrypted_priv_key || crypto.decrypt(priv_key);
      const addresses = await client
        .getAddresses(seed)
        .accountIndex(0)
        .range(0, 1)
        .get();

      if (addresses && addresses.length > 0) {
        return addresses[0];
      } else {
        return null;
      }
    })()
  );
};

Iota.getBalance = async (address) => {
  return iotaHandler(
    (async () => {
      console.log("---address");
      console.log(address);
      const balance = await client.getAddressBalance(address);
      if (balance) {
        return balance;
      } else {
        return null;
      }
    })()
  );
};

Iota.sendFunds = async (seed, address, amount) => {
  return iotaHandler(
    (async () => {
      const priv_key_decr = crypto.decrypt(seed);

      console.log("tx amount", amount)

      let message;
      try {

        if(amount === 0){ 
          //TODO production 
          let zeroMsgIndex = (process.env.NODE_ENV !== "production") ? uuidv4() : uuidv4()//"TODO Help A Stranger is sending love."
          let zeroMsgData = (process.env.NODE_ENV !== "production") ? uuidv4() : `
           Thank you for showing a person in need love by walking up to him!
           Wondering why there are no funds in this donation?
           We can only make a limited number of micro-transactions on each address.
           This is a form of spam protection which is called dust protection in the IOTA world.
           If you want to donate funds to this address, please create an account.
           Thank you!
           `

          message = await client.message()
            .index(zeroMsgIndex)
            .data(zeroMsgData)
            .submit();
        } else if(amount >= IOTA_DUST_OUTPUT_ALLOWANCE){
          message = await client
            .message()
            .seed(priv_key_decr)
            .accountIndex(0)
            .dustAllowanceOutput(address, parseInt(amount))
            .submit();
        } else {
          message = await client
            .message()
            .seed(priv_key_decr)
            .accountIndex(0)
            .output(address, parseInt(amount))
            .submit();
        }

        if (message && message.messageId) {
          const tx = [{ hash: message.messageId }];
          return { tx };
        } else {
          return null;
        }
      } catch (err) {
        console.log(err);
        throw new Error("Transaction failed. Check balance or try later.");
      }
    })()
  );
};

Iota.createChecksum = (address) => address;

module.exports = Iota;
