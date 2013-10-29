<?php

require_once __DIR__.'/../vendor/autoload.php';

use Symfony\Component\HttpFoundation\JsonResponse;

$app = new Silex\Application();
$app['debug'] = true;

$app->register(new DerAlex\Silex\YamlConfigServiceProvider(__DIR__ . '/config/settings.yml'));

$app->register(new Silex\Provider\DoctrineServiceProvider(), array(
	'db.options' => array(
		'driver' => 'pdo_mysql',
		'host' => 'localhost',
		'dbname' => 'JocondeLab',
		'user' => 'root',
		'password' => 'zHuy3uoz',
		'charset' => 'utf8'
	)
));

$app->get('/notices', function() use($app) {
    $sql = 'SELECT loca, id FROM core_notice WHERE loca is not null LIMIT 0, 5';

    return new JsonResponse($app['db']->fetchAll($sql));
});

$app->get('/hello/{name}', function ($name) use ($app) {
    return 'Hello '.$app->escape($name);
});
$app->run();
