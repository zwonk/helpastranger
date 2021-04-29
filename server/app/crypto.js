const crypto = require("crypto");

const algorithm = "aes-192-cbc";
const key = crypto.scryptSync(process.env.encKey, process.env.pepper, 24);

const encrypt = (text) => {
  if (!text) return { plain: null, encrypted: null };

  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  const encrypted_obj = {
    content: encrypted.toString("hex"),
    iv: iv.toString("hex"),
  };

  const concatenated_obj = encrypted_obj.content + " " + encrypted_obj.iv;
  return { plain: text, encrypted: concatenated_obj };
};

const decrypt = (hash) => {
  if (!hash) return null;

  const hash_arr = hash.split(" ");
  const hash_obj = { content: hash_arr[0], iv: hash_arr[1] };

  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(hash_obj.iv, "hex")
  );

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(hash_obj.content, "hex")),
    decipher.final(),
  ]);

  return decrpyted.toString();
};

module.exports = {
  encrypt,
  decrypt,
};
