var JocondeLabControllers = angular.module('JocondeLabControllers', []);

JocondeLabControllers.controller('HomeChoiceCtrl', function HomeChoiceCtrl($scope, $http) {
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


JocondeLabControllers.controller('MuseumsCtrl', function MuseumsCtrl($scope, $http, Geocoder) {
	$scope.city = 'Paris';
	$scope.geocodes = [];

	$http({
		method: 'POST',
		url: 'api/web/index.php/museums',
		data: $scope.city
	})
	.success(function(data) {
		$scope.museums = data;

		var reference = Geocoder.getGeocode($scope.city+' France');
		reference.then(function(data) {
			var refLatLng = data;
			reference = new google.maps.LatLng(refLatLng.lat, refLatLng.lng);

			angular.forEach($scope.museums, function(value, key) {
				var splitted = value.loca.split(' ; ');
				var museum = splitted[1];
				var geocode = Geocoder.getGeocode(museum+' '+$scope.city+' France', reference);
				geocode.then(function(data) {
					$scope.geocodes.push(data);
				}, function(error) {
					alert(error);
				});
			});
		}, function(error) {
			alert(error);
		});
	});
	/*
	var geocode = Geocoder.getGeocode('Musée du Louvre Paris France');
	geocode.then(function(data) {
		
	}, function(error) {
		alert(error);
	});*/
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