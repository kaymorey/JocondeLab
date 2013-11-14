var app = angular.module('JocondeLab', [
	'ngRoute',
	'JocondeLabControllers',
	'Accordion'
]);

app.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider
		.when('/', {
			templateUrl: 'partials/home.html',
			controller: 'SearchCtrl'
		})
		.when('/destination', {
			templateUrl: 'partials/destination.html',
			controller: 'DestCtrl'
		})
		.when('/museums', {
			templateUrl: 'partials/museums.html',
			controller: 'MuseumsCtrl'
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
		getGeocode: function(address, reference = null) {
			var deferred = $q.defer();

			var geocoder = new google.maps.Geocoder();
			geocoder.geocode({address : address}, function (results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					var point = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
					if(reference != null) {
						console.log(reference);
						console.log(point);
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
					deferred.reject('Geocode was not successful for the following reason: ' + status);
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
			scope.getImages();
			scope.$watch('images', function(update) {
				if(update) {
					$(element).accordion();
				}
			});
		}
	};
});