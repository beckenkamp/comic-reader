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


myApp.controller('mainCtrl', ['$scope', function($scope) {
    $scope.newauthor = false;
    $scope.newcomic = false;
    $scope.newchapter = false;
    $scope.newpage = false;
    $scope.home = true;

    $scope.show = function(type) {
        switch (type) {
            case 'home':
                $scope.home = true;
                $scope.newauthor = false;
                $scope.newcomic = false;
                $scope.newchapter = false;
                $scope.newpage = false;
                break;
            case 'author':
                $scope.home = false;
                $scope.newauthor = true;
                $scope.newcomic = false;
                $scope.newchapter = false;
                $scope.newpage = false;
                break;
            case 'comic':
                $scope.home = false;
                $scope.newauthor = false;
                $scope.newcomic = true;
                $scope.newchapter = false;
                $scope.newpage = false;
                break;
            case 'chapter':
                $scope.home = false;
                $scope.newauthor = false;
                $scope.newcomic = false;
                $scope.newchapter = true;
                $scope.newpage = false;
                break;
            case 'page':
                $scope.home = false;
                $scope.newauthor = false;
                $scope.newcomic = false;
                $scope.newchapter = false;
                $scope.newpage = true;
                break;
        }
    }
}]);


myApp.controller('comicCtrl', ['$scope', '$http', 'fileUpload', function($scope, $http, fileUpload){

    $scope.authors = [];
    $scope.comics = [];
    $scope.chapters = [];

    $http.get('/api/author').success(function(response) {
        $scope.authors = response.objects;
    });

    $http.get('/api/comic').success(function(response) {
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

    $scope.addComic = function() {
        var title = $scope.comic_title;
        var author_id = $scope.author_id;

        $http.post('/api/comic', { 'title' : title, 'author_id' : author_id }).success(function(data){
            $scope.msg = data;
        });
    }

    $scope.addChapter = function() {
        var title = $scope.chapter_title;
        var comic_id = $scope.comic_id;

        $http.post('/api/chapter', { 'title' : title, 'comic_id' : comic_id }).success(function(data){
            $scope.msg = data;
        });
    }

    $scope.addAuthor = function() {
        $http.post('/api/author', { 'name' : $scope.author_name }).success(function(data){
            $scope.msg = data;
            $scope.author_id = data.id;
        });
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
