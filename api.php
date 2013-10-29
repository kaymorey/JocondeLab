<?php

require('lib/top.php');

function getNotices() {
	global $db;
	$req = $db->prepare('SELECT core_notice.loca FROM core_notice LIMIT 0 10');
	$req->execute();

	$result = $req->fetchAll();

	return $result;
}