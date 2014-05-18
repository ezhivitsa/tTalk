app.controller('TalkCtrl', ['$scope', '$resource', '$routeParams', '$location', '$rootScope', function ( $scope, $resource, $routeParams, $location, $rootScope ) {
	
	var apiService = $resource('../api/:action',{
				action: '@action'
			},{
				subscribe: {method:'POST', isArray:true }
			}),
		pageCount = { val: 1 };


	function getTalk() {
		$scope.talk = apiService.get({ action: 'talk', id: $routeParams.id },
			function ( response ) {
				$scope.talk.date = (new Date($scope.talk.date)).toLocaleString();
			},
			function ( response ) {
				app.resourceAuthorizedErr($location,$rootScope,response);
			});
	}

	function getComments( page , size ) {
		var comments = apiService.get({ action: 'comments', id: $routeParams.id, page: page.val, page_size: size },
			function ( response ) {
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
				app.resourceAuthorizedErr($location,$rootScope,response);
			});
	}

	getTalk();
	getComments(pageCount,10);

	$scope.subscribe = function ( event ) {
		event.preventDefault();
		if (!$scope.talk.isCanSubscribe) {
			return;
		}
		var participants = apiService.subscribe({ action: 'subscribe' },{ id: $routeParams.id },function(response) {
				$scope.talk.isCanSubscribe = false;
				$scope.talk.participants = participants;
			},function(response) {
				app.resourceAuthorizedErr($location,$rootScope,response);
			});
	};

	$scope.eval = function ( event, mark ) {
		event.preventDefault();
		if (!$scope.talk.isCanEvaluate) {
			return;
		}
		var rating = apiService.save({ action: 'evaluatetalk' },{ id: $routeParams.id, mark: mark },function(response) {
				$scope.talk.isCanEvaluate = false;
				$scope.talk.rating = rating.rating;
			},function(response) {
				app.resourceAuthorizedErr($location,$rootScope,response);
			});
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
		apiService.save({ action: 'comment' },{ id: $routeParams.id, text: $scope.talk.newComment },function(response) {
				$scope.talk.newComment = '';
				pageCount.val = 1;
				getComments(pageCount,10);
			},function(response) {
				app.resourceAuthorizedErr($location,$rootScope,response);
			});
	}

	$scope.delete = function ( event ) {
		event.preventDefault();
		if (!$scope.talk.isCanDelete) {
			return;
		}
		apiService.save({ action: 'deletetalk' },{ id: $routeParams.id },function(response) {
				$location.path("/main");
			},function(response) {
				app.resourceAuthorizedErr($location,$rootScope,response);
			})
	}

}]);

app.directive('comment', [ '$resource', '$location', '$rootScope', function ( $resource, $location, $rootScope ){
	return {
		scope: {
			data: '=data'
		},
		restrict: 'E',
		template: '<div class="comment">' + 
					'<a class="removeButton" ng-if="data.isCanDelete" href="#/comment/remove" ng-click="remove($event)"></a>' +
					'<a class="cAuthor" href="#/userinfo/{{data.author.nickname}}">{{data.author.nickname}}</a>' +
					'<div class="text" ng-class="{red: !data.isActual}">{{data.text || "This comment was removed"}}</div>' +
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
			var evalTalkService = $resource('/api/evaluatecomment'),
				deleteTalkService = $resource('/api/deletecomment');
			$scope.cEval = function ( event, mark ) {
				event.preventDefault();
				if (!$scope.data.isCanEvaluate) {
					return;
				}
				var rating = evalTalkService.save({},{ id: $scope.data._id, mark: mark },function(response) {
						$scope.data.isCanEvaluate = false;
						$scope.data.rating = rating.rating;
					},function(response) {
						app.resourceAuthorizedErr($location,$rootScope,response);
					});
			};

			$scope.remove = function ( event ) {
				event.preventDefault();
				if (!$scope.data.isCanDelete) {
					return;
				}
				deleteTalkService.save({},{ id: $scope.data._id },function(response) {
						$scope.data.isCanEvaluate = false;
						$scope.data.isCanDelete = false;
						$scope.data.isActual = false;
						$scope.data.text = null;
					},function(response) {
						app.resourceAuthorizedErr($location,$rootScope,response);
					});
			}
		}
	};
}]);