import bcrypt from 'bcryptjs';

class HashProvider {
  async hashPassword(plainText: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainText, salt);
    return { salt, hashedPassword };
  }

  async checkPassword(plainText: string, hash: string) {
    return await bcrypt.compare(plainText, hash);
  }
}

export default new HashProvider();
