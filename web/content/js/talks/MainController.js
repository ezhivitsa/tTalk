app.controller('MainCtrl',['$scope', '$resource', '$q', '$location', function ( $scope, $resource, $q, $location ) {
	var talksService = $resource('../api/talks'),
		page = 0;
	$scope.status = localStorage.getItem('isPositiveRating');
	$scope.talks = [];

	$scope.moreTalks = function ( event ) {
		page++;
		var talksInfo = talksService.get({ page_size: 9, page: page },
		function ( response ) {
			$scope.talks = $scope.talks.concat(talksInfo.talks);
			$scope.isAll = !talksInfo.isEnd;
		},
		function ( response ) {

		});
	};
	
	$scope.moreTalks();
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