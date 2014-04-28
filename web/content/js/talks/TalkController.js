app.controller('TalkCtrl', ['$scope', '$resource', '$routeParams', '$q', function ( $scope, $resource, $routeParams, $q ) {
	
	var talkService = $resource('../api/talk'),
		commentsService = $resource('../api/comments'),
		pageCount = 0;

	var defer = $q.defer();
	$scope.talk = talkService.get({ id: $routeParams.id },
		function ( response ) {
			defer.resolve();
			$scope.talk.date = (new Date($scope.talk.date)).toLocaleString();
			console.log($scope.talk);
		},
		function ( response ) {
			defer.reject({
				message: response.data.message,
				status: response.status
			});
		});

	$scope.comments = commentsService.get({ id: $routeParams.id, page: pageCount, page_size: 10 },
		function ( response ) {
			console.log($scope.comments)
		},
		function ( response ) {
			defer.reject({
				message: response.data.message,
				status: response.status
			});
		});

	return defer.promise;

}]);
app.directive('comment', [function(){
	return {
		scope: {
			data: '=data'
		},
		restrict: 'E',
		template: '<div class="comment">' + 
					'<a class="cAuthor" href="#/userinfo/{{data.author.nickname}}">{{data.author.nickname}}</a>' +
					'<div class="text">{{data.text}}</div>' +
					'<div class="bottom">' +
						'<span class="rating">{{data.rating}}</span>' +
						'<span class="cEval" ng-show="data.isCanEvaluate">' +
							'<a href="../talk/like" class="evalButton like" ng-cick="cLike($event)">+</a>' +
							'<a href="../talk/dislike" class="evalButton dislike" ng-cick="cDislike($event)">-</a>' +
						'</span>' +
					'</div>' +
				'</div>',
		replace: true
	};
}]);