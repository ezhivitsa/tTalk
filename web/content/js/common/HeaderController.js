app.controller('HeadCtrl',['$scope', 'HttpService', function($scope, HttpService) {
	$scope.visHeader = false;

	$scope.$on('logged',function(){
		$scope.userNickname = localStorage.getItem("nickname");
		$scope.visHeader = true;
	});

	$scope.$on('unlogged',function(){
		localStorage.removeItem("nickname");
		$scope.visHeader = false;
	});

	$scope.logout = function(event) {
		event.preventDefault();
		HttpService.userLogout();
	};
}]);