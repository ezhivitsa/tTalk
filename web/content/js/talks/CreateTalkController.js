app.controller('CreateTalkCtrl', ['$scope','HttpService', '$fileUploader', function ( $scope, HttpService, $fileUploader ) {
	var uploader = $scope.uploader = $fileUploader.create({
		scope: $scope,
		url: '../api/upload',
		formData: [
			{ 
				title: "",
				description: "",
				date: ""
			}
		],
		filters: [
			function (item) {
				console.info('filter1');
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
		uploader.formData[0].title = $scope.talk.title;
		uploader.formData[0].description = $scope.talk.description;
		uploader.formData[0].date = $scope.talk.date;
	    uploader.uploadAll();
	};
	

}])