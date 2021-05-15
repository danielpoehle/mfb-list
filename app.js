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
        mfbList.showBOB = false;
        mfbList.Trains = [];
        mfbList.ZNr = [];
        mfbList.selectZNr = [];
        mfbList.BOB = '';
        mfbList.FilteredTrains = [];
        mfbList.BOBmfb = [];
        mfbList.ArrangedTrains = [];
        mfbList.ArrangedBOB = [];

        mfbList.inputZNr = '';
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        mfbList.fromDate = new Date().toLocaleDateString('de-DE', options);
        mfbList.toDate = mfbList.fromDate;
        mfbList.showRules = false;
        mfbList.ArrangedRules = [];

        mfbList.Options = { scrollableHeight: '300px', scrollable: true, enableSearch: true, 
        checkBoxes: true, styleActive: true, template: '{{option}}', smartButtonMaxItems: 1, smartButtonTextConverter: function(itemText, originalItem) {return 'Zugnummern auswählen'} };
        mfbList.Button = {buttonDefaultText: 'Zugnummern auswählen'};


        mfbList.filterAndShowTrains = function(){
            mfbList.showTable = false;
            mfbList.showBOB = false;
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
            mfbList.showBOB = false;
            mfbList.ArrangedBOB = [];
            mfbList.FilteredTrains = mfbList.Trains.filter((t) => t.Vorgangsnummer === mfbList.BOB);
            let vt = mfbList.FilteredTrains.map((z) => z.Verkehrstag.VNumber);
            vt = vt.filter((item, index) => vt.indexOf(item)===index).sort();
            for (let k = 0; k < vt.length; k+= 1) {
                let znr = mfbList.FilteredTrains.filter((z) => z.Verkehrstag.VNumber === vt[k]).map((z) => z.Zugnummer);
                znr = znr.filter((item, index) => znr.indexOf(item)===index).sort();
                let mfbznr = [];
                let bob = mfbList.Trains.filter((t) => t.Verkehrstag.VNumber === vt[k] && znr.includes(t.Zugnummer)).map((z) => z.Vorgangsnummer);
                bob = bob.filter((item, index) => bob.indexOf(item)===index).sort();
                let boblist = [];
                for (let j = 0; j < bob.length; j+= 1) {
                    if(bob[j] !== mfbList.BOB){
                        let bobregel = mfbList.Trains.filter((t) => t.Verkehrstag.VNumber === vt[k] && znr.includes(t.Zugnummer) && t.Vorgangsnummer === bob[j]);
                        let znrbob = mfbList.Trains.filter((t) => t.Verkehrstag.VNumber === vt[k] && znr.includes(t.Zugnummer) && t.Vorgangsnummer === bob[j]).map((z) => z.Zugnummer);
                        znrbob = znrbob.filter((item, index) => znrbob.indexOf(item)===index).sort((a, b) => a - b);
                        mfbznr = mfbznr.concat(znrbob);
                        boblist.push({
                            'bobnr': bob[j],
                            'trains': znrbob.join(', '),
                            'regel': bobregel.sort((a,b) => (a.Zugnummer > b.Zugnummer) ? 1 : (a.Zugnummer === b.Zugnummer) ? ((a.Regelungsart > b.Regelungsart) ? 1 : -1) :-1 )
                        });
                    }                    
                }                
                mfbznr = mfbznr.filter((item, index) => mfbznr.indexOf(item)===index).sort((a, b) => a - b);                
                mfbList.ArrangedBOB.push({
                    'Bob': mfbList.BOB, 
                    'VT': mfbList.FilteredTrains.find((z) => z.Verkehrstag.VNumber === vt[k]).Verkehrstag,
                    'Parallel': boblist,
                    'MfbTrains': {'Anz': mfbznr.length, 'Trains': mfbznr.join(', ')},
                });
            }
            if(mfbList.ArrangedBOB.length >0){
                mfbList.showBOB = true;
            }else{
                mfbList.showBOB = false;
            } 
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

        mfbList.filterAndShowRulesForTrain = function(){
            mfbList.showRules = false;
            mfbList.ArrangedRules = [];
            const DateTime = luxon.DateTime;
            const Interval = luxon.Interval;
            const intvl = Interval.fromDateTimes(DateTime.fromFormat(mfbList.fromDate, 'dd.MM.yyyy'), 
                                                 DateTime.fromFormat(mfbList.toDate, 'dd.MM.yyyy').plus({ days: 1 }).minus({seconds: 1}));
            let days = intvl.splitBy(luxon.Duration.fromObject({days: 1})).map((i) => i.start.toFormat('dd.MM.yyyy'));
            for (let i = 0; i < days.length; i+= 1) {
                let rules = mfbList.Trains.filter((t) => t.Zugnummer === mfbList.inputZNr && t.Verkehrstag.VNumber === DateTime.fromFormat(days[i], 'dd.MM.yyyy').ts);   
                mfbList.ArrangedRules.push({
                    'date': days[i],
                    'rules': rules.sort((a,b) => (a.Regelungsart > b.Regelungsart) ? 1 : (a.Regelungsart === b.Regelungsart) ? ((a.Vorgangsnummer > b.Vorgangsnummer) ? 1 : -1) :-1 )
                });            
            }
            if(mfbList.ArrangedRules.length >0){
                mfbList.showRules = true;
            }else{
                mfbList.showRules = false;
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
                        result[i].Verkehrstag = {'VText': vt, 'VNumber': luxon.DateTime.fromFormat(vt, 'dd.MM.yyyy').ts};                                               
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