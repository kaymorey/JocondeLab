<?php

require_once __DIR__.'/../vendor/autoload.php';
require '../../sphinx/sphinxapi.php';

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

$app->post('/next-artwork', function(Request $request) use($app) {
    $data = $request->getContent();
    $data = json_decode($data);

    $city = $data->city;
    $history = $data->history;
    $museums = $data->museums;

    $sphinx = new SphinxClient;
    
    $sphinx->SetServer('localhost', 3312);
    $sphinx->SetConnectTimeout(5);
    $sphinx->SetSortMode(SPH_SORT_EXTENDED, '@random');
    $sphinx->SetLimits(0, 1);
    // Exclude notices in history
    $sphinx->SetFilter('notice_id', $history, true);
    // Exlude notice with id 292717 (because of loca Paris;Nantes)
    $sphinx->setFilter('notice_id', array(292717), true);
    // Exclude museums in history
    $sphinx->SetFilter('museum_id', $museums, true);

    $result = $sphinx->Query($city, 'notice');

    $ids = array_keys($result['matches']);

    $sql = 'SELECT notice.id, notice.titr, notice.ddpt, term.label as autr, noticeimage.relative_url as image, notice.loca, museum.museumCode as geoloc, museum.id as museum_id
            FROM core_noticeimage as noticeimage
            INNER JOIN core_notice as notice ON (noticeimage.notice_id = notice.id)
            INNER JOIN museum ON (notice.museum_id = museum.id)
            RIGHT JOIN core_noticeterm as noticeterm ON (noticeterm.notice_id = notice.id)
            INNER JOIN core_term as term ON (term.id = noticeterm.term_id)
            WHERE notice.id IN ('.implode(',', $ids).')
            AND term.thesaurus_id = 1';

    $artwork = $app['db']->fetchAssoc($sql);

    return new JsonResponse($artwork);
});

$app->post('/museums', function(Request $request) use($app) {
    $city = $request->getContent();

    $sphinx = new SphinxClient;
    
    $sphinx->SetServer('localhost', 3312);
    $sphinx->SetConnectTimeout(5);

    $sphinx->SetSortMode(SPH_SORT_EXTENDED, '@random');
    $sphinx->SetLimits(0, 5);
    // Exlude notice with id 292717 (because of loca Paris;Nantes)
    $sphinx->setFilter('notice_id', array(292717), true);

    $result = $sphinx->Query($city, 'notice');

    $ids = array_keys($result['matches']);

    $sql = 'SELECT notice.id, notice.loca, museum.id as museum_id
    FROM core_notice as notice
    INNER JOIN museum
    ON museum.id = notice.museum_id
    WHERE notice.id IN('.implode(',', $ids).')';
    
    $museums = $app['db']->fetchAll($sql);

    $artworks = array();

    foreach($museums as $museum) {
        $sphinx = new SphinxClient;
        $sphinx->SetServer('localhost', 3312);
        $sphinx->SetConnectTimeout(5);

        $sphinx->SetSortMode(SPH_SORT_EXTENDED, '@random');
        $sphinx->SetLimits(0, 1);
        $sphinx->SetFilter('museum_id', array($museum['museum_id']));

        $artwork = $sphinx->Query($city, 'notice');

        $ids = array_keys($artwork['matches']);

        $sql = 'SELECT notice.id, notice.titr, notice.ddpt, term.label as autr, noticeimage.relative_url as image, notice.loca, museum.museumCode as geoloc, museum.id as museum_id
                FROM core_noticeimage as noticeimage
                INNER JOIN core_notice as notice ON (noticeimage.notice_id = notice.id)
                INNER JOIN museum ON (notice.museum_id = museum.id)
                RIGHT JOIN core_noticeterm as noticeterm ON (noticeterm.notice_id = notice.id)
                INNER JOIN core_term as term ON (term.id = noticeterm.term_id)
                WHERE notice.id IN('.implode(',', $ids).')
                AND term.thesaurus_id = 1';

        $artwork = $app['db']->fetchAssoc($sql);

        array_push($artworks, $artwork);
    }

    // QUERY TO SELECT 5 RANDOM ARTWORKS THAT HAVE A DIFFERENT LOCA

    // select 5 random locations that contains at least one artwork with image
    /*$sql = 'SELECT noticeimage.relative_url as image, notice.id, notice.loca
    FROM core_noticeimage as noticeimage
    INNER JOIN core_notice as notice
    ON noticeimage.notice_id = notice.id
    WHERE notice.loca LIKE "%'.$city.'%"
    AND notice.loca LIKE "%;%"
    AND notice.loca NOT LIKE "%oeuvre disparue%"
    AND notice.loca NOT LIKE "%oeuvre détruite%"
    AND notice.loca NOT LIKE "%oeuvre volée%"
    GROUP BY notice.loca
    ORDER BY RAND()
    LIMIT 0, 5';

    $museums = $app['db']->fetchAll($sql);

    $artworks = array();

    // select 1 random artwork per museum
    foreach($museums as $museum) {
        $sql = 'SELECT noticeimage.relative_url as image, notice.id, notice.loca, geoloc.museum as geoloc
        FROM core_noticeimage as noticeimage
        INNER JOIN core_notice as notice
        ON noticeimage.notice_id = notice.id
        INNER JOIN geoloc
        ON notice.id = geoloc.notice_id
        WHERE notice.loca = "'.$museum['loca'].'"
        AND noticeimage.relative_url LIKE "%_p.jpg%"
        AND notice.loca != ""
        AND notice.loca LIKE "%;%"
        AND notice.loca NOT LIKE "%oeuvre disparue%"
        AND notice.loca NOT LIKE "%oeuvre détruite%"
        AND notice.loca NOT LIKE "%oeuvre volée%"
        ORDER BY RAND()
        LIMIT 1';

        $artwork = $app['db']->fetchAssoc($sql);
        if($artwork == false) {
            var_dump($museum);
        }
        array_push($artworks, $artwork);
    }*/

    return new JsonResponse($artworks);
});

$app->get('/cities', function() use($app) {
    $sphinx = new SphinxClient;
    $sphinx->SetServer('localhost', 3312);
    $sphinx->SetConnectTimeout(5);

    $sphinx->SetLimits(0, 360);
    $sphinx->SetSortMode(SPH_SORT_ATTR_DESC, 'nbMuseums');

    $cities = $sphinx->Query('France', 'cities');

    $ids = array_keys($cities['matches']);

    $sql = 'SELECT RTRIM(SUBSTRING_INDEX(notice.loca, ";", 1)) as city
    FROM core_notice as notice
    WHERE notice.id IN('.implode(',', $ids).')
    ORDER BY FIELD(id,'.implode(',', $ids).')';

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

/* MUSEUMS TABLE REQUEST */
$app->get('/insert-museums', function(Request $request) use($app) {
    $sql = 'SELECT notice.id, notice.loca as museum, RTRIM(SUBSTRING_INDEX(notice.loca, ";", 1)) as city, geoloc.museum as museumCode, geoloc.city as cityCode
    FROM core_notice as notice, geoloc
    WHERE notice.loca IS NOT NULL
    AND notice.loca != ""
    AND notice.loca LIKE "%;%"
    AND notice.loca NOT LIKE "%oeuvre disparue%"
    AND notice.loca NOT LIKE "%oeuvre détruite%"
    AND notice.loca NOT LIKE "%oeuvre volée%"
    AND SUBSTRING_INDEX(notice.loca2, ";", 1) LIKE "%France%"
    AND geoloc.notice_id = notice.id
    GROUP BY notice.loca';

    $museums = $app['db']->fetchAll($sql);

    foreach($museums as $museum) {
        $sql = 'INSERT INTO museum(id, museum, city, museumCode, cityCode)
        values("", ?, ?, ?, ?)';

        $result = $app['db']->executeUpdate($sql, array($museum['museum'], $museum['city'], $museum['museumCode'], $museum['cityCode']));
    }

    return "Lignes insérées dans la table museum";
});

$app->get('/set-notice-museum', function(Request $request) use($app) {
    $sql = 'SELECT museum.id, museum.museum FROM museum';

    $museums = $app['db']->fetchAll($sql);

    $sql = 'SELECT notice.id, notice.loca 
    FROM core_notice as notice';

    $notices = $app['db']->fetchAll($sql);

    foreach($notices as $notice) {
        foreach($museums as $museum) {
            if(trim($notice['loca']) == $museum['museum']) {
                $sql = 'UPDATE core_notice SET museum_id = ? WHERE core_notice.id = ?';
                $result = $app['db']->executeUpdate($sql, array($museum['id'], $notice['id']));
                break;
            }
        }
    }

    return "Notices mises à jour avec l'id du musée";
});

/* GEOLOC TABLE REQUEST */
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

/* INSERT MUSEUM */
$app->get('insert-museum', function(Request $request) use($app) {
    $sql = 'SELECT notice.id
    FROM core_notice as notice
    WHERE notice.loca = "Paris ; Bibliothèque Nationale de France ; département des Estampes et de la Photographie"';

    $notices = $app['db']->fetchAll($sql);

    foreach($notices as $notice) {
        $sql = 'INSERT INTO geoloc(id, notice_id, museum, city)
        values("", ?, ?, ?)';

        $result = $app['db']->executeUpdate($sql, array((int) $notice['id'], '{"lat":48.833584,"lng":2.375766}', '{"lat":48.856614,"lng":2.3522219}'));
    }

    return "Lignes insérées pour le musée : Paris ; Bibliothèque Nationale de France ; département des Estampes et de la Photographie";
});

/* PARIS REQUEST */
$app->get('insert-paris', function(Request $request) use($app) {
    $sql = 'SELECT notice.id
    FROM core_notice as notice
    WHERE notice.loca = "Paris"';

    $notices = $app['db']->fetchAll($sql);

    foreach($notices as $notice) {
        $sql = 'INSERT INTO geoloc(id, notice_id, museum, city)
        values("", ?, ?, ?)';

        $result = $app['db']->executeUpdate($sql, array((int) $notice['id'], '{"lat":48.856614,"lng":2.3522219}', '{"lat":48.856614,"lng":2.3522219}'));
    }

    return "Lignes insérées pour les musées ayant la loca Paris";
});

$app->run();
