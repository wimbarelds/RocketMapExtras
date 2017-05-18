<pre>
<?php
	
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL ^ E_DEPRACATED ^ E_NOTICE);

	$starttime = microtime(true);
	
	require_once('mysql_connect.php');
	$gymmember_old_results = $mysqli->query('SELECT DISTINCT `gym_id` , `pokemon_uid`  FROM `gymmember_old`');
	$gymmember_new_results = $mysqli->query('SELECT DISTINCT `gym_id` , `pokemon_uid`  FROM `gymmember`');
	$timestamp = time();

	$oldGymmembers = [];
	while ($gymmember = $gymmember_old_results->fetch_row()) {
		$oldGymmembers[$gymmember[0]][] = $gymmember[1];
	}
	
	$newGymmembers = [];
	while ($gymmember = $gymmember_new_results->fetch_row()) {
		$gymId = $gymmember[0];
		$pokemonuid = $gymmember[1];
		if(empty($oldGymmembers[$gymId]) || !in_array($pokemonuid, $oldGymmembers[$gymId])) {
			// This is a new pokemon in the gym
			$newGymmembers[$gymId][] = $pokemonuid;
		}
		else {
			// This pokemon was in the gym, is still in the gym (ie: no changes)
			$removeIndex = array_search($pokemonuid, $oldGymmembers[$gymId]);
			unset($oldGymmembers[$gymId][$removeIndex]);
		}
	}
	
	// Calculate changes
	$changes = [];
	foreach($oldGymmembers as $gymId => $gymmembers) {
		if(empty($gymmembers)) continue;
		$changes[$gymId]["removed"] = $gymmembers;
	}
	foreach($newGymmembers as $gymId => $gymmembers) {
		$changes[$gymId]["added"] = $gymmembers;
	}
	
	// Insert changes into gymmember_history table
	$insertChangesValues = [];
	foreach($changes as $gymId => $gymmemberChanges) {
		foreach($gymmemberChanges as $event => $pokemonuids) {
			foreach($pokemonuids as $pokemonuid) {
				$insertChangesValues[] = "('".$gymId."', '".$pokemonuid."', '".$event."', '".$timestamp."')";
			}
		}
	}
	$insertChangesQuery = "INSERT INTO `gymmember_history` "
		."( `gym_id` , `pokemon_uid` , `event` , `timestamp` ) VALUES "
		.implode(" , ", $insertChangesValues);
	$mysqli->query($insertChangesQuery);
	
	// Remove changes older than 1 month
	$deleteBefore = $timestamp - (60 * 60 * 24 * 30);
	$deleteQuery = "DELETE FROM `gymmember_history` WHERE `timestamp` < '".$deleteBefore."'";
	$mysqli->query($deleteQuery);
	
	// Update the gymmember_old table
	$gymmember_new_results->data_seek(0);
	$addQuery = 'INSERT INTO `gymmember_old` (`gym_id` , `pokemon_uid`) VALUES ';
	$addQueryValues = [];
	while ($gymmember = $gymmember_new_results->fetch_row()) {
		$addQueryValues[] = "('".$gymmember[0]."', '".$gymmember[1]."')";
	}
	$addQuery .= implode(" , ", $addQueryValues);
	$mysqli->query('DELETE FROM `gymmember_old`');
	$mysqli->query($addQuery);
	
	$endtime = microtime(true);
	$elapsed = $endtime - $starttime;
	echo "Finished in ".$elapsed."s";
	
?>
</pre>