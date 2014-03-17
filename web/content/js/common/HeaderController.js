app.controller('HeadCtrl',['$scope', 'HttpService', function($scope, HttpService) {

	$scope.$on('logged',function(){
		if (localStorage.getItem("full")) {
			$scope.userNickname = localStorage.getItem("full");
		} else {
			$scope.userNickname = localStorage.getItem("nickname");
		}
		$scope.visHeader = true;
	});

	$scope.$on('unlogged',function(){
		localStorage.removeItem("nickname");
		localStorage.removeItem("full");
		$scope.visHeader = false;
	});

	$scope.logout = function(event) {
		event.preventDefault();
		HttpService.userLogout();
	};
}]);