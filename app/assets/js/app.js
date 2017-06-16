'use strict';

var config = {
    apiKey: "AIzaSyC4WPJDNxqK9xgWmsR-RFiC9YDlKZmkunM",
    authDomain: "taller-9a149.firebaseapp.com",
    databaseURL: "https://taller-9a149.firebaseio.com",
    projectId: "taller-9a149",
    storageBucket: "taller-9a149.appspot.com",
    messagingSenderId: "468318737312"
};
firebase.initializeApp(config);

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'firebase',
    'ui.router',
    'ui.mask',
])

.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise('/home/');
    $stateProvider
    .state('home',{
        url: '/home',
        templateUrl:'templates/home.html',
        controller: 'ProjectHomeController as ProjectHome'
    })
    .state('login', {
        url: '/login',
        controller:'ProjectLoginController as projectLogin',
        templateUrl:'templates/login.html'
    })
})

// Home Controller
.controller("ProjectHomeController", function($scope, usuariosService, $location) {
    $scope.logout = function(){
        usuariosService.logout();
    }
})

// Login Controller
.controller("ProjectLoginController", function($rootScope, $scope, usuariosService, $location, $state) {
  $scope.user = {
      email:'',
      password:''
  }
  //$scope.$apply();
  $scope.submit = function(){
   
    if($scope.signinForm.$valid){
        usuariosService.validaLogin($scope.user)
        .then(function(firebaseUser){
            //login success
            $rootScope.usuarioLogado = firebaseUser;
            $location.path('/home/');
        })
        .catch(function(error) {
            //login falid
            $rootScope.usuarioLogado = error;
            $scope.loginError = true;
        });
    }else{
        angular.forEach($scope.user,function(value,key) {
            if(value && value.length == 0){
                $scope.signinForm[key].$dirty = true;
                $scope.signinForm[key].$error.required = true;
            }
        }, this);
    }
  }

  $scope.register = function(){
     $location.path('/registro');
    //$state.go('registro');
  }
})