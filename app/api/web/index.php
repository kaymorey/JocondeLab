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

$app->post('/museums', function(Request $request) use($app) {
    $city = $request->getContent();

    $sql = 'SELECT notice.loca, notice.id, geoloc.museum 
    FROM core_notice as notice
    INNER JOIN geoloc
    ON notice.id = geoloc.notice_id
    WHERE notice.loca LIKE "%'.$city.' ; %"
    GROUP BY notice.loca
    LIMIT 0, 5';
    $result = $app['db']->fetchAll($sql);

    return new JsonResponse($result);
});

$app->get('/get-museums', function() use ($app) {
    $sql = 'SELECT notice.loca, notice.id
    FROM core_notice as notice
    WHERE notice.loca IS NOT NULL
    AND notice.loca != ""
    AND notice.loca LIKE "%;%"
    AND notice.loca NOT LIKE "%oeuvre disparue%"
    AND notice.loca NOT LIKE "%oeuvre détruite%"
    AND notice.loca NOT LIKE "%oeuvre volée%"
    AND SUBSTRING_INDEX(notice.loca2, ";", 1) LIKE "%France%"
    GROUP BY notice.loca';
    $result = $app['db']->fetchAll($sql);

    return new JsonResponse($result);
});

$app->get('/cities', function() use($app) {
    $sql = 'SELECT RTRIM(SUBSTRING_INDEX(notice.loca, ";", 1)) as city, COUNT(DISTINCT SUBSTRING_INDEX(notice.loca, ";", 2)) as nbMuseums
    FROM core_notice as notice
    WHERE SUBSTRING_INDEX(notice.loca2, ";", 1) LIKE "%France%"
    AND notice.loca IS NOT NULL
    GROUP BY city
    ORDER BY nbMuseums DESC';
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

$app->post('/geoloc-museums', function(Request $request) use($app) {
    $index = $request->getContent();
    $index = intval($index);

    $sql = 'SELECT notice.loca, notice.id
    FROM core_notice as notice
    ORDER BY notice.id
    LIMIT '.$index.', 5';

    $result = $app['db']->fetchAll($sql);

    return new JsonResponse($result);
});

$app->post('/insert-geoloc', function(Request $request) use($app) {
    $data = $request->getContent();
    $data = json_decode($data);

    $museumCode = array(
        'lat' => $data->museumCode->lat,
        'lng' => $data->museumCode->lng
    );
    $museumCode = json_encode($museumCode);
    $cityCode = array(
        'lat' => $data->cityCode->lat,
        'lng' => $data->cityCode->lng
    );
    $cityCode = json_encode($cityCode);

    $loca = $data->notice->loca;

    $sql = 'SELECT notice.id
    FROM core_notice as notice
    WHERE notice.loca = "'.$loca.'"';

    $notices = $app['db']->fetchAll($sql);

    foreach($notices as $notice) {
        $sql = 'INSERT INTO geoloc(id, notice_id, museum, city)
        values("", ?, ?, ?)';

        $result = $app['db']->executeUpdate($sql, array((int) $notice['id'], $museumCode, $cityCode));
    }

    return "Lignes insérées pour le musée ".$loca;
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
