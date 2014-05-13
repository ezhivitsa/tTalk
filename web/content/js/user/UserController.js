app.controller('UserProfileCtrl', ['$scope', '$resource', '$q', '$location', '$rootScope', function ( $scope, $resource, $q, $location, $rootScope ){

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
		var defer = $q.defer();
		userDataService.save({},$scope.userData,
			function ( response ) {
				defer.resolve();
				$location.path("/main");
			},
			function ( response ) {
				app.resourceAuthorizedErr($location,$rootScope,response,defer);
			});
		return defer.promise;
	}
	
}]);

app.controller('UserInfoCtrl', ['$scope', '$resource', '$routeParams', '$q', '$location', '$rootScope', function ( $scope, $resource, $routeParams, $q, $location, $rootScope ){

	var userDataService = $resource('../api/user');

	var defer = $q.defer();
	$scope.userData = userDataService.get({ nickname: $routeParams.nickname },
		function ( response ) {
			defer.resolve();
		},
		function ( response ) {
			app.resourceAuthorizedErr($location,$rootScope,response,defer);
		});

	return defer.promise;
}]);