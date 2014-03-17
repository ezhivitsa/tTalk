app.controller('CreateTalkCtrl', ['$scope','HttpService', function ($scope, HttpService) {
	
	$scope.createTalk = function(event) {
		HttpService.createTalk($scope);
	}
}])