app.controller('CreateTalkCtrl', ['$scope','HttpService', '$fileUploader', function ( $scope, HttpService, $fileUploader ) {
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
		console.info('success', xhr, item, response);
	});

	uploader.bind('error', function ( event, xhr, item, response ) {
		console.info('Error', xhr, item, response);
	});

	$scope.createTalk = function( event ) {
		uploader.formData.push({
			title: $scope.talk.title,
			description: $scope.talk.description,
			date: $scope.talk.date
		});
	    uploader.uploadAll();
	};
	

}])