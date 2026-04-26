import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;
const CODE_SALT_ROUNDS = 8;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function hashEmailCode(code: string): Promise<string> {
  return bcrypt.hash(code, CODE_SALT_ROUNDS);
}

export async function verifyEmailCode(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}
