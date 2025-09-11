-- Crear base de datos y usarla
CREATE DATABASE IF NOT EXISTS `smart_garden` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `smart_garden`;

-- Tabla Usuarios
CREATE TABLE IF NOT EXISTS `Usuarios` (
	`id` INT AUTO_INCREMENT PRIMARY KEY,
	`nombre` VARCHAR(255) NOT NULL,
	`correo` VARCHAR(255) NOT NULL UNIQUE,
	`contraseña` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla Tanques
CREATE TABLE IF NOT EXISTS `Tanques` (
	`id` INT AUTO_INCREMENT PRIMARY KEY,
	`nombre` VARCHAR(255) NOT NULL,
	`altura` DECIMAL(10, 2) NOT NULL,
	`ancho` DECIMAL(10, 2) NOT NULL,
	`usuario_id` INT,
	INDEX (`usuario_id`),
	CONSTRAINT `fk_tanques_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `Usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla Plantas
CREATE TABLE IF NOT EXISTS `Plantas` (
	`id` INT AUTO_INCREMENT PRIMARY KEY,
	`nombre` VARCHAR(255) NOT NULL,
	`tipo_de_planta` VARCHAR(255) NOT NULL,
	`fecha_cuidado` DATE,
	`tanque_id` INT,
	INDEX (`tanque_id`),
	CONSTRAINT `fk_plantas_tanque` FOREIGN KEY (`tanque_id`) REFERENCES `Tanques`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 