(function () {
    'use strict'; 

    angular.module('MFB', ['angularjs-dropdown-multiselect'])
    .controller('MfbController', MfbController)
    .service('MfbService', MfbService);
    
    MfbController.$inject = ['MfbService'];
    function MfbController(MfbService) {
        let mfbList = this;
        
        mfbList.Filename = 'bla';
        mfbList.loadComplete = false;
        mfbList.selTrain = false;
        mfbList.showTable = false;
        mfbList.Trains = [];
        mfbList.ZNr = [];
        mfbList.selectZNr = [];
        mfbList.BOB = '';
        mfbList.FilteredTrains = [];
        mfbList.BOBmfb = [];
        mfbList.ArrangedTrains = [];

        mfbList.Options = { scrollableHeight: '300px', scrollable: true, enableSearch: true, 
        checkBoxes: true, styleActive: true, template: '{{option}}', smartButtonMaxItems: 1, smartButtonTextConverter: function(itemText, originalItem) {return 'Zugnummern auswählen'} };
        mfbList.Button = {buttonDefaultText: 'Zugnummern auswählen'};


        mfbList.filterAndShowTrains = function(){
            mfbList.showTable = false;
            mfbList.selTrain = false;
            mfbList.selectZNr = [];
            mfbList.FilteredTrains = mfbList.Trains.filter((t) => t.Vorgangsnummer === mfbList.BOB);
            let tNr = mfbList.FilteredTrains.map((t) => t.Zugnummer);
            mfbList.ZNr = tNr.filter((item, index) => tNr.indexOf(item)===index).sort();
            if(mfbList.ZNr.length >0){
                mfbList.selTrain = true;
            }else{
                mfbList.selTrain = false;
            }        
        };

        mfbList.filterAndShowBOB = function(){
            mfbList.showTable = false;
            mfbList.selTrain = false;
            mfbList.selectZNr = [];
            mfbList.FilteredTrains = mfbList.Trains.filter((t) => t.Vorgangsnummer === mfbList.BOB);
            console.log(mfbList.FilteredTrains[0]);
        };

        mfbList.filterAndShowRules = function(){   
            mfbList.showTable = false;         
            mfbList.ArrangedTrains = [];
            for (let i = 0; i < mfbList.selectZNr.length; i+= 1) {                
                let vt = mfbList.FilteredTrains.filter((t) => t.Zugnummer === mfbList.selectZNr[i]).map((z) => z.Verkehrstag.VNumber);
                vt = vt.filter((item, index) => vt.indexOf(item)===index).sort();
                let d = [];
                for (let j = 0; j < vt.length; j+= 1) {                    
                    d.push({ 
                        'day': mfbList.Trains.find((z) => z.Verkehrstag.VNumber === vt[j]).Verkehrstag,
                        'trains': mfbList.Trains.filter((z) => z.Zugnummer === mfbList.selectZNr[i] && z.Verkehrstag.VNumber === vt[j]).sort((a,b) => (a.Regelungsart > b.Regelungsart) ? 1 : -1)
                    });
                }
                mfbList.ArrangedTrains.push({
                    'znr': mfbList.selectZNr[i],
                    'zg': d[0].trains[0].Zuggattung,
                    'kd': d[0].trains[0].Kundennummer,
                    'von': d[0].trains[0].Abgangsbahnhof,
                    'bis': d[0].trains[0].Zielbahnhof,
                    'vt': d
                });                                               
            }
            if(mfbList.ArrangedTrains.length >0){
                mfbList.showTable = true;
            }else{
                mfbList.showTable = false;
            } 

        };

        $(document).ready(function () {
            $('#list').bind('change', handleDialog);
        });

        function handleDialog(event) {
            const { files } = event.target;
            const file = files[0];
            
            const reader = new FileReader();
            reader.readAsText(file, 'ISO-8859-1');
            reader.onload = function (event) {                
                csv({
                    output: "json",
                    delimiter: ";"
                })
                .fromString(event.target.result)
                .then(function(result){
                    for (let i = 0; i < result.length; i+= 1) {
                        const vt = result[i].Verkehrstag; 
                        result[i].Verkehrstag = {VText: vt, VNumber: luxon.DateTime.fromFormat(vt, 'dd.MM.yyyy').ts};                                               
                    }
                    mfbList.Trains = result;
                    mfbList.loadComplete = true;
                    console.log(mfbList.Trains.length);
                    console.log(mfbList.Trains[0]);
                })                
                
            };
        };
    };

    function MfbService(){
        let service = this;
    };

})();