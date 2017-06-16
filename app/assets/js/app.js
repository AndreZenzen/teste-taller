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
    .state('home.newCompany', {
        url: '/newcompany',
        templateUrl:'templates/company.html',
        controller:'ProjectCompanyController as projectCompany'
    })
    .state('home.ticket', {
        url: '/newticket',
        templateUrl:'templates/ticket.html',
        controller: 'ProjectTicketController as projectTicket'
    })
    .state('home.viewTickets',{
        url: '/viewtickets',
        templateUrl:'templates/view_tickets.html',
        controller: 'ProjectViewTicketController as ProjectViewTicket',
        params: {
            companies: null,
            tickets: null,
            key: null
        }
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

// Cadastro empresa Controller
.controller("ProjectCompanyController", function($scope, $location, $firebaseObject) {
    $scope.companies = {};
    $scope.cnpjExist = false;
    $scope.valida = true;
    $scope.cp = {
        name:"",
        cnpj:""
    }

    firebase.database().ref('/company').once('value').then(function(snapshot) {
        $scope.companies = snapshot.val();
    });

    $scope.submit = function(){
        if($scope.companyForm.$valid){
            $scope.cnpjExist = false;
            angular.forEach($scope.companies, function(value,key) {
                if(value.cnpj == $scope.cp.cnpj ){
                    $scope.cnpjExist = true;
                }
            }, this);

            if(!$scope.cnpjExist){
                var newPostKey = firebase.database().ref().child('company').push().key;
                var updates = {};
                updates['/company/' + newPostKey] = $scope.cp;
                $scope.formSuccess = firebase.database().ref().update(updates);
            }
        }else{
            angular.forEach($scope.cp,function(value,key) {
                if(value && value.length == 0){
                    $scope.companyForm[key].$dirty = true;
                    $scope.companyForm[key].$error.required = true;
                }
            }, this);
        }
    }

    $scope.validaCNPJ = function(){
        $scope.valida = validaCNPJ($scope.cp.cnpj);
        $scope.companyForm.cnpj.$invalid = !$scope.valida;
        $scope.companyForm.cnpj.$error.validateCnpj = !$scope.valida;
        if(!$scope.cp.name && $scope.cp.name.length == 0){
            $scope.companyForm.$valid = false;
        }
    }
    var validaCNPJ = function (str) {
            if (str == null)
              return false;

            str = str.replace(/\./g, '');
            str = str.replace('/', '');
            str = str.replace('-', '');

            var cnpj = str;
            var tamanho;
            var numeros;
            var digitos;
            var soma;
            var pos;
            var resultado;
            var i;

            if (cnpj == '')
              return false;

            if (cnpj.length != 14)
              return false;

            // Regex to validate strings with 14 same characters
            var regex = /([0]{14}|[1]{14}|[2]{14}|[3]{14}|[4]{14}|[5]{14}|[6]{14}|[7]{14}|[8]{14}|[9]{14})/g
            // Regex builder
            var patt = new RegExp(regex);
            if (patt.test(cnpj))
              return false;

            // Valida DVs
            tamanho = cnpj.length - 2
            numeros = cnpj.substring(0, tamanho);
            digitos = cnpj.substring(tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (i = tamanho; i >= 1; i--) {
              soma += numeros.charAt(tamanho - i) * pos--;
              if (pos < 2)
                pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(0))
              return false;

            tamanho = tamanho + 1;
            numeros = cnpj.substring(0, tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (i = tamanho; i >= 1; i--) {
              soma += numeros.charAt(tamanho - i) * pos--;
              if (pos < 2)
                pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(1))
              return false;

            return true;
          }
})

// Ticket controller 
.controller("ProjectTicketController", function($rootScope, $scope, $firebaseObject, $location) {
    $scope.companies = [];
    $scope.list = [];
    $scope.loader = true;
    $scope.ticket = {
        empresa: "",
        produto: "",
        qtd: 0
    }

    firebase.database().ref('/company').once('value').then(function(snapshot) {
        $scope.companies = snapshot.val();
        $scope.loader = false;
        $scope.$apply();
    });

    $scope.addList = function(){
        $scope.formSuccess = false;
        if(Object.keys($scope.list).indexOf($scope.ticket.empresa) == -1){
             $scope.list[$scope.ticket.empresa] = [];
        }
        $scope.list[$scope.ticket.empresa].push({
            produto: $scope.ticket.produto,
            qtd: $scope.ticket.qtd
        });
    }

    $scope.empresaChange = function(){
        //if($scope.list.length > 0 && $scope.ticket.empresa != Object.keys($scope.list)[0] ){
            //confirm("Deseja realmente trocar a empresa? Se confirmar irá remover os itens de sua lista.");
        //}
    }

    $scope.removeItemList = function(index){
       $scope.list[$scope.ticket.empresa].splice(index, 1);
    }

    $scope.validaAddList = function(){
        var teste = true;
        if( $scope.ticket.empresa.length > 0 && $scope.ticket.produto.length > 0 && $scope.ticket.qtd > 0){
            teste = false;
        }
        return teste;
    }

    $scope.submitList = function(){
        var lista = {
            empresa:$scope.ticket.empresa,
            created_at:new Date(),
            itens:angular.copy($scope.list[$scope.ticket.empresa])
        }
        var updates = {};
        var newPostKey = firebase.database().ref().child('ticket/').push().key;
        
        updates['/ticket/' + $rootScope.usuarioLogado.uid + '/' + newPostKey] = lista;
        $scope.formSuccess = firebase.database().ref().update(updates);
        if($scope.formSuccess){
            $scope.list[$scope.ticket.empresa] = [];
        }
    }

    $scope.buttonDisablePedido = function(){
        return Object.keys($scope.list).length > 0 && $scope.list[$scope.ticket.empresa].length > 0;
    }
})

// View Ticket controller
.controller("ProjectViewTicketController", function($rootScope, $scope, $state, $stateParams, $firebaseObject) {
    
    if(!$stateParams.companies || !$stateParams.tickets || !$stateParams.key ){
        $state.go("home.dashboard");
    }

    $scope.form = {
        cnpj:$stateParams.key?$stateParams.companies[$stateParams.key].cnpj:"",
        pedido:""
    }
    $scope.list = [];
    $scope.empresa = $stateParams.companies[$stateParams.key].name;

    $scope.$watch("form.cnpj", function(newVal, oldVal) {
      if (newVal !== oldVal) {
          $scope.empresa = "";
          angular.forEach($stateParams.companies, function(element, key){
                if(element.cnpj == newVal){
                    $scope.empresa = element.name;
                }
          });
      }
    });

    $scope.$watch("form.pedido", function(newVal, oldVal) {
      if (newVal !== oldVal) {
          $scope.empresa = "";
          angular.forEach($stateParams.companies, function(element, key){
                if(element.key == newVal){
                    $scope.empresa = element.name;
                }
          });
      }
    });

    angular.forEach($stateParams.tickets,function(value, key){
        var pedido = {
            key:key,
            empresa:{
                name:$stateParams.companies[value.empresa].name,
                cnpj:$stateParams.companies[value.empresa].cnpj
            },
            produtos:value.itens
        }
        $scope.list.push(pedido);
    });


    $scope.cancelPedido = function(index, key){
       firebase.database().ref('/ticket/' + $rootScope.usuarioLogado.uid + '/' + key +'/').remove()
        .then(function() {
            $scope.list.splice(index,1);
        }, function(error) {
            console.log(error);
        });
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

