app.controller('MainCtrl',['$scope', '$rootScope' ,function( $scope ) {
	$scope.status = localStorage.getItem('isPositiveRating');
}]);

app.directive('talk', ["HttpService", function ( HttpService ) {
	return {
		scope: {
			data: '=data'
		},
		restrict: 'E',
		template: '<a href="#/talk/{{data.id}}" ng-click="loadTalk($event)" class="talkPrev"><span class="title">{{data.title}}</span></a>',
		replace: true,
		link: function ( $scope ) {
			$scope.loadTalk = function( event ) {
				event.preventDefault();
				console.log($scope.data);
			};
		}
	};
}])