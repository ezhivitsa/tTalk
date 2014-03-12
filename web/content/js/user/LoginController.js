app.controller('LoginCtrl',['$scope', '$timeout', 'HttpService' ,function($scope, $timeout, HttpService) {
	$scope.incorect = false;
	
	$scope.login = function(event) {
		HttpService.userLogin($scope,$scope.logData);
	};
	$timeout(function() {
		var inputs = document.querySelectorAll('input[ng-model]');
		for (var i = 0; i < inputs.length; i++) {
			angular.element(inputs[i]).checkAndTriggerAutoFillEvent();
		}
	}, 500);
}]);