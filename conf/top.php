<?php

require('settings.php');

// Connexion à la BDD
try {
	$pdo_options[PDO::ATTR_ERRMODE] = PDO::ERRMODE_EXCEPTION;
	$db  = new PDO('mysql:host='.DB_SERVER.';dbname='.DB_BASE, DB_USER, DB_PASS, $pdo_options);
}   
catch(Exception $e) {
	// On error message display
	die('Error : '.$e->getMessage());
}

