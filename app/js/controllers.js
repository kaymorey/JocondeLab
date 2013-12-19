var JocondeLabControllers = angular.module('JocondeLabControllers', []);

JocondeLabControllers.controller('HomeChoiceCtrl', function HomeChoiceCtrl($scope, $rootScope, $http) {
    // Affichage full page
    $scope.full = true;

    $rootScope.step = false;
    $rootScope.home = true;

    $scope.slideLeft = false;
    $scope.slideRight = false;

    $scope.showLeft = false;
    $scope.showRight = false;

    $scope.showLeftTitle = true;
    $scope.showRightTitle = true;

    $scope.cities = [];

    $scope.chooseHomeLeft = function(item) {
        if($scope.showLeft == false) {
            $scope.slideLeft = true;

            $scope.showRight = false;

            $scope.showRightTitle = false;
        }
    };

    $http({
        method: 'GET',
        url: 'api/web/index.php/cities'
    })
    .success(function(data) {
        angular.forEach(data, function(value, key) {
            $scope.cities.push(value.city);
        });
    });

   $scope.chooseHomeRight = function(item) {
        if($scope.showRight == false) {
            $scope.slideRight = true;

            $scope.showLeft = false;

            $scope.showLeftTitle = false;
        }
   };
});

JocondeLabControllers.controller('ChooseCityCtrl', function ChooseCityCtrl($scope, $rootScope, $location) {
    $scope.submit = function(city) {
        $rootScope.city = angular.copy(city);
        $location.path('/partir/'+$rootScope.city+'/filtre');
    }
});

JocondeLabControllers.controller('FilterCtrl', function FilterCtrl($scope, $rootScope, $http, $routeParams) {
    // Affichage full page
    $scope.full = true;
    $scope.artworks = '';
    // Footer btn
    $rootScope.validateBtn = true;

    $rootScope.page = 'filter';
    $rootScope.city = $routeParams.city;

    $scope.getData = function() {

    }
});

JocondeLabControllers.controller('FooterCtrl', function FooterCtrl($scope, $rootScope, $location, ArtworksService, localStorageService) {
    // Show or not elements footer
    $rootScope.$watch('step', function() {
        $scope.step = $rootScope.step;
    });
    $rootScope.$watch('home', function() {
        $scope.home = $rootScope.home;
    });
    $rootScope.$watch('page', function() {
        $scope.page = $rootScope.page;
    });
    $rootScope.$watch('validateBtn', function() {
        $scope.validateBtn = $rootScope.validateBtn;
    });
    $rootScope.$watch('route', function() {
        $scope.route = $rootScope.route;
    });
    
    // Handle more-less indicators
    $scope.maxArtworks = ArtworksService.maxArtworks;
    $scope.nbArtworks = ArtworksService.nbArtworks;
    $scope.minArtworks = ArtworksService.minArtworks;

    $scope.getmaxArtworks = function(num) {
        return new Array(num);   
    }

    $scope.validate = function(page) {
        if(page == 'filter') {
            $rootScope.$broadcast('filterFinished');
        }
        else if(page == 'city') {
            if($rootScope.artworksValidated.length < 3) {
            alert('Vous devez sélectionner au moins 3 oeuvres pour passer à l\'étape suivante');
            }
            else {
                localStorageService.add('artworks', $rootScope.artworksValidated);
                $rootScope.$broadcast('path');
            }
        }
        else if(page == 'path') {
            localStorageService.add('artworks', $rootScope.artworksValidated);
            $location.path('/partir/'+$rootScope.city+'/parcours');
        }
    }
});


JocondeLabControllers.controller('MuseumsCtrl', function MuseumsCtrl($scope, $rootScope, $http, Geocoder, $routeParams, ArtworksService) {
    // Affichage full page
    $scope.full = true;

    $rootScope.step = true;
    $rootScope.home = false;
    $rootScope.page = 'city';

    $rootScope.city = $routeParams.city;

    $scope.cityCode = [];
    var geocode = Geocoder.getGeocode($routeParams.city+' France');
    geocode.then(function(data) {
        $scope.cityCode = data;
    }, function(error) {
        alert(error);
    });

    $scope.$watch('cityCode', function() {
        /*$http({
            method: 'GET',
            url: 'http://api.geonames.org/findNearbyPlaceNameJSON?lat='+$scope.cityCode['lat']+'&lng='+$scope.cityCode['lng']+'&featureCode=PPL&radius=10&maxRows=50&username=kaymorey'
        })
        .success(function(data) {
            console.log(data);
        });*/

        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                userLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
                var distance = google.maps.geometry.spherical.computeDistanceBetween(userLocation, $scope.cityCode);
                if(distance > 30) {

                }
            }, function() {
              handleNoGeolocation(browserSupportFlag);
            });
        }
    });
    
    $scope.geocodes = [];

    $scope.artworksHistory = [];
    $scope.museums = [];

    $rootScope.artworksValidated = [];

    $scope.getData = function() {
        $http({
            method: 'POST',
            url: 'api/web/index.php/museums',
            data: $routeParams.city
        })
        .success(function(data) {
            $scope.artworks = data;
            angular.forEach($scope.artworks, function(data, index) {
                $scope.artworksHistory.push(parseInt(data['id']));
                $scope.museums.push(parseInt(data['museum_id']));
            });
        });
    }

    $scope.displayArtwork = function(index) {
        $scope.activeArtwork = index;
    }

    $scope.next = function(index) {
        if($rootScope.artworksValidated.indexOf($scope.artworks[index]) == -1) {
            $http({
                method: 'POST',
                url: 'api/web/index.php/next-artwork',
                data: {
                    'city': $routeParams.city,
                    'history': $scope.artworksHistory,
                    'museums': $scope.museums
                }
            })
            .success(function(data) {
                $scope.artworks[index] = data;
                $scope.museums[index] = data['museum_id'];
                $scope.$watch('artworks', function() {
                    angular.element('ul.accordion').accordion();
                });
            });
        }
        else {
            alert('Vous avez validé cette oeuvre');
        }
    }
    $scope.add = function() {
        $http({
            method: 'POST',
            url: 'api/web/index.php/next-artwork',
            data: {
                'city': $routeParams.city,
                'history': $scope.artworksHistory,
                'museums': $scope.museums
            }
        })
        .success(function(data) {
            $scope.artworks.push(data);
            $scope.museums.push(data['museum_id']);
            $scope.$watch('artworks', function() {
                angular.element('ul.accordion').accordion();
            });
            $rootScope.$broadcast('addMarker', data);
        })
    }
    $scope.check = function(index) {
        var indexValidated = $rootScope.artworksValidated.indexOf($scope.artworks[index]);
        if(indexValidated == -1) {
            $rootScope.artworksValidated.push($scope.artworks[index]);
            ArtworksService
        }
        else {
            $rootScope.artworksValidated.splice(indexValidated, 1);
        }
    }
    $scope.remove = function(index) {
        if($scope.artworks.length <= 3) {
            alert('Vous devez sélectionner au moins 3 oeuvres');
        }
        else if($rootScope.artworksValidated.indexOf($scope.artworks[index]) != -1) {
            alert('Vous avez validé cette oeuvre');
        }
        else {
            var artwork = $scope.artworks[index];
            $scope.artworksHistory.push(artwork['id']);
            $scope.artworks.splice(index, 1);
            $scope.museums.splice(index, 1);
            $scope.$watch('artworks', function() {
                angular.element('ul.accordion').accordion();
            });
            $rootScope.$broadcast('removeMarker', index);
        }
    }

    // When click on more-less indicators (event emitted in a directive, app.js)
    $rootScope.$on('loadItems', function(event, itemsToLoad) {
        // Remove artworks
        if(itemsToLoad < 0) {
            itemsToLoad = itemsToLoad * (-1);
            if(ArtworksService.nbArtworks - $rootScope.artworksValidated.length < itemsToLoad) {
                alert('Vous avez déjà validé '+$rootScope.artworksValidated.length+' oeuvres');
            }
            else {
                var removed = 0;
                var indexToRemove = 0;
                for(var i = 0; i < ArtworksService.nbArtworks; i++) {
                    if($rootScope.artworksValidated.indexOf($scope.artworks[0]) == -1) {
                        $scope.$apply(function () {
                            $scope.remove(0);
                        });
                        removed++;
                        indexToRemove = 0;
                    }
                    else {
                        for(indexToRemove = 0; indexToRemove < ArtworksService.nbArtworks; indexToRemove++) {
                            if($rootScope.artworksValidated.indexOf($scope.artworks[indexToRemove]) == -1) {
                                $scope.$apply(function () {
                                    $scope.remove(indexToRemove);
                                });
                                removed++;
                                break;
                            }
                        }
                    }
                    if(removed == itemsToLoad) {
                        break;
                    }
                }
                ArtworksService.nbArtworks -= itemsToLoad;
            }
            angular.element('ul.accordion').accordion();
        }
        // Add artworks
        else if(itemsToLoad > 0) {
            var updated = false;
            for(var i = 0; i < itemsToLoad; i++) {
                $scope.$apply(function () {
                    $scope.add();
                });
                $scope.$watch('artworks', function() {
                    updated = true;
                });
            }
            ArtworksService.nbArtworks += itemsToLoad;
        }
    });
});

JocondeLabControllers.controller('PathCtrl', function PathCtrl($scope, $rootScope, $http) {
    // Affichage full page
    $scope.full = true;

    $rootScope.step = true;
    $rootScope.home = false;
    $rootScope.page = 'path';

    $scope.checked = [false, false, false, false, false];

    $scope.getData = function() {
        $http({
        method: 'GET',
        url: 'js/path.json'
        })
        .success(function(data) {
            $scope.artworks = data;
        });
    }

    $scope.check = function(index) {
        var artwork = $scope.artworks[index];
        var data = {
            "geoloc": {
                "lat": artwork.content.museums.lat,
                "lng": artwork.content.museums.lng
            },
            "loca": artwork.content.museums.name,
            "image": artwork.content.museums.artwork.image,
            "type": "json"
        };

        $rootScope.artworksValidated.push(data);
        $scope.checked[index] = true;
    }

    $scope.remove = function(index) {
        $scope.artworks.splice(index, 1);
        $scope.$watch('artworks', function() {
            angular.element('ul.accordion').accordion();
        });
        $('.route .content .marker').eq(index).css({
            'display': 'none'
        });
    }
});

JocondeLabControllers.controller('RouteCtrl', function RouteCtrl($scope, $rootScope, $http, localStorageService) {
    // Affichage full page
    $scope.full = true;

    $rootScope.route = true;

    $rootScope.$broadcast("restoreArtworks");
    $scope.artworks = localStorageService.get('artworks');
    $scope.$watch('artworks', function() {
        angular.forEach($scope.artworks, function(artwork, index) {
            var geoloc = angular.fromJson(artwork.geoloc);
            $http({
                method:'GET',
                url: 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+geoloc.lat+','+geoloc.lng+'&sensor=false'
            })
            .success(function(data) {
                result = [];
                angular.forEach(data['results']['0']['address_components'], function(element, index) {
                    result[element['types']] = element['long_name'];
                });
                artwork.address = result;
                if(artwork.type != 'json') {
                    var loca = artwork.loca.split(';');
                    artwork.loca = loca[1];
                }
            });
        });
    });
});

JocondeLabControllers.controller('CitiesCtrl', function CitiesCtrl($scope, $http) {
    $http({
        method: 'GET',
        url: 'api/web/index.php/cities'
    })
    .success(function(data) {
        $scope.cities = data;
    });
});

JocondeLabControllers.controller('AccordionCtrl', function AccordionCtrl($scope, $http) {
    $scope.getImages = function() {
        $http({
            method: 'GET',
            url: 'api/web/index.php/images'
        })
        .success(function(data) {
            $scope.images = data;
        });
    }
});

JocondeLabControllers.controller('DestCtrl', function DestCtrl($scope, $http) {
    
});

JocondeLabControllers.controller('SearchCtrl', function SearchCtrl($scope, $http) {
    $scope.search = function() {
        $http({
            method: 'POST',
            url: 'api/web/index.php/search',
            data: $scope.keywords
        })
        .success(function(data) {
            $scope.results = data;
        });
    }

});

/* ---- GET GEOLOC MUSEUMS QUERY  ---- */

JocondeLabControllers.controller('GeolocqueryCtrl', function GeolocqueryCtrl($scope, $timeout, $http, Geocoder, $q) {
    var insertGeoloc = function(museums) {
        $scope.interval = 683;
        $scope.lastMuseum = '';
        geoloc = $timeout(function geolocFunction() {
            angular.forEach(museums, function(value, index) {
                if(index >= $scope.interval && index < $scope.interval + 5) {
                    loca = museums[index].loca.split(";");
                    var city = loca[0];
                    city = city.trim();
                    var museum = loca[1];
                    var museum = museum.trim();

                    var loca = museums[index];

                    var museumCode = Geocoder.getGeocode(museum+' '+city+' France');
                    museumCode.then(function(code) {
                        console.log(loca);
                        var museum = {
                            'lat': code['lat'],
                            'lng': code['lng']
                        }

                        var cityCode = Geocoder.getGeocode(city+' France');
                        cityCode.then(function(code) {
                            var city = {
                                'lat': code['lat'],
                                'lng': code['lng']
                            }

                            var result = {
                                'museumCode': museum,
                                'cityCode': city,
                                'notice': loca
                            }

                            $http({
                                method: 'POST',
                                url: 'api/web/index.php/insert-geoloc',
                                data: result
                            })
                            .success(function(data) {
                                $scope.result = data;
                            });
                        }, function(error) {
                            if(error == "OVER_QUERY_LIMIT") {
                                alert(error);
                                $scope.lastMuseum = museums[index]+ ' '+index;
                                $timeout.cancel(stop);
                            }
                        });
                    }, function(error) {
                        if(error == "OVER_QUERY_LIMIT") {
                            alert(error);
                            $scope.lastMuseum = museums[index]+ ' '+index;
                            $timeout.cancel(stop);
                        }
                    });
                }
            });
            $scope.interval += 5;
            geoloc = $timeout(geolocFunction, 25000);
        }, 25000);
    }

    $http({
        method: 'GET',
        url: 'api/web/index.php/get-museums'
    })
    .success(function(data) {
        insertGeoloc(data);
    });
});