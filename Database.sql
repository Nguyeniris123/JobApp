-- MySQL dump 10.13  Distrib 8.0.41, for macos15 (x86_64)
--
-- Host: localhost    Database: jobdb
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add content type',4,'add_contenttype'),(14,'Can change content type',4,'change_contenttype'),(15,'Can delete content type',4,'delete_contenttype'),(16,'Can view content type',4,'view_contenttype'),(17,'Can add session',5,'add_session'),(18,'Can change session',5,'change_session'),(19,'Can delete session',5,'delete_session'),(20,'Can view session',5,'view_session'),(21,'Can add user',6,'add_user'),(22,'Can change user',6,'change_user'),(23,'Can delete user',6,'delete_user'),(24,'Can view user',6,'view_user'),(25,'Can add company',7,'add_company'),(26,'Can change company',7,'change_company'),(27,'Can delete company',7,'delete_company'),(28,'Can view company',7,'view_company'),(29,'Can add company image',8,'add_companyimage'),(30,'Can change company image',8,'change_companyimage'),(31,'Can delete company image',8,'delete_companyimage'),(32,'Can view company image',8,'view_companyimage'),(33,'Can add job post',9,'add_jobpost'),(34,'Can change job post',9,'change_jobpost'),(35,'Can delete job post',9,'delete_jobpost'),(36,'Can view job post',9,'view_jobpost'),(37,'Can add review',10,'add_review'),(38,'Can change review',10,'change_review'),(39,'Can delete review',10,'delete_review'),(40,'Can view review',10,'view_review'),(41,'Can add verification document',11,'add_verificationdocument'),(42,'Can change verification document',11,'change_verificationdocument'),(43,'Can delete verification document',11,'delete_verificationdocument'),(44,'Can view verification document',11,'view_verificationdocument'),(45,'Can add follow',12,'add_follow'),(46,'Can change follow',12,'change_follow'),(47,'Can delete follow',12,'delete_follow'),(48,'Can view follow',12,'view_follow'),(49,'Can add application',13,'add_application'),(50,'Can change application',13,'change_application'),(51,'Can delete application',13,'delete_application'),(52,'Can view application',13,'view_application'),(53,'Can add application',14,'add_application'),(54,'Can change application',14,'change_application'),(55,'Can delete application',14,'delete_application'),(56,'Can view application',14,'view_application'),(57,'Can add access token',15,'add_accesstoken'),(58,'Can change access token',15,'change_accesstoken'),(59,'Can delete access token',15,'delete_accesstoken'),(60,'Can view access token',15,'view_accesstoken'),(61,'Can add grant',16,'add_grant'),(62,'Can change grant',16,'change_grant'),(63,'Can delete grant',16,'delete_grant'),(64,'Can view grant',16,'view_grant'),(65,'Can add refresh token',17,'add_refreshtoken'),(66,'Can change refresh token',17,'change_refreshtoken'),(67,'Can delete refresh token',17,'delete_refreshtoken'),(68,'Can view refresh token',17,'view_refreshtoken'),(69,'Can add id token',18,'add_idtoken'),(70,'Can change id token',18,'change_idtoken'),(71,'Can delete id token',18,'delete_idtoken'),(72,'Can view id token',18,'view_idtoken');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_jobs_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_jobs_user_id` FOREIGN KEY (`user_id`) REFERENCES `jobs_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=145 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
INSERT INTO `django_admin_log` VALUES (1,'2025-04-18 15:59:56.203190','8','dan',1,'[{\"added\": {}}]',6,2),(2,'2025-04-18 16:01:03.772015','8','dan',3,'',6,2),(3,'2025-04-22 03:23:52.151571','3','nguyen',2,'[{\"changed\": {\"fields\": [\"Email address\"]}}]',6,2),(4,'2025-04-22 09:32:37.073356','4','nguyen follows hau',3,'',12,2),(5,'2025-04-22 09:55:20.619793','1','nguyen - Tuyển lập trình viên Django - rejected',3,'',13,2),(6,'2025-04-22 09:55:24.082332','3','nguyen - Tuyển lập trình viên DataDatDat - pending',3,'',13,2),(7,'2025-04-22 09:55:27.190658','6','nguyen - Tuyển lập trình viên Java - pending',3,'',13,2),(8,'2025-04-22 09:58:58.199704','9','nguyen - Tuyển lập trình viên Java - pending',3,'',13,2),(9,'2025-04-22 10:00:49.985030','10','nguyen - Tuyển lập trình viên Java - pending',3,'',13,2),(10,'2025-04-22 10:08:58.408155','11','nguyen - Tuyển lập trình viên Java - pending',3,'',13,2),(11,'2025-04-22 10:09:10.722256','12','nguyen - Tuyển lập trình viên Java - pending',3,'',13,2),(12,'2025-04-22 10:09:58.058667','13','nguyen - Tuyển lập trình viên Java - rejected',3,'',13,2),(13,'2025-04-22 10:39:19.155210','5','nguyen follows hau',3,'',12,2),(14,'2025-04-22 11:35:48.910754','6','nguyen follows hau',3,'',12,2),(15,'2025-04-22 11:41:46.179907','7','nguyen follows hau',3,'',12,2),(16,'2025-04-23 06:20:13.597320','14','nguyen - Tuyển lập trình viên Java - accepted',3,'',13,2),(17,'2025-04-23 06:36:11.909662','9','nguyen follows hau',3,'',12,2),(18,'2025-04-25 04:17:02.714723','1','tin111232232368 đánh giá nguyen',1,'[{\"added\": {}}]',10,2),(19,'2025-04-25 14:59:52.574775','2','hau đánh giá nguyen',1,'[{\"added\": {}}]',10,2),(20,'2025-04-25 15:00:28.329339','3','hau đánh giá dan',1,'[{\"added\": {}}]',10,2),(21,'2025-04-25 15:21:50.826242','4','nguyen đánh giá hau',1,'[{\"added\": {}}]',10,2),(22,'2025-04-25 15:23:13.101255','5','dan đánh giá hau',1,'[{\"added\": {}}]',10,2),(23,'2025-04-25 15:24:06.513193','6','nguyen đánh giá tin',1,'[{\"added\": {}}]',10,2),(24,'2025-04-25 16:03:58.681317','11','dan follows tin',3,'',12,2),(25,'2025-04-25 16:12:54.581296','4','nguyen đánh giá hau',3,'',10,2),(26,'2025-04-26 15:15:00.096027','8','nguyen đánh giá hau',3,'',10,2),(27,'2025-04-26 15:15:07.973803','7','nguyen đánh giá hau',3,'',10,2),(28,'2025-04-26 15:30:36.673530','15','nguyen - Tuyển lập trình viên Java - accepted',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',13,2),(29,'2025-04-26 15:32:13.557194','15','nguyen - Tuyển lập trình viên Java - rejected',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',13,2),(30,'2025-04-26 15:32:31.354924','15','nguyen - Tuyển lập trình viên Java - accepted',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',13,2),(31,'2025-04-26 15:32:44.528485','9','hau đánh giá nguyen',3,'',10,2),(32,'2025-04-26 15:32:49.220659','10','nguyen đánh giá hau',3,'',10,2),(33,'2025-04-26 15:38:26.418485','15','nguyen - Tuyển lập trình viên Java - pending',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',13,2),(34,'2025-04-26 15:38:53.633959','11','nguyen đánh giá hau',3,'',10,2),(35,'2025-04-26 15:44:48.682074','12','nguyen đánh giá hau',3,'',10,2),(36,'2025-04-26 15:55:45.929587','15','nguyen - Tuyển lập trình viên Java - accepted',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',13,2),(37,'2025-04-26 15:55:51.016572','15','nguyen - Tuyển lập trình viên Java - rejected',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',13,2),(38,'2025-04-26 15:56:00.102465','7','dan - Tuyển lập trình viên Java - accepted',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',13,2),(39,'2025-04-26 15:56:13.770193','15','nguyen - Tuyển lập trình viên Java - accepted',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',13,2),(40,'2025-04-26 15:59:45.781224','7','dan - Tuyển lập trình viên Java - rejected',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',13,2),(41,'2025-04-26 16:00:05.701907','7','dan - Tuyển lập trình viên Java - pending',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',13,2),(42,'2025-05-07 16:27:35.840779','15','nguyen đánh giá hau',3,'',10,2),(43,'2025-05-07 16:33:08.105020','15','nguyen - Tuyển lập trình viên Java - rejected',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',13,2),(44,'2025-05-07 16:33:15.325289','16','nguyen đánh giá hau',3,'',10,2),(45,'2025-05-07 16:33:54.804735','15','nguyen - Tuyển lập trình viên Java - accepted',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',13,2),(46,'2025-05-07 16:38:12.418756','17','nguyen đánh giá hau',3,'',10,2),(47,'2025-05-08 16:18:55.959463','3','hau đánh giá dan',3,'',10,2),(48,'2025-05-08 16:18:55.959522','2','hau đánh giá nguyen',3,'',10,2),(49,'2025-05-08 16:18:55.959549','1','tin111232232368 đánh giá nguyen',3,'',10,2),(50,'2025-05-08 16:34:39.702637','19','hau đánh giá nguyen',3,'',10,2),(51,'2025-05-08 16:34:45.027156','20','hau đánh giá dan',3,'',10,2),(52,'2025-05-08 16:34:58.414145','15','nguyen - Tuyển lập trình viên Java - rejected',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',13,2),(53,'2025-05-08 16:40:54.869175','15','nguyen - Tuyển lập trình viên Java - accepted',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',13,2),(54,'2025-05-08 16:41:09.657746','21','hau đánh giá nguyen',3,'',10,2),(55,'2025-05-08 16:44:14.210600','16','nguyen - Tuyển lập trình viên DataDatDat - accepted',1,'[{\"added\": {}}]',13,2),(56,'2025-05-08 16:52:42.732369','18','nguyen đánh giá hau',3,'',10,2),(57,'2025-05-08 16:53:33.906960','24','nguyen đánh giá hau',3,'',10,2),(58,'2025-05-08 16:53:52.458371','15','nguyen - Tuyển lập trình viên Java - rejected',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',13,2),(59,'2025-05-08 16:54:04.400068','15','nguyen - Tuyển lập trình viên Java - accepted',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',13,2),(60,'2025-05-11 07:21:28.422981','3','nguyen',2,'[{\"changed\": {\"fields\": [\"Email address\"]}}]',6,2),(61,'2025-05-15 02:19:55.563323','18','nguyen3333 - Tuyển lập trình viên Help - pending',3,'',13,2),(62,'2025-05-15 02:32:17.909028','19','nguyen3333 - Tuyển lập trình viên Help - pending',3,'',13,2),(63,'2025-05-15 02:36:32.118181','20','nguyen3333 - Tuyển lập trình viên Help - pending',3,'',13,2),(64,'2025-05-15 02:42:30.804402','21','nguyen3333 - Tuyển lập trình viên Help - pending',3,'',13,2),(65,'2025-05-15 02:43:27.293718','22','nguyen3333 - Tuyển lập trình viên Help - pending',3,'',13,2),(66,'2025-05-15 02:45:41.532151','23','nguyen3333 - Tuyển lập trình viên Help - pending',3,'',13,2),(67,'2025-05-15 02:50:19.427040','24','nguyen3333 - Tuyển lập trình viên Help - pending',3,'',13,2),(68,'2025-05-15 02:51:38.583119','25','nguyen3333 - Tuyển lập trình viên Help - pending',2,'[{\"changed\": {\"fields\": [\"Cv\"]}}]',13,2),(69,'2025-05-15 02:56:50.632660','25','nguyen3333 - Tuyển lập trình viên Help - pending',2,'[{\"changed\": {\"fields\": [\"Cv\"]}}]',13,2),(70,'2025-05-15 02:58:42.946098','25','nguyen3333 - Tuyển lập trình viên Help - pending',3,'',13,2),(71,'2025-05-15 03:11:19.721002','26','nguyen3333 - Tuyển lập trình viên Help - pending',3,'',13,2),(72,'2025-05-15 03:21:44.097459','11','tin333',3,'',6,2),(73,'2025-05-15 03:23:48.081031','12','tin333',3,'',6,2),(74,'2025-05-15 03:46:47.948229','13','tin333',3,'',6,2),(75,'2025-05-15 03:48:12.021442','8','Tin333 company',2,'[{\"changed\": {\"fields\": [\"Name\"]}}]',7,2),(76,'2025-05-15 03:48:21.059792','5','tincompany',2,'[{\"changed\": {\"fields\": [\"Name\"]}}]',7,2),(77,'2025-05-15 03:48:35.764211','1','tin111232232368cômpany',2,'[{\"changed\": {\"fields\": [\"Name\"]}}]',7,2),(78,'2025-05-15 03:48:47.847218','3','haucompany',2,'[{\"changed\": {\"fields\": [\"Name\"]}}]',7,2),(79,'2025-05-15 04:00:16.223518','3','haucompany',2,'[{\"changed\": {\"fields\": [\"Location\"]}}]',7,2),(80,'2025-05-15 04:00:31.374290','1','tin111232232368company',2,'[{\"changed\": {\"fields\": [\"Name\", \"Location\"]}}]',7,2),(81,'2025-05-15 04:00:43.986298','8','Tin333 company',2,'[{\"changed\": {\"fields\": [\"Location\"]}}]',7,2),(82,'2025-05-15 04:00:54.212719','5','tincompany',2,'[{\"changed\": {\"fields\": [\"Location\"]}}]',7,2),(83,'2025-05-15 04:06:20.031111','27','nguyen3333 - Tuyển lập trình viên Help - rejected',3,'',13,2),(84,'2025-05-15 04:14:04.788865','17','nguyen - Tuyển lập trình viên Help - pending',3,'',13,2),(85,'2025-05-15 04:14:24.571667','28','nguyen3333 - Tuyển lập trình viên Help - pending',3,'',13,2),(86,'2025-05-17 05:01:00.203379','15','Image of Tin333 company',3,'',8,2),(87,'2025-05-17 05:14:26.424830','18','Image of tin111232232368company',1,'[{\"added\": {}}]',8,2),(88,'2025-05-17 05:16:47.381399','18','Image of tin111232232368company',3,'',8,2),(89,'2025-05-17 05:17:19.129780','19','Image of Tin333 company',1,'[{\"added\": {}}]',8,2),(90,'2025-05-17 05:19:25.229506','8','Tin333 company',2,'[{\"changed\": {\"name\": \"company image\", \"object\": \"Image of Tin333 company\", \"fields\": [\"Image\"]}}, {\"changed\": {\"name\": \"company image\", \"object\": \"Image of Tin333 company\", \"fields\": [\"Image\"]}}]',7,2),(91,'2025-05-17 05:22:55.517502','13','Image of Tin333 company',3,'',8,2),(92,'2025-05-17 05:22:59.196260','14','Image of Tin333 company',3,'',8,2),(93,'2025-05-17 05:23:02.241144','19','Image of Tin333 company',3,'',8,2),(94,'2025-05-17 05:23:18.190817','20','Image of Tin333 company',1,'[{\"added\": {}}]',8,2),(95,'2025-05-17 05:26:54.498702','20','Image of Tin333 company',3,'',8,2),(96,'2025-05-17 05:27:07.859435','21','Image of Tin333 company',1,'[{\"added\": {}}]',8,2),(97,'2025-05-17 05:37:08.025430','21','Image of Tin333 company',3,'',8,2),(98,'2025-05-17 05:37:20.540666','22','Image of Tin333 company',1,'[{\"added\": {}}]',8,2),(99,'2025-05-17 05:44:51.786357','15','dan123',3,'',6,2),(100,'2025-05-17 05:50:00.326017','16','dan123',3,'',6,2),(101,'2025-05-17 07:43:46.166093','27','nguyen đánh giá hau',3,'',10,2),(102,'2025-05-17 08:37:27.451418','17','dan123',3,'',6,2),(103,'2025-05-23 06:01:04.216795','10','nguyen3333',2,'[{\"changed\": {\"fields\": [\"Last name\"]}}]',6,2),(104,'2025-05-30 02:25:15.665039','22','Image of Tin333 company',3,'',8,2),(105,'2025-05-30 02:26:28.284943','8','Tin333 company',2,'[{\"changed\": {\"fields\": [\"Is verified\"]}}]',7,2),(106,'2025-05-30 02:26:46.285137','46','Image of Tin333 company',1,'[{\"added\": {}}]',8,2),(107,'2025-05-30 13:06:42.576140','29','nguyen3333 - Tuyển lập trình viên Help - pending',3,'',13,2),(108,'2025-05-30 14:06:29.176751','30','nguyen3333 - Tuyển lập trình viên Help - pending',3,'',13,2),(109,'2025-06-01 01:20:34.559654','31','nguyen3333 - Tuyển lập trình viên Help - pending',3,'',13,2),(110,'2025-06-02 10:39:15.766634','46','Image of Tin333 company',3,'',8,2),(111,'2025-06-02 10:39:30.688806','47','Image of Tin333 company',1,'[{\"added\": {}}]',8,2),(112,'2025-06-03 18:26:22.740194','32','nguyen3333 - Tuyển lập trình viên Help123 - pending',3,'',13,2),(113,'2025-06-03 18:30:01.907035','29','hau đánh giá nguyen3333',1,'[{\"added\": {}}]',10,2),(114,'2025-06-03 18:32:10.600691','18','nguyen3333 follows hau',3,'',12,2),(115,'2025-06-03 18:38:07.182492','33','nguyen3333 - Intern marketing - accepted',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',13,2),(116,'2025-06-03 18:42:07.487537','19','minh123',3,'',6,2),(117,'2025-06-03 18:42:13.413156','18','dan123',3,'',6,2),(118,'2025-06-03 18:44:53.372280','26','tin đánh giá nguyen',2,'[{\"changed\": {\"fields\": [\"Reviewer\"]}}]',10,2),(119,'2025-06-03 18:45:00.234756','23','tin111232232368 đánh giá nguyen',3,'',10,2),(120,'2025-06-03 18:45:35.129137','1','tin111232232368',3,'',6,2),(121,'2025-06-03 18:45:47.556059','14','tin333',3,'',6,2),(122,'2025-06-03 18:46:09.934269','9','Image of tincompany',2,'[{\"changed\": {\"fields\": [\"Image\"]}}]',8,2),(123,'2025-06-03 18:46:29.382167','8','Image of tincompany',2,'[{\"changed\": {\"fields\": [\"Image\"]}}]',8,2),(124,'2025-06-03 18:46:41.415761','7','Image of tincompany',2,'[{\"changed\": {\"fields\": [\"Image\"]}}]',8,2),(125,'2025-06-03 18:47:40.328739','9','Image of tincompany',3,'',8,2),(126,'2025-06-03 18:47:45.036682','8','Image of tincompany',3,'',8,2),(127,'2025-06-03 18:47:49.365294','7','Image of tincompany',3,'',8,2),(128,'2025-06-03 18:48:07.234171','48','Image of tincompany',1,'[{\"added\": {}}]',8,2),(129,'2025-06-03 18:53:32.206052','33','nguyen - Intern marketing - pending',2,'[{\"changed\": {\"fields\": [\"Applicant\", \"Status\"]}}]',13,2),(130,'2025-06-03 18:54:02.471371','33','nguyen3333 - Intern marketing - pending',2,'[{\"changed\": {\"fields\": [\"Applicant\"]}}]',13,2),(131,'2025-06-03 18:57:11.226666','9','dan',2,'[]',6,2),(132,'2025-06-03 18:57:19.476545','10','nguyen3333',2,'[{\"changed\": {\"fields\": [\"Email address\"]}}]',6,2),(133,'2025-06-03 19:07:19.763968','3','nguyen',2,'[{\"changed\": {\"fields\": [\"Email address\"]}}]',6,2),(134,'2025-06-03 19:20:36.975120','3','nguyen',2,'[{\"changed\": {\"fields\": [\"Email address\"]}}]',6,2),(135,'2025-06-03 19:21:47.768327','17','Tuyển lập trình viên IT3',3,'',9,2),(136,'2025-06-03 19:21:47.768404','16','Tuyển lập trình viên IT2',3,'',9,2),(137,'2025-06-03 19:21:47.768436','15','Tuyển lập trình viên IT2',3,'',9,2),(138,'2025-06-03 19:21:47.768461','14','Tuyển lập trình viên IT',3,'',9,2),(139,'2025-06-03 19:23:15.495601','18','Tuyển nhân viên marketing',2,'[{\"changed\": {\"fields\": [\"Title\"]}}]',9,2),(140,'2025-06-04 09:43:08.188047','18','Tuyển nhân viên marketing',2,'[{\"changed\": {\"fields\": [\"Specialized\"]}}]',9,2),(141,'2025-06-04 13:53:11.042608','21','nguyen11111',3,'',6,2),(142,'2025-06-04 13:53:17.725244','22','dan321',3,'',6,2),(143,'2025-06-04 13:53:28.852261','20','dan123',3,'',6,2),(144,'2025-06-05 01:03:35.135650','19','Tuyển lập trình viên Help',3,'',9,2);
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(3,'auth','group'),(2,'auth','permission'),(4,'contenttypes','contenttype'),(13,'jobs','application'),(7,'jobs','company'),(8,'jobs','companyimage'),(12,'jobs','follow'),(9,'jobs','jobpost'),(10,'jobs','review'),(6,'jobs','user'),(11,'jobs','verificationdocument'),(15,'oauth2_provider','accesstoken'),(14,'oauth2_provider','application'),(16,'oauth2_provider','grant'),(18,'oauth2_provider','idtoken'),(17,'oauth2_provider','refreshtoken'),(5,'sessions','session');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2025-04-14 15:51:04.373842'),(2,'contenttypes','0002_remove_content_type_name','2025-04-14 15:51:04.400315'),(3,'auth','0001_initial','2025-04-14 15:51:04.468690'),(4,'auth','0002_alter_permission_name_max_length','2025-04-14 15:51:04.485224'),(5,'auth','0003_alter_user_email_max_length','2025-04-14 15:51:04.489417'),(6,'auth','0004_alter_user_username_opts','2025-04-14 15:51:04.493937'),(7,'auth','0005_alter_user_last_login_null','2025-04-14 15:51:04.497745'),(8,'auth','0006_require_contenttypes_0002','2025-04-14 15:51:04.498998'),(9,'auth','0007_alter_validators_add_error_messages','2025-04-14 15:51:04.503947'),(10,'auth','0008_alter_user_username_max_length','2025-04-14 15:51:04.508475'),(11,'auth','0009_alter_user_last_name_max_length','2025-04-14 15:51:04.512346'),(12,'auth','0010_alter_group_name_max_length','2025-04-14 15:51:04.525312'),(13,'auth','0011_update_proxy_permissions','2025-04-14 15:51:04.529483'),(14,'auth','0012_alter_user_first_name_max_length','2025-04-14 15:51:04.533726'),(15,'jobs','0001_initial','2025-04-14 15:51:04.865263'),(16,'admin','0001_initial','2025-04-14 15:51:04.922612'),(17,'admin','0002_logentry_remove_auto_add','2025-04-14 15:51:04.933951'),(18,'admin','0003_logentry_add_action_flag_choices','2025-04-14 15:51:04.947962'),(19,'oauth2_provider','0001_initial','2025-04-14 15:51:05.252799'),(20,'oauth2_provider','0002_auto_20190406_1805','2025-04-14 15:51:05.313871'),(21,'oauth2_provider','0003_auto_20201211_1314','2025-04-14 15:51:05.343813'),(22,'oauth2_provider','0004_auto_20200902_2022','2025-04-14 15:51:05.571708'),(23,'oauth2_provider','0005_auto_20211222_2352','2025-04-14 15:51:05.645919'),(24,'oauth2_provider','0006_alter_application_client_secret','2025-04-14 15:51:05.682643'),(25,'oauth2_provider','0007_application_post_logout_redirect_uris','2025-04-14 15:51:05.721136'),(26,'oauth2_provider','0008_alter_accesstoken_token','2025-04-14 15:51:05.735757'),(27,'oauth2_provider','0009_add_hash_client_secret','2025-04-14 15:51:05.782636'),(28,'oauth2_provider','0010_application_allowed_origins','2025-04-14 15:51:05.818358'),(29,'oauth2_provider','0011_refreshtoken_token_family','2025-04-14 15:51:05.853978'),(30,'oauth2_provider','0012_add_token_checksum','2025-04-14 15:51:06.007101'),(31,'sessions','0001_initial','2025-04-14 15:51:06.018667');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('1uj0gmzl0e2rd8bltz16nrruf4brgtmo','.eJxVjDsOwyAQRO9CHSEWw2JSpvcZ0PILTiKQjF1FuXtsyUUiTTXvzbyZo20tbutpcXNkVybZ5bfzFJ6pHiA-qN4bD62uy-z5ofCTdj61mF630_07KNTLvkaTowgAiGiEV3LMSUMgGOWgBhGt0p4wQgKNhFZ6ShblHm-yBNCBfb7E3DcJ:1u4MDH:P4ai6QAiwVdWN9t84q-xKuHtFUNjem0Z1A83dPJEdYk','2025-04-28 15:59:11.806128'),('hkp40n8rfczxfero8e5ghvcamhdkaus2','.eJxVjDsOwyAQRO9CHSEWw2JSpvcZ0PILTiKQjF1FuXtsyUUiTTXvzbyZo20tbutpcXNkVybZ5bfzFJ6pHiA-qN4bD62uy-z5ofCTdj61mF630_07KNTLvkaTowgAiGiEV3LMSUMgGOWgBhGt0p4wQgKNhFZ6ShblHm-yBNCBfb7E3DcJ:1uIIIS:z7gxzFMFEZHMnX8qAafZtaNP3W1KzCsRofsLeVtlfkQ','2025-06-06 02:38:08.983474'),('xhm8m94yg9nrsukyyza80m3kohosbntp','.eJxVjDsOwyAQRO9CHSEWw2JSpvcZ0PILTiKQjF1FuXtsyUUiTTXvzbyZo20tbutpcXNkVybZ5bfzFJ6pHiA-qN4bD62uy-z5ofCTdj61mF630_07KNTLvkaTowgAiGiEV3LMSUMgGOWgBhGt0p4wQgKNhFZ6ShblHm-yBNCBfb7E3DcJ:1uCbjJ:YG0jrsGA9XNGc3hzTK_THMl0FQhJfOmz1Kbm6N2UiTg','2025-05-21 10:10:21.478080');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs_application`
--

DROP TABLE IF EXISTS `jobs_application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs_application` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` tinyint(1) NOT NULL,
  `created_date` datetime(6) NOT NULL,
  `updated_date` datetime(6) NOT NULL,
  `cv` varchar(255) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `applicant_id` bigint NOT NULL,
  `job_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `jobs_application_applicant_id_job_id_5d0e0c0f_uniq` (`applicant_id`,`job_id`),
  KEY `jobs_application_job_id_7bb7e966_fk_jobs_jobpost_id` (`job_id`),
  CONSTRAINT `jobs_application_applicant_id_3b46b5e4_fk_jobs_user_id` FOREIGN KEY (`applicant_id`) REFERENCES `jobs_user` (`id`),
  CONSTRAINT `jobs_application_job_id_7bb7e966_fk_jobs_jobpost_id` FOREIGN KEY (`job_id`) REFERENCES `jobs_jobpost` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs_application`
--

LOCK TABLES `jobs_application` WRITE;
/*!40000 ALTER TABLE `jobs_application` DISABLE KEYS */;
INSERT INTO `jobs_application` VALUES (7,1,'2025-04-18 16:02:12.865451','2025-04-26 16:00:05.699630','image/upload/https://res.cloudinary.com/your_cloud_name/raw/upload/v1234567890/cv_pascal.pdf','pending',9,3),(15,1,'2025-04-23 06:20:16.919179','2025-05-08 16:54:04.397955','image/upload/https://res.cloudinary.com/your_cloud_name/raw/upload/v1234567890/cv_pascal.pdf','accepted',3,3);
/*!40000 ALTER TABLE `jobs_application` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs_company`
--

DROP TABLE IF EXISTS `jobs_company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs_company` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` tinyint(1) NOT NULL,
  `created_date` datetime(6) NOT NULL,
  `updated_date` datetime(6) NOT NULL,
  `name` varchar(255) NOT NULL,
  `tax_code` varchar(20) NOT NULL,
  `description` longtext NOT NULL,
  `location` varchar(255) NOT NULL,
  `is_verified` tinyint(1) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tax_code` (`tax_code`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `jobs_company_user_id_665e3586_fk_jobs_user_id` FOREIGN KEY (`user_id`) REFERENCES `jobs_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs_company`
--

LOCK TABLES `jobs_company` WRITE;
/*!40000 ALTER TABLE `jobs_company` DISABLE KEYS */;
INSERT INTO `jobs_company` VALUES (3,1,'2025-04-14 16:14:49.458788','2025-06-01 01:35:58.219042','haucompany','135','Công ty của hau','TP.HCM',0,5),(5,1,'2025-04-14 17:04:17.806569','2025-06-03 18:48:07.229660','tincompany','135654654','eweqwewqqưe','TP.HCM',1,7);
/*!40000 ALTER TABLE `jobs_company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs_companyimage`
--

DROP TABLE IF EXISTS `jobs_companyimage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs_companyimage` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` tinyint(1) NOT NULL,
  `created_date` datetime(6) NOT NULL,
  `updated_date` datetime(6) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `company_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_companyimage_company_id_0e7f81b6_fk_jobs_company_id` (`company_id`),
  CONSTRAINT `jobs_companyimage_company_id_0e7f81b6_fk_jobs_company_id` FOREIGN KEY (`company_id`) REFERENCES `jobs_company` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs_companyimage`
--

LOCK TABLES `jobs_companyimage` WRITE;
/*!40000 ALTER TABLE `jobs_companyimage` DISABLE KEYS */;
INSERT INTO `jobs_companyimage` VALUES (43,1,'2025-05-23 03:18:16.284886','2025-05-23 03:18:16.284915','image/upload/v1747970296/a193iss6eutu8scum3vc.jpg',3),(44,1,'2025-05-23 03:18:16.987709','2025-05-23 03:18:16.987744','image/upload/v1747970297/qh578cb2zv3ivdlqb0vn.jpg',3),(45,1,'2025-05-23 03:18:17.806983','2025-05-23 03:18:17.807018','image/upload/v1747970298/sb2p9oneiw9951cwmybo.jpg',3),(48,1,'2025-06-03 18:48:03.748168','2025-06-03 18:48:03.748200','image/upload/v1748976484/ullrvutzffra7vmmovnq.jpg',5);
/*!40000 ALTER TABLE `jobs_companyimage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs_follow`
--

DROP TABLE IF EXISTS `jobs_follow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs_follow` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` tinyint(1) NOT NULL,
  `created_date` datetime(6) NOT NULL,
  `updated_date` datetime(6) NOT NULL,
  `follower_id` bigint NOT NULL,
  `recruiter_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `jobs_follow_follower_id_recruiter_id_49555d31_uniq` (`follower_id`,`recruiter_id`),
  KEY `jobs_follow_recruiter_id_5d23c6aa_fk_jobs_user_id` (`recruiter_id`),
  CONSTRAINT `jobs_follow_follower_id_e2fa94aa_fk_jobs_user_id` FOREIGN KEY (`follower_id`) REFERENCES `jobs_user` (`id`),
  CONSTRAINT `jobs_follow_recruiter_id_5d23c6aa_fk_jobs_user_id` FOREIGN KEY (`recruiter_id`) REFERENCES `jobs_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs_follow`
--

LOCK TABLES `jobs_follow` WRITE;
/*!40000 ALTER TABLE `jobs_follow` DISABLE KEYS */;
INSERT INTO `jobs_follow` VALUES (3,1,'2025-04-18 17:31:03.178940','2025-04-18 17:31:03.178966',3,7),(10,1,'2025-04-23 06:36:15.895763','2025-04-23 06:36:15.895785',3,5),(20,1,'2025-06-04 09:52:49.756542','2025-06-04 09:52:49.756567',10,5);
/*!40000 ALTER TABLE `jobs_follow` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs_jobpost`
--

DROP TABLE IF EXISTS `jobs_jobpost`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs_jobpost` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` tinyint(1) NOT NULL,
  `created_date` datetime(6) NOT NULL,
  `updated_date` datetime(6) NOT NULL,
  `title` varchar(255) NOT NULL,
  `specialized` varchar(100) NOT NULL,
  `description` longtext NOT NULL,
  `salary` decimal(10,2) NOT NULL,
  `working_hours` varchar(50) NOT NULL,
  `location` varchar(255) NOT NULL,
  `recruiter_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_jobpost_recruiter_id_197ab2e9_fk_jobs_user_id` (`recruiter_id`),
  CONSTRAINT `jobs_jobpost_recruiter_id_197ab2e9_fk_jobs_user_id` FOREIGN KEY (`recruiter_id`) REFERENCES `jobs_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs_jobpost`
--

LOCK TABLES `jobs_jobpost` WRITE;
/*!40000 ALTER TABLE `jobs_jobpost` DISABLE KEYS */;
INSERT INTO `jobs_jobpost` VALUES (2,1,'2025-04-14 16:16:23.366119','2025-04-14 16:16:23.366211','Tuyển lập trình viên Django','IT - Phần mềm','Tham gia phát triển dự án web bằng Django, Rest Framework',20000.00,'8h - 17h','Quận 1, TP.HCM',5),(3,1,'2025-04-18 14:14:36.935855','2025-04-18 14:14:36.935879','Tuyển lập trình viên Java','IT - Phần mềm','Tham gia phát triển dự án web bằng Django, Rest Framework',20000.00,'8h - 17h','Quận 1, TP.HCM',5),(4,1,'2025-04-22 03:24:39.592607','2025-04-22 03:24:39.592637','Tuyển lập trình viên C++','IT - Phần mềm','Tham gia phát triển dự án web bằng Django, Rest Framework',20000.00,'8h - 17h','Quận 1, TP.HCM',5),(5,1,'2025-04-22 03:37:52.062141','2025-04-22 03:37:52.062259','Tuyển lập trình viên C#','IT - Phần mềm','Tham gia phát triển dự án web bằng Django, Rest Framework',20000.00,'8h - 17h','Quận 1, TP.HCM',5),(6,1,'2025-04-22 04:31:55.743975','2025-04-22 04:31:55.744081','Tuyển lập trình viên Ruby','IT - Phần mềm','Tham gia phát triển dự án web bằng Django, Rest Framework',20000.00,'8h - 17h','Quận 1, TP.HCM',5),(7,1,'2025-04-22 04:35:11.908663','2025-04-22 04:35:11.908684','Tuyển lập trình viên Spring','IT - Phần mềm','Tham gia phát triển dự án web bằng Django, Rest Framework',20000.00,'8h - 17h','Quận 1, TP.HCM',5),(8,1,'2025-04-22 10:35:40.600016','2025-04-22 10:35:40.600045','Tuyển lập trình viên .Net','IT - Phần mềm','Tham gia phát triển dự án web bằng Django, Rest Framework',20000.00,'8h - 17h','Quận 1, TP.HCM',5),(9,1,'2025-05-11 02:16:37.092150','2025-05-11 02:16:37.092183','Tuyển lập trình viên lavarel','IT - Phần mềm','Tham gia phát triển dự án web bằng Django, Rest Framework',20000.00,'8h - 17h','Quận 1, TP.HCM',5),(10,1,'2025-05-11 07:14:25.996008','2025-06-01 01:33:36.080675','Tuyển lập trình viên Help123','IT - Phần mềm','Tham gia phát triển dự án web bằng Django, Rest Framework',20000.00,'8h - 17h','Quận 1, TP.HCM',5),(18,1,'2025-06-03 19:21:54.408731','2025-06-04 09:43:08.161464','Tuyển nhân viên marketing','software','Tham gia phát triển dự án web bằng Django, Rest Framework',20000.00,'8h - 17h','Quận 1, TP.HCM',5);
/*!40000 ALTER TABLE `jobs_jobpost` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs_review`
--

DROP TABLE IF EXISTS `jobs_review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs_review` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` tinyint(1) NOT NULL,
  `created_date` datetime(6) NOT NULL,
  `updated_date` datetime(6) NOT NULL,
  `rating` int NOT NULL,
  `comment` longtext NOT NULL,
  `reviewed_user_id` bigint NOT NULL,
  `reviewer_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_review_reviewed_user_id_48427ece_fk_jobs_user_id` (`reviewed_user_id`),
  KEY `jobs_review_reviewer_id_3e5ef7ef_fk_jobs_user_id` (`reviewer_id`),
  CONSTRAINT `jobs_review_reviewed_user_id_48427ece_fk_jobs_user_id` FOREIGN KEY (`reviewed_user_id`) REFERENCES `jobs_user` (`id`),
  CONSTRAINT `jobs_review_reviewer_id_3e5ef7ef_fk_jobs_user_id` FOREIGN KEY (`reviewer_id`) REFERENCES `jobs_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs_review`
--

LOCK TABLES `jobs_review` WRITE;
/*!40000 ALTER TABLE `jobs_review` DISABLE KEYS */;
INSERT INTO `jobs_review` VALUES (5,1,'2025-04-25 15:23:13.097169','2025-04-25 15:23:13.097220',2,'đâsdasd',5,9),(6,1,'2025-04-25 15:24:06.510961','2025-04-25 15:24:06.510990',2,'ssad',7,3),(26,1,'2025-05-08 16:57:24.255217','2025-06-03 18:44:53.368159',5,'Ứng viên rất tiềm năng, làm việc chuyên nghiệp.',3,7),(28,1,'2025-05-17 07:44:44.317909','2025-05-17 07:44:44.317940',5,'Nhà tuyển dụng rất chuyên nghiệp.',5,3),(29,1,'2025-06-03 18:30:01.900028','2025-06-03 18:30:01.900062',4,'good',10,5);
/*!40000 ALTER TABLE `jobs_review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs_user`
--

DROP TABLE IF EXISTS `jobs_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `role` varchar(10) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs_user`
--

LOCK TABLES `jobs_user` WRITE;
/*!40000 ALTER TABLE `jobs_user` DISABLE KEYS */;
INSERT INTO `jobs_user` VALUES (2,'pbkdf2_sha256$870000$DDzDXFrcJzNVyc9rbLod3T$9spAy4qwVW5G07CTc0rD8wbucS4LbPnaZHhbyZlq7Gw=','2025-05-23 02:38:08.974708',1,'admin','','','ngyen@gmail.com',1,1,'2025-04-14 15:58:03.584421','',NULL),(3,'pbkdf2_sha256$870000$SB0hKAMC2ZM5qPu0WQnqh3$U7mBMZPdrrh55vkvhDcTgBMdFYYCPf3Vwar+pl7k6iM=',NULL,0,'nguyen','Ho','Nguyen','nguyen.hochi@gmail.com',0,1,'2025-04-14 16:04:35.000000','candidate','image/upload/v1746626924/and1xisktzutb2kpk6ud.webp'),(5,'pbkdf2_sha256$870000$MEWEWbLnouUwGN1UgpPTVa$MIjKBET2Cat4Icu8wmqj0t/3+HGZE4w1PLqINg6Y5CI=',NULL,0,'hau','Tran','Ho','hotran123@gmail.com',0,1,'2025-04-14 16:14:46.325250','recruiter','image/upload/v1744647288/pmauzfgqpxzunerxxaqu.jpg'),(7,'pbkdf2_sha256$870000$L1diBY8ySQU16dnDxq5wSE$M9AoVu5UUo+S+ov2g/vKiPEKDiEF50ZH5rX7GailGwE=',NULL,0,'tin','Phuoc Hau','Ngo','ngueeyen@gmail.com',0,1,'2025-04-14 17:04:15.158635','recruiter','image/upload/v1744650256/byqbtzraznnxf9xt3b6p.png'),(9,'pbkdf2_sha256$870000$x08xviqQ47mxHoEBoiOY6u$I5GCozMb5xB4qH3JeQvPYo6L+Ly3nxUwMxXsBptcsHs=',NULL,0,'dan','Hồ Chí','Nguyên','2251050048nguyen@ou.edu.vn',0,1,'2025-04-18 16:01:34.000000','candidate','image/upload/fafafaf'),(10,'pbkdf2_sha256$870000$MEWEWbLnouUwGN1UgpPTVa$MIjKBET2Cat4Icu8wmqj0t/3+HGZE4w1PLqINg6Y5CI=',NULL,0,'nguyen3333','Nguyen','Ho','2251050048nguyen@ou.edu.vn',0,1,'2025-05-13 03:30:41.000000','candidate','image/upload/v1747107045/ikswnhiorfbq5mthggkh.jpg');
/*!40000 ALTER TABLE `jobs_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs_user_groups`
--

DROP TABLE IF EXISTS `jobs_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `jobs_user_groups_user_id_group_id_39db2e61_uniq` (`user_id`,`group_id`),
  KEY `jobs_user_groups_group_id_8c4ec9ac_fk_auth_group_id` (`group_id`),
  CONSTRAINT `jobs_user_groups_group_id_8c4ec9ac_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `jobs_user_groups_user_id_c74ea82a_fk_jobs_user_id` FOREIGN KEY (`user_id`) REFERENCES `jobs_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs_user_groups`
--

LOCK TABLES `jobs_user_groups` WRITE;
/*!40000 ALTER TABLE `jobs_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs_user_user_permissions`
--

DROP TABLE IF EXISTS `jobs_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `jobs_user_user_permissions_user_id_permission_id_80875a4d_uniq` (`user_id`,`permission_id`),
  KEY `jobs_user_user_permi_permission_id_e171478b_fk_auth_perm` (`permission_id`),
  CONSTRAINT `jobs_user_user_permi_permission_id_e171478b_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `jobs_user_user_permissions_user_id_d7a33063_fk_jobs_user_id` FOREIGN KEY (`user_id`) REFERENCES `jobs_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs_user_user_permissions`
--

LOCK TABLES `jobs_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `jobs_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs_verificationdocument`
--

DROP TABLE IF EXISTS `jobs_verificationdocument`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs_verificationdocument` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` tinyint(1) NOT NULL,
  `created_date` datetime(6) NOT NULL,
  `updated_date` datetime(6) NOT NULL,
  `document` varchar(100) NOT NULL,
  `status` varchar(10) NOT NULL,
  `admin_note` longtext,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `jobs_verificationdocument_user_id_136ec6ff_fk_jobs_user_id` FOREIGN KEY (`user_id`) REFERENCES `jobs_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs_verificationdocument`
--

LOCK TABLES `jobs_verificationdocument` WRITE;
/*!40000 ALTER TABLE `jobs_verificationdocument` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs_verificationdocument` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth2_provider_accesstoken`
--

DROP TABLE IF EXISTS `oauth2_provider_accesstoken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oauth2_provider_accesstoken` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `token` longtext NOT NULL,
  `expires` datetime(6) NOT NULL,
  `scope` longtext NOT NULL,
  `application_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `created` datetime(6) NOT NULL,
  `updated` datetime(6) NOT NULL,
  `source_refresh_token_id` bigint DEFAULT NULL,
  `id_token_id` bigint DEFAULT NULL,
  `token_checksum` varchar(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `oauth2_provider_accesstoken_token_checksum_85319a26_uniq` (`token_checksum`),
  UNIQUE KEY `source_refresh_token_id` (`source_refresh_token_id`),
  UNIQUE KEY `id_token_id` (`id_token_id`),
  KEY `oauth2_provider_acce_application_id_b22886e1_fk_oauth2_pr` (`application_id`),
  KEY `oauth2_provider_accesstoken_user_id_6e4c9a65_fk_jobs_user_id` (`user_id`),
  CONSTRAINT `oauth2_provider_acce_application_id_b22886e1_fk_oauth2_pr` FOREIGN KEY (`application_id`) REFERENCES `oauth2_provider_application` (`id`),
  CONSTRAINT `oauth2_provider_acce_id_token_id_85db651b_fk_oauth2_pr` FOREIGN KEY (`id_token_id`) REFERENCES `oauth2_provider_idtoken` (`id`),
  CONSTRAINT `oauth2_provider_acce_source_refresh_token_e66fbc72_fk_oauth2_pr` FOREIGN KEY (`source_refresh_token_id`) REFERENCES `oauth2_provider_refreshtoken` (`id`),
  CONSTRAINT `oauth2_provider_accesstoken_user_id_6e4c9a65_fk_jobs_user_id` FOREIGN KEY (`user_id`) REFERENCES `jobs_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=153 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth2_provider_accesstoken`
--

LOCK TABLES `oauth2_provider_accesstoken` WRITE;
/*!40000 ALTER TABLE `oauth2_provider_accesstoken` DISABLE KEYS */;
INSERT INTO `oauth2_provider_accesstoken` VALUES (1,'4jnk5KIQn6SKmzN6ro4yOIPVlenvIb','2025-04-15 02:01:40.080886','read write',1,2,'2025-04-14 16:01:40.081285','2025-04-14 16:01:40.081293',NULL,NULL,'d0f2cbb71ace1a7548daecf4f01846e466d8a11090ee158e0c7c81b700d8302d'),(3,'Vwv5SWMj68mr8lODiedwVIunQ5YVJW','2025-04-15 02:05:34.790816','read write',1,3,'2025-04-14 16:05:34.791179','2025-04-14 16:05:34.791187',NULL,NULL,'eb59a457130431e56e0e5ed0a12e7abf721e49bcf248c56bb5320e3d44f5c254'),(4,'A7t2zOnqeyO6flAY8EftdeVNbdtEWp','2025-04-15 02:15:06.675886','read write',1,5,'2025-04-14 16:15:06.676227','2025-04-14 16:15:06.676236',NULL,NULL,'97d842d365707dced3663a90bef73f0c68bdb6355bf5769202f73199499b6438'),(5,'3yImu3LtuMqdyNnqAwOWyWGUD5R8Zu','2025-04-15 02:19:38.262223','read write',1,5,'2025-04-14 16:19:38.262611','2025-04-14 16:19:38.262621',NULL,NULL,'258fd5390d6dbe32cd696972c8fb35cdc42825a9629e22c492d736b410265040'),(6,'W51fIdfT9ZiILlFKe6wDoL7l3MPOhK','2025-04-15 02:19:51.925941','read write',1,3,'2025-04-14 16:19:51.926209','2025-04-14 16:19:51.926217',NULL,NULL,'3e81fda8c2fb0a3aadd2291dd15048e2b06bb9a981c380dd68c911eb6edc5d3f'),(7,'cKrLVfmr2k5gAPb2xuVT6wZgol4m8p','2025-04-15 02:26:27.487919','read write',1,5,'2025-04-14 16:26:27.488257','2025-04-14 16:26:27.488265',NULL,NULL,'95fe38183b2ef81b8a2102d1c0a881bdf53ff40eda38af077a18dfc926d08097'),(8,'Tm6nMfZennm40TkknrkkaNzhXytRDb','2025-04-15 03:04:34.948678','read write',1,7,'2025-04-14 17:04:34.949026','2025-04-14 17:04:34.949034',NULL,NULL,'41fb9d00771b0c628900a5beeae78ea87be2a908d8d836d0cfe5babc4a2ed942'),(9,'VaLFeB2PGIK1NkLEemlL39bqRdQYvA','2025-04-19 00:14:06.728091','read write',1,5,'2025-04-18 14:14:06.728661','2025-04-18 14:14:06.728676',NULL,NULL,'3d6384e507cabf7bbdb68b75bd0388261affdc5a06a5249f9351bbda508dfbf2'),(10,'HMysQFD2EMA2HgB5R04FoN2DrpzNwR','2025-04-19 00:56:30.560625','read write',1,3,'2025-04-18 14:56:30.561184','2025-04-18 14:56:30.561196',NULL,NULL,'189803d809b7afa05a2305dc2b2ca9b1b7bb095431ed793f6aebafb3d59d69d5'),(11,'hlC865v8eyw4bycoRPYwanRVAhrcX1','2025-04-19 00:57:30.596866','read write',1,5,'2025-04-18 14:57:30.597134','2025-04-18 14:57:30.597142',NULL,NULL,'44fac473e3d7707d6762c81f164c460fac343296e4966ee73d43df315cafbf3c'),(12,'ZQ3hb2GZXM4Y96gROidGucqtifBTza','2025-04-19 00:58:08.319894','read write',1,7,'2025-04-18 14:58:08.320181','2025-04-18 14:58:08.320191',NULL,NULL,'13fae9f4fe07e9ed40fb9c65f97d8d149323fec178d0c165b335a2f924f40da8'),(13,'zYl4vt7Y2pkpdjopfh2nmECxLG71Ru','2025-04-19 01:09:34.390377','read write',1,5,'2025-04-18 15:09:34.391046','2025-04-18 15:09:34.391059',NULL,NULL,'fc87157528cc7d02e32561b53e59811aed14ea061ba0345a6dd1a3758b5c9c18'),(14,'BniqNL9AwmRpN81uD5Xrfoib33G95X','2025-04-19 01:39:58.609390','read write',1,3,'2025-04-18 15:39:58.610497','2025-04-18 15:39:58.610525',NULL,NULL,'810c8059b4dd4ae4b5a270071ed2ce9cf430dfa2aa97c86be63d4bec3feaebcc'),(15,'2Tn0eIKV4TXuAyDzC1qVN86b92JUHj','2025-04-19 01:52:23.783994','read write',1,3,'2025-04-18 15:52:23.784795','2025-04-18 15:52:23.784810',NULL,NULL,'ac8c1666e72b00d070e16be3b037463ed575d3da1bd0a34226819f8ead3f8ab0'),(16,'PPCcWElfZwyeWORyFufUqwKzG8EijN','2025-04-19 01:52:38.706968','read write',1,5,'2025-04-18 15:52:38.707245','2025-04-18 15:52:38.707254',NULL,NULL,'3207db44b8ec7acc6e528627f1227b41c59b3b69e41e69268a7f1b439870d8d5'),(17,'sP3e4sERveAJa9d1VazK2vCKcyi10U','2025-04-19 01:57:44.124966','read write',1,3,'2025-04-18 15:57:44.125517','2025-04-18 15:57:44.125529',NULL,NULL,'818d31fc41cb4188165190e735dfd4b8ca70500a0b5fe755d1249c655f47905c'),(18,'a21xZt6i3DA9cN983LfrCnWEuKCpC9','2025-04-19 02:01:45.687143','read write',1,9,'2025-04-18 16:01:45.687700','2025-04-18 16:01:45.687728',NULL,NULL,'4e6091d38a08fb0b18359d3bbb3b9fdb18e1335c0ed89f597fa20b80e5a03b85'),(19,'wcZrpbjAHu6dFlHqxgvb4pFDXwzdvh','2025-04-19 02:03:08.675018','read write',1,5,'2025-04-18 16:03:08.675284','2025-04-18 16:03:08.675292',NULL,NULL,'70b60ff5a3f1fd9f7b7d073734b888691be4c1b4493e224bf5e95d765c798242'),(21,'DvmArb4SkjHqIKKooTld0gMlwA2x9K','2025-04-19 02:12:03.064691','read write',1,3,'2025-04-18 16:12:03.064958','2025-04-18 16:12:03.064967',NULL,NULL,'c79f94e4f076fc80d9af9f1f2d8aadbcee8045213369a42cb4fc419f00a4595a'),(22,'fVMhc9RtijeGc6PjpHevzZ5jZ1MI0g','2025-04-19 02:12:15.560116','read write',1,5,'2025-04-18 16:12:15.560383','2025-04-18 16:12:15.560392',NULL,NULL,'0cfb73a88c6aa8787d8947b9eba4ab882ce3b2fa999fa43118a8d179474412c3'),(23,'aZ1k3Jz7t9K7skBfSdFOPIKXUEZHst','2025-04-19 02:23:39.137121','read write',1,3,'2025-04-18 16:23:39.137738','2025-04-18 16:23:39.137749',NULL,NULL,'adc605e953f8fec5e445520294c4e1244ea02ab654b1ebae24adf51db4f0b79e'),(24,'Uio0BRkdFeuHeDwqTg6lHkbAO0Ei12','2025-04-19 02:24:21.125465','read write',1,3,'2025-04-18 16:24:21.125881','2025-04-18 16:24:21.125893',NULL,NULL,'0ad615640b90eac3ca8a59616567624e313666c2c2b6788928261ef4ba27085c'),(25,'W5JORKr8UHSCUza7zZW23zQyrXToGP','2025-04-19 02:24:54.069947','read write',1,5,'2025-04-18 16:24:54.070214','2025-04-18 16:24:54.070222',NULL,NULL,'ff9090fc24a8ef84bd279d49cbf3219ae93a9f4d327da123ed01bc17ce8b3973'),(26,'Atnp5JytbmH9VvTsmkKgB7V4fQPOlX','2025-04-19 02:25:48.213571','read write',1,3,'2025-04-18 16:25:48.213983','2025-04-18 16:25:48.213996',NULL,NULL,'6a0b6a2d0eb39d326b03183327a65d35b4892391da41f67147673dd1cfca9ba4'),(27,'H7I7tdOnOCaQV1VgnyEIoZhhw4xryf','2025-04-19 02:32:12.182697','read write',1,5,'2025-04-18 16:32:12.184040','2025-04-18 16:32:12.184054',NULL,NULL,'b05996ec6bb0c89d99c1bc34f6c762662b9f8e4a6ed189189aaabcc03a438366'),(28,'VM0mAC7s4L8gznskPdH6l6Nxq7g7ak','2025-04-19 02:52:34.378418','read write',1,7,'2025-04-18 16:52:34.378820','2025-04-18 16:52:34.378832',NULL,NULL,'1671a40cbf57ca5aec8cfa765c19506d0fb8f6c26794914738b620793bc2af9b'),(29,'3HveGDDGobNHHlWJUtYs5Eb22GOPkN','2025-04-19 02:52:53.435330','read write',1,3,'2025-04-18 16:52:53.435608','2025-04-18 16:52:53.435616',NULL,NULL,'3a9ab0743f6858991994c769d2b3c1acb9735fe9f270046544c50313752185a7'),(30,'ZmiyFAevm6B3O0nYs8q0VHTD735Bah','2025-04-19 02:53:15.120320','read write',1,5,'2025-04-18 16:53:15.120590','2025-04-18 16:53:15.120598',NULL,NULL,'20a5e2583e6e1e50f14df0ddb9427bcf48cb231bc721c5de79760ecaea3c0f56'),(31,'gn4dKWuvmf2ow0KfVpeJlHXo372WsZ','2025-04-19 02:56:26.529243','read write',1,3,'2025-04-18 16:56:26.529665','2025-04-18 16:56:26.529674',NULL,NULL,'3e8364134a244035cf0436d6d0b922cab6d15a151e1aa42daf4f16e0a63f74c0'),(32,'2OmFZPTgJzRWwi3CUmLWnAwg5trahI','2025-04-19 03:26:48.176100','read write',1,5,'2025-04-18 17:26:48.176719','2025-04-18 17:26:48.176730',NULL,NULL,'1e46f472813486cf98bf495fd579d026833a5ad98b500efdfc2c196c02d2e115'),(33,'Vsum8Z3qgy26TQKDOI4vR4BUmYfLf8','2025-04-19 03:28:47.561462','read write',1,9,'2025-04-18 17:28:47.561851','2025-04-18 17:28:47.561863',NULL,NULL,'5e3e8b73782b85316b79ead09aa71b37498582f015cbadd3ffe27a6821679200'),(34,'ceESsq3qk4o2MAsFDFqnS4gqXNGtTb','2025-04-19 03:29:35.139108','read write',1,3,'2025-04-18 17:29:35.139386','2025-04-18 17:29:35.139394',NULL,NULL,'6c912386527fd8ed5275782b51e20589a54b165853bb7d1d634059cbd844346b'),(35,'iE8yhs2KeUs0OuSoZXzRlKIWPxdk0C','2025-04-19 03:34:45.445551','read write',1,9,'2025-04-18 17:34:45.446776','2025-04-18 17:34:45.446785',NULL,NULL,'7b4b25c96294451e2ec8b4029baf14ad1045b3d6fd42351aa3f0d6ca53832fd0'),(36,'POwhPkB8uHHosyjlzj1nNi90q8g5bk','2025-04-19 03:35:22.650312','read write',1,3,'2025-04-18 17:35:22.650581','2025-04-18 17:35:22.650590',NULL,NULL,'84c352157adcbbe3117f882a24a2a291e9372011b5fe85dae85055a861fd626b'),(37,'KYtDNU2LVutoUzO2pN813m1mXUHfLw','2025-04-19 03:35:41.602941','read write',1,5,'2025-04-18 17:35:41.603204','2025-04-18 17:35:41.603212',NULL,NULL,'346070ac800fc476cf99b669d7c2497e5a73a3517d0d42849f11a4092086c22e'),(38,'NpkMJf4EmPawRCoNR8sO4AAnOjCPKF','2025-04-19 03:36:56.601273','read write',1,3,'2025-04-18 17:36:56.601941','2025-04-18 17:36:56.601967',NULL,NULL,'9002da9ce8542907188637ab01c5d243b33d2c32dba35e91a548ef54546d5831'),(39,'6OQFSmSXvLjt9RM3uL2diET9txkTO4','2025-04-19 03:37:21.339675','read write',1,5,'2025-04-18 17:37:21.339957','2025-04-18 17:37:21.339966',NULL,NULL,'6734d86f719933605f186afe54953584941aff2e6876de4ea31c5262d8126ccd'),(40,'owC3M118U4E2RYhR7rObujNAQ95pyE','2025-04-19 03:38:29.442693','read write',1,7,'2025-04-18 17:38:29.442963','2025-04-18 17:38:29.442971',NULL,NULL,'52d8ecf16348687a9ba763f1cfd9c3c874acae01f0fd75e9ee05d9c78f63ff03'),(41,'iCMZEQQoW90ciqZ6MncBGikTy0qle5','2025-04-19 17:38:11.593422','read write',1,5,'2025-04-19 07:38:11.608916','2025-04-19 07:38:11.609174',NULL,NULL,'660d58e102b5211bae23535fd3c97cd21fee66421e6cccef54f03c6324bf45bc'),(42,'39XaefVIaZsOQq1d9I7SAqUccGmadX','2025-04-22 12:36:37.562053','read write',1,5,'2025-04-22 02:36:37.562674','2025-04-22 02:36:37.562701',NULL,NULL,'9c6afe89b9bf5d240fbe77daeb251ee6c031a7db1c275445b69575fcb670ad17'),(43,'rdHRYYNqs31jwD2oPLB8gNZqO4ag01','2025-04-22 12:38:06.168457','read write',1,7,'2025-04-22 02:38:06.169844','2025-04-22 02:38:06.169853',NULL,NULL,'ad89b0f30c506aef2b872421124bfff87d60adc9ccdcf48f01e6505f65248226'),(44,'7foL4muF7EdyuWeRtbl4NEBeBPvshe','2025-04-22 12:38:20.041124','read write',1,3,'2025-04-22 02:38:20.041407','2025-04-22 02:38:20.041416',NULL,NULL,'4bf5009459ff0ca6345a4e3a9bc5c21c381c75341b8254b1c2834c742c88f5f5'),(45,'YFbulVG63V2Jyeq5XmFLxGChUWn8D1','2025-04-22 13:24:26.826500','read write',1,5,'2025-04-22 03:24:26.827138','2025-04-22 03:24:26.827148',NULL,NULL,'e07956947bcf38ef37116ec451c6a145f820fa8b64939ca024278df077dbba74'),(46,'RDGUsgzUP8U2iRzGEfXdqOfW0EsXRv','2025-04-22 19:33:01.096579','read write',1,3,'2025-04-22 09:33:01.100530','2025-04-22 09:33:01.100542',NULL,NULL,'bac85bae8b3485bcf9ee5e3f6b008bfcd401093d9c3d3f66a2f1d20e3b43002a'),(47,'B5ZPmzxTFSB3OhEAo9F4o6qcPdM2qv','2025-04-22 19:52:06.617948','read write',1,3,'2025-04-22 09:52:06.618351','2025-04-22 09:52:06.618362',NULL,NULL,'0e0e5aad976c12192f02770af0b369c713105a75aa2ba2154c26e7db4132f29f'),(48,'JJMSVtJZ5tf1IB3cnw3u8DD8whFJYF','2025-04-22 20:03:15.867939','read write',1,5,'2025-04-22 10:03:15.868763','2025-04-22 10:03:15.868773',NULL,NULL,'8044975977e14e9aaecc165449dc436f451d0176b1969b4a1027d5e52b213528'),(49,'I75LHhcB5mAfwOVRheIZk0E9MiHuCZ','2025-04-22 20:04:16.149075','read write',1,3,'2025-04-22 10:04:16.149448','2025-04-22 10:04:16.149457',NULL,NULL,'42abfb8a3ffffed167ab80000cd0e632ce3ef02edac0ed621640c13609da904e'),(50,'ZYIUSTJBjAJ0RVTAKWmAXJEiGAaoXQ','2025-04-22 20:23:38.551275','read write',1,5,'2025-04-22 10:23:38.553726','2025-04-22 10:23:38.553747',NULL,NULL,'10f93991ea2a86e91f7d6f08ba20936737d4858d91abd241011cbc97e8b16475'),(51,'G1v1SLPRcklAlOOZm0iMl8I6jya1ea','2025-04-22 20:30:50.566162','read write',1,5,'2025-04-22 10:30:50.567559','2025-04-22 10:30:50.567579',NULL,NULL,'06ee9cef928c8015c6d1d637aa894f597e3921803701a490a4b268e3e42b5ef5'),(52,'Ws9yS4bfOlHd2KmOKPVM54iUNFbKQu','2025-04-22 21:37:05.997512','read write',1,3,'2025-04-22 11:37:05.998013','2025-04-22 11:37:05.998045',NULL,NULL,'a33c56bc21ba4250e4a7240f8072bee0b64094da6b1fa0887e47412cfee2e10b'),(53,'zNI1JmLyGp5ifGXd2EvDgCPnp6PPmr','2025-04-22 21:37:55.204077','read write',1,5,'2025-04-22 11:37:55.204360','2025-04-22 11:37:55.204368',NULL,NULL,'571f6f7057be797e33e50e598c40f9e47f3b9542a6c1c3ff4f585c4ff8dd38d3'),(54,'pIdhHYsaZFOtjooIB7VliaB8FjgXWR','2025-04-22 21:40:26.806915','read write',1,3,'2025-04-22 11:40:26.807426','2025-04-22 11:40:26.807439',NULL,NULL,'0b8c2513eb62604cfa583bd5c5e70c5447613a91cd7d0cc3609571f56039e1d6'),(55,'pSNeHeod29RGOOnLxks9BljG3S6pYR','2025-04-22 23:34:41.348330','read write',1,5,'2025-04-22 13:34:41.349125','2025-04-22 13:34:41.349136',NULL,NULL,'f82dc63a65aae71683b32cda493b6162957865be91527337018eba1c44fe4df6'),(56,'3ttuAQ3rOUjwlLgF3o5GTqGYtD79AZ','2025-04-22 23:34:57.961934','read write',1,3,'2025-04-22 13:34:57.962201','2025-04-22 13:34:57.962210',NULL,NULL,'a4671bfd928acb39f77ede3cddc3084421d2000856b3673b1cb36e643dca472d'),(57,'umfMKb5mpbLTR4NnSouxS7xDIhvLcM','2025-04-23 16:18:36.226519','read write',1,3,'2025-04-23 06:18:36.230782','2025-04-23 06:18:36.230808',NULL,NULL,'e6b741ff6d37236a48213547b3be16fa5d952aeeabd40cb0ae208bf40c725d90'),(58,'PA4RhcyM8R0i7eugIyhhGQpM6A0WPc','2025-04-26 00:58:02.105380','read write',1,3,'2025-04-25 14:58:02.106102','2025-04-25 14:58:02.106114',NULL,NULL,'83977bbc692506623f1cf3c1ef40d465b69e79034f75bb87c43be3f07a2bfb82'),(59,'8c7fBvtQXHySYtnxAWzzW4lG5N4Mtr','2025-04-26 01:00:39.339022','read write',1,9,'2025-04-25 15:00:39.339388','2025-04-25 15:00:39.339397',NULL,NULL,'71db5584ab422b602413ae55b90ff012ac335ceeebfcd82b95a2ef3c3e93a644'),(60,'o8zvHzpU3e982LlBzUkvwp2qjHEvGp','2025-04-26 01:15:44.368101','read write',1,5,'2025-04-25 15:15:44.368497','2025-04-25 15:15:44.368508',NULL,NULL,'1d5454532800f214c9f9064a4d54eebd707a308845c92df24cd379349f62f804'),(61,'wykBwgRlU46Xjtkbl6sc2tFzgaydvQ','2025-04-26 01:24:20.071913','read write',1,5,'2025-04-25 15:24:20.072265','2025-04-25 15:24:20.072275',NULL,NULL,'224800bcb06aca71089194d4b27d89aa2a033a30ddabd054ab1b02bbbf93f3e4'),(62,'c9Trp87BtvFDbGoFNS0HtbUH8k0fwa','2025-04-26 01:24:30.263195','read write',1,7,'2025-04-25 15:24:30.263465','2025-04-25 15:24:30.263473',NULL,NULL,'d4b07211f4ff178bbc754dd36c1c80b9c22ed2781d93b02582b6199594cd52ac'),(63,'UsuSY4IXDu9dSJ6x5jEDQLrvYcqFe4','2025-04-26 01:43:10.992068','read write',1,3,'2025-04-25 15:43:10.992636','2025-04-25 15:43:10.992647',NULL,NULL,'569d07e14c04ae6bfdfda711fe4f9a0ddab9d232d61fe42051c4548d4d1615ca'),(64,'F9b0XvFHjyhvmqUtGpPlpjMCt3VK5L','2025-04-26 01:59:27.069207','read write',1,5,'2025-04-25 15:59:27.069611','2025-04-25 15:59:27.069622',NULL,NULL,'92fd20b9245e0c2dadd7bec383c84adb23025e84e01f5a4eed82b5a618a1a551'),(65,'mnbnN1PTKTpNV7aGG4IWVN9j4jor8u','2025-04-26 02:00:49.863545','read write',1,9,'2025-04-25 16:00:49.863901','2025-04-25 16:00:49.863910',NULL,NULL,'6004bc2d29ad0a89ccf0d64654aa35a936482d2903d606dfaf39dd52f5d5be19'),(66,'MNOS8YydNnuc9ZAr8SRL1gqJ2y0qh3','2025-04-26 02:03:40.640977','read write',1,5,'2025-04-25 16:03:40.641250','2025-04-25 16:03:40.641259',NULL,NULL,'1ad005b347fb9520985930178e07578ec0cfc85223018b54556f4b7f23d0460d'),(67,'c8y3EbTawBMlKhMgcWoE0ve1Fbmgqb','2025-04-26 02:04:48.400533','read write',1,7,'2025-04-25 16:04:48.400829','2025-04-25 16:04:48.400837',NULL,NULL,'c9cfd39677c02c997aa84890e8ae7b3f323a7067e4468400e35df769d666de11'),(68,'YozyUdWXAWthwmAtBRXzuctyFlLcOe','2025-04-26 02:05:06.445590','read write',1,3,'2025-04-25 16:05:06.445874','2025-04-25 16:05:06.445882',NULL,NULL,'744a1ea213343ac8faab77ec6ac199bad004805247260b54111d69e8e2edee13'),(69,'5MNHnMChfgJqRoVXErfl1BAjKedypr','2025-04-26 02:07:10.750523','read write',1,5,'2025-04-25 16:07:10.750799','2025-04-25 16:07:10.750807',NULL,NULL,'c940be11d4c1f9b91a06fead4972284be7aee2fa71acf4daa2febdd71cbba22d'),(70,'s7FJUScjViJFfzKz3kHIH2GLJJTdn5','2025-04-26 02:07:24.040154','read write',1,3,'2025-04-25 16:07:24.040501','2025-04-25 16:07:24.040511',NULL,NULL,'cefaaca5f2ad2c090d14633293ec29d2f347c8388edfba091be7dce5b5019f96'),(71,'UbzjBW66CT79ejueA9iQ3BfrUzlNd0','2025-04-26 02:08:04.611223','read write',1,9,'2025-04-25 16:08:04.611507','2025-04-25 16:08:04.611516',NULL,NULL,'d536c334da8371f479186c4bf81afc2a5c936453f7d4586be76b99fa7293097f'),(72,'FMTjYx5PDc7FBZmgCx4zuYhQvckxOY','2025-04-26 02:12:16.031965','read write',1,3,'2025-04-25 16:12:16.033952','2025-04-25 16:12:16.033969',NULL,NULL,'bfbd5fc194eba176f86ac3ffe98dfda5915febaab8c45e687d76b6c23e3096ac'),(73,'L9BMTnr35X9GgILbLFH6JAyXdbZKCT','2025-04-26 02:14:05.208515','read write',1,5,'2025-04-25 16:14:05.208787','2025-04-25 16:14:05.208794',NULL,NULL,'3cee2f3dfb9727150ef60a98d5884d63bc509b6322e07567fad86c820b38f8e6'),(74,'fJ2038JNrC4uQzCi8DRuVlw8hUUg7a','2025-04-27 01:13:44.654469','read write',1,5,'2025-04-26 15:13:44.655456','2025-04-26 15:13:44.655471',NULL,NULL,'3aa5f0a36d12e8a35f372459b5e1836468a9824aba288149536b851e18e23cc5'),(75,'zmMp6LjDxRo2XEq3tYxDIL5KGw9VHO','2025-04-27 01:31:09.482575','read write',1,3,'2025-04-26 15:31:09.483451','2025-04-26 15:31:09.483493',NULL,NULL,'eaf90fdbe1ae11cf64f38e45a967a131f67e635c807a687036c6890e35270936'),(76,'7hdBxftCj4qRgRk3ZO5qGb7vYByIxq','2025-04-27 01:31:55.172886','read write',1,3,'2025-04-26 15:31:55.173206','2025-04-26 15:31:55.173215',NULL,NULL,'53e3a77ff2f2234daa49e1fabd67b3c5d0f916bfc293e09cac5b1fa6da00f90c'),(77,'TKG1hFvrtAQpBOeH7gDg2DUu3nEmL2','2025-04-27 01:38:32.350898','read write',1,3,'2025-04-26 15:38:32.351449','2025-04-26 15:38:32.351460',NULL,NULL,'484f5254f5d6b37c879c964cf68fc01d97e3ca2492317cefcd527be024723818'),(78,'vy9jthn73tBmhrDSiN48QovzDYV7SG','2025-04-27 01:58:17.599248','read write',1,5,'2025-04-26 15:58:17.600260','2025-04-26 15:58:17.600269',NULL,NULL,'3986d64f151f9b032dae946a9b4bdacfda0ed385e63d649d78274150ae3ce7d7'),(79,'TSoHshHWmQh3t8lsGEPL4K8FaC1cY4','2025-04-27 02:12:37.293209','read write',1,5,'2025-04-26 16:12:37.294920','2025-04-26 16:12:37.294933',NULL,NULL,'fda685085fdbcfbeb8534e37bd8002c7ad532c8cd605ac366ee874f3e1165013'),(80,'V9JL1IpP4FdEH22L3dOVW7p1gvqyBl','2025-04-27 02:23:18.583537','read write',1,9,'2025-04-26 16:23:18.584070','2025-04-26 16:23:18.584079',NULL,NULL,'b2cec2d6c0a0a2502b2ade2b8e3a78613149dec8aa3651c618a4191351dbb5e8'),(81,'zzXW6a4Z1RKZvPJTDOPO78yMuVTW03','2025-04-27 02:23:31.862550','read write',1,3,'2025-04-26 16:23:31.862983','2025-04-26 16:23:31.862991',NULL,NULL,'eb88a9d454e1d6451815a75d3b0384433077baf8981e9677f6e1174b21c93a86'),(82,'oDNInIhF5jUSPZejPUvabvPLZFCc3P','2025-05-07 20:26:17.184252','read write',1,3,'2025-05-07 10:26:17.186112','2025-05-07 10:26:17.186124',NULL,NULL,'afe2ff2204563b63c16bf035a02cb3dd4f381951cfd76f2ea18f454d539851b2'),(83,'s2eYiaLVUwEADYHT4vjiXqNDesOhMu','2025-05-08 00:00:31.682845','read write',1,3,'2025-05-07 14:00:31.683494','2025-05-07 14:00:31.683506',NULL,NULL,'68cad982c5385ac47bff52d6e931d148daf4029cd5a69c9785c099d345be81a6'),(84,'5rhrPMbLetN00VGF76hp2QvvIZEd3g','2025-05-08 00:08:25.073464','read write',1,5,'2025-05-07 14:08:25.074070','2025-05-07 14:08:25.074082',NULL,NULL,'2fc4477ca1752aa4c074bee7cbeb7be94549cba0b6a6a2c6bd04feeba75134c6'),(85,'KfZpHrCWKMzgF6cLo7k69nfxPnblyC','2025-05-08 00:08:37.292456','read write',1,3,'2025-05-07 14:08:37.292737','2025-05-07 14:08:37.292746',NULL,NULL,'c88c5db4498ebcdfb06cb80e1620a0c7176e6c1d9d89c0872d27240d8755e757'),(86,'4YA5GmtV9uK3QHd8SnQDeO92eF8aVP','2025-05-08 01:29:00.469465','read write',1,3,'2025-05-07 15:29:00.471120','2025-05-07 15:29:00.471160',NULL,NULL,'e3c7db1fc4f9c666bef168c53b76b7967f8442b794193f2fc2bfb39edaacc177'),(87,'zzepvfOEW0Knm4mmlJnpXPaAUzxLQl','2025-05-08 02:06:52.502075','read write',1,3,'2025-05-07 16:06:52.502937','2025-05-07 16:06:52.502949',NULL,NULL,'c1bb4aca9914831cc07e14506e9847ed4b8428d6aadbfcbaecf44c00097eced4'),(88,'LPY3RH8vNMlwZJYWzpDGMf7zDzonjH','2025-05-08 02:21:11.399198','read write',1,5,'2025-05-07 16:21:11.399871','2025-05-07 16:21:11.399880',NULL,NULL,'12ab676c132fb9992953823e30f429b274bb222f22840ec23999392f988a02cb'),(89,'fkklC1hYYlLgvFvRqhY313jz6XSm8O','2025-05-08 02:38:29.255401','read write',1,5,'2025-05-07 16:38:29.256340','2025-05-07 16:38:29.256350',NULL,NULL,'6d03ff411d55a0f0fe2fa81f61b15ceebbc62926986055f8f2930c4f2a79d702'),(90,'GpSxwyjXg3g7ZnCV2VJQWiLCzO56l2','2025-05-08 02:53:02.786043','read write',1,3,'2025-05-07 16:53:02.786463','2025-05-07 16:53:02.786476',NULL,NULL,'acadd350b74013d2e8c90b15a9224e9e100137942f83611583ba5d676f189440'),(91,'k4DbiV4pgXtnZRmiqthRdl2Iy0XKmc','2025-05-09 02:09:27.729447','read write',1,3,'2025-05-08 16:09:27.729939','2025-05-08 16:09:27.729951',NULL,NULL,'6b5dfb3a315aca92c211fe2f262e3f17d22c925b880921e35c83a936668c506d'),(92,'5xcqyiMzYQdOqD08vBaQtfE3susJpv','2025-05-09 02:20:02.920210','read write',1,5,'2025-05-08 16:20:02.920738','2025-05-08 16:20:02.920748',NULL,NULL,'d14eb88c0a52b3190005af5a0b2005d186c7edbcb1f701dc40da4b9fa3f77c3a'),(93,'HAU8JB01p5MrqNqW3i0dvElkoCmFvF','2025-05-09 02:24:03.892168','read write',1,3,'2025-05-08 16:24:03.892586','2025-05-08 16:24:03.892602',NULL,NULL,'8d63fa9e50dd581c067d8554e2ad75a851897a21fb02e5421c16a9d046b36ab3'),(94,'rkBRvkVcX0UXKcATqLH6X8nmPtmLQI','2025-05-09 02:24:49.465626','read write',1,5,'2025-05-08 16:24:49.465936','2025-05-08 16:24:49.465964',NULL,NULL,'c544b337fdbf0c498d51d5e4e9e04a7862524900d4b30786aaa72434e26b8bc9'),(95,'nHqAFs27ofehLTr9uXrB14vL6UWw4s','2025-05-09 02:41:20.087786','read write',1,3,'2025-05-08 16:41:20.088140','2025-05-08 16:41:20.088148',NULL,NULL,'e266acd5b32ce049dad0a7599377f0b91839bf765273127d008c6ff75ab342c8'),(96,'qwYRPn3MpLqw3Tjwy5tZELPLyvbvwZ','2025-05-09 02:41:43.600822','read write',1,5,'2025-05-08 16:41:43.601154','2025-05-08 16:41:43.601163',NULL,NULL,'54d715a8742871ecd3d2fe61d22fc397a4f6a4cd11101d63dc75f8a997a4c0fe'),(97,'2p3DhKyktF9XnzNPK3oJdaJNnOIK48','2025-05-09 02:42:26.762774','read write',1,7,'2025-05-08 16:42:26.763052','2025-05-08 16:42:26.763060',NULL,NULL,'34449f940cd92b2bf85cc63152dc7c83f1f18bd90dd24b9814842702198a2056'),(99,'QCZQDdB4CQoiZbnDPXey1CJGU3cm5L','2025-05-09 02:50:31.254148','read write',1,3,'2025-05-08 16:50:31.254615','2025-05-08 16:50:31.254626',NULL,NULL,'4157ca1283c51bcf4858217b296d0be34696b44f4282c5a37cf5492a49f424d6'),(100,'naCJw5kkOHgDex6TAmwiGLDnSp861u','2025-05-09 02:50:43.120146','read write',1,5,'2025-05-08 16:50:43.120538','2025-05-08 16:50:43.120547',NULL,NULL,'2987c4d03d64ee5923210651e1cc132ad194606213797eaaa75fb8694a5ebf80'),(101,'LFaa7tgTzn35lj7KOZMXbYudCWdMRC','2025-05-09 02:52:26.331237','read write',1,3,'2025-05-08 16:52:26.331722','2025-05-08 16:52:26.331730',NULL,NULL,'3ae5bbb03a71e4be3cdffea482621f68279a42eb93156c2a4e6a204078845a9e'),(102,'mZ0yy2MDavIzYOcyD4ULnSm2012q0p','2025-05-09 23:23:10.737612','read write',1,3,'2025-05-09 13:23:10.738823','2025-05-09 13:23:10.738838',NULL,NULL,'efc272ba3a0684d3e27a08ffb704f5af280f2abd162bb1b17ad3f6972cef106d'),(103,'lXTg8AugdyRKUMLj3KLpNZ29ds46Hf','2025-05-09 23:57:42.001639','read write',1,5,'2025-05-09 13:57:42.002060','2025-05-09 13:57:42.002072',NULL,NULL,'0f7426471c3080acbe141076b68cf559bf8db6e7997cef36026f67463362a787'),(104,'LfJAIrTDjJNd3lSVXYnRuvYtD3I0tY','2025-05-10 13:53:53.902761','read write',1,5,'2025-05-10 03:53:53.903299','2025-05-10 03:53:53.903310',NULL,NULL,'af07318acdf2e6e1dfc9e557c77aedf6a5c23c8e03e3b1c980789abf71ad8bf9'),(105,'uMBiSiV5okrMz3Ce3XIxb0pPJ1WDzv','2025-05-11 12:16:09.037790','read write',1,5,'2025-05-11 02:16:09.038232','2025-05-11 02:16:09.038243',NULL,NULL,'2fafe5b3fc95cec56ef938825e1cf74bae22603a38f70a840423c6c8fe85de2e'),(106,'VO8iqjRPXuuG3lgLBQLkXXD3vUbhYh','2025-05-13 01:00:40.602942','read write',1,3,'2025-05-12 15:00:40.604653','2025-05-12 15:00:40.604666',NULL,NULL,'1d9a1a170d7868b034ec4132963dfe0439a87acf164fc7c39a4c99f64bb59ed2'),(107,'XS9aYK6hlIEkHnp4brgWk2K1zzKPG8','2025-05-13 12:37:53.979964','read write',1,3,'2025-05-13 02:37:53.981670','2025-05-13 02:37:53.981685',NULL,NULL,'6f8bab1101928849e0416a2dd34a63d8e381674937a69ee3d9742104a82c23af'),(108,'HQ3cGHoLYftrti1PILKnay4l1uBPvL','2025-05-13 13:32:09.350766','read write',1,10,'2025-05-13 03:32:09.355016','2025-05-13 03:32:09.355028',NULL,NULL,'4c015cad18747fa39567dfe7a8dcc4534e853cfd2e983f44068f095d8aa3ee4b'),(109,'FN9jPD0poiMLtQNAqDpqTq19Uh31F4','2025-05-13 13:45:44.015167','read write',1,10,'2025-05-13 03:45:44.018661','2025-05-13 03:45:44.018677',NULL,NULL,'0dc7e86ff53467d2c68d294296e8f046f926043f26975168825623c2f65ba94f'),(110,'NUo5H7dXK2ed6tUkXkWsCSs5fS8ZcU','2025-05-13 15:02:16.467235','read write',1,3,'2025-05-13 05:02:16.478597','2025-05-13 05:02:16.478621',NULL,NULL,'e3df004692257b1bffdfb0c41fa464b0e2cd339edc5c7d49c48fd441b5a71047'),(111,'Z9wzFGt6meuuyBHwV9eeC1Xb42lmWE','2025-05-13 15:15:12.568753','read write',1,10,'2025-05-13 05:15:12.574389','2025-05-13 05:15:12.574400',NULL,NULL,'a258561d757d1d8d6cbb5e7db3f5c516ed305b5e550a3ccc6de7956aa12156ca'),(112,'hxZpqNGS1OH0QkdbdKepsZpZyRLidr','2025-05-15 11:53:47.393722','read write',1,10,'2025-05-15 01:53:47.406263','2025-05-15 01:53:47.406280',NULL,NULL,'94a826760684aa447908aaa68554a82bfa813ae2c7a8ddd51f9cdb39a9043dc0'),(113,'on67rBHoa6JOKucHuMpHlf3whwWViK','2025-05-15 11:58:08.326515','read write',1,5,'2025-05-15 01:58:08.327312','2025-05-15 01:58:08.327323',NULL,NULL,'d8d6068a7e309ef46d0b58555508ec97d2915bd4535bbd8903e929d708d31228'),(114,'NVnH9wIxC7ZNY4rAN2eW1AhJJMeLVy','2025-05-15 12:04:38.034419','read write',1,10,'2025-05-15 02:04:38.035227','2025-05-15 02:04:38.035236',NULL,NULL,'267406199dbdbc18341e7819bbcd7191acc1a8dacf85371d465e93daf75c9615'),(115,'Hyv8SyhZMGIoKqekzrV3OBOnQVXkxD','2025-05-15 12:08:34.382502','read write',1,10,'2025-05-15 02:08:34.383238','2025-05-15 02:08:34.383247',NULL,NULL,'b79d52264241b4c6ce39b2c22c8835c85ab79fe10b4c4e521a2960bb640330e0'),(116,'x0wgx6NPmaqVTNCjPIARfhfhtlXXys','2025-05-15 12:20:02.691100','read write',1,10,'2025-05-15 02:20:02.693254','2025-05-15 02:20:02.693264',NULL,NULL,'7a46b5c1269f4456b73d2498f88b0cbe1842e46e182bcd93ef36e4ac01be443c'),(117,'VdGphx55OQB53dXRa9Rd1L5iISjNek','2025-05-15 12:49:09.242154','read write',1,5,'2025-05-15 02:49:09.243443','2025-05-15 02:49:09.243453',NULL,NULL,'c58856315cfde2eb4d96b911690a3e797e232f56464a8e3e757620760a53cd77'),(118,'ReyWPqTqK24FlfRIad7LOAitbIoRhE','2025-05-15 13:02:10.030853','read write',1,10,'2025-05-15 03:02:10.032618','2025-05-15 03:02:10.032629',NULL,NULL,'9deefed966e63f4271402f3e5b8cbe6b9278e66f6cd96c1dc173fc2b1f848b64'),(119,'9Zv8HDKyOn0qvE1CXWDjVMG2vKDJMi','2025-05-15 13:18:34.908074','read write',1,5,'2025-05-15 03:18:34.911456','2025-05-15 03:18:34.911468',NULL,NULL,'86b7f65e4486ebe1a85e9abbff7003fe09cfca3d84783de0f1be8257c8986e67'),(120,'9pnrSnbocHXDqBMIYU1JlyH5H6kIve','2025-05-15 14:19:29.586287','read write',1,10,'2025-05-15 04:19:29.586908','2025-05-15 04:19:29.586921',NULL,NULL,'fbd36a62a2720f8532159472e88493cf891a6cce624f5b150f41a44bd68bdbdd'),(121,'LnLXvttKFBJA1s91tIWWoyfTfcWUmR','2025-05-17 03:00:03.870112','read write',1,5,'2025-05-16 17:00:03.870828','2025-05-16 17:00:03.870846',NULL,NULL,'5fdbc85be9ce508ebef24049ac4004cf3b445d337055f6f2321454c37d2342f9'),(122,'UKa2lmAVX5I87mc45tcEMMg8a6rVmH','2025-05-17 03:24:17.888619','read write',1,10,'2025-05-16 17:24:17.891130','2025-05-16 17:24:17.891156',NULL,NULL,'9fa6fcae103f37e9cc4391305d68ce74845bcd433fd776ddc4f0ad7572475835'),(123,'1JrxCcvylkciuu2rje3HbLMxRbH2zE','2025-05-17 17:33:11.225890','read write',1,10,'2025-05-17 07:33:11.227210','2025-05-17 07:33:11.227230',NULL,NULL,'73e3d25d9f74970ae5352c8e757174f3d2aa8fc8afa862b3aef252a2d83e11e9'),(124,'VBnx8rrlkN90gFCycdkMzvQF6l2SFR','2025-05-17 17:34:10.755154','read write',1,3,'2025-05-17 07:34:10.755594','2025-05-17 07:34:10.755603',NULL,NULL,'626d7682791c462e7e09d9225fd5f9378af8c98a4bbb78842026f29d1c32adeb'),(125,'5wxAK67bMDdiea8YjYbTGNkPazMLVQ','2025-05-17 18:22:08.708329','read write',1,5,'2025-05-17 08:22:08.710455','2025-05-17 08:22:08.710485',NULL,NULL,'661810d11104cae9820c6b5449cb4b70743b07ba238167c223e2933cd1d89236'),(126,'exjr6CdwgX81UeyUuZd8WhCC4vvDLu','2025-05-23 12:39:03.218890','read write',1,5,'2025-05-23 02:39:03.219440','2025-05-23 02:39:03.219449',NULL,NULL,'742df2c95279be27bb03795da9109c9a401065fc1eb2a2765c9608321b3108cd'),(127,'IcD3kZXH3IXbTyVnebQomzdPIgykJU','2025-05-23 13:10:36.985576','read write',1,10,'2025-05-23 03:10:36.985951','2025-05-23 03:10:36.985959',NULL,NULL,'5016971f6b5def571a6502757aa09521cd2e2c453d97aab5401564afc37e6ca1'),(128,'H1IXZZqgjJ2TWC7bsHr9C3Cu9Zpnrw','2025-05-23 13:10:55.098615','read write',1,5,'2025-05-23 03:10:55.099372','2025-05-23 03:10:55.099385',NULL,NULL,'31c532bb4a464f409b1ffe70c7b5a257df79480c948ff86b5603172fb6b4a929'),(129,'EhaHrlYXn2xGRejE7P82Kms1Ibo17i','2025-05-23 15:58:07.722426','read write',1,10,'2025-05-23 05:58:07.722847','2025-05-23 05:58:07.722859',NULL,NULL,'cf4a1269fb0f2f930295457aba7f977361d7b1fb0fd0a59db1e1bad919cd5670'),(130,'Dqt8G4iBzSUwhh87Jb5q6aJ5Lypcew','2025-05-23 19:34:18.142198','read write',1,5,'2025-05-23 09:34:18.145724','2025-05-23 09:34:18.145741',NULL,NULL,'b6e18d696f9780fc318cd2bcd9912dd02f1af1cb42de57e2bded413c23d7f1a9'),(131,'wpjcP3tN9Atow9GrAn034lzwN1jsRf','2025-05-30 23:04:16.943903','read write',1,10,'2025-05-30 13:04:16.949759','2025-05-30 13:04:16.949772',NULL,NULL,'4dc82477173884545e195cd89308716f5e5a48d19e28aeacd00520d15edb2507'),(132,'AHeSiaLV9EJ0oHqfVidz2zf8niCNYq','2025-05-30 23:11:54.687973','read write',1,10,'2025-05-30 13:11:54.688848','2025-05-30 13:11:54.688860',NULL,NULL,'0575090269b9032d42e28d6e4f137ba648a4d49a4b985cb6d2b6b79349bce481'),(133,'49d5u4rVgV7p6Es0lxhqKbfgwIV0XW','2025-05-30 23:34:17.581168','read write',1,10,'2025-05-30 13:34:17.583602','2025-05-30 13:34:17.583614',NULL,NULL,'8cd2b033954a746f2c679ecabcf42cb3bb0aadbcfe06191d678d02ca2ff700c9'),(134,'Dj6LdFWa8E5iUl7Vzvvr5HoBPIZEyb','2025-05-31 13:58:34.467932','read write',1,5,'2025-05-31 03:58:34.470834','2025-05-31 03:58:34.470867',NULL,NULL,'342437eabdd871b0d7a51b9df4078b06889e58918b1f28b806cd418854d84c05'),(135,'9mS6gC5b1phg5tXWcFzcavgAAYTSbX','2025-06-01 11:18:52.712240','read write',1,10,'2025-06-01 01:18:52.714308','2025-06-01 01:18:52.714325',NULL,NULL,'f5eb5bee70cb97ddded6c5047a445fd488f03f1ef269a94791fce617c6b4cc44'),(136,'aRVsFNlI3Zfn51jFAnxrqnNmYcvTrV','2025-06-01 11:33:25.990468','read write',1,5,'2025-06-01 01:33:25.992179','2025-06-01 01:33:25.992190',NULL,NULL,'b182cf6b94b71c96ebf43e1f6e5f5399bce6b702f93efdd21a9451724dbcdf0f'),(137,'FGgQVwo4sDQnlgaPxuLekH5QKbZrB5','2025-06-01 11:33:26.004292','read write',1,5,'2025-06-01 01:33:26.004484','2025-06-01 01:33:26.004504',NULL,NULL,'0454fcf145e33e09d6a15650b22be7b7a704b75a94595a1dc09a8431291f8be1'),(138,'TNAQSeYdEZjpcp6bWmwaGQ9o4Pb6Df','2025-06-01 14:10:38.459129','read write',1,5,'2025-06-01 04:10:38.460237','2025-06-01 04:10:38.460247',NULL,NULL,'00db97cfc87a410b354a08cfcb0069a9da5876341c761ad5b26e05f38bf4245c'),(139,'NEqfBRez0uM9UmrIGcqaRzdwOO2Pwx','2025-06-01 19:25:37.684003','read write',1,3,'2025-06-01 09:25:37.685230','2025-06-01 09:25:37.685245',NULL,NULL,'ad2191b2b4107997e55288a11954b31a014b1fc5d3d5b1f0d2b7ec52dcca5e0a'),(140,'HhrcF5S0FQzQvNOsYR13cP8ctoH6R2','2025-06-01 19:27:15.526884','read write',1,5,'2025-06-01 09:27:15.527551','2025-06-01 09:27:15.527565',NULL,NULL,'619116dbde29d8b2605a6fab077395e882f853f39e2b9b23dcd4a8455a1a986d'),(141,'xhhhaz9h1dlHM4lQMots7pHRIjHCcS','2025-06-01 19:29:34.396459','read write',1,3,'2025-06-01 09:29:34.396880','2025-06-01 09:29:34.396892',NULL,NULL,'b1deb0942b11653ad1de12262d248fd794606ce81a0c6254ce519af6ed60907c'),(142,'vqbno9qgnjqjw3TP26FSW5BKGws5YX','2025-06-02 19:50:09.792013','read write',1,3,'2025-06-02 09:50:09.792954','2025-06-02 09:50:09.792969',NULL,NULL,'a285c3ecadba67813d22a7167b59ad79e02c18a51b641924cd7c646bd80d70ae'),(143,'jXgLaXdeF0dgNf8AySD8AevLROijmx','2025-06-04 04:24:56.931530','read write',1,10,'2025-06-03 18:24:56.936843','2025-06-03 18:24:56.936868',NULL,NULL,'0f38c34b900328ab6721fbc7cd2e0d65a66dbf31d3cd29a02012ab72f6262f9e'),(144,'TtRKTCkatAxSAHzGxSF4a05oEN6Axo','2025-06-04 04:31:07.513274','read write',1,10,'2025-06-03 18:31:07.513841','2025-06-03 18:31:07.513856',NULL,NULL,'483884dc5ff12871e16c9033f8c43659e8e1c7f6752db9f0e5dfeb917674fd3b'),(145,'LW4UORBtVwo0QhwT8aMVK4waQsiI33','2025-06-04 04:35:35.096833','read write',1,5,'2025-06-03 18:35:35.097300','2025-06-03 18:35:35.097313',NULL,NULL,'5ef2d4ee585ac5e0e734f3daf0dbb8d402b6d0eaee7de9d8feb886d2b6765b67'),(146,'KN3qXRYs1KWZrNWT6J2QrCSgtnJu7o','2025-06-04 04:40:49.472243','read write',1,10,'2025-06-03 18:40:49.473185','2025-06-03 18:40:49.473199',NULL,NULL,'3e0466bb16c17ea2ce416f17fde73445630af1776b543d997a8fd319c8aebcdb'),(147,'BLU8x1pVqFPrLYhyKufIQGnIrPCaQV','2025-06-04 04:52:25.960583','read write',1,5,'2025-06-03 18:52:25.962729','2025-06-03 18:52:25.962746',NULL,NULL,'6e1caae8465778cbe859243e0ace31e8a73131aa55e109ceb9c9b0a6602ad3b1'),(148,'mMpxaPwHqb6AKXqyPwwSlaYyvnmbZF','2025-06-04 05:04:22.412310','read write',1,5,'2025-06-03 19:04:22.412937','2025-06-03 19:04:22.412952',NULL,NULL,'a9385bb52f7c17520fadd74a96eaba6d0f2bcfe72807d33cc7453dc35931d265'),(149,'zbAOONdacpWw59tNApuoDkyu5aqmEH','2025-06-04 19:49:30.244906','read write',1,10,'2025-06-04 09:49:30.246076','2025-06-04 09:49:30.246098',NULL,NULL,'002fceaad37b9051af99b0d83580d88cb91d37ef6b59b7f034558e94adb09909'),(150,'AW8KipPExKGHB0uYGQw3u7vGdRMdH1','2025-06-05 10:24:59.940578','read write',1,10,'2025-06-05 00:24:59.953314','2025-06-05 00:24:59.953335',NULL,NULL,'dc8d58889266681832d4f9441e797cfd8b7f22ae7b1c2f9abcda0da4fe6e227d'),(151,'jWPEjvfXORjvJbbxQfDNrmNptVIG6A','2025-06-05 11:02:52.131744','read write',1,5,'2025-06-05 01:02:52.132618','2025-06-05 01:02:52.132627',NULL,NULL,'7aa60b6ec1f86638d9aa1c8e742d725260e698b100f9e1d4cb2646db75099b1c'),(152,'mk1oS4jhoc3RIYL3QMGuNx5528pwOD','2025-06-05 13:29:19.498492','read write',1,10,'2025-06-05 03:29:19.510451','2025-06-05 03:29:19.510486',NULL,NULL,'ac6c8256c1fadc0d899291a67a4d27f23e0ac055edd5adeaae03898c8eab0a4e');
/*!40000 ALTER TABLE `oauth2_provider_accesstoken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth2_provider_application`
--

DROP TABLE IF EXISTS `oauth2_provider_application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oauth2_provider_application` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `client_id` varchar(100) NOT NULL,
  `redirect_uris` longtext NOT NULL,
  `client_type` varchar(32) NOT NULL,
  `authorization_grant_type` varchar(32) NOT NULL,
  `client_secret` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `skip_authorization` tinyint(1) NOT NULL,
  `created` datetime(6) NOT NULL,
  `updated` datetime(6) NOT NULL,
  `algorithm` varchar(5) NOT NULL,
  `post_logout_redirect_uris` longtext NOT NULL,
  `hash_client_secret` tinyint(1) NOT NULL,
  `allowed_origins` longtext NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_id` (`client_id`),
  KEY `oauth2_provider_application_user_id_79829054_fk_jobs_user_id` (`user_id`),
  KEY `oauth2_provider_application_client_secret_53133678` (`client_secret`),
  CONSTRAINT `oauth2_provider_application_user_id_79829054_fk_jobs_user_id` FOREIGN KEY (`user_id`) REFERENCES `jobs_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth2_provider_application`
--

LOCK TABLES `oauth2_provider_application` WRITE;
/*!40000 ALTER TABLE `oauth2_provider_application` DISABLE KEYS */;
INSERT INTO `oauth2_provider_application` VALUES (1,'W98vZiDOW9W6Nk0WCofMkzINkOjmudnK7iOgrubr','','confidential','password','pbkdf2_sha256$870000$ZPOWPttzbI7e3ckY0sDMmX$lMrla4TXDlgYGzWyIqxpV0Ui/1gNJRSTWGNLWGapLcg=','job',2,0,'2025-04-14 16:01:29.637002','2025-04-14 16:01:29.637034','','',1,'');
/*!40000 ALTER TABLE `oauth2_provider_application` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth2_provider_grant`
--

DROP TABLE IF EXISTS `oauth2_provider_grant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oauth2_provider_grant` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `expires` datetime(6) NOT NULL,
  `redirect_uri` longtext NOT NULL,
  `scope` longtext NOT NULL,
  `application_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `created` datetime(6) NOT NULL,
  `updated` datetime(6) NOT NULL,
  `code_challenge` varchar(128) NOT NULL,
  `code_challenge_method` varchar(10) NOT NULL,
  `nonce` varchar(255) NOT NULL,
  `claims` longtext NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `oauth2_provider_gran_application_id_81923564_fk_oauth2_pr` (`application_id`),
  KEY `oauth2_provider_grant_user_id_e8f62af8_fk_jobs_user_id` (`user_id`),
  CONSTRAINT `oauth2_provider_gran_application_id_81923564_fk_oauth2_pr` FOREIGN KEY (`application_id`) REFERENCES `oauth2_provider_application` (`id`),
  CONSTRAINT `oauth2_provider_grant_user_id_e8f62af8_fk_jobs_user_id` FOREIGN KEY (`user_id`) REFERENCES `jobs_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth2_provider_grant`
--

LOCK TABLES `oauth2_provider_grant` WRITE;
/*!40000 ALTER TABLE `oauth2_provider_grant` DISABLE KEYS */;
/*!40000 ALTER TABLE `oauth2_provider_grant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth2_provider_idtoken`
--

DROP TABLE IF EXISTS `oauth2_provider_idtoken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oauth2_provider_idtoken` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `jti` char(32) NOT NULL,
  `expires` datetime(6) NOT NULL,
  `scope` longtext NOT NULL,
  `created` datetime(6) NOT NULL,
  `updated` datetime(6) NOT NULL,
  `application_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `jti` (`jti`),
  KEY `oauth2_provider_idto_application_id_08c5ff4f_fk_oauth2_pr` (`application_id`),
  KEY `oauth2_provider_idtoken_user_id_dd512b59_fk_jobs_user_id` (`user_id`),
  CONSTRAINT `oauth2_provider_idto_application_id_08c5ff4f_fk_oauth2_pr` FOREIGN KEY (`application_id`) REFERENCES `oauth2_provider_application` (`id`),
  CONSTRAINT `oauth2_provider_idtoken_user_id_dd512b59_fk_jobs_user_id` FOREIGN KEY (`user_id`) REFERENCES `jobs_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth2_provider_idtoken`
--

LOCK TABLES `oauth2_provider_idtoken` WRITE;
/*!40000 ALTER TABLE `oauth2_provider_idtoken` DISABLE KEYS */;
/*!40000 ALTER TABLE `oauth2_provider_idtoken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth2_provider_refreshtoken`
--

DROP TABLE IF EXISTS `oauth2_provider_refreshtoken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oauth2_provider_refreshtoken` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `token` varchar(255) NOT NULL,
  `access_token_id` bigint DEFAULT NULL,
  `application_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `created` datetime(6) NOT NULL,
  `updated` datetime(6) NOT NULL,
  `revoked` datetime(6) DEFAULT NULL,
  `token_family` char(32) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `access_token_id` (`access_token_id`),
  UNIQUE KEY `oauth2_provider_refreshtoken_token_revoked_af8a5134_uniq` (`token`,`revoked`),
  KEY `oauth2_provider_refr_application_id_2d1c311b_fk_oauth2_pr` (`application_id`),
  KEY `oauth2_provider_refreshtoken_user_id_da837fce_fk_jobs_user_id` (`user_id`),
  CONSTRAINT `oauth2_provider_refr_access_token_id_775e84e8_fk_oauth2_pr` FOREIGN KEY (`access_token_id`) REFERENCES `oauth2_provider_accesstoken` (`id`),
  CONSTRAINT `oauth2_provider_refr_application_id_2d1c311b_fk_oauth2_pr` FOREIGN KEY (`application_id`) REFERENCES `oauth2_provider_application` (`id`),
  CONSTRAINT `oauth2_provider_refreshtoken_user_id_da837fce_fk_jobs_user_id` FOREIGN KEY (`user_id`) REFERENCES `jobs_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=153 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth2_provider_refreshtoken`
--

LOCK TABLES `oauth2_provider_refreshtoken` WRITE;
/*!40000 ALTER TABLE `oauth2_provider_refreshtoken` DISABLE KEYS */;
INSERT INTO `oauth2_provider_refreshtoken` VALUES (1,'SBPfZpEQgEVqse6lFWY5MiW5NjwRXK',1,1,2,'2025-04-14 16:01:40.082509','2025-04-14 16:01:40.082526',NULL,'082342481a7543578e85c98fe66c4a49'),(3,'Z0GvJTILG60hJHripxM7ccvYb4QNb3',3,1,3,'2025-04-14 16:05:34.792042','2025-04-14 16:05:34.792057',NULL,'ac690e24416d4049ba916faab0278bf3'),(4,'a757EVFcA44EOs2rj1iCo62TtU0cN0',4,1,5,'2025-04-14 16:15:06.677106','2025-04-14 16:15:06.677121',NULL,'a89ed6c27dc6419fab08e40bb403d531'),(5,'JREEpCOHuVw1KarYVPvLmIGqE5urHr',5,1,5,'2025-04-14 16:19:38.264874','2025-04-14 16:19:38.264900',NULL,'172a5ca0bb08410abf650453e094d93c'),(6,'oUTqtE17QHjM2OMZJkMGFczxqwJlqd',6,1,3,'2025-04-14 16:19:51.928241','2025-04-14 16:19:51.928262',NULL,'26b4bb9b461b404d85239f6942276ff7'),(7,'3eoycbZErHVfBovQoLdfeoNVPDXDEA',7,1,5,'2025-04-14 16:26:27.490221','2025-04-14 16:26:27.490245',NULL,'7ed1551e248d4ce59d5a82ff8836c2fe'),(8,'TArarHuHwkBz9Q3L1ycFKuO1kQYs57',8,1,7,'2025-04-14 17:04:34.950155','2025-04-14 17:04:34.950172',NULL,'78ba7be218bf4afd87d2e24a8e148a8d'),(9,'gpyRD3pc2vN4C27AfnyHHPM2hsvX0H',9,1,5,'2025-04-18 14:14:06.737144','2025-04-18 14:14:06.737168',NULL,'13953f22727540338c78e95bd29a13da'),(10,'jvdEpDbIaepI5UIc0xj5YP67Zlq82M',10,1,3,'2025-04-18 14:56:30.565234','2025-04-18 14:56:30.565257',NULL,'a4c47a9c0742424396dbd41141cbb759'),(11,'QSeM0smlArZASmUYG7Zqe6jfVp8DUW',11,1,5,'2025-04-18 14:57:30.602338','2025-04-18 14:57:30.602359',NULL,'65c07579ed0542d4a8c675697b297d91'),(12,'Q4bnl8yUBgrCJbt6R0zdj5wGYkOwru',12,1,7,'2025-04-18 14:58:08.322521','2025-04-18 14:58:08.322540',NULL,'0cff2119b29641b8a4dbb4aebb2b6ea1'),(13,'RzsaaNOAT9Qkek2Kj4beq6Je5KvES3',13,1,5,'2025-04-18 15:09:34.393391','2025-04-18 15:09:34.393408',NULL,'5f3915aec2294a61af16ae5a5e3c3ab8'),(14,'pdotlUiZJBvZDdPibHtME8lYli8Oy9',14,1,3,'2025-04-18 15:39:58.613671','2025-04-18 15:39:58.613693',NULL,'7fb9ca153fcb4ee28b82b30bb457ffe4'),(15,'ER7CaZ2F1py9I4bAqfzypLeHo6QdIs',15,1,3,'2025-04-18 15:52:23.789602','2025-04-18 15:52:23.789622',NULL,'6aded6b18bfa4fcd9e537e6c34951595'),(16,'ChLsReqnrXk6AlGB0gmunap7s2QSUt',16,1,5,'2025-04-18 15:52:38.710501','2025-04-18 15:52:38.710540',NULL,'5d6df2ff5ce548a8ba00af2bdd15f5f4'),(17,'q1YGdte6elVPUZ0BOGTgXUkXDJb0xp',17,1,3,'2025-04-18 15:57:44.133018','2025-04-18 15:57:44.133043',NULL,'371c99458f5047619cb9ea9e7805bf1d'),(18,'5wCkux97KbpXQdB0RCb0X4mICF53nl',18,1,9,'2025-04-18 16:01:45.689767','2025-04-18 16:01:45.689790',NULL,'5ee9d3d48bdf44f89e5d2c0a005299b1'),(19,'k9YxvDz7MAVmfDunACKWRoTXtzvZZx',19,1,5,'2025-04-18 16:03:08.675930','2025-04-18 16:03:08.675944',NULL,'58352ee2dafa4d52b8f807b7fcee6c91'),(21,'EonVL32tMUJjW0xLqtoZb69FuMCdgo',21,1,3,'2025-04-18 16:12:03.065762','2025-04-18 16:12:03.065777',NULL,'119b539345dd47de9ea32ec03f29c387'),(22,'HVXLjln3V51iMAmfVfgxqzQdQ0J8DM',22,1,5,'2025-04-18 16:12:15.561359','2025-04-18 16:12:15.561380',NULL,'a5547e16e98f4e08a34939ff6230ed12'),(23,'Rv9CraWkTp3PGjtGwvzJx7MGDFkmQT',23,1,3,'2025-04-18 16:23:39.141211','2025-04-18 16:23:39.141230',NULL,'c26c5d03dcb14041a0dc16ba2e883ba8'),(24,'t8CLVYuDkopahNtHMDmjCWHTfLw5tV',24,1,3,'2025-04-18 16:24:21.128965','2025-04-18 16:24:21.128986',NULL,'9e5ec273d0254e9eb35543d9b31dd2f0'),(25,'URoaRd6MuKJBJigeYFGXvMMartrzsp',25,1,5,'2025-04-18 16:24:54.071694','2025-04-18 16:24:54.071711',NULL,'087485ea8dff41b3b07aee9d591d1dc1'),(26,'Pl2pNKH8tUsvK4eh03I74AQPx2W6OS',26,1,3,'2025-04-18 16:25:48.214871','2025-04-18 16:25:48.214890',NULL,'c9295f1549d64bf997fadfa992735f5f'),(27,'0HE62FzzvtBWCBVtgkM06Qmq9w7hah',27,1,5,'2025-04-18 16:32:12.187049','2025-04-18 16:32:12.187072',NULL,'e410ea0e883b41b3be3abb865db5f7d1'),(28,'M3N9s7pUPKkHpTYSwXaEnbemRYz5A3',28,1,7,'2025-04-18 16:52:34.382739','2025-04-18 16:52:34.382761',NULL,'17e128acbdaf4d2d82029abe1d51df43'),(29,'UxcrELVLCen1UZ93lMG3AcGEahky1D',29,1,3,'2025-04-18 16:52:53.437637','2025-04-18 16:52:53.437656',NULL,'3af4208f2b30485e8ef1a5ad2ae9e3da'),(30,'L5GiBtbfqW3KnTA9tgewbLOWoM6S3P',30,1,5,'2025-04-18 16:53:15.121298','2025-04-18 16:53:15.121313',NULL,'601d3912e44642389c125f9c4e87b0a9'),(31,'aIUkmPDo24w9eKrxyqDcxdMNGxXdL3',31,1,3,'2025-04-18 16:56:26.531896','2025-04-18 16:56:26.531918',NULL,'cf66271eda194e0498248c404cd88f20'),(32,'KXAvSMZa1qhAEU2BkkKsU1mmeLpz0F',32,1,5,'2025-04-18 17:26:48.179846','2025-04-18 17:26:48.179873',NULL,'710715abb080461d8beba34cba2364ea'),(33,'1BfonbDXAyPQSQzXVLyr7AdPTfOV5R',33,1,9,'2025-04-18 17:28:47.564711','2025-04-18 17:28:47.564732',NULL,'24763e68deb34491bfde6487f276eb13'),(34,'g0PUJvcipVbioFCLO1SG1EDeY0kCwo',34,1,3,'2025-04-18 17:29:35.141639','2025-04-18 17:29:35.141659',NULL,'bcb3c69c2dd748968889592c89a2dc51'),(35,'zqXipcFeylgqeRvsBiNhA33rDvmcXb',35,1,9,'2025-04-18 17:34:45.448164','2025-04-18 17:34:45.448179',NULL,'1bf1f5b98f3f43a3b832b3217666fc82'),(36,'y82poNmau4nkOFNTe4m5g15mW14bWA',36,1,3,'2025-04-18 17:35:22.653459','2025-04-18 17:35:22.653482',NULL,'21cb66affdec4ecaa6be6b5abe89f78c'),(37,'OBRiY2Zw6081QT4lNrAGYTwSpZVoaf',37,1,5,'2025-04-18 17:35:41.605056','2025-04-18 17:35:41.605075',NULL,'af657796571044f0b7c2b65f9aeb8773'),(38,'wPPhrtVLLElorjV7FP47zPaSr3nyzK',38,1,3,'2025-04-18 17:36:56.606095','2025-04-18 17:36:56.606122',NULL,'06977b4b0afa4e3d94f55fb8461dbe21'),(39,'zmlHgMh0e4STXUXDKD3yxho3nzRkez',39,1,5,'2025-04-18 17:37:21.342112','2025-04-18 17:37:21.342132',NULL,'26c4b69c705e4c5796eafe9f055fcfb1'),(40,'J5OVfVoB1MJKuMdNSheaqtTbo8YEE8',40,1,7,'2025-04-18 17:38:29.445048','2025-04-18 17:38:29.445069',NULL,'75f9edd776aa4711a4ba8c77497cc4de'),(41,'S1X4Et2bTJMJztXPPsNbr92NkPtMMP',41,1,5,'2025-04-19 07:38:11.797728','2025-04-19 07:38:11.798232',NULL,'cb495a3552a8458ea51e730181fdccc4'),(42,'RlZwDshZNctPXFZz5uNa6fx7bKls9Z',42,1,5,'2025-04-22 02:36:37.591059','2025-04-22 02:36:37.591083',NULL,'1bc095dd392a4588b3c91a5ba0d37251'),(43,'ikr8z1Ik7on0caxri5Ja9D0TczXdzt',43,1,7,'2025-04-22 02:38:06.172161','2025-04-22 02:38:06.172180',NULL,'821b7ddafebc477a87548f94905337dd'),(44,'KFa1JHCuTR906Ms571UGtigG4c7wZO',44,1,3,'2025-04-22 02:38:20.043501','2025-04-22 02:38:20.043521',NULL,'510f97e37c6a4c10889426e8c6076288'),(45,'LAhPt1M30MFwP1HLA0G4AjqY35awNi',45,1,5,'2025-04-22 03:24:26.836306','2025-04-22 03:24:26.836327',NULL,'86eb8d872f2a43e1b7ec2d4806b09513'),(46,'X9F02p5oZctqv0LkYFCGG4bF02XgGZ',46,1,3,'2025-04-22 09:33:01.114071','2025-04-22 09:33:01.114094',NULL,'74026df4ecf64b20b25112626203d4fd'),(47,'IhKyXJonIYn7wezeihI7lEI0qrUVFr',47,1,3,'2025-04-22 09:52:06.624206','2025-04-22 09:52:06.624230',NULL,'07d1a07a6ea541febb77afefb8f169de'),(48,'5X3ggA0hlCbX1CeaYFZCQ3tI8hPnfN',48,1,5,'2025-04-22 10:03:15.875049','2025-04-22 10:03:15.875074',NULL,'480ef4ea254d4f17a6fb99610bb2e04d'),(49,'3yfV9eZ4PvyqDmFFXB4IUeBpetVXI0',49,1,3,'2025-04-22 10:04:16.155999','2025-04-22 10:04:16.156023',NULL,'3b964a60c82f4ed688068c332a27b916'),(50,'XncTNSg8gPrkJ07zXe8afFTswHRg5I',50,1,5,'2025-04-22 10:23:38.558414','2025-04-22 10:23:38.558437',NULL,'3cc22ac4ca8349ec8fdc59771142fe10'),(51,'5cFKWmoBNerSGvioV7B0fsOy8elXH1',51,1,5,'2025-04-22 10:30:50.572238','2025-04-22 10:30:50.572260',NULL,'9463358b08f143b38ed2f1d46e83cad2'),(52,'9HfDsILJLhWZhtACSGFduIChgmxbH7',52,1,3,'2025-04-22 11:37:06.003314','2025-04-22 11:37:06.003334',NULL,'db52ef4ceb934fd8b3c83f0f0a03859e'),(53,'vq0pqOWRhiXULuoLx5ItOJYnW8XOYC',53,1,5,'2025-04-22 11:37:55.207477','2025-04-22 11:37:55.207498',NULL,'40c7cc52c7b746618950556cc0d224ef'),(54,'omhTx7jLT4XgdeUndTie0NGUwlkpye',54,1,3,'2025-04-22 11:40:26.810395','2025-04-22 11:40:26.810415',NULL,'000987c018fe4a67b6129b49055fd874'),(55,'lrRy1xoaTgVMf9516ufET33FyJeThN',55,1,5,'2025-04-22 13:34:41.382002','2025-04-22 13:34:41.382027',NULL,'ebb94a5aa7c443dfacc3e2b01d04e122'),(56,'O7lwI72NBA1sIWUrRj8DliszO4RtTk',56,1,3,'2025-04-22 13:34:57.967868','2025-04-22 13:34:57.967895',NULL,'22c498c9c7a74806adf65a3678a25ce0'),(57,'wFYDCCJ34fkq7Ap6Qu6NZMNj6EQKO2',57,1,3,'2025-04-23 06:18:36.282667','2025-04-23 06:18:36.282695',NULL,'bf1a45df96ad4934b1b45d9b68f83a10'),(58,'JeAb8H6HqdaPvrVodDHL1nvQuFCPZK',58,1,3,'2025-04-25 14:58:02.145941','2025-04-25 14:58:02.145973',NULL,'65c641580fc24d41a43c2e9a8baffdb8'),(59,'13xHA5l4iczRREHmD9UBobtCb7I6AI',59,1,9,'2025-04-25 15:00:39.341574','2025-04-25 15:00:39.341595',NULL,'dfb6f077536447e4842bb4b77e2d9a4a'),(60,'YJW0BlMnUHWMJ0v99G82b3qpeMZnYb',60,1,5,'2025-04-25 15:15:44.371337','2025-04-25 15:15:44.371364',NULL,'081b1167cf2444558fd61f667ed054eb'),(61,'pT6kRpVj744c4Qez2pTSiZlZwfNxe7',61,1,5,'2025-04-25 15:24:20.073203','2025-04-25 15:24:20.073223',NULL,'15eecb0d1376474a8b207ba44bdae7d9'),(62,'K0czhNgywjqd6h2bJSbiBOBpp0Mlqb',62,1,7,'2025-04-25 15:24:30.265633','2025-04-25 15:24:30.265657',NULL,'54bc3376bc8e45dda74e35d633b058db'),(63,'VUfd0XHu6Thi4M09hOi5yJA9oTfVlk',63,1,3,'2025-04-25 15:43:10.995205','2025-04-25 15:43:10.995228',NULL,'a4e32d1e3e0b4f7d825b4fbd130d5531'),(64,'hg0NCzK02CnYIPJrRG79HVQmxZfFPj',64,1,5,'2025-04-25 15:59:27.072877','2025-04-25 15:59:27.072902',NULL,'bdb55b0cab5a4f46a539ea7f5af4ad22'),(65,'4mfQ7X40x8JkTtcuFIcKRaG4ZAQQpZ',65,1,9,'2025-04-25 16:00:49.867043','2025-04-25 16:00:49.867073',NULL,'75893ccf78a340cea51e285a26aa8fe1'),(66,'6a9NPKQBTCpLC9mbwZcnCSJKPweJEu',66,1,5,'2025-04-25 16:03:40.643389','2025-04-25 16:03:40.643417',NULL,'92c16d077aac4ea79010d0a5e22fc01a'),(67,'IVWzIWtER4ZlRQ6XBkhJjXdLdZ4oz8',67,1,7,'2025-04-25 16:04:48.402870','2025-04-25 16:04:48.402893',NULL,'f3ab61fdcad94631b49176fff12b540b'),(68,'jOBkVJtUQ8EVGuxGK2lCJnItwufiOn',68,1,3,'2025-04-25 16:05:06.446738','2025-04-25 16:05:06.446758',NULL,'92d1b003d02149748a575c843cd70e46'),(69,'W0TFESSFIqCOoT1htFbIagvVW2Kl90',69,1,5,'2025-04-25 16:07:10.752835','2025-04-25 16:07:10.752853',NULL,'c3f944e9ed78496e8d3477e1be8cb57f'),(70,'0NNOxwqWzKlhmkkd1bGcHTXTQiBFus',70,1,3,'2025-04-25 16:07:24.041395','2025-04-25 16:07:24.041413',NULL,'8184f608785a4af8854d71dd04b1100e'),(71,'QvqA34s03YXOfRi3QBWK4JKjA62Mas',71,1,9,'2025-04-25 16:08:04.612300','2025-04-25 16:08:04.612319',NULL,'cbec243ce56b424190c0d13e864d9507'),(72,'IuhsfvecYDnhpVw121m7U8Nx9He1k7',72,1,3,'2025-04-25 16:12:16.036257','2025-04-25 16:12:16.036279',NULL,'3d21406bafab411fbff1ef973ac8b2ca'),(73,'44qxOvkeA2eWGkl0UoR9lYSNxT1JFJ',73,1,5,'2025-04-25 16:14:05.210813','2025-04-25 16:14:05.210840',NULL,'fc0848d2bae04aec992b7277c0b224a7'),(74,'ERgPzqr76Qz8CYtoARsCdCGPXDnJiy',74,1,5,'2025-04-26 15:13:44.681349','2025-04-26 15:13:44.681372',NULL,'f8ef4cbf415146da958a9654af537922'),(75,'LUuJCJFV01FbkgE3DSuXcUGushw5fA',75,1,3,'2025-04-26 15:31:09.489165','2025-04-26 15:31:09.489188',NULL,'fbbacef04f9b414d80c26e25247e824a'),(76,'ejWLZBScHWLYNb7i43X3d7Pn2WeZZT',76,1,3,'2025-04-26 15:31:55.177110','2025-04-26 15:31:55.177138',NULL,'f03477c2156047ab994d3cabbbb84586'),(77,'DuV8yvTjg6tZV15mdxsA2U8lgeL7xs',77,1,3,'2025-04-26 15:38:32.353872','2025-04-26 15:38:32.353894',NULL,'79d14d640d994ca296d52ac7a70992f8'),(78,'XmtCxeq3P8DoDe64ZDst62J52UNjq0',78,1,5,'2025-04-26 15:58:17.604095','2025-04-26 15:58:17.604137',NULL,'8d203de28212411bb1b57ded507ab8d7'),(79,'uqEdJqaNqhzObWk6RauTbSedJCmZoh',79,1,5,'2025-04-26 16:12:37.298748','2025-04-26 16:12:37.298768',NULL,'dba2d5315fea4b5a8d3f9e4107f927b2'),(80,'azNHx0Kq0PEwG7551jAIaNfKW4rcow',80,1,9,'2025-04-26 16:23:18.585101','2025-04-26 16:23:18.585116',NULL,'4e8ecf5476864c3c8102574486027bb2'),(81,'VIK4dOK1SMq79bxHZaDvRrt9tTdBlZ',81,1,3,'2025-04-26 16:23:31.865894','2025-04-26 16:23:31.865917',NULL,'cb341ae7c1464ff0b565586f386a0fa8'),(82,'OTxKL6so2np5zOTDGXhal6AQ0qK8pU',82,1,3,'2025-05-07 10:26:17.191492','2025-05-07 10:26:17.191516',NULL,'8d3276103ac14b4b8b1034b490558aec'),(83,'IWHy7fk4BlF9uBBOXPnQ7vkhff8JA6',83,1,3,'2025-05-07 14:00:31.708169','2025-05-07 14:00:31.708191',NULL,'9df7362fe80b443aa8c1b369ee3a8493'),(84,'iGXFZK92EeTuC43cAbROq58TBXvOUA',84,1,5,'2025-05-07 14:08:25.078311','2025-05-07 14:08:25.078333',NULL,'ac04b55254a54db08cb3ff3035b4a7c7'),(85,'JMqRVNMhZ2HYwVCPQ7sTGlCyvofWfW',85,1,3,'2025-05-07 14:08:37.294625','2025-05-07 14:08:37.294644',NULL,'a0214cb63fbd4582a0bf1a896da34154'),(86,'4Eoaz8BgwaRUOaHsp8vUyaDyVxMCJN',86,1,3,'2025-05-07 15:29:00.496196','2025-05-07 15:29:00.496219',NULL,'b4834a7c49a94a598e5beb74debfe36e'),(87,'RO5zPwzPGb5IGhUutxK6N9uqmdLqCU',87,1,3,'2025-05-07 16:06:52.507168','2025-05-07 16:06:52.507190',NULL,'93ef502fb8f74b938b705aa9f3dc0f97'),(88,'JbuZkFwoT7ECpo5jNWGAg9M9LIkzwt',88,1,5,'2025-05-07 16:21:11.410776','2025-05-07 16:21:11.410797',NULL,'9e752ddbb88d495caff7c649d90cce17'),(89,'ORShoCe0dMffiasMx1ZQ4z0KywvBcc',89,1,5,'2025-05-07 16:38:29.264020','2025-05-07 16:38:29.264044',NULL,'8f3e9e2a72304e5d8125b8439fa278f6'),(90,'FzkLMLEeuhi8UfYOyn3OK0DZX87d7p',90,1,3,'2025-05-07 16:53:02.790257','2025-05-07 16:53:02.790282',NULL,'fdfba5ccc47046f382e706ee95fd9dd0'),(91,'ZIhHCSgJCWfKinerfbvcv2FOdACUqD',91,1,3,'2025-05-08 16:09:27.761793','2025-05-08 16:09:27.761815',NULL,'e6137ed10a084bc5a530a4c049f50d65'),(92,'uTCmY9CGca1JvDwDgJv9Pvh3KL50xn',92,1,5,'2025-05-08 16:20:02.923026','2025-05-08 16:20:02.923049',NULL,'433b46e1f93445279c3a8d66ef58756b'),(93,'Mt4Ivc3P1RYTPWjQGn2OI2FbDu16xb',93,1,3,'2025-05-08 16:24:03.894782','2025-05-08 16:24:03.894802',NULL,'64cc16e251e74eb194585502e06084a9'),(94,'9SVkXRr6h1Ra12JCg1Er4JxuGTIyqq',94,1,5,'2025-05-08 16:24:49.467878','2025-05-08 16:24:49.467898',NULL,'11f19c18e2f34604a3668a8a3d7fcdc7'),(95,'YPBBHHkFKOLxmSTU4PxIlvWt3nqbq7',95,1,3,'2025-05-08 16:41:20.089988','2025-05-08 16:41:20.090012',NULL,'ce0c94a3f6ab46b4abeb28676d780176'),(96,'fpTQWpzcTSlPbvC8ZGF9hXZjDMKpCg',96,1,5,'2025-05-08 16:41:43.604034','2025-05-08 16:41:43.604058',NULL,'07d1f9d03642408ab6ddbf6f723ef72c'),(97,'EfkJOyo59C2khElga37UeBY12jfi14',97,1,7,'2025-05-08 16:42:26.765072','2025-05-08 16:42:26.765128',NULL,'1d42752b885e4107ab94aa376170d7b8'),(99,'KTSXUAIq8G8D8bD0C7XsmaXD7YwqYx',99,1,3,'2025-05-08 16:50:31.259011','2025-05-08 16:50:31.259034',NULL,'78a3210052ea40718f507b26b94867ad'),(100,'Mw8Cy2xNfrQpv5mHR99jUx5x0yJHMP',100,1,5,'2025-05-08 16:50:43.122332','2025-05-08 16:50:43.122387',NULL,'882d60dd6b70425cb4660f31e3bdc668'),(101,'NOXn2Kryok6JacXab1lqeRvoWgRq7z',101,1,3,'2025-05-08 16:52:26.334254','2025-05-08 16:52:26.334274',NULL,'960bc7ea5ed0448cbc8c7260c3e54c21'),(102,'QRYiAhIaJhEtQXJkLi4ugCqq3FiWNl',102,1,3,'2025-05-09 13:23:10.764839','2025-05-09 13:23:10.764863',NULL,'1cfbc9c9c875403fbb11abec7f681ca3'),(103,'tbENsSPhyBnfDsx9FWW5MtCj0pgPrw',103,1,5,'2025-05-09 13:57:42.030776','2025-05-09 13:57:42.030798',NULL,'96d13adfc26a4bff8fa4c2c8e5da9ff7'),(104,'uqHRZ7boP9dfRhOwQjHLjStYA5QHwf',104,1,5,'2025-05-10 03:53:53.917149','2025-05-10 03:53:53.917170',NULL,'df727c441e844aee8418889d3608936d'),(105,'mYstAkhPORR4YNlZf6G0WWuzRCk2J7',105,1,5,'2025-05-11 02:16:09.089878','2025-05-11 02:16:09.089904',NULL,'b744643c17174ea58850f3d642776e33'),(106,'iIuTBNGm0MOd8nXfq6EUNhkTKqf4Yc',106,1,3,'2025-05-12 15:00:40.630687','2025-05-12 15:00:40.630714',NULL,'5dc66e1e80d8419ca04a926e5a5c0e1c'),(107,'27rauJzv3d651YRaqvvTWq5kwrFOYZ',107,1,3,'2025-05-13 02:37:54.006057','2025-05-13 02:37:54.006087',NULL,'6e9f0ec1b65d4b7283372252395df982'),(108,'aJFRdMuCUyIOmHMKEB3denU560scbO',108,1,10,'2025-05-13 03:32:09.371185','2025-05-13 03:32:09.371262',NULL,'e6b9244314844b01abf111c7b436206b'),(109,'oowKQgIm7eWrNglQht30OGQMdwjbRq',109,1,10,'2025-05-13 03:45:44.049330','2025-05-13 03:45:44.049359',NULL,'b9e8ca946ae3403b82d1b8680032e1e8'),(110,'Q0qLRfS2MMdWba8eRCJzg5eULVhhqQ',110,1,3,'2025-05-13 05:02:16.498383','2025-05-13 05:02:16.498415',NULL,'435f04d2c4ff4a65aa25f61f4f57ff99'),(111,'kmIcqddT5wfpr6RzJj1lRcBeKy1kLh',111,1,10,'2025-05-13 05:15:12.585323','2025-05-13 05:15:12.585351',NULL,'2d91d0f0e2d8492994418c4b2169c81d'),(112,'eRr34KZBlvOWuJSgmDF3xiePM72m4H',112,1,10,'2025-05-15 01:53:47.457228','2025-05-15 01:53:47.457251',NULL,'8a7c86a5b61744128cda1cdc0c872120'),(113,'NOikB1BWZ3xB0u0jfW9Sf0TWl6NnZU',113,1,5,'2025-05-15 01:58:08.336797','2025-05-15 01:58:08.336818',NULL,'a7f32ba485794c38b3e2381dc9b70ecb'),(114,'wzO0DGHeyhboRcSCX7w9wr3knzTthh',114,1,10,'2025-05-15 02:04:38.042106','2025-05-15 02:04:38.042128',NULL,'c5cf981428664547b3240b8843943303'),(115,'j5YXZIQNsfE7aHYkK4D2untQ6DxBeV',115,1,10,'2025-05-15 02:08:34.388643','2025-05-15 02:08:34.388665',NULL,'18ccaa87e38442339f5c4bab79fa6b3a'),(116,'wcZwHWG6sK5M5JGc0YRF04x9Lqrfqv',116,1,10,'2025-05-15 02:20:02.697787','2025-05-15 02:20:02.697810',NULL,'30400bbd00b64514a66eb2f92b74794b'),(117,'D2XvW3GHJSdKAYpWedggqfafKuQ6yS',117,1,5,'2025-05-15 02:49:09.247435','2025-05-15 02:49:09.247458',NULL,'29dc759026bf4ed1ba97ce4b941b89d9'),(118,'Jkfs05cRla1F13GIEUCG1ELquJEtYQ',118,1,10,'2025-05-15 03:02:10.039169','2025-05-15 03:02:10.039257',NULL,'2dd1b0e6967b444eb06a54b198eaced8'),(119,'Ul4PwSCbBi9ABGAWhKkJVmhlRtEMFs',119,1,5,'2025-05-15 03:18:34.922202','2025-05-15 03:18:34.922231',NULL,'66b3aab08984482b8ce2fd3c46b82b35'),(120,'IrZdbqenoJ0EPExCYzv3oxhDRDnhlX',120,1,10,'2025-05-15 04:19:29.594601','2025-05-15 04:19:29.594622',NULL,'31b55646950e45f980e22dc0b6165bfb'),(121,'S31AOklEznSuEhguAmNKAl80f3WTY5',121,1,5,'2025-05-16 17:00:03.909187','2025-05-16 17:00:03.909220',NULL,'6043204893064684802abc623c85f63f'),(122,'GxpEnagRnYYxqGf1hcrRNoS9fZR1qc',122,1,10,'2025-05-16 17:24:17.900572','2025-05-16 17:24:17.900605',NULL,'2cc829f510734291ad3478bb74580dd7'),(123,'EtKZgHCyQh4sV7hPy3MJvE41E2SsEU',123,1,10,'2025-05-17 07:33:11.262225','2025-05-17 07:33:11.262249',NULL,'1e8f994e64a14d0ead1d864291d09a4e'),(124,'lmvcYXYj5hpgn7pt0CnwQPljc73Jsb',124,1,3,'2025-05-17 07:34:10.761363','2025-05-17 07:34:10.761386',NULL,'2b870c9ab1a5491297538cd20a972e9f'),(125,'3PeHy352lUhHwtcSuSsEFBSTBnKdBG',125,1,5,'2025-05-17 08:22:08.720146','2025-05-17 08:22:08.720168',NULL,'92a881fc424e4642a5633b38ddf3b49b'),(126,'jwVeSSRjYuABZ8Iv4tho1yZOEva2Cl',126,1,5,'2025-05-23 02:39:03.229128','2025-05-23 02:39:03.229154',NULL,'540272746c42467bb25794bbffcbb5eb'),(127,'i90CHB9wPNL2XL0xXgpk9yBPyzp8iy',127,1,10,'2025-05-23 03:10:36.986885','2025-05-23 03:10:36.986900',NULL,'5c92dff37fa84543be3aeeb01018ccda'),(128,'rb2CIh0MMwjgTOgWpY6zfQeNLiDYVU',128,1,5,'2025-05-23 03:10:55.100436','2025-05-23 03:10:55.100460',NULL,'c062057495ab46898576c80fa58c3988'),(129,'tv5QrnCvE0nKClUjwKMUvssFaLmEEO',129,1,10,'2025-05-23 05:58:07.737523','2025-05-23 05:58:07.737546',NULL,'a592c56757d04cee879b51568cc14447'),(130,'r7Z2DqPFoG6sNfCPPDt4iKsu5souid',130,1,5,'2025-05-23 09:34:18.170721','2025-05-23 09:34:18.170747',NULL,'91d8626da0c14d94b6d4af6e80f125ca'),(131,'JonTkQO6cjghSWc5u05yCBwzLcgzww',131,1,10,'2025-05-30 13:04:16.985891','2025-05-30 13:04:16.985919',NULL,'2ec895459c214cc4802d2d1c6e012c94'),(132,'Yq8KfOY6vNaXs0GlpwvrUukmUjk7Vb',132,1,10,'2025-05-30 13:11:54.710379','2025-05-30 13:11:54.710404',NULL,'04d09470888a4198889dda9f35f608ef'),(133,'DRu0TL6xbs8eN1DfKX9i4UEX81GfZQ',133,1,10,'2025-05-30 13:34:17.596114','2025-05-30 13:34:17.596137',NULL,'c4d42553a93f4375a5609c537c9bde1e'),(134,'w2rYlDYDnCiw5K6qKs2BxC6OfKtflB',134,1,5,'2025-05-31 03:58:34.494468','2025-05-31 03:58:34.496023',NULL,'42a9499504d644429d3d06e67bbe0abf'),(135,'D4IftY7ZrCkX1eoDzGnEYeNcCOxjLu',135,1,10,'2025-06-01 01:18:52.747203','2025-06-01 01:18:52.747229',NULL,'abc64401ea2844349d1c0964d166424b'),(136,'dsncjBC7w3wT7eKxeWxJGM0wmBOsoT',136,1,5,'2025-06-01 01:33:26.003694','2025-06-01 01:33:26.003717',NULL,'bb8918d405c846c88427b70ab8b7d11a'),(137,'uYEN8gqJKvsHRkE0oClp6cum1eXEes',137,1,5,'2025-06-01 01:33:26.007036','2025-06-01 01:33:26.007058',NULL,'f226eee37de14f54a6dbf7a52d6e3e5c'),(138,'TWaaE0Ju9HCvdxwRiQzGApW3K1bIMw',138,1,5,'2025-06-01 04:10:38.474698','2025-06-01 04:10:38.474725',NULL,'2cb2e36c8926490da2a947934abe83da'),(139,'MBuHMHkc9jsDaktGww7YJWyZQF7MNo',139,1,3,'2025-06-01 09:25:37.716257','2025-06-01 09:25:37.716293',NULL,'e0d633c41bfc415f84cbd87d3aa5d01f'),(140,'WPSotlfmp5twb3oIyobSKHcKjcTEoQ',140,1,5,'2025-06-01 09:27:15.534287','2025-06-01 09:27:15.534321',NULL,'56374c0bd0d04b9f875a7262c53156ae'),(141,'rfYG1YVIJL0nqfKEs6khvD8CqfJjuK',141,1,3,'2025-06-01 09:29:34.400416','2025-06-01 09:29:34.400467',NULL,'4156d72b9e88458699c85a9239847fa4'),(142,'LrLDKbQN1dJ6yrQ8dsBQXdxKdmadl1',142,1,3,'2025-06-02 09:50:09.823840','2025-06-02 09:50:09.823861',NULL,'71a1b5698ce64bb1a57dc51dc53f36f6'),(143,'KE9zJnBIUkXNJ31yeCSYkfYEzkqBzf',143,1,10,'2025-06-03 18:24:56.982499','2025-06-03 18:24:56.982530',NULL,'0d99dbfe8abe46d384231aabf5742511'),(144,'UzSFCfQJvLDqcsIvq8zS6lH361wpI1',144,1,10,'2025-06-03 18:31:07.517945','2025-06-03 18:31:07.517989',NULL,'72a088899a104233a107ce3551ec98ce'),(145,'tM03rFnQLUFsBSwsL2bKnNyObQ6mAM',145,1,5,'2025-06-03 18:35:35.100218','2025-06-03 18:35:35.100248',NULL,'cccfd2eb76164a4ca1512358b67cc0ff'),(146,'GtIuMA2HeacKRiQFrM4zHuPsBpGkKw',146,1,10,'2025-06-03 18:40:49.476800','2025-06-03 18:40:49.476828',NULL,'b1e013cebebc4a5eaae8dcccf777482b'),(147,'fUdh85gzPYEhJwqEf1T3K8XOagifTZ',147,1,5,'2025-06-03 18:52:25.967242','2025-06-03 18:52:25.967278',NULL,'b5106952eaf94896b163998086b2f9fe'),(148,'9W3jbnESVlaFOCBQg6B40OdCxZfzku',148,1,5,'2025-06-03 19:04:22.415779','2025-06-03 19:04:22.415809',NULL,'d3456456ef06434c816fabcde518006e'),(149,'oADMPjiHduwvb8yNMTQhAofrpmzPFt',149,1,10,'2025-06-04 09:49:30.255351','2025-06-04 09:49:30.255383',NULL,'d04de41771d040f690f563060f5a19ff'),(150,'Xl2w2ikHItmGUgJ2K6ZKPcOvCmVgW0',150,1,10,'2025-06-05 00:24:59.994621','2025-06-05 00:24:59.994650',NULL,'04bae303340a4f3794c9d0f7b1271094'),(151,'TQTgBJPW15ElNdyDvOQQ8I6lL67sW2',151,1,5,'2025-06-05 01:02:52.164975','2025-06-05 01:02:52.164996',NULL,'1692ac883de4402f8c681cb57e87469d'),(152,'7a6Kort4qNR2JMRe81ckcHtl0QOEhy',152,1,10,'2025-06-05 03:29:19.557808','2025-06-05 03:29:19.557843',NULL,'91295d08a94d4b34b69ec42837d5da01');
/*!40000 ALTER TABLE `oauth2_provider_refreshtoken` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-05 15:14:16
