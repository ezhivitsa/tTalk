app.controller('HeadCtrl',['$scope', '$resource', '$rootScope', '$q', '$location', function( $scope, $resource, $rootScope, $q, $location ) {
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
		var defer = $q.defer();

		logoutService.get({},function(response, getReponseHeaders) {
				$rootScope.$broadcast('unlogged');
				defer.resolve();				
				$location.path("/");
			},function(response, getReponseHeaders) {
				if (response.status == "403") {
					$rootScope.$broadcast('unlogged');
					defer.resolve();
					$location.path("/");
				} else {
					defer.reject({
						message : data.message,
						status: status
					});	
				}
			});

		return defer.promise;
	};
}]);