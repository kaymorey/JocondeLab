var app = angular.module('JocondeLab', []);

app.controller('NoticeCtrl', function NoticeCtrl($scope, $http) {
	
	$http.get('http://localhost/JocondeLab/api/web/index.php/notices').success(function(data) {
		$scope.notices = data;
	});

});

app.controller('SearchCtrl', function SearchCtrl($scope, $http) {

	$scope.search = function() {
		$http.post('../api/web/index.php/search', {"data" : $scope.keywords})
		.success(function(data, status) {

		})
		.error(function(data,status) {

		});
	}

});