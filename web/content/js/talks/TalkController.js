app.controller('TalkCtrl', ['$scope', '$resource', '$routeParams', '$q', function ( $scope, $resource, $routeParams, $q ) {
	
	var talkService = $resource('../api/talk'),
		commentsService = $resource('../api/comments'),
		subscribeService = $resource('/api/subscribe'),
		apiService = $resource('../api/:action',{
				action: '@action'
			}),
		pageCount = 0;


	function getTalk() {
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
		return defer.promise;
	}

	function getComments( page , size ) {
		$scope.comments = commentsService.get({ id: $routeParams.id, page: page, page_size: size },
			function ( response ) {
				console.log($scope.comments)
			},
			function ( response ) {
				defer.reject({
					message: response.data.message,
					status: response.status
				});
			});
		return ++page;
	}

	getTalk();
	pageCount = getComments(pageCount,10);

	$scope.subscribe = function ( event ) {
		event.preventDefault();
		if (!$scope.talk.isCanSubscribe) {
			return;
		}
		$scope.talk.participants = apiService.save({ action: 'subscribe' },{ id: $scope.talk._id },function(response) {
				console.log($scope.talk.participants);
			},function(response) {
				defer.reject({
					message: response.data.message,
					status: response.status
				});
			});
	};

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
						'<span class="cEval" ng-if="data.isCanEvaluate">' +
							'<a href="../talk/like" class="evalButton like" ng-cick="cLike($event)">+</a>' +
							'<a href="../talk/dislike" class="evalButton dislike" ng-cick="cDislike($event)">-</a>' +
						'</span>' +
					'</div>' +
				'</div>',
		replace: true
	};
}]);