app.controller('UserProfileCtrl', ['$scope', '$resource', function ( $scope, $resource ){

	var userDataService = $resource('../api/myaccount');

	$scope.userData = userDataService.get({},
		function ( response ) {
			console.log($scope.userData)
		},
		function ( response ) {

		});
	
}]);

app.controller('UserInfoCtrl', ['$scope', '$resource', function ( $scope, $resource ){
	
}]);