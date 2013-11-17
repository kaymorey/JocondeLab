var JocondeLabControllers = angular.module('JocondeLabControllers', []);

JocondeLabControllers.controller('GeolocqueryCtrl', function GeolocqueryCtrl($scope, $timeout, $http, Geocoder) {
	var insertGeoloc = function(museums) {
		$scope.interval = 0;
		geoloc = $timeout(function geolocFunction() {
			$http({
				method: 'POST',
				url: 'api/web/index.php/geoloc-museums',
				data: $scope.interval
			})
			.success(function(data) {
				for(i = $scope.interval; i < $scope.interval + 5; i++) {
					loca = data[i].loca.split(";");
					var city = loca[0];
					city = city.trim();
					var museum = loca[1];
					var museum = museum.trim();

					var loca = data[i];

					var museumCode = Geocoder.getGeocode(museum+' '+city+' France');
					museumCode.then(function(code) {
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
								'loca': loca
							}

							$http({
								method: 'POST',
								url: 'api/web/index.php/insert-geoloc',
								data: result
							})
							.success(function(data) {
								$scope.result = data;
							});
				}
				angular.forEach(data, function(value, key) {
					loca = value.loca.split(";");
					var city = loca[0];
					city = city.trim();
					var museum = loca[1];
					var museum = museum.trim();

					var result = [];
					var museumCode = Geocoder.getGeocode(museum+' '+city+' France');
					museumCode.then(function(code) {
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
							
							result = {
								'museumCode': museum,
								'cityCode': city,
								'id': value.id
							}
							$http({
								method: 'POST',
								url: 'api/web/index.php/insert-geoloc',
								data: result
							})
							.success(function(data) {
								$scope.result = data;
							});
						});
					})
				});
			});
			$scope.interval += 5;
			geoloc = $timeout(geolocFunction, 10000);
		}, 10000);
	}

	$http({
		method: 'GET',
		url: 'api/web/index.php/get-museums'
	})
	.success(function(data) {
		insertGeoloc(data);
	});
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