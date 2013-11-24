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
			controller: 'HomeChoiceCtrl'
		})
		.when('/partir/:city', {
			templateUrl: 'partials/museums.html',
			controller: 'MuseumsCtrl'
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
			scope.getImages();
			scope.$watch('images', function(update) {
				if(update) {
					$(element).accordion();
				}
			});
		}
	};
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
					$(element).suggest(scope.cities);
				}
			});
		}
	}
});

app.directive('googleMap', function() {
	return {
		restric: 'A',
		link: function(scope, element, attrs) {
			var mapOptions = {
				zoom: 8,
				center: new google.maps.LatLng(-34.397, 150.644)
			  };

			var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

		}
	}
});