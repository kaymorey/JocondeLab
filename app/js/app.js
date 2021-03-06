angular.module('LocalStorageModule').value('prefix', 'jclab');

var app = angular.module('JocondeLab', [
    'ngRoute',
    'JocondeLabControllers',
    'Accordion',
    'LocalStorageModule'
]);


angular.module('testApp', ['LocalStorageModule'])

app.run(['$rootScope', function($rootScope){
    $rootScope.artworksValidated = [];
}]);

app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html',
            controller: 'HomeChoiceCtrl'
        })
        .when('/partir/:city/filtre', {
            templateUrl: 'partials/filter.html',
            controller: 'FilterCtrl'
        })
        .when('/partir/:city', {
            templateUrl: 'partials/museums.html',
            controller: 'MuseumsCtrl'
        })
        .when('/partir/:city/trajet', {
            templateUrl: 'partials/path.html',
            controller: 'PathCtrl'
        })
        .when('/partir/:city/parcours', {
            templateUrl: 'partials/route.html',
            controller: 'RouteCtrl'
        })
        .when('/destination', {
            templateUrl: 'partials/destination.html',
            controller: 'DestCtrl'
        })
        .when('/cities', {
            templateUrl: 'partials/cities.html',
            controller: 'CitiesCtrl'
        })
        .when('/accordion', {
            templateUrl: 'partials/accordion.html',
            controller: 'AccordionCtrl'
        })
        .when('/geoloc-query', {
            templateUrl: 'partials/geoloc-query.html',
            controller: 'GeolocqueryCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
    }
]);

app.factory('Geocoder', function ($q) {
    return {
        getGeocode: function(address, reference) {
            var deferred = $q.defer();

            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({address : address}, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    var point = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
                    if(reference != null) {
                        var distance = google.maps.geometry.spherical.computeDistanceBetween(reference, point);
                    }
                    else {
                        var distance = null;
                    }

                    var result = {
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng(),
                        distance: distance
                    };

                    deferred.resolve(result);
                }
                else {
                    deferred.reject(status);
                }

            });
            return deferred.promise;
        }
    }
});

var accordion = angular.module('Accordion', []);

accordion.directive('accordionInit', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            if(element.hasClass('filter')) {
                scope.$watch('artworks', function() {
                    $(element).accordion();
                });
            }
            else {
                scope.getData();
                scope.$watch('artworks', function(update) {
                    if(update) {
                        $(element).accordion();
                    }
                });
            }
        }
    };
});
app.directive('infosSlide', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(document).on('click', '.accordion .actions .infos', function() {
                var index = $(this).parent('.actions').attr('data-index');
                var infos = $('.accordion div.infos').eq(index);
                $('.accordion div.infos').eq(index).slideToggle();
                $('.accordion .actions').eq(index).find('.infos').toggleClass('selected');
            });
        }
    }
});


app.directive('pathAccordion', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(document).on('mouseenter', '.accordion li', function() {
                $('.accordion div.infos').slideUp();
                $('.accordion .actions .infos').removeClass('selected');
                var index = $(this).index();
                var items = $('.route .content .marker');
                items.each(function() {
                    if($(this).hasClass('selected')) {
                        $(this).find('.icon').css({
                            'background-position': 'center -41px'
                        });
                    }
                    else {
                       $(this).find('.icon').css({
                            'background-position': 'center top'
                        }); 
                    }
                    $(this).find('.city').css({
                        'visibility': 'hidden'
                    });
                });

                $('.route .content .marker .icon').eq(index).css({
                    'background-position': 'center -21px'
                });
                $('.route .content .marker .city').eq(index).css({
                    'visibility': 'visible'
                });
            });
            $(document).on('click', '.accordion li .actions .next', function(e) {
                e.preventDefault;

                var index = $(this).parent('.actions').attr('data-index');
                scope.$apply(function() {
                    scope.artworks[index] = {
                        "name": "Aix-en-provence",
                        "class": "aix",
                        "content": {
                            "lat": 43.529742,
                            "lng": 5.447427,
                            "museums": {
                                "name": "musée Granet",
                                "lat": 43.525386,
                                "lng": 5.452802,
                                "artwork": {
                                    "author": "Paul Cézanne",
                                    "title": "Les grandes baigneuses",
                                    "image": "Aix-en-provence.jpg"
                                }
                            }
                        }
                    }
                });
                $('.artwork-path').accordion();
            });
        }
    };
});
app.directive('filterAccordion', function($rootScope, $location) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var content = '<section class="filter-lightbox lightbox">';
                content += '<h1>À propos de vous...</h1>';
                content += '<p>Aidez-nous à mieux vous connaître en sélectionnant la ou les œuvres qui vous intéressent.</p>';
                content += '<div>';
                    content += '<a href="#"">c\'est parti !</a>';
                content += '</div>';
            content += '</section>';

            $.fancybox.open({
                content: content,
                closeBtn: false,
                width: 280,
                height: 194,
                fitToView: false,
                autoSize: false,
                helpers : {
                    overlay : {
                        opacity    : 0.1
                    },
                },
                afterShow: function() {
                    $('.filter-lightbox a').on('click', function(e) {
                        e.preventDefault();
                        $.fancybox.close();
                    });
                }
            });

            var items = element.find('li');
            items.each(function() {
                $(this).on('click', function(e) {
                    e.preventDefault();
                    $(this).find('a').toggleClass('selected');
                });
            });

            $rootScope.$on('filterFinished', function() {
                var content = '<section class="filter-lightbox lightbox">';
                    content += '<h1>C’est noté :)</h1>';
                    content += '<p>Maintenant que nous en savons plus sur vos goûts il est temps de commencer à créer votre parcours personnalisé.</p>';
                    content += '<div>';
                        content += '<a href="#">c\'est parti !</a>';
                    content += '</div>';
                content += '</section>';
                $.fancybox.open({
                    content: content,
                    closeBtn: false,
                    width: 280,
                    height: 214,
                    fitToView: false,
                    autoSize: false,
                    helpers : {
                        overlay : {
                            opacity    : 0.1
                        },
                    },
                    afterShow: function() {
                        $('.filter-lightbox a').on('click', function(e) {
                            e.preventDefault();
                            $rootScope.$apply(function() {
                                $location.path('/partir/'+$rootScope.city);
                            });
                            $.fancybox.close();
                        });
                    }
                });     
            });
        }
    }
});
app.directive('museumsAccordion', function($rootScope, $location) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var content = '<section class="museums-lightbox lightbox">';
                content += '<h1>À vous de décider.</h1>';
                content += '<p>Sélectionnez les œuvres de votre choix pour créer votre parcours de musées.</p>';
                content += '<p>Affichez jusqu’à 10 œuvres par parcours.</p>';
                content += '<div>';
                    content += '<a href="#"">j\'ai compris</a>';
                content += '</div>';
            content += '</section>';

            $.fancybox.open({
                content: content,
                closeBtn: false,
                width: 280,
                height: 232,
                fitToView: false,
                autoSize: false,
                helpers : {
                    overlay : {
                        opacity    : 0.1
                    },
                },
                afterShow: function() {
                    $('.museums-lightbox a').on('click', function(e) {
                        e.preventDefault();
                        $.fancybox.close();
                    });
                }
            });
        }
    }
});

app.directive('homeWhere', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.on('click', function() {
                if($(this).find('img').length == 0) {
                    element.html('<img src="images/home/imperatifs.png" alt="" class="img-click" />');
                }
                else {
                    element.html('<img src="images/home/imperatifs2.png" alt="" class="img-click" />');
                }
            });
        }
    }
});

app.directive('showSlide', function() {
    return {
        restrict: 'A',

     //set up the directive.
     link: function(scope, element, attrs) {
        var watchField = attrs.showSlide;

        scope.$watch(attrs.showSlide, function(show) {
            if(scope.slideLeft) {
                $('.home.right').animate({
                    left: '90%',
                    width: '10%',
                }, {duration: 500, queue: false });
                $('.home.left').animate({
                    width: '90%'
                }, 
                {
                    duration: 500, 
                    queue: false, 
                    complete: function() {
                        scope.$apply(function() {
                            scope.showLeft = true;
                            scope.showLeftTitle = true;
                        });
                    } 
                });
                scope.slideLeft = false;
            }
            else if(scope.slideRight) {
                $('.home.left').animate({
                    width: '10%',
                }, {duration: 500, queue: false });
                $('.home.right').animate({
                    left: '10%',
                    width: '90%',
                }, 
                {
                    duration: 500, 
                    queue: false, 
                    complete: function() {
                        scope.$apply(function() {
                            scope.showRight = true;
                            scope.showRightTitle = true;
                        });
                    } 
                });
                scope.slideRight = false;
            }
        });
     }
    }
});

app.directive('autoSuggest', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.$watch('cities', function(update) {
                if(update) {
                    $(element).suggest(scope.cities, {
                        'suggestionColor': '#b2b2b2'
                    });
                }
            });
        }
    }
});

app.directive('full', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            if(scope.full) {
                var sectionHeight = $(window).height() - $('footer').height();
                element.height(sectionHeight);
                angular.element($(window)).bind('resize',function() {
                    var sectionHeight = $(window).height() - $('footer').height();
                    element.height(sectionHeight);
                });
            }
        }
    }
});

app.directive('moreLess', function($rootScope, ArtworksService) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.$watch('maxArtworks', function() {
                var indicators = element.find('span');
                nbIndicators = indicators.length;
                indicators.each(function() {
                    $(this).on('mouseenter', function() {
                        var index = $(this).index();
                        for(var i = 0; i <= nbIndicators; i++) {
                            if((scope.maxArtworks - scope.minArtworks) <= i) {
                                indicators.eq(i).css({
                                    'background-color': '#FFF'
                                });
                            }
                            else {
                                indicators.eq(i).css({
                                    'background-color': '#666'
                                });
                            }
                        }
                        for(var i = index; i <= nbIndicators; i++) {
                            indicators.eq(i).css({
                                'background-color': '#FFF'
                            });
                        }
                    });
                    $(this).on('click', function() {
                        // 3 artworks at least
                        if($(this).index() != scope.maxArtworks - 1 && $(this).index() != scope.maxArtworks - 2) {
                            var itemsToLoad = scope.maxArtworks - ArtworksService.nbArtworks - $(this).index();
                            $rootScope.$broadcast('loadItems', itemsToLoad);
                        }
                    });
                });

                element.on('mouseleave', function() {
                    var indicators = element.find('span');
                    indicators.css({
                        'background-color': '#666'
                    });
                    indicators.each(function() {
                        if($(this).hasClass('selected')) {
                            $(this).css({
                                'background-color': '#FFF'
                            });
                        }
                    });
                });
            });
        }
    }
});

app.directive('connexion', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.on('click', function() {
                $.fancybox.open({
                    href: 'images/connexion.jpg',
                    type: 'image',
                    closeBtn: false,
                    helpers : {
                        overlay : {
                            opacity    : 0.1
                        },
                    },
                    wrapCSS: 'fancy-connexion',
                    afterShow: function() {
                        $('.fancy-connexion').on('click', function() {
                            $.fancybox.open({
                                href: 'images/inscription.jpg',
                                type: 'image',
                                closeBtn: false,
                                helpers : {
                                    overlay : {
                                        opacity    : 0.1
                                    },
                                },
                                wrapCSS: 'fancy-connexion'
                            });
                        });
                    }
                });
            });
        }
    }
});

app.directive('goPath', function($rootScope, $location) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $rootScope.$on('path', function(event) {
                var content = '<section class="path-lightbox lightbox">';
                    content += '<h1>Félicitations !</h1>';
                    content += '<p><em>Vous venez de créer votre premier parcours.</em></p>';
                    content += '<p>Souhaitez vous  découvrir les musées qui se trouvent sur votre trajet ?</p>';
                    content += '<div>';
                        content += '<a href="#" class="yes-btn">oui</a>';
                        content += '<a href="#">non</a>'
                    content += '</div>';
                content += '</section>';
                $.fancybox.open({
                    content: content,
                    closeBtn: false,
                    width: 325,
                    height: 234,
                    fitToView: false,
                    autoSize: false,
                    helpers : {
                        overlay : {
                            opacity    : 0.1
                        },
                    },
                    afterShow: function() {
                        $('.path-lightbox .yes-btn').on('click', function(e) {
                            e.preventDefault();
                            $location.path('/partir/'+$rootScope.city+'/trajet');
                            $.fancybox.close();
                        });
                    }
                });
            });
        }
    }
});

app.directive('googleMap', function($rootScope) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.$watch('cityCode', function() {
                center = new google.maps.LatLng(scope.cityCode['lat'], scope.cityCode['lng']);

                mapOptions = {
                    zoom: 8,
                    // Centrer sur la ville
                    center: center,
                    backgroundColor: "rgb(0, 0, 0)",
                    disableDefaultUI: true
                };

                map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);


                var mapStyles = [ 
                    { 
                        "stylers": [{ 
                            "color": "#000000" 
                        }, 
                        { 
                            "visibility": "off" 
                        }] 
                    },
                    { 
                        "featureType": "water", 
                        "stylers": [{ 
                            "color": "#808080" 
                        }, { 
                            "visibility": "on" 
                        }] 
                    },{
                        "featureType": "landscape",
                        "stylers": [{
                            "visibility": "on"
                        }] 
                    },{
                        "elementType": "labels",
                        "stylers": [{
                            "visibility": "off"
                        }]
                    }
                ];

                var markerCenter = new google.maps.Marker({
                    position: center,
                    map: map,
                    icon: 'images/markerCenter.png'
                });

                latlngbounds = new google.maps.LatLngBounds();

                markersTab = [];
                latlngTab = [];

                var defaultIcon = 'images/marker.png';
                var activeIcon = 'images/markerActive.png';
                var validatedIcon = 'images/markerValidated.png';

                // Créer des marqueurs pour les différents musées
                angular.forEach(scope.artworks, function(museum, index) {
                    var geoloc = JSON.parse(museum.geoloc);
                    var markerLatlng = new google.maps.LatLng(geoloc.lat, geoloc.lng);

                    var marker = new google.maps.Marker({
                        position: markerLatlng,
                        map: map,
                        icon: 'images/marker.png'
                    });
                    markersTab.push(marker);
                    latlngTab.push(markerLatlng);
                    latlngbounds.extend(markerLatlng);

                    var contentString = '<div id="content"><div id="bodyContent">'+scope.artworks[index].loca+'</div></div>';

                    var infowindow = new google.maps.InfoWindow({
                        content: contentString
                    });

                    google.maps.event.addListener(marker, 'click', function() {
                        infowindow.open(map, marker);
                    });
                });


                map.setOptions({styles: mapStyles});
                map.fitBounds(latlngbounds);

                prevActive = -1;

                $(document).on('mouseenter', '.accordion li', function() {
                    $('.accordion div.infos').slideUp();
                    $('.accordion .actions .infos').removeClass('selected');
                    if(prevActive != -1 && prevActive < markersTab.length && markersTab.length > 1) {
                        var prevItem = $('.accordion li').eq(prevActive);
                        if(prevItem.find('.actions .check').hasClass('selected')) {
                            markersTab[prevActive].setIcon(validatedIcon);
                        }
                        else {
                            markersTab[prevActive].setIcon(defaultIcon);
                        }
                    }
                    var index = $(this).index();
                    markersTab[index].setIcon(activeIcon);
                    prevActive = index;
                });

                $('.accordion li .actions .next').click(function() {
                    elmt = $(this);
                    scope.$watch('artworks', function() {
                        var index = elmt.parent('.actions').attr('data-index');

                        var geoloc = JSON.parse(scope.artworks[index].geoloc);
                        var markerLatlng = new google.maps.LatLng(geoloc.lat, geoloc.lng);

                        var marker = new google.maps.Marker({
                            position: markerLatlng,
                            map: map,
                            title: "Hello World!",
                            icon: 'images/marker.png'
                        });

                        markersTab[index].setMap(null);
                        markersTab[index] = marker;
                        latlngTab[index] = markerLatlng;

                        latlngbounds = new google.maps.LatLngBounds();
                        angular.forEach(latlngTab, function(latlng, index) {
                            latlngbounds.extend(latlng);
                        });
                        map.fitBounds(latlngbounds);

                        var contentString = '<div id="content"><div id="bodyContent">'+scope.artworks[index].loca+'</div></div>';

                        var infowindow = new google.maps.InfoWindow({
                            content: contentString
                        });

                        google.maps.event.addListener(marker, 'click', function() {
                            infowindow.open(map, marker);
                        });
                    });
                });
                $('.accordion li .actions .check').click(function() {
                    var index = $(this).parent('.actions').attr('data-index');
                    if($(this).hasClass('selected')) {
                        markersTab[index].setIcon(validatedIcon);
                    }
                    else {
                        markersTab[index].setIcon(defaultIcon);
                    }
                });
            });
            $rootScope.$on('addMarker', function(event, data) {
                var geoloc = JSON.parse(data.geoloc);
                var markerLatlng = new google.maps.LatLng(geoloc.lat, geoloc.lng);

                var marker = new google.maps.Marker({
                    position: markerLatlng,
                    map: map,
                    icon: 'images/marker.png'
                });

                markersTab.push(marker);
                latlngTab.push(markerLatlng);
                latlngbounds.extend(markerLatlng);
                map.fitBounds(latlngbounds);
            });
            $rootScope.$on('removeMarker', function(event, index) {
                markersTab[index].setMap(null);
                markersTab.splice(index, 1);
                latlngTab.splice(index, 1);

                latlngbounds = new google.maps.LatLngBounds();
                angular.forEach(latlngTab, function(latlng, index) {
                    latlngbounds.extend(latlng);
                });
                map.fitBounds(latlngbounds);
            });
        }
    }
});
app.directive('dndList', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var toUpdate;
            var startIndex = -1;
     
            scope.$watch(attrs.dndList, function(value) {
                toUpdate = value;
            },true);

            $(element[0]).sortable({
                items:'li',
                start:function (event, ui) {
                    $(ui.item).removeClass('grab');
                    $(ui.item).addClass('grabbing');
                    startIndex = ($(ui.item).index());
                },
                stop:function (event, ui) {
                    $(ui.item).removeClass('grabbing');
                    $(ui.item).addClass('grab');
                    var newIndex = ($(ui.item).index());
                    var toMove = toUpdate[startIndex];
                    toUpdate.splice(startIndex,1);
                    toUpdate.splice(newIndex,0,toMove);
     
                    scope.$apply(scope.artworks);
                },
                axis:'y'
            });
        }
    }
});

app.directive('finalRoute', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var content = '<section class="route-lightbox lightbox">';
                content += '<h1>Félicitations !</h1>';
                content += '<p>Votre parcours est maintenant terminé. Vous pouvez désormais l’organiser en déplaçant chaque ligne de musée pour l’adapter à vos envies.</p>';
                content += '<div>';
                    content += '<a href="#"">suivant</a>';
                content += '</div>';
            content += '</section>';

            var content2 = '<section class="route-lightbox lightbox">';
                content2 += '<h1>Félicitations !</h1>';
                content2 += '<p>Vous pouvez ensuite accéder à votre itinéraire sur mesure dans Google maps, l’envoyer par mail, le publier sur facebook ou tout simplement l’imprimer.</p>';
                content2 += '<div>';
                    content2 += '<a href="#"">j\'ai compris</a>';
                content2 += '</div>';
            content2 += '</section>';

            $.fancybox.open({
                content: content,
                closeBtn: false,
                width: 325,
                height: 215,
                fitToView: false,
                autoSize: false,
                helpers : {
                    overlay : {
                        opacity    : 0.1
                    },
                },
                afterShow: function() {
                    $('.route-lightbox a').on('click', function(e) {
                        e.preventDefault();
                        $.fancybox.open({
                            content: content2,
                            closeBtn: false,
                            width: 325,
                            height: 215,
                            fitToView: false,
                            autoSize: false,
                            helpers : {
                                overlay : {
                                    opacity    : 0.1
                                },
                            },
                            afterShow: function() {
                                $('.route-lightbox a').on('click', function(e) {
                                    e.preventDefault();
                                    $.fancybox.close();
                                });
                            }
                        });
                    });
                }
            });
        }
    }
});
app.factory('ArtworksService', function() {
  return {
      maxArtworks : 10,
      nbArtworks : 5,
      minArtworks : 3
  };
});
app.factory('ArtworksStorage', ['$rootScope', function ($rootScope) {

    var service = {

        SaveState: function () {
            sessionStorage.artworksService = angular.toJson($rootScope.validatedArtworks);
        },

        RestoreState: function () {
            $rootScope.validatedArtworks = angular.fromJson(sessionStorage.artworksService);
        }
    }

    $rootScope.$on("saveArtworks", service.SaveState);
    $rootScope.$on("restoreArtworks", service.RestoreState);

    return service;
}]);