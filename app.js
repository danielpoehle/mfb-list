(function () {
    'use strict'; 

    angular.module('MFB', [])
    .controller('MfbController', MfbController)
    .service('MfbService', MfbService);
    
    MfbController.$inject = ['MfbService'];
    function MfbController(MfbService) {
        let mfbList = this;
        
        mfbList.Filename = 'bla';
    };

    function MfbService(){
        let service = this;
    };

})();