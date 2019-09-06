<?php
$source = new PDO("sqlite:meetings.sql");
$stmt = $source->query("SELECT * FROM `meetings`");

$results = [];

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    array_push($results, [
        'meeting_name' => sprintf("%s (%s, %s)", $row['place'], $row['city'], $row['country']),
        'latitude' => $row['latitude'],
        'longitude' => $row['longitude'],
        'weekday_tinyint' => $row['mtg_day'],
        'id_bigint' => $row['id'],
        'start_time' => sprintf("%s:%s", substr($row['mtg_time'], 0, 2), substr($row['mtg_time'], 2, 2)),
        'root_server_uri' => 'https://na.org/main_server/'
    ]);
}

$stmt->closeCursor();

$target = fopen("../js/naws_meetings.json", "w");
fwrite($target, json_encode($results));
fclose($target);
