/*
  Warnings:

  - You are about to alter the column `month` on the `meterreading` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `DateTime(3)`.
  - You are about to alter the column `user_id` on the `tenant` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `user_id` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `tenant` DROP FOREIGN KEY `Tenant_user_id_fkey`;

-- DropIndex
DROP INDEX `Tenant_user_id_fkey` ON `tenant`;

-- AlterTable
ALTER TABLE `meterreading` MODIFY `month` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `tenant` MODIFY `user_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    MODIFY `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`user_id`);

-- AddForeignKey
ALTER TABLE `Tenant` ADD CONSTRAINT `Tenant_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
