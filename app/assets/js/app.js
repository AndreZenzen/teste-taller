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

