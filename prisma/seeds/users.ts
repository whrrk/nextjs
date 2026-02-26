// primsa.対象テーブル名.メソッド のように記述
import { prisma } from "../../src/lib/prisma";
import * as bcrypt from "bcryptjs";

export async function seedUsers() {
  // クリーンアップ
  await prisma.user.deleteMany();
  const hashedPassword = await bcrypt.hash("password123", 12); // 暗号化

  // ユーザー作成
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
      password: hashedPassword,
      role: "USER",
    },
  });
  console.log({ adminUser, user });

  const allUsers = await prisma.user.findMany();
  console.log("Available users:", allUsers);
}
