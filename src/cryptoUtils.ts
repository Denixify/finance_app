import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_CRYPTO_SECRET || "fallback-secret-key";

export const encryptData = <T>(data: T): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

export const decryptData = <T>(encryptedText: string): T | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString) as T;
  } catch (error) {
    console.error("Ошибка расшифровки данных:", error);
    return null;
  }
};
