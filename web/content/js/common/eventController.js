app.controller('EventCtrl',['$scope', '$rootScope', '$route', '$location' ,function($scope, $rootScope, $route, $location) {
	var self = this;
	$rootScope.$on("$routeChangeError", function ( event, previous, current, resolve ) {
		self.backUrl = previous.$$route.originalPath;
		self.status = null;
		self.errorMessage = resolve.message;
        $location.path("/error");
    });
    $rootScope.$on("requestError", function ( event, resolve ) {
		self.backUrl = 'main';
		console.log(resolve);
		self.status = resolve.status;
		self.errorMessage = resolve.message;
        $location.path("/error");
    });
}]);