app.controller('EventCtrl',['$scope', '$rootScope', '$route', '$location' ,function($scope, $rootScope, $route, $location) {
	var self = this;
	$rootScope.$on("$routeChangeError", function(event, previous, current, resolve) {
		self.backUrl = previous.$$route.originalPath;
		self.errorMessage = resolve.message;
        $location.path("/error");
    });
}]);