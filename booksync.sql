-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: booksync
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `favorito`
--

DROP TABLE IF EXISTS `favorito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorito` (
  `id_favorito` int unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` int unsigned NOT NULL,
  `id_libro` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_favorito`),
  UNIQUE KEY `uq_usuario_libro` (`id_usuario`,`id_libro`),
  KEY `fk_favorito_libro` (`id_libro`),
  CONSTRAINT `fk_favorito_libro` FOREIGN KEY (`id_libro`) REFERENCES `libro` (`id_libro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_favorito_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorito`
--

LOCK TABLES `favorito` WRITE;
/*!40000 ALTER TABLE `favorito` DISABLE KEYS */;
INSERT INTO `favorito` VALUES (3,3,6,'2026-05-27 16:45:52');
/*!40000 ALTER TABLE `favorito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario` (
  `id_inventario` int unsigned NOT NULL AUTO_INCREMENT,
  `id_libro` int unsigned NOT NULL,
  `stock_actual` int unsigned DEFAULT NULL,
  `stock_minimo` int unsigned DEFAULT NULL,
  `stock_maximo` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id_inventario`),
  KEY `fk_inventario_libro` (`id_libro`),
  CONSTRAINT `fk_inventario_libro` FOREIGN KEY (`id_libro`) REFERENCES `libro` (`id_libro`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario`
--

LOCK TABLES `inventario` WRITE;
/*!40000 ALTER TABLE `inventario` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `libro`
--

DROP TABLE IF EXISTS `libro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `libro` (
  `id_libro` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) DEFAULT NULL,
  `author` varchar(200) DEFAULT NULL,
  `genre` varchar(100) DEFAULT NULL,
  `publication_year` year DEFAULT NULL,
  `available_quantity` int unsigned DEFAULT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `status` enum('disponible','prestado','dañado','inactivo') DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `cover` varchar(255) DEFAULT NULL,
  `total_quantity` int NOT NULL DEFAULT '0',
  `editorial` varchar(200) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id_libro`),
  UNIQUE KEY `isbn` (`isbn`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `libro`
--

LOCK TABLES `libro` WRITE;
/*!40000 ALTER TABLE `libro` DISABLE KEYS */;
INSERT INTO `libro` VALUES (5,'Utopía','Andre Hiotis','Filosofía',2017,2,'9781532834509','disponible','Sala 2 - A3','/uploads/libros/utopia.jpg',3,'Fondo de Cultura Económica','Reflexión profunda sobre la búsqueda de sociedades ideales y los dilemas de la modernidad.'),(6,'La metamorfosis','Kafka','Ficción de terror',2017,1,'97898975661912','disponible','Sala 1 - B1','/uploads/libros/metamorfosis.jpg',1,'Verlag Kurt Wolff','Gregor Samsa se despierta convertido en un insecto gigante. Metáfora sobre la alienación moderna.'),(7,'Tan poca vida','Yanagihara','Novela',2017,1,'9788426403278','disponible','Sala 3 - C2','/uploads/libros/tan-poca-vida.jpg',1,'Doubleday','Una historia de amistad y dolor, de vidas entrelazadas y heridas que perduran.'),(21,'Clean Code','Robert C. Martin','Programación',2008,5,'123456','disponible','A1','/uploads/libros/clean-code.jpg',5,NULL,NULL),(28,'Cien años de soledad','Gabriel García Márquez','Realismo mágico',1967,5,'978-0-06-088328-7','inactivo','Estante A-12','https://ejemplo.com/portada.jpg',5,'Editorial Sudamericana','Una obra maestra de la literatura latinoamericana.'),(29,'libro de prueba','kevin','tecnologia',2026,5,'1111111111111','inactivo','virtual','sinurl',5,'sena','Libro de prueba para la documentacion de casos de prueba');
/*!40000 ALTER TABLE `libro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificacion`
--

DROP TABLE IF EXISTS `notificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificacion` (
  `id_notificacion` int unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` int unsigned NOT NULL,
  `mensaje` text NOT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('pendiente','leida') DEFAULT 'pendiente',
  PRIMARY KEY (`id_notificacion`),
  KEY `fk_notificacion_usuario` (`id_usuario`),
  CONSTRAINT `fk_notificacion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificacion`
--

LOCK TABLES `notificacion` WRITE;
/*!40000 ALTER TABLE `notificacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prestamo`
--

DROP TABLE IF EXISTS `prestamo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prestamo` (
  `id_prestamo` int unsigned NOT NULL AUTO_INCREMENT,
  `id_reserva` int unsigned DEFAULT NULL,
  `id_usuario` int unsigned NOT NULL,
  `id_libro` int unsigned NOT NULL,
  `fecha_prestamo` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_devolucion` datetime DEFAULT NULL,
  `estado` enum('activo','devuelto','vencido') DEFAULT 'activo',
  `fecha_devolucion_real` datetime DEFAULT NULL,
  PRIMARY KEY (`id_prestamo`),
  KEY `fk_prestamo_usuario` (`id_usuario`),
  KEY `fk_prestamo_libro` (`id_libro`),
  KEY `fk_prestamo_reserva` (`id_reserva`),
  CONSTRAINT `fk_prestamo_libro` FOREIGN KEY (`id_libro`) REFERENCES `libro` (`id_libro`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_prestamo_reserva` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`),
  CONSTRAINT `fk_prestamo_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ck_prestamo_fechas` CHECK (((`fecha_devolucion` is null) or (`fecha_devolucion` >= `fecha_prestamo`)))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prestamo`
--

LOCK TABLES `prestamo` WRITE;
/*!40000 ALTER TABLE `prestamo` DISABLE KEYS */;
INSERT INTO `prestamo` VALUES (1,6,3,21,'2026-05-26 19:17:21','2026-06-02 19:17:21','devuelto','2026-05-26 19:18:27'),(2,8,3,6,'2026-05-27 11:47:09','2026-06-03 11:47:09','devuelto','2026-05-27 11:47:58'),(3,9,3,7,'2026-06-03 11:18:46','2026-06-10 11:18:46','devuelto','2026-06-03 11:19:29');
/*!40000 ALTER TABLE `prestamo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reporte`
--

DROP TABLE IF EXISTS `reporte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reporte` (
  `id_reporte` int unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` int unsigned NOT NULL,
  `tipo` enum('mensual','personal','inventario') NOT NULL,
  `fecha_generacion` date NOT NULL,
  `contenido` text,
  `estado` enum('activo','cerrado') DEFAULT 'activo',
  PRIMARY KEY (`id_reporte`),
  KEY `fk_reporte_usuario` (`id_usuario`),
  CONSTRAINT `fk_reporte_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reporte`
--

LOCK TABLES `reporte` WRITE;
/*!40000 ALTER TABLE `reporte` DISABLE KEYS */;
/*!40000 ALTER TABLE `reporte` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reserva`
--

DROP TABLE IF EXISTS `reserva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reserva` (
  `id_reserva` int unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` int unsigned NOT NULL,
  `id_libro` int unsigned NOT NULL,
  `fecha_reserva` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `estado` enum('activa','confirmada','cancelada','expirada','prestada') NOT NULL DEFAULT 'activa',
  PRIMARY KEY (`id_reserva`),
  UNIQUE KEY `uk_reserva_unica` (`id_usuario`,`id_libro`,`fecha_reserva`),
  KEY `idx_reserva_usuario_estado` (`id_usuario`,`estado`),
  KEY `idx_reserva_estado_exp` (`estado`,`expires_at`),
  KEY `idx_reserva_libro` (`id_libro`),
  CONSTRAINT `fk_reserva_libro` FOREIGN KEY (`id_libro`) REFERENCES `libro` (`id_libro`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_reserva_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reserva`
--

LOCK TABLES `reserva` WRITE;
/*!40000 ALTER TABLE `reserva` DISABLE KEYS */;
INSERT INTO `reserva` VALUES (1,3,21,'2026-05-08 16:31:16','2026-05-10 00:31:16',NULL,'2026-05-08 16:47:59','cancelada'),(2,3,5,'2026-05-08 16:53:18','2026-05-10 00:53:18','2026-05-08 16:53:43',NULL,'confirmada'),(3,3,21,'2026-05-09 08:34:18','2026-05-10 16:34:18',NULL,'2026-05-09 08:35:14','cancelada'),(4,3,21,'2026-05-11 15:52:28','2026-05-12 23:52:28',NULL,'2026-05-11 15:53:35','cancelada'),(5,3,21,'2026-05-11 16:24:08','2026-05-13 00:24:08',NULL,'2026-05-11 16:24:12','cancelada'),(6,3,21,'2026-05-11 23:20:18','2026-05-13 07:20:18','2026-05-11 23:22:15',NULL,'prestada'),(7,3,6,'2026-05-26 19:16:46','2026-05-28 03:16:46',NULL,'2026-05-27 11:45:32','cancelada'),(8,3,6,'2026-05-27 11:45:53','2026-05-28 19:45:53','2026-05-27 11:47:04',NULL,'prestada'),(9,3,7,'2026-05-29 18:36:49','2026-05-31 02:36:49','2026-05-29 18:37:56',NULL,'prestada');
/*!40000 ALTER TABLE `reserva` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesion`
--

DROP TABLE IF EXISTS `sesion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesion` (
  `id_sesion` int unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` int unsigned NOT NULL,
  `inicio` datetime NOT NULL,
  `fin` datetime DEFAULT NULL,
  PRIMARY KEY (`id_sesion`),
  KEY `ix_sesion_usuario_inicio` (`id_usuario`,`inicio`),
  CONSTRAINT `fk_sesion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesion`
--

LOCK TABLES `sesion` WRITE;
/*!40000 ALTER TABLE `sesion` DISABLE KEYS */;
/*!40000 ALTER TABLE `sesion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `tipo` enum('administrador','bibliotecario','usuario') NOT NULL,
  `estado` enum('activo','inactivo','bloqueado') DEFAULT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `tipo_documento` enum('CC','TI') DEFAULT NULL,
  `numero_documento` varchar(30) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (3,'kevin','kevin@booksync.com','$2b$10$uqyNaA4u6loWe/KzCs.BCuXDS5a5UaXxarYgHoCbWNt8/jmqpHdpW','administrador','activo','Lara','CC','10700045555','2004-06-27'),(16,'Juan','juan@email.com','$2b$10$phiq74.WoO/3p3dMM6ZWb.rlQVorvevixlLzt3Dr5sIJDH.vEZSLG','usuario','inactivo','García','CC','1234567890','2000-05-15'),(17,'juanito','juanito@gmail.com','$2b$10$JFjAGFeQPX85ki2zPLbNuOljk9WGKDB4Ia6capEQsYdUzQEIHw9Zy','usuario','inactivo','perez','CC','123456789','2002-06-05'),(18,'juanita','lol@gmail.com','$2b$10$NlKt578wGV2Wo1JCifoexuop/yL51QKg3uCAEzRWVYWIvDLjf.ADu','usuario','inactivo','perez','CC','1070004611','2026-05-01'),(19,'test','kevinesteven0627@gmail.com','$2b$10$NCreFPtqrmJFFDmLELtWCO8QqdH5MYaDBFvxWgszEwrSUnn4dsLda','usuario','activo','mento','CC','0000000000000000','2026-05-11');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-24 15:57:58
