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
    .state('registro', {
        url: '/registro',
        templateUrl:'templates/registro.html',
        controller:'ProjectRegisterController as projectRegister',
    })
    .state('home.myRegister', {
        url: '/newregister',
        templateUrl:'templates/my_register.html',
        controller:'ProjectMyRegisterController as projectMyRegister',
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
  }
})

// Cadastro Controller
.controller("ProjectRegisterController", function($scope, usuariosService, $location) {
    $scope.user = {
        email:"",
        password:"",
        confirmPassword:""
    }

    $scope.submit = function(){
        if($scope.registerForm.$valid){
            usuariosService.createUser($scope.user)
            .then(function(firebaseUser){
                $location.path('/login');
            })
            .catch(function(error) {
                console.log("Create User failed:", error);
                $scope.submitError = true;
            });
        }else{
            angular.forEach($scope.user,function(value,key) {
                if(value && value.length == 0){
                    $scope.registerForm[key].$dirty = true;
                    $scope.registerForm[key].$error.required = true;
                }
            }, this);
        }
  }

})

// Meus Dados Controller
.controller("ProjectMyRegisterController", function($rootScope, $scope, usuariosService, $location) {
    $scope.formSuccess = false;
    $scope.user = {
        email:$rootScope.usuarioLogado.email,
        password:"",
        confirmPassword:""
    }

    $scope.submit = function(){
        if($scope.registerForm.$valid){
            if($scope.user.email != $rootScope.usuarioLogado.email){
                usuariosService.updateEmail($scope.user.email)
                .then(function() {
                    $scope.formSuccess = true;
                }, function(error) {
                    $scope.registerForm.email.$invalid = true;
                    if(error.code == "auth/email-already-in-use"){
                        $scope.registerForm.email.$error.exist = true;
                    }else{  
                        $scope.registerForm.email.$error.others = true;
                    }
                    console.log(error);
                });
            }
            if($scope.user.password.length > 0){
                usuariosService.updatePassword($scope.user.password)
                .then(function() {
                    $scope.formSuccess = true;
                }, function(error) {
                    $scope.registerForm.password.$invalid = true;
                    console.log(error);
                });
            }
         }else{
            angular.forEach($scope.user,function(value,key) {
                if(value && value.length == 0){
                    $scope.registerForm[key].$dirty = true;
                    $scope.registerForm[key].$error.required = true;
                }
            }, this);
         }
    }
})

// Diretiva para verificar confirmação de senha
.directive('passwordVerify',
function passwordVerify() {
    return {
      restrict: 'A', 
      require: '?ngModel',
      link: function(scope, elem, attrs, ngModel) {
        if (!ngModel) return;

        scope.$watch(attrs.ngModel, function() {
          validate();
        });

        attrs.$observe('passwordVerify', function(val) {
          validate();
        });

        var validate = function() {
          var val1 = ngModel.$viewValue;
          var val2 = attrs.passwordVerify;

          ngModel.$setValidity('passwordVerify', val1 === val2);
        };
      }
    }
  })

// Service para lib firebase de autenticação
.service('usuariosService', function ($rootScope, $location, $firebaseAuth) {
    /**
     * login user.
     */
    this.validaLogin = function(user){
        return $firebaseAuth().$signInWithEmailAndPassword(user.email, user.password);
    }

    /**
     * create user.
     */
    this.createUser = function(user){
        return $firebaseAuth().$createUserWithEmailAndPassword(user.email, user.password);
    }

    /**
     * logout user.
     */
    this.logout = function(){
        $firebaseAuth().$signOut()
        $rootScope.usuarioLogado = null;
        $location.path('/login');
    }

    /**
     * Update password user.
     */
    this.updatePassword = function(password){
        return $firebaseAuth().$updatePassword(password);
    }

    /**
     * Update email user.
     */
    this.updateEmail = function(email){
        return $firebaseAuth().$updateEmail(email);
    }

})

// Verify user is logged
.run(function ($rootScope, $location) {
    $rootScope.$on('$locationChangeStart', function () { 
        if($rootScope.usuarioLogado == null && !/registro/.test($location.path()) ){
            $location.path('/login');
        }
    });
})

