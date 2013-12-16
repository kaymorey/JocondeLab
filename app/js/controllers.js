var JocondeLabControllers = angular.module('JocondeLabControllers', []);

JocondeLabControllers.controller('HomeChoiceCtrl', function HomeChoiceCtrl($scope, $http) {
    // Affichage full page
    $scope.full = true;

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

JocondeLabControllers.controller('ChooseCityCtrl', function ChooseCityCtrl($scope, $location) {
    $scope.submit = function(city) {
        $scope.city = angular.copy(city);
        $location.path('/partir/'+city);
    }
});


JocondeLabControllers.controller('MuseumsCtrl', function MuseumsCtrl($scope, $http, Geocoder, $routeParams) {
    // Affichage full page
    $scope.full = true;

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

    $scope.artworksValidated = [];

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
        if($scope.artworksValidated.indexOf($scope.artworks[index]) == -1) {
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
                $scope.artworksHistory.push(data['id']);
                $scope.$watch('artworks', function() {
                    angular.element('ul.accordion').accordion();
                });
            });
        }
        else {
            alert('Vous avez validé cette oeuvre');
        }
    }
    $scope.like = function(index) {
        $scope.artworksValidated.push($scope.artworks[index]);
    }
    $scope.remove = function(index) {
        if($scope.artworks.length == 1) {
            alert('Vous devez sélectionner au moins une oeuvre');
        }
        else if($scope.artworksValidated.indexOf($scope.artworks[index]) != -1) {
            alert('Vous avez validé cette oeuvre');
        }
        else {
            $scope.artworks.splice(index, 1);
            $scope.$watch('artworks', function() {
                angular.element('ul.accordion').accordion();
            });
        }
    }
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