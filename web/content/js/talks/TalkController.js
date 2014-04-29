app.controller('TalkCtrl', ['$scope', '$resource', '$routeParams', '$q', function ( $scope, $resource, $routeParams, $q ) {
	
	var apiService = $resource('../api/:action',{
				action: '@action'
			}),
		pageCount = { val: 1 };


	function getTalk() {
		var defer = $q.defer();
		$scope.talk = apiService.get({ action: 'talk', id: $routeParams.id },
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
		var comments = apiService.get({ action: 'comments', id: $routeParams.id, page: page.val, page_size: size },
			function ( response ) {
				console.log(comments)
				if (page.val != 1) {
					$scope.comments = $scope.comments.concat(comments.comments);
					$scope.isCommentsEnd = comments.isEnd;
				} else {
					$scope.comments = comments.comments;
					$scope.isCommentsEnd = comments.isEnd;
				}
				page.val++;
			},
			function ( response ) {
			});
	}

	getTalk();
	getComments(pageCount,10);

	$scope.subscribe = function ( event ) {
		event.preventDefault();
		var defer = $q.defer();
		if (!$scope.talk.isCanSubscribe) {
			return;
		}
		var participants = apiService.save({ action: 'subscribe' },{ id: $routeParams.id },function(response) {
				defer.resolve();
				$scope.talk.isCanSubscribe = false;
				$scope.talk.participants = participants;
				console.log(participants);
			},function(response) {
				defer.reject({
					message: response.data.message,
					status: response.status
				});
			});
		return defer.promise;
	};

	$scope.eval = function ( event, mark ) {
		event.preventDefault();
		var defer = $q.defer();
		if (!$scope.talk.isCanEvaluate) {
			return;
		}
		var rating = apiService.save({ action: 'evaluatetalk' },{ id: $routeParams.id, mark: mark },function(response) {
				defer.resolve();
				$scope.talk.isCanEvaluate = false;
				$scope.talk.rating = rating.rating;
				console.log(rating);
			},function(response) {
				defer.reject({
					message: response.data.message,
					status: response.status
				});
			});
		return defer.promise;
	}

	$scope.moreComments = function ( event ) {
		event.preventDefault();
		if($scope.comments.isEnd) {
			return;
		}
		getComments(pageCount,10);
	}

	$scope.createComment = function ( event ) {
		event.preventDefault();
		var defer = $q.defer();
		apiService.save({ action: 'comment' },{ id: $routeParams.id, text: $scope.talk.newComment },function(response) {
				defer.resolve();
				$scope.talk.newComment = '';
				pageCount.val = 1;
				getComments(pageCount,10);
			},function(response) {
				defer.reject({
					message: response.data.message,
					status: response.status
				});
			});
		return defer.promise;
	}

}]);

app.directive('comment', [ '$resource', '$q', function( $resource, $q ){
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
							'<a href="#like" class="evalButton like" ng-click="cEval($event,1)">+</a>' +
							'<a href="#dislike" class="evalButton dislike" ng-click="cEval($event,-1)">-</a>' +
						'</span>' +
					'</div>' +
				'</div>',
		replace: true,
		link: function( $scope, iElm, iAttrs, controller ) {
			var evalTalkService = $resource('/api/evaluatecomment');
			$scope.cEval = function ( event, mark ) {
				event.preventDefault();
				var defer = $q.defer();
				if (!$scope.data.isCanEvaluate) {
					return;
				}
				var rating = evalTalkService .save({},{ id: $scope.data._id, mark: mark },function(response) {
						defer.resolve();
						$scope.data.isCanEvaluate = false;
						$scope.data.rating = rating.rating;
					},function(response) {
						defer.reject({
							message: response.data.message,
							status: response.status
						});
					});
				return defer.promise;
			}
		}
	};
}]);