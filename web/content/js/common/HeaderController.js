app.controller('HeadCtrl',['$scope', '$resource', '$rootScope', '$location', function ( $scope, $resource, $rootScope, $location ) {
	$scope.visHeader = false;
	var logoutService = $resource('../api/logout');

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

		logoutService.get({},function ( response ) {
				$rootScope.$broadcast('unlogged');			
				$location.path("/");
			},function ( response ) {
				if (response.status == "403") {
					$rootScope.$broadcast('unlogged');
					$location.path("/");
				} else {
					$rootScope.$broadcast('requestError',{
						message: response.data.message,
						status: response.status
					});
				}
			});

	};
}]);