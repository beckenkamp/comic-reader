var myApp = angular.module('myApp', []);

myApp.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

myApp.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, comic_id, chapter_id, uploadUrl){
        var fd = new FormData();
        fd.append('file', file);
        fd.append('chapter_id', chapter_id);
        fd.append('comic_id', comic_id);
        var promise = $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(data){
            console.log(data);
            $http.post('/api/page', {
                chapter_id: chapter_id,
                file: data
            })
            return data;
        })
        .error(function(){
        });

        return promise;
    }
}]);

myApp.controller('uploadCtrl', ['$scope', '$http', 'fileUpload', function($scope, $http, fileUpload){
    
    $scope.comics = [];
    $scope.chapters = [];

    $http.get('/api/comic').success(function(response){
        $scope.comics = response.objects;
        //$scope.comic_id = response.objects[0].id;
    });

    $scope.getChapters = function(comic_id) {
        $scope.comic_id = comic_id;
        if (comic_id !== null) {
            $http.get('/api/comic/' + $scope.comic_id).success(function(response){
                $scope.chapters = response.chapters;
                $scope.chapter_id = response.chapters[0].id;
            });
        } else {
            $scope.chapters = [];
        }
    }

    $scope.uploadFile = function(){
        var file = $scope.file;
        var comic_id = $scope.comic_id;
        var chapter_id = $scope.chapter_id;
        var msg = $scope.msg;
        //console.log('file is ' + JSON.stringify(file));
        var uploadUrl = "/upload";
        
        if (comic_id === undefined || chapter_id === undefined || file === undefined) {
            $scope.msg = 'Please, no field must be empty!';
        } else {
            fileUpload.uploadFileToUrl(file, comic_id, chapter_id, uploadUrl).then(function(response){
                $scope.msg = response.data;
            });
        }
    };
    
}]);
