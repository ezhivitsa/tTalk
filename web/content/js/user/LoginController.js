app.controller('LoginCtrl',['$scope', '$timeout', 'HttpService' ,function($scope,$timeout,HttpService) {
	$scope.incorect = false;
	
	$scope.login = function(e) {
		HttpService.userLogin($scope,$scope.logData);
	};
	$timeout(function() {
		var inputs = document.querySelectorAll('input[ng-model]');
		for (var i = 0; i < inputs.length; i++) {
			angular.element(inputs[i]).checkAndTriggerAutoFillEvent();
		}
	}, 500);
}]);

// app.directive('autofill', ['$timeout', function($timeout) {
//     return {
//         restrict: 'A',
//         require: 'ngModel',
//         link: function( scope, elem, attrs ) {
//         	console.log(elem);
//         	// evt = document.createEvent("HTMLEvents");
// 	        // evt.initEvent('input', true, true); // event type,bubbling,cancelable
//             // $timeout(function() {
//             //     elem[0].dispatchEvent(evt);
//             // 
//         }
//     }
// }]);

