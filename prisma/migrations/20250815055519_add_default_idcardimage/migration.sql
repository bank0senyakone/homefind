/*
  Warnings:

  - You are about to drop the column `idCardNumeberImageUrl` on the `tenant` table. All the data in the column will be lost.
  - Added the required column `idCardNumberImageUrl` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tenant` DROP COLUMN `idCardNumeberImageUrl`,
    ADD COLUMN `idCardNumberImageUrl` VARCHAR(191) NOT NULL;
