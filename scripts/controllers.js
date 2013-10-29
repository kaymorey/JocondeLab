var JocondeLab = angular.module('JocondeLab', ['ngResource']);

JocondeLab.controller('NoticeCtrl', function NoticeCtrl($scope, $resource, $http) {
	$http({method: 'GET', url: 'http://localhost/JocondeLab/api/web/index.php/notices'}).success(function(data) {
		$scope.notices = data;
	});
});