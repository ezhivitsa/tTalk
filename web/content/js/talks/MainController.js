app.controller('MainCtrl',['$scope', '$resource', '$q', '$location', function ( $scope, $resource, $q, $location ) {
	var talksService = $resource('../api/talks');
	$scope.status = localStorage.getItem('isPositiveRating');

	$scope.talks = talksService.query();
}]);

app.directive('talk', function ( ) {
	return {
		scope: {
			data: '=data'
		},
		restrict: 'E',
		template: '<a href="#/talk/{{data.id}}" class="talkPrev"><img src="{{data.image}}" title="{{data.title}}" /><span class="title">{{data.title}}</span></a>',
		replace: true
	};
});