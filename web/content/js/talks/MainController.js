app.controller('MainCtrl',['$scope', '$rootScope' ,function( $scope ) {
	// if (localStorage.getItem("status") && localStorage.getItem("status") >= 100) {
	// 	$scope.status = true;
	// } else {
	// 	$scope.status = false;
	// }
	$scope.status = true;
}]);

app.directive('talk', ["HttpService", function ( HttpService ) {
	return {
		scope: {
			data: '=data'
		},
		restrict: 'E',
		template: '<a href="" ng-click="loadTalk($event)" class="talkPrev" ng-mouseenter="myVis=true" ng-mouseleave="myVis=false"><span class="title" ng-show="myVis">{{data.title}}</span></a>',
		replace: true,
		link: function ( $scope ) {
			$scope.loadTalk = function( event ) {
				event.preventDefault();
				console.log($scope.data);
			};
		}
	};
}])