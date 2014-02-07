app.controller('EventCtrl',function($scope, $rootScope, $route, $location) {
	var self = this;
	$rootScope.$on("$routeChangeError", function(event, previous, current, resolve) {
		self.backUrl = previous.$$route.originalPath;
		self.errorMessage = resolve;
        $location.path("/error");
    });
});