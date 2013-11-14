var JocondeLabControllers = angular.module('JocondeLabControllers', []);

JocondeLabControllers.controller('GeolocqueryCtrl', function GeolocqueryCtrl($scope, $http, Geocoder) {
	var interval = 0;
	$timeout(function() {
		$http({
			method: 'POST',
			url: 'api/web/index.php/geoloc-museums',
			data: interval
		})
		.success(function(data) {
			var loca = data.loca;
			var id = data.id;
			angular.forEach(loca, function(value, key) {
				value = value.split(";");
				var city = value[0];
				city = city.trim();
				var museum = value[1];
				museum = museum.trim();

				var result = [];
				var museumCode = Geocoder.getGeocode(museum+' '+city+' France');
				museumCode.then(function() {
					var museum = {
						'lat': museumCode['lat'],
						'lng': museumCode['lng']
					}

					var cityCode = Geocoder.getGeocode(city+' France');
					cityCode.then(function() {
						var city = {
							'lat': cityCode['lat'],
							'lng': cityCode['lng']
						}
						
						result = {
							'museumCode': museum,
							'cityCode': city,
							'id': id
						}

						$http({
							method: 'POST',
							url: 'api/web/index.php/insert-geoloc',
							data: result
						});
					});
				})
			});
			interval+=5;
		});
	}, 2000);
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
					alert(error)
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