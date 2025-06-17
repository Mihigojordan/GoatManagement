-- CreateTable
CREATE TABLE `Admin` (
    `id` VARCHAR(191) NOT NULL,
    `names` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Admin_names_key`(`names`),
    UNIQUE INDEX `Admin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Goat` (
    `id` VARCHAR(191) NOT NULL,
    `goatName` VARCHAR(191) NOT NULL,
    `breed` VARCHAR(191) NOT NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `Gender` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `weight` DOUBLE NULL,
    `sireName` VARCHAR(191) NULL,
    `sireRegistrationNumber` VARCHAR(191) NULL,
    `damName` VARCHAR(191) NULL,
    `damRegistrationNumber` VARCHAR(191) NULL,
    `breederName` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `status` ENUM('checkedin', 'checkout') NOT NULL DEFAULT 'checkedin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
