-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: centuryply
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
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `file_type` varchar(255) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `size` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `uploaded_at` datetime(6) NOT NULL,
  `uploaded_by` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` VALUES (4,'png','1782898646499-CENT-PLY-GHY.png',1173838,'CENT-PLY-GHY.png','2026-07-01 09:37:26.519771','superadmin'),(5,'xlsx','1782898877396-IT_Asset_ITSM_Dashboard_Guwahati.xlsx',103827,'IT_Asset_ITSM_Dashboard_Guwahati.xlsx','2026-07-01 09:41:17.400746','admin'),(11,'pdf','1782988599300-Century_Ply_Diagram.pdf',1113814,'Century_Ply_Diagram.pdf','2026-07-02 10:36:39.311796','superadmin'),(12,'docx','1782988715230-Data Center Temperature Monitoring Dashboard.docx',59427,'Data Center Temperature Monitoring Dashboard.docx','2026-07-02 10:38:35.233648','superadmin'),(13,'pdf','1782988750702-20260515152344.pdf',961601,'20260515152344.pdf','2026-07-02 10:39:10.707982','superadmin'),(14,'pdf','1782988815797-Order-Guwahati.pdf',2341366,'Order-Guwahati.pdf','2026-07-02 10:40:15.809258','superadmin'),(16,'pptx','1783142218267-Network map.pptx',1300532,'Network map.pptx','2026-07-04 05:16:58.281229','superadmin'),(17,'xlsx','1783326995893-Asset Register_standard format-ISO.xlsx',17187,'Asset Register_standard format-ISO.xlsx','2026-07-06 08:36:35.906124','admin');
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incidents`
--

DROP TABLE IF EXISTS `incidents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incidents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assigned_to` bigint DEFAULT NULL,
  `closed_at` datetime(6) DEFAULT NULL,
  `closed_by` bigint DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `created_by` bigint NOT NULL,
  `department` enum('HR','ACCOUNTS','IT') NOT NULL,
  `description` text NOT NULL,
  `employee_comment` text,
  `incident_number` varchar(255) NOT NULL,
  `priority` enum('LOW','MEDIUM','HIGH') NOT NULL,
  `status` enum('OPEN','IN_PROGRESS','PENDING_REVIEW','CLOSED') NOT NULL,
  `title` varchar(255) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_swgqxno17jy5wuklr3w2vwt5e` (`incident_number`),
  KEY `FK3t6skjqylf4i79o5k5mihjg1w` (`assigned_to`),
  KEY `FKjs8lkhnveeiwf6rshc4p6nlwq` (`closed_by`),
  KEY `FKehb71to4ns52r63q9n40dio01` (`created_by`),
  CONSTRAINT `FK3t6skjqylf4i79o5k5mihjg1w` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`),
  CONSTRAINT `FKehb71to4ns52r63q9n40dio01` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKjs8lkhnveeiwf6rshc4p6nlwq` FOREIGN KEY (`closed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incidents`
--

LOCK TABLES `incidents` WRITE;
/*!40000 ALTER TABLE `incidents` DISABLE KEYS */;
INSERT INTO `incidents` VALUES (1,8,'2026-07-06 09:47:58.468972',2,'2026-07-06 07:00:26.078654',2,'IT','fix asap\n','done','CPLY0001','HIGH','CLOSED','fix ip camera issue in main gate','2026-07-06 09:47:58.469969'),(3,8,'2026-07-07 06:56:53.996441',2,'2026-07-06 08:42:14.051947',2,'ACCOUNTS','ww',NULL,'CPLY0002','MEDIUM','CLOSED','ww','2026-07-07 06:56:53.998423'),(4,8,'2026-07-07 06:04:46.824114',1,'2026-07-06 09:02:02.924379',2,'IT','fff','fixed issue','CPLY0003','MEDIUM','CLOSED','fff','2026-07-07 06:04:46.827123'),(5,3,NULL,NULL,'2026-07-06 10:08:44.837671',2,'IT','fix it',NULL,'CPLY0004','HIGH','IN_PROGRESS','printer issue','2026-07-06 10:21:04.812403'),(6,8,'2026-07-07 07:00:08.814774',2,'2026-07-07 04:44:49.138587',2,'HR','pp','done','CPLY0005','HIGH','CLOSED','pop','2026-07-07 07:00:08.816081');
/*!40000 ALTER TABLE `incidents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('SUPER_ADMIN','ADMIN','EMPLOYEE') DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_r43af9ap4edm43mmtq01oddj6` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,_binary '','superadmin@centuryply.com','Super Admin','$2a$10$KTx5Tmc/wKVywTs1TaMtju3dYkyoiajaO1nOcDW2mamjCMRcRBJTm','SUPER_ADMIN','superadmin'),(2,_binary '','admin@centuryply.com','Admin User','$2a$10$nv.8AiZuRCBCUg6CPpV8WeFYMjHbXQcaRvbqrA1ULyXcT9hhjYF.a','ADMIN','admin'),(3,_binary '','employee@centuryply.com','Employee User','$2a$10$kO8gzXC4/KbeHArKkdOe7up738iHged5DRuf0rhUBoCyggWnPKKK6','EMPLOYEE','employee'),(8,_binary '','nayan123@gmail.com','nayanmoni','$2a$10$CT7N3vVqvV1TYXETKgnqdOwpXcs0wMssN9UFYiEdhbsb6VotnPCKa','EMPLOYEE','nayan');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-08 10:35:36
