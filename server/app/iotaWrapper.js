const Iota = parseInt(process.env.IOTA_CHRYSALIS)
  ? require("./iota-chrysalis.js")
  : require("./iota-devnet.js");
//const DevNetIota = require("./iota-devnet.js");

function IotaWrapper() {
  
  this.iotaGetAllAddresses = Iota.getAllAddresses

  this.iotaSend = async (req) => {
    if (parseInt(process.env.IOTA_CHRYSALIS)) {
      const { priv_key, address, amount } = req.body;
      return Iota.sendFunds(priv_key, address, amount);
    } else {
      const {
        priv_key,
        address,
        amount,
        source_address,
        source_address_index,
        addressIndexIteration,
        nextAddress,
      } = req.body;
      return Iota.sendFunds(
        priv_key,
        address,
        amount,
        source_address,
        source_address_index,
        addressIndexIteration,
        nextAddress
      );
    }
  };

  this.iotaGetBalance = async (req) => {
    const { curr_public_key } = req.body;

    if (parseInt(process.env.IOTA_CHRYSALIS)) {

      const balance = await Iota.getBalance(curr_public_key);

      if (balance == null || balance.balance == null) {
        return { error: "No balance found." };
      }

      if (balance.error) {
        return { error: balance.error };
      }

      return { balance };
    } else {
      const balance = await Iota.getBalance(curr_public_key);

      if (!balance || !balance.balances || balance.balances.length === 0) {
        return { error: "No balances found." };
      }

      if (balance.error) {
        return { error: balance.error };
      }

      return { balance: balance.balances[0] };
    }
  };

  this.iotaGetAddress = async (req) => {
    const { priv_key, decrypted_priv_key } = req.body;
    return Iota.getAddress(priv_key, decrypted_priv_key);
  };

  this.iotaGenerateSeed = () => {
    return Iota.generateSeed();
  };

  this.iotaCreateChecksum = (req) => {
    const { address } = req.body;
    return Iota.createChecksum(address);
  };

  this.iotaValidAddress = (req) => {
    const { address }  = req.body
    return Iota.isValidAddress(address);
  }
}

const iotaWrapper = new IotaWrapper();
module.exports = iotaWrapper;
