/*
  Warnings:

  - You are about to drop the column `damName` on the `goat` table. All the data in the column will be lost.
  - You are about to drop the column `sireName` on the `goat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `goat` DROP COLUMN `damName`,
    DROP COLUMN `sireName`,
    ADD COLUMN `note` VARCHAR(191) NOT NULL DEFAULT 'no pest and diseases ';
