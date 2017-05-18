<?php
	
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL ^ E_DEPRACATED ^ E_NOTICE);
	
	if(empty($_GET["trainer_name"])) {
		header('Content-Type: application/json');
		echo json_encode([
			"success" => false,
			"message" => "query-variable 'trainer_name' not found"
		]);
		exit(0);
	}

	function UTF8EncodeRecursive($d) {
		if (is_array($d)) {
			foreach ($d as $k => $v) {
				$d[$k] = UTF8EncodeRecursive($v);
			}
		} else if (is_object($d)) {
			foreach ($d as $k => $v) {
				$d->$k = UTF8EncodeRecursive($v);
			}
		} else if (is_string ($d)) {
			return utf8_encode($d);
		}
		return $d;
	}
	
	require_once('mysql_connect.php');
	function getHistory($mysqli, $trainerName){
		$query = "SELECT DISTINCT
			`gymmember_history`.`event` , `gymmember_history`.`timestamp` ,
			`gym`.`latitude` , `gym`.`longitude` , `gym`.`gym_id` ,
			`gymdetails`.`name` AS `gym_name` , 
			`gympokemon`.`cp` , `gympokemon`.`pokemon_id` , `gympokemon`.`trainer_name` , `gympokemon`.`move_1` , `gympokemon`.`move_2` , `gympokemon`.`iv_attack` , `gympokemon`.`iv_defense` , `gympokemon`.`iv_stamina`
			FROM `gymmember_history`
				INNER JOIN `gympokemon` ON `gympokemon`.`pokemon_uid` = `gymmember_history`.`pokemon_uid`
				INNER JOIN `gym` ON `gym`.`gym_id` = `gymmember_history`.`gym_id`
				INNER JOIN `gymdetails` ON `gymdetails`.`gym_id` = `gymmember_history`.`gym_id`
			WHERE `gympokemon`.`trainer_name` = '".$mysqli->real_escape_string($trainerName)."'
			ORDER BY `gympokemon`.`cp` DESC";
		
		$result = $mysqli->query($query);
		
		$changes = [];
		while($change = $result->fetch_array(MYSQLI_ASSOC)) {
			$changes[] = $change;
		}
		return $changes;
	}

	function getTrainerInfo($mysqli, $trainerName) {
		$query = "SELECT
			`name` , `team` , `level`
			FROM `trainer`
			WHERE `name` = '".$mysqli->real_escape_string($trainerName)."'
			LIMIT 0, 1";

		$result = $mysqli->query($query);
		$trainer = $result->fetch_array(MYSQLI_ASSOC);
		return $trainer;
	}	

	$changes = getHistory($mysqli, $_GET["trainer_name"]);
	$trainer = getTrainerInfo($mysqli, $_GET["trainer_name"]);

	header('Content-Type: application/json');
	echo json_encode(UTF8EncodeRecursive([
		"success" => true,
		"data" => [
			"history" => $changes,
			"trainer" => $trainer
		]
	]));
	exit(0);
	
?>