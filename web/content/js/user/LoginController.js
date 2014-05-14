app.controller('LoginCtrl',['$scope', '$timeout', '$resource', '$rootScope', '$location', function( $scope, $timeout, $resource, $rootScope, $location ) {
	var loginService = $resource('../api/login');
	$scope.incorect = false;
	
	$scope.login = function(event) {
		loginService.save({},$scope.logData,function(response) {	
				localStorage.setItem("nickname", response.nickname);
				if (response.firstName) {
					localStorage.setItem("full", response.firstName + " " + response.lastName);
				}
				localStorage.setItem('isPositiveRating',response.isPositiveRating);
				$rootScope.$broadcast('logged');	
				$location.path("/main");
			},function(response) {
				if (response.status == "403") {
					$scope.incorect = true;
				} else {
					$rootScope.$broadcast('requestError',{
						message: response.data.message,
						status: response.status
					});
				}
			});
	};
	$timeout(function() {
		var inputs = document.querySelectorAll('input[ng-model]');
		for (var i = 0; i < inputs.length; i++) {
			angular.element(inputs[i]).checkAndTriggerAutoFillEvent();
		}
	}, 500);
}]);