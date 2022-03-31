CREATE DATABASE IF NOT EXISTS soy_fri_comercios;
USE soy_fri_comercios;

CREATE TABLE IF NOT EXISTS Users (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `username` VARCHAR(255) NOT NULL,
    `emailAddress` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    `status` VARCHAR(255) NOT NULL,
    `createdDate` DATETIME NOT NULL,
    `updatedDate` DATETIME DEFAULT NULL,
    `phone` int NULL,
    `pic` VARCHAR(255) NULL,
    `resetPasswordToken` int NULL,
    PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS FriUsers (
	`id` int NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `lastname` VARCHAR(255) NOT NULL,
    `avatar` VARCHAR(255) NOT NULL,
    `countryCode` VARCHAR(5) NOT NULL,
    `phoneNumber` int NULL,
    `emailAddress` VARCHAR(255) NOT NULL UNIQUE,
    PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS PaymentRequests (
	`id` int NOT NULL AUTO_INCREMENT,
    `friUserId` int NOT NULL,
    `reference` int NULL,
    `format` VARCHAR(255) NULL,
    `amount` DECIMAL (10,2) NOT NULL,    
    `userIdCreated` int NULL,
    PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS Transactions (
	`id` int NOT NULL AUTO_INCREMENT,
    `businessId` int NULL,
    `businessUserId` int NULL,
    `paymentRequestId` int NULL,
    `creationDate` DATETIME NOT NULL,
    `status` VARCHAR(255) DEFAULT 0 NOT NULL,
    `closingId` int NULL,
    PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS Closings (
	`id` int NOT NULL AUTO_INCREMENT,
    `closingDate` DATETIME NULL,
    `completionDate` DATETIME NULL,
    `userId` int NOT NULL,
    `format` VARCHAR(255) NULL,
    `amount` DECIMAL(10,2) NULL,
    `status` VARCHAR(255) DEFAULT 0 NOT NULL,
    `transactions` int NOT NULL,
    `completions` int NOT NULL,
    `cancelations` int NOT NULL,
    `rejections` int NOT NULL,
    `refunds` int NOT NULL,
    PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS Business (
	`id` int NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `avatar` VARCHAR(255) NULL,
    `userId` int NULL,
    PRIMARY KEY(`id`)
);