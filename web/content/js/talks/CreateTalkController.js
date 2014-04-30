app.controller('CreateTalkCtrl', ['$scope', '$fileUploader', '$location', function ( $scope, $fileUploader, $location ) {
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