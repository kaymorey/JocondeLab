var JocondeLabControllers = angular.module('JocondeLabControllers', []);

JocondeLabControllers.controller('MuseumCtrl', function Museumtrl($scope, $http, Geocoder) {
	$http({
		method: 'GET',
		url: 'api/web/index.php/museums'
	})
	.success(function(data) {
		$scope.museums = data;
	});

	var geocode = Geocoder.getGeocode('Musée du Louvre Paris France');
	geocode.then(function(data) {
		console.log(data);
	}, function(error) {
		alert(error);
	});
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

JocondeLabControllers.controller('AccordionCtrl', function SearchCtrl($scope, $http) {
	$http({
		method: 'GET',
		url: 'api/web/index.php/images'
	})
	.success(function(data) {
		$scope.images = data;
	});
});