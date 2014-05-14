app.controller('UserProfileCtrl', ['$scope', '$resource', '$location', '$rootScope', function ( $scope, $resource, $location, $rootScope ){

	var userDataService = $resource('../api/myaccount');
	$scope.myPermisson = false;

	$scope.userData = userDataService.get();

	$scope.passwordChange = function() {
		if (!$scope.rPassword) {
			return;
		} else if ($scope.rPassword != $scope.userData.password) {
			if (!$scope.userData.password) {
				$scope.rPassword = "";
				$scope.passwordError = '';
				$scope.rPasswordError = '';
				$scope.myPermisson = false;
			} else {
				$scope.passwordError = 'Please enter the same value again.';
				$scope.myPermisson = true;
			}
		} else {
			$scope.passwordError = '';
			$scope.rPasswordError = '';
			$scope.myPermisson = false;
		}
	}

	$scope.rPasswordChange = function() {
		if (!$scope.userData.password) {
			return;
		} else if ($scope.rPassword != $scope.userData.password) {
			$scope.rPasswordError = 'Please enter the same value again.';
			$scope.myPermisson = true;
		} else {
			$scope.passwordError = '';
			$scope.rPasswordError = '';
			$scope.myPermisson = false;
		}
	}

	$scope.updateProfile = function ( event ) {
		event.preventDefault();
		userDataService.save({},$scope.userData,
			function ( response ) {
				$location.path("/main");
			},
			function ( response ) {
				app.resourceAuthorizedErr($location,$rootScope,response);
			});
	}
	
}]);

app.controller('UserInfoCtrl', ['$scope', '$resource', '$routeParams', '$location', '$rootScope', function ( $scope, $resource, $routeParams, $location, $rootScope ){

	var userDataService = $resource('../api/user');

	$scope.userData = userDataService.get({ nickname: $routeParams.nickname },
		function ( response ) {
		},
		function ( response ) {
			app.resourceAuthorizedErr($location,$rootScope,response);
		});

}]);