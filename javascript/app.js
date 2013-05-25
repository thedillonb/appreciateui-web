var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
var screenshotUrl = '/api/screenshots.php';
var categoriesUrl = '/api/categories.php';

/*
    Setup angular!
*/
var app = angular.module('app', []).
    config(function($routeProvider) {
        $routeProvider.
              when('/', {controller:RecentCtrl, templateUrl:'list.html'}).
              when('/category/:id', {controller:CategoryCtrl, templateUrl:'list.html'}).
              otherwise({redirectTo:'/'});
    }).
    /*
        Categories object which represents the data for all the categories
        possible. This object will request the category information from the
        server and cache it. All subsequent requests will use the cached data.
    */
    factory('Categories', function($http) {
        var Categories = {};
        var cache = undefined;
        
        //Get all the categories
        Categories.getAll = function(cb) {
            //Check if there is a cache
            if (cache !== undefined) {
                return cb(cache);
            }
            
            //No cache exists, get it from the server
            $http.get(categoriesUrl).success(function(data) {
                cache = data;
                cb(data);
            });
        };
        
        return Categories;
    });
  
/*
    Controller for the recent view
*/
function RecentCtrl($scope, $rootScope, $http) {
    $rootScope.selectedCategoryId = -1;
    $http.get(screenshotUrl + '?recent=true').success(function(data) {
        $scope.screenshots = massageScreenshotData(data);
        updateScreenshotScroll();
    });
    
    $scope.$watch('screenshots', function() { $scope.$evalAsync(unveil); });
}

/*
    Controller for the category view
*/
function CategoryCtrl($scope, $rootScope, $http, $routeParams) {
    var catId = $routeParams.id;
    $rootScope.selectedCategoryId = catId;
    $http.get(screenshotUrl + '?cat=' + catId).success(function(data) {
        $scope.screenshots = massageScreenshotData(data); 
        updateScreenshotScroll();
    });
    
    $scope.$watch('screenshots', function() { $scope.$evalAsync(unveil); });
}

/*
    Controls the category menu found at the left of the page
*/
function CategoryMenuCtrl($scope, Categories) {
    Categories.getAll(function(data) {
        $scope.categories = data;
        if (!isMobile) { $('#sidebar .inner-sidebar').slimScroll({height: 'auto'}); }
    });
}

/*
    Controls the title found at the top of the page
*/
function TitleCtrl($scope, $rootScope, Categories) {
    $rootScope.$watch('selectedCategoryId', function() {
        if ($rootScope.selectedCategoryId === -1) {
            return $scope.title = "Recent";
        }
        Categories.getAll(function(data) {
            angular.forEach(data, function(d) {
                if (d.id == $rootScope.selectedCategoryId) {
                    $scope.title = d.name;
                }
            })
        });
    })
}

/*
    Updates the screenshot div 'slimScroll' plugin
*/
function updateScreenshotScroll() {
    if (!isMobile) {  
        $('#screenshots').slimScroll({height: 'auto'}); 
    }
}

/*
    Massage the screenshot data on it's way back
*/
function massageScreenshotData(data) {
    return angular.forEach(data, function(d) { 
        d.thumbUrl = "http://www.dillonbuchanan.com/appreciateui/downloader.php?id=" + d.url + "&w=296&h=444&ext=" + d.ext;
        d.fullUrl = "http://www.dillonbuchanan.com/appreciateui/uploads/" + d.url + "." + d.ext; 
    });
}

/*
    Set the unveil hooks into the images so they don't all load at once
*/
function unveil() {
    var $screenshots = $('#screenshots');
    var $unveilParent = isMobile ? $screenshots.parent() : $screenshots; 
    $('img.lazy-load').unveil({view: $unveilParent});
}

/*
    This code creates the slide out navigation bar
*/
$(function() {
    var oldWrapperX;
    $('#collapse').click(function() {
        var $wrapper = $('#wrapper');
        if ($wrapper.hasClass('active')) {
            oldWrapperX = $wrapper.position().left;
            $wrapper.animate({left: '0px'}, 0).removeClass('active');
        } else {
            $wrapper.animate({left: oldWrapperX + 'px'}, 0).addClass('active');
        }
    });
});

/*
    Resize event to make sure everything appears correctly
*/
$(window).resize(function() {
    //Dont apply the custom scrollbar to non-mobile devices
    if (!isMobile) {
        $('#sidebar .inner-sidebar').slimScroll({height: 'auto'});
        $('#screenshots').slimScroll({height: 'auto'});
    }
    
    //Always try to refresh the unveil plugin so that pictures show up
    unveil();
});