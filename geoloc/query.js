$(document).ready(function() {
	$.ajax({
		method : 'GET',
		url: '../app/api/web/index.php/get-museums',
		async: false
	})
	.success(function(data) {
		insertGeoloc(data);
	});
	

	var insertGeoloc = function(museums) {
		var interval = 0;
		setInterval(function geolocFunction() {
			for(i = interval; i < interval + 5; i++) {
				loca = museums[i].loca.split(";");
				var city = loca[0];
				city = city.trim();
				var museum = loca[1];
				var museum = museum.trim();

				var loca = museums[i];

				var museumCode = getGeocode(museum+' '+city+' France');
				museumCode.then(function(code) {
					console.log(loca);
					var museum = {
						'lat': code['lat'],
						'lng': code['lng']
					}

					var cityCode = getGeocode(city+' France');
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
							deferred.resolve('ok');

						});
					}, function(error) {
						if(error == "OVER_QUERY_LIMIT") {
							alert(error);
							$scope.lastMuseum = museums[i]+ ' '+i;
							$timeout.cancel(stop);
						}
					});
				}, function(error) {
					if(error == "OVER_QUERY_LIMIT") {
						alert(error);
						$scope.lastMuseum = museums[i]+ ' '+i;
						$timeout.cancel(stop);
					}
				});
			}
			return deferred.promise;
			$scope.interval += 5;
			geoloc = $timeout(geolocFunction, 20000);
		}, 20000);
	}




});