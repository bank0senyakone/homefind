/*
  Warnings:

  - The primary key for the `checkin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `checkInDate` on the `checkin` table. All the data in the column will be lost.
  - You are about to drop the column `checkInId` on the `checkin` table. All the data in the column will be lost.
  - You are about to drop the column `contractId` on the `checkin` table. All the data in the column will be lost.
  - The primary key for the `checkout` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `checkOutId` on the `checkout` table. All the data in the column will be lost.
  - You are about to drop the column `contractId` on the `checkout` table. All the data in the column will be lost.
  - The primary key for the `contract` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `constractId` on the `contract` table. All the data in the column will be lost.
  - You are about to drop the column `outstanding` on the `contract` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `contract` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `contract` table. All the data in the column will be lost.
  - You are about to alter the column `depositAmount` on the `contract` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - The primary key for the `meterreading` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `contracId` on the `meterreading` table. All the data in the column will be lost.
  - You are about to drop the column `meterReadingId` on the `meterreading` table. All the data in the column will be lost.
  - You are about to drop the column `recordeDate` on the `meterreading` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `meterreading` table. All the data in the column will be lost.
  - You are about to alter the column `month` on the `meterreading` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - The primary key for the `outstandingpayment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `contractId` on the `outstandingpayment` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `outstandingpayment` table. All the data in the column will be lost.
  - You are about to alter the column `amountDue` on the `outstandingpayment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - The values [partial] on the enum `OutstandingPayment_status` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `payment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `contractId` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `payment` table. All the data in the column will be lost.
  - You are about to alter the column `totalAmount` on the `payment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - The primary key for the `paymentitem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `paymentId` on the `paymentitem` table. All the data in the column will be lost.
  - You are about to drop the column `paymentItemid` on the `paymentitem` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `paymentitem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - The primary key for the `paymentslip` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `paymentId` on the `paymentslip` table. All the data in the column will be lost.
  - You are about to drop the column `paymentSlipid` on the `paymentslip` table. All the data in the column will be lost.
  - The primary key for the `room` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `floor` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `roomNumder` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `roomTypeId` on the `room` table. All the data in the column will be lost.
  - The values [occupied,maintenance] on the enum `Room_status` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `tenant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fullName` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `idCardNumber` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `idCardNumberImageUrl` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `tenant` table. All the data in the column will be lost.
  - You are about to alter the column `phone` on the `tenant` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - The primary key for the `utilityrate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `utilityrate` table. All the data in the column will be lost.
  - You are about to alter the column `ratePerUnit` on the `utilityrate` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to drop the `roomdetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roomtype` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userdemo` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[contract_id]` on the table `CheckIn` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contract_id]` on the table `CheckOut` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[payment_id]` on the table `PaymentSlip` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `checkInData` to the `CheckIn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checkIn_id` to the `CheckIn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contract_id` to the `CheckIn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checkOut_id` to the `CheckOut` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contract_id` to the `CheckOut` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contract_id` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `room_id` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contract_id` to the `MeterReading` table without a default value. This is not possible if the table is not empty.
  - Added the required column `meterReading_id` to the `MeterReading` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordedDate` to the `MeterReading` table without a default value. This is not possible if the table is not empty.
  - Added the required column `room_id` to the `MeterReading` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contract_id` to the `OutstandingPayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outstandingPayment_id` to the `OutstandingPayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contract_id` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_id` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentItem_id` to the `PaymentItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_id` to the `PaymentItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentSlip_id` to the `PaymentSlip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_id` to the `PaymentSlip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomNumber` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `room_id` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idcard` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `utilityRate_id` to the `UtilityRate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `checkin` DROP FOREIGN KEY `CheckIn_contractId_fkey`;

-- DropForeignKey
ALTER TABLE `checkout` DROP FOREIGN KEY `CheckOut_contractId_fkey`;

-- DropForeignKey
ALTER TABLE `contract` DROP FOREIGN KEY `Contract_roomId_fkey`;

-- DropForeignKey
ALTER TABLE `contract` DROP FOREIGN KEY `Contract_tenantId_fkey`;

-- DropForeignKey
ALTER TABLE `meterreading` DROP FOREIGN KEY `MeterReading_contracId_fkey`;

-- DropForeignKey
ALTER TABLE `meterreading` DROP FOREIGN KEY `MeterReading_roomId_fkey`;

-- DropForeignKey
ALTER TABLE `outstandingpayment` DROP FOREIGN KEY `OutstandingPayment_contractId_fkey`;

-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `Payment_contractId_fkey`;

-- DropForeignKey
ALTER TABLE `paymentitem` DROP FOREIGN KEY `PaymentItem_paymentId_fkey`;

-- DropForeignKey
ALTER TABLE `paymentslip` DROP FOREIGN KEY `PaymentSlip_paymentId_fkey`;

-- DropForeignKey
ALTER TABLE `room` DROP FOREIGN KEY `Room_roomTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `roomdetail` DROP FOREIGN KEY `RoomDetail_roomId_fkey`;

-- DropIndex
DROP INDEX `CheckIn_contractId_key` ON `checkin`;

-- DropIndex
DROP INDEX `CheckOut_contractId_key` ON `checkout`;

-- DropIndex
DROP INDEX `Contract_roomId_fkey` ON `contract`;

-- DropIndex
DROP INDEX `Contract_tenantId_fkey` ON `contract`;

-- DropIndex
DROP INDEX `MeterReading_contracId_fkey` ON `meterreading`;

-- DropIndex
DROP INDEX `MeterReading_roomId_fkey` ON `meterreading`;

-- DropIndex
DROP INDEX `OutstandingPayment_contractId_fkey` ON `outstandingpayment`;

-- DropIndex
DROP INDEX `Payment_contractId_fkey` ON `payment`;

-- DropIndex
DROP INDEX `PaymentItem_paymentId_fkey` ON `paymentitem`;

-- DropIndex
DROP INDEX `PaymentSlip_paymentId_key` ON `paymentslip`;

-- DropIndex
DROP INDEX `Room_roomTypeId_fkey` ON `room`;

-- AlterTable
ALTER TABLE `checkin` DROP PRIMARY KEY,
    DROP COLUMN `checkInDate`,
    DROP COLUMN `checkInId`,
    DROP COLUMN `contractId`,
    ADD COLUMN `checkInData` DATETIME(3) NOT NULL,
    ADD COLUMN `checkIn_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `contract_id` INTEGER NOT NULL,
    MODIFY `remarks` TEXT NULL,
    ADD PRIMARY KEY (`checkIn_id`);

-- AlterTable
ALTER TABLE `checkout` DROP PRIMARY KEY,
    DROP COLUMN `checkOutId`,
    DROP COLUMN `contractId`,
    ADD COLUMN `checkOut_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `contract_id` INTEGER NOT NULL,
    MODIFY `remarks` TEXT NULL,
    ADD PRIMARY KEY (`checkOut_id`);

-- AlterTable
ALTER TABLE `contract` DROP PRIMARY KEY,
    DROP COLUMN `constractId`,
    DROP COLUMN `outstanding`,
    DROP COLUMN `roomId`,
    DROP COLUMN `tenantId`,
    ADD COLUMN `contract_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `room_id` INTEGER NOT NULL,
    ADD COLUMN `tenant_id` INTEGER NOT NULL,
    MODIFY `depositAmount` DECIMAL(10, 2) NOT NULL,
    MODIFY `status` ENUM('active', 'expired', 'terminated') NOT NULL,
    ADD PRIMARY KEY (`contract_id`);

-- AlterTable
ALTER TABLE `meterreading` DROP PRIMARY KEY,
    DROP COLUMN `contracId`,
    DROP COLUMN `meterReadingId`,
    DROP COLUMN `recordeDate`,
    DROP COLUMN `roomId`,
    ADD COLUMN `contract_id` INTEGER NOT NULL,
    ADD COLUMN `meterReading_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `recordedDate` DATETIME(3) NOT NULL,
    ADD COLUMN `room_id` INTEGER NOT NULL,
    MODIFY `month` VARCHAR(20) NOT NULL,
    MODIFY `waterOld` DECIMAL(10, 2) NOT NULL,
    MODIFY `waterNew` DECIMAL(10, 2) NOT NULL,
    MODIFY `electricOld` DECIMAL(10, 2) NOT NULL,
    MODIFY `electricNew` DECIMAL(10, 2) NOT NULL,
    ADD PRIMARY KEY (`meterReading_id`);

-- AlterTable
ALTER TABLE `outstandingpayment` DROP PRIMARY KEY,
    DROP COLUMN `contractId`,
    DROP COLUMN `id`,
    ADD COLUMN `contract_id` INTEGER NOT NULL,
    ADD COLUMN `outstandingPayment_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `amountDue` DECIMAL(10, 2) NOT NULL,
    MODIFY `status` ENUM('unpaid', 'partially_paid', 'paid', 'overdue') NOT NULL,
    ADD PRIMARY KEY (`outstandingPayment_id`);

-- AlterTable
ALTER TABLE `payment` DROP PRIMARY KEY,
    DROP COLUMN `contractId`,
    DROP COLUMN `paymentId`,
    DROP COLUMN `status`,
    ADD COLUMN `contract_id` INTEGER NOT NULL,
    ADD COLUMN `payment_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `totalAmount` DECIMAL(10, 2) NOT NULL,
    ADD PRIMARY KEY (`payment_id`);

-- AlterTable
ALTER TABLE `paymentitem` DROP PRIMARY KEY,
    DROP COLUMN `paymentId`,
    DROP COLUMN `paymentItemid`,
    ADD COLUMN `paymentItem_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `payment_id` INTEGER NOT NULL,
    MODIFY `description` VARCHAR(255) NOT NULL,
    MODIFY `amount` DECIMAL(10, 2) NOT NULL,
    ADD PRIMARY KEY (`paymentItem_id`);

-- AlterTable
ALTER TABLE `paymentslip` DROP PRIMARY KEY,
    DROP COLUMN `paymentId`,
    DROP COLUMN `paymentSlipid`,
    ADD COLUMN `paymentSlip_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `payment_id` INTEGER NOT NULL,
    MODIFY `slipImageUrl` VARCHAR(255) NOT NULL,
    ADD PRIMARY KEY (`paymentSlip_id`);

-- AlterTable
ALTER TABLE `room` DROP PRIMARY KEY,
    DROP COLUMN `floor`,
    DROP COLUMN `roomId`,
    DROP COLUMN `roomNumder`,
    DROP COLUMN `roomTypeId`,
    ADD COLUMN `roomNumber` VARCHAR(255) NOT NULL,
    ADD COLUMN `room_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `status` ENUM('available', 'rented', 'under_maintenance') NOT NULL,
    ADD PRIMARY KEY (`room_id`);

-- AlterTable
ALTER TABLE `tenant` DROP PRIMARY KEY,
    DROP COLUMN `fullName`,
    DROP COLUMN `idCardNumber`,
    DROP COLUMN `idCardNumberImageUrl`,
    DROP COLUMN `tenantId`,
    ADD COLUMN `Census` TEXT NULL,
    ADD COLUMN `idcard` VARCHAR(50) NOT NULL,
    ADD COLUMN `name` VARCHAR(50) NOT NULL,
    ADD COLUMN `profile` VARCHAR(255) NULL,
    ADD COLUMN `tenant_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `user_id` VARCHAR(191) NOT NULL,
    MODIFY `phone` VARCHAR(20) NOT NULL,
    MODIFY `email` VARCHAR(255) NOT NULL,
    MODIFY `address` TEXT NOT NULL,
    ADD PRIMARY KEY (`tenant_id`);

-- AlterTable
ALTER TABLE `utilityrate` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `utilityRate_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `ratePerUnit` DECIMAL(10, 2) NOT NULL,
    ADD PRIMARY KEY (`utilityRate_id`);

-- DropTable
DROP TABLE `roomdetail`;

-- DropTable
DROP TABLE `roomtype`;

-- DropTable
DROP TABLE `user`;

-- DropTable
DROP TABLE `userdemo`;

-- CreateTable
CREATE TABLE `Users` (
    `user_id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phoneNumber` VARCHAR(20) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `profile` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Users_email_key`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoomDetails` (
    `roomdetail_id` INTEGER NOT NULL AUTO_INCREMENT,
    `room_id` INTEGER NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `earnestmoney` DECIMAL(10, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `price` DECIMAL(10, 2) NOT NULL,
    `floor` TINYINT NOT NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `RoomDetails_room_id_key`(`room_id`),
    PRIMARY KEY (`roomdetail_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Problem_notification` (
    `Problem_id` INTEGER NOT NULL AUTO_INCREMENT,
    `room_id` INTEGER NOT NULL,
    `tenant_id` INTEGER NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    `Problem_notification_date` DATETIME(3) NOT NULL,
    `status` ENUM('pending', 'in_progress', 'resolved') NOT NULL,
    `description` TEXT NULL,

    PRIMARY KEY (`Problem_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CheckoutProblem` (
    `problem_id` INTEGER NOT NULL AUTO_INCREMENT,
    `checkout_id` INTEGER NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `status` ENUM('new', 'resolved', 'damage') NOT NULL,
    `damage_cost` DECIMAL(10, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`problem_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `CheckIn_contract_id_key` ON `CheckIn`(`contract_id`);

-- CreateIndex
CREATE UNIQUE INDEX `CheckOut_contract_id_key` ON `CheckOut`(`contract_id`);

-- CreateIndex
CREATE UNIQUE INDEX `PaymentSlip_payment_id_key` ON `PaymentSlip`(`payment_id`);

-- AddForeignKey
ALTER TABLE `Tenant` ADD CONSTRAINT `Tenant_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomDetails` ADD CONSTRAINT `RoomDetails_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `Room`(`room_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contract` ADD CONSTRAINT `Contract_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `Tenant`(`tenant_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contract` ADD CONSTRAINT `Contract_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `Room`(`room_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Problem_notification` ADD CONSTRAINT `Problem_notification_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `Tenant`(`tenant_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Problem_notification` ADD CONSTRAINT `Problem_notification_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `Room`(`room_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MeterReading` ADD CONSTRAINT `MeterReading_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `Room`(`room_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MeterReading` ADD CONSTRAINT `MeterReading_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `Contract`(`contract_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CheckIn` ADD CONSTRAINT `CheckIn_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `Contract`(`contract_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CheckOut` ADD CONSTRAINT `CheckOut_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `Contract`(`contract_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CheckoutProblem` ADD CONSTRAINT `CheckoutProblem_checkout_id_fkey` FOREIGN KEY (`checkout_id`) REFERENCES `CheckOut`(`checkOut_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `Contract`(`contract_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentItem` ADD CONSTRAINT `PaymentItem_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `Payment`(`payment_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OutstandingPayment` ADD CONSTRAINT `OutstandingPayment_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `Contract`(`contract_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentSlip` ADD CONSTRAINT `PaymentSlip_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `Payment`(`payment_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
