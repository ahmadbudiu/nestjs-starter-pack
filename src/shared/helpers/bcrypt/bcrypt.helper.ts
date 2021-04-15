import * as bcrypt from 'bcrypt';

export class BcryptHelper {
  static async hash(str) {
    return await bcrypt.hash(str, 10);
  }

  static async compare(str, hash) {
    return await bcrypt.compare(str, hash);
  }
}
