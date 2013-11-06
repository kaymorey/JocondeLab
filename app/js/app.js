var app = angular.module('JocondeLab', [
	'ngRoute',
	'JocondeLabControllers'
]);

app.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider
		.when('/', {
			templateUrl: 'partials/home.html',
			controller: 'SearchCtrl'
		})
		.when('/accordion', {
			templateUrl: 'partials/accordion.html',
			controller: 'AccordionCtrl'
		})
		.otherwise({
			redirectTo: '/'
		});
	}
]);


app.factory('Geocoder', function ($q) {
	return {
		getGeocode: function(address) {
			var deferred = $q.defer();
			var coords = '';

			var geocoder = new google.maps.Geocoder();
			geocoder.geocode({ address : address}, function (result, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					coords = {
						lat: result[0].geometry.location.lat(),
						lng: result[0].geometry.location.lng()
					};
					deferred.resolve(coords);
				}
				else {
					deferred.reject('Geocode was not successful for the following reason: ' + status);
				}

			});
			return deferred.promise;
		}
	}
});