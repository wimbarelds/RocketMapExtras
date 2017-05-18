<?php
	
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL ^ E_DEPRACATED ^ E_NOTICE);
	
	require_once('mysql_connect.php');
	
	$result1 = $mysqli->query("CREATE TABLE IF NOT EXISTS `gymmember_history` (
		  `gym_id` varchar(255) NOT NULL,
		  `pokemon_uid` varchar(255) NOT NULL,
		  `event` enum('added','removed') NOT NULL,
		  `timestamp` int(11) NOT NULL,
		  KEY `gym_id` (`gym_id`),
		  KEY `pokemon_uid` (`pokemon_uid`),
		  KEY `timestamp` (`timestamp`)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8");
	
	if(!$result1) {
		echo "<b>Error creating gymmember_history</b><br>\r\n";
		echo $mysqli->error . "<br><br>\r\n";
	}

	$result2 = $mysqli->query("CREATE TABLE IF NOT EXISTS `gymmember_old` (
		  `gym_id` varchar(255) NOT NULL,
		  `pokemon_uid` varchar(255) NOT NULL
		) ENGINE=InnoDB DEFAULT CHARSET=utf8");
	
	if(!$result2) {
		echo "<b>Error creating gymmember_old</b><br>\r\n";
		echo $mysqli->error . "<br><br>\r\n";
	}

	$mysqli->query("TRUNCATE `gymmember_old`");
	$result3 = $mysqli->query("INSERT INTO `gymmember_old` SELECT `gym_id` , `pokemon_uid` FROM `gymmember`");
	if(!$result3) {
		echo "<b>Error copying data to gymmember_old</b><br>\r\n";
		echo $mysqli->error;
	}
	
?>