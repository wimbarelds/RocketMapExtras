<?php
	
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL ^ E_DEPRACATED ^ E_NOTICE);
	
	if(empty($_GET["gymid"])) {
		header('Content-Type: application/json');
		echo json_encode(array(
			"success" => false,
			"message" => "query-variable 'gymid' not found"
		));
		exit(0);
	}
	
	require_once('mysql_connect.php');
	$query = "SELECT DISTINCT
		`gymmember_history`.`pokemon_uid` , `gymmember_history`.`timestamp` , `gymmember_history`.`event` ,
		`gympokemon`.`pokemon_id` , `gympokemon`.`cp` , `gympokemon`.`trainer_name` ,
		`trainer`.`team` AS `trainer_team` , `trainer`.`level` AS `trainer_level`
		FROM `gymmember_history`
			INNER JOIN `gympokemon` ON `gympokemon`.`pokemon_uid` = `gymmember_history`.`pokemon_uid`
			INNER JOIN `trainer` ON `trainer`.`name` = `gympokemon`.`trainer_name`
		WHERE `gymmember_history`.`gym_id` = '".$mysqli->real_escape_string($_GET["gymid"])."'
		ORDER BY `gymmember_history`.`timestamp` DESC , `gymmember_history`.`event` DESC";
		
	$result = $mysqli->query($query);
	
	$changes = [];
	while($change = $result->fetch_array(MYSQLI_ASSOC)) {
		$changes[] = $change;
	}
	header('Content-Type: application/json');
	echo json_encode([
		"success" => true,
		"data" => $changes
	]);
	exit(0);
	
	
?>