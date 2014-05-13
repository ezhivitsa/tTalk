app.controller('CreateTalkCtrl', ['$scope', '$fileUploader', '$location', '$rootScope', function ( $scope, $fileUploader, $location, $rootScope ) {
	var uploader = $scope.uploader = $fileUploader.create({
		scope: $scope,
		url: '../api/createtalk',
		formData: [],
		filters: [
			function (item) {
				// console.info(item);
				return true;
			}
		]
	});

	uploader.bind('success',function ( event, xhr, item, response ) {
		$location.path('/talk/' + response.id);
		$scope.$apply();
	});

	uploader.bind('error', function ( event, xhr, item, response ) {
		if (response.status == "401") {
			$location.path("/");			
			$rootScope.$broadcast('unlogged');
			$scope.$apply();
		}
	});

	$scope.createTalk = function( event ) {
		uploader.getNotUploadedItems()[0].formData.push({
			title: $scope.talk.title,
			description: $scope.talk.description,
			date: $scope.talk.date
		});
	    uploader.uploadAll();
	};
	

}])