<?php

require_once __DIR__.'/../vendor/autoload.php';

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

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

$app->get('/museums', function() use($app) {
    $sql = 'SELECT notice.loca, notice.id 
    FROM core_notice as notice 
    WHERE notice.loca is not null and notice.loca != ""
    GROUP BY notice.loca';
    $result = $app['db']->fetchAll($sql);

    return new JsonResponse($result);
});

$app->get('/images', function() use($app) {
    $sql = 'SELECT noticeimage.relative_url as url
    FROM core_noticeimage as noticeimage
    WHERE noticeimage.relative_url LIKE "%_p.jpg%"
    ORDER BY rand()
    LIMIT 0, 7';
    $result = $app['db']->fetchAll($sql);

    return new JsonResponse($result);
});

$app->post('/search', function(Request $request) use($app) {
	$keywords = $request->getContent();
    $sql = 'SELECT notice.titr as titre, noticeimage.relative_url as url
    FROM core_term as term
    INNER JOIN core_noticeterm as noticeterm
    ON term.id = noticeterm.term_id
    INNER JOIN core_notice as notice
    ON noticeterm.notice_id = notice.id
    INNER JOIN core_noticeimage as noticeimage
    ON notice.id = noticeimage.notice_id
    WHERE notice.titr LIKE "%'.$keywords.'%"
    GROUP BY notice.id
    LIMIT 0, 5';
    $result = $app['db']->fetchAll($sql);

    return new JsonResponse($result);
});

$app->get('/hello/{name}', function ($name) use ($app) {
    return 'Hello '.$app->escape($name);
});
$app->run();
