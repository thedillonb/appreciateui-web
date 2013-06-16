angular.module('analytics', [])
  .run(['$window', '$rootScope', function($window, $rootScope) {
    $window._gaq = $window._gaq || [];
    _gaq.push(['_setAccount', 'UA-41138650-1']);
    _gaq.push(['_trackPageview']);

    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);


    // $rootScope.$on('$routeChangeSuccess', function(e, current, previous) {
    //   $window._gaq.push(['_trackPageview', url]);

    // };

  }]);