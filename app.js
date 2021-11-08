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
        mfbList.showBOBSequence = false;
        mfbList.showAssignList = false;
        mfbList.filter2Reroutes = true;
        mfbList.Trains = [];
        mfbList.ZNr = [];
        mfbList.selectZNr = [];
        mfbList.BOB = '';
        mfbList.FilteredTrains = [];
        mfbList.BOBmfb = [];
        mfbList.ArrangedTrains = [];
        mfbList.ArrangedBOB = [];
        mfbList.bobSequence = [];
        mfbList.assignList = [];
        mfbList.routes = [];
        mfbList.stationArray = [];

        mfbList.newRoute = '';
        mfbList.newDelay = '';

        mfbList.inputZNr = '';
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        mfbList.fromDate = new Date().toLocaleDateString('de-DE', options);
        mfbList.toDate = mfbList.fromDate;
        mfbList.showRules = false;
        mfbList.ArrangedRules = [];
        mfbList.bobVorplan = [];
        mfbList.bobDelay = [];
        mfbList.bobReroute = [];
        mfbList.mergedNote = '';

        mfbList.Options = { scrollableHeight: '300px', scrollable: true, enableSearch: true, 
        checkBoxes: true, styleActive: true, template: '{{option}}', smartButtonMaxItems: 1, smartButtonTextConverter: function(itemText, originalItem) {return 'Zugnummern auswählen'} };
        mfbList.Button = {buttonDefaultText: 'Zugnummern auswählen'};


        mfbList.addBobToSequence = function(){
            if(mfbList.BOB !== ''){
                mfbList.bobSequence.push(mfbList.BOB);
                mfbList.BOB = '';
            }
            if(mfbList.bobSequence.length > 0){
                mfbList.showBOBSequence = true;
            }else{
                mfbList.showBOBSequence = false;
            }        
        };

        mfbList.deleteBobFromSequence = function(index){
            mfbList.bobSequence.splice(index, 1);
            if(mfbList.bobSequence.length > 0){
                mfbList.showBOBSequence = true;
            }else{
                mfbList.showBOBSequence = false;
            }   
        };

        mfbList.countRerouting = function(list){
            return list.filter((t) => t.Regelungsart === 'Umleitung').length;
        };

        mfbList.addRouteFromIndex = function(arr, index){
            let addition = arr.slice(index).join(" - ");
            if(mfbList.newRoute === ''){
                mfbList.newRoute = addition;
            }else{
                mfbList.newRoute = mfbList.newRoute + " - " + addition;
            }            
        };

        mfbList.addRouteToIndex = function(arr, index){
            let addition = arr.slice(0,index).join(" - ");
            if(mfbList.newRoute === ''){
                mfbList.newRoute = addition;
            }else{
                mfbList.newRoute = mfbList.newRoute + " - " + addition;
            }            
        };

        mfbList.applyRerouting = function(){
            let bobIndex = mfbList.stationArray[0].bobIndex; 
            let trainIndex = mfbList.stationArray[0].trainIndex;  
            
                for (let j = 0; j < mfbList.assignList[bobIndex].trains[trainIndex].vt.length; j+=1) {
                    let reg = mfbList.assignList[bobIndex].trains[trainIndex].vt[j].trains.filter((t) => t.Regelungsart === 'Umleitung').map((t) => t.Umleitungsstrecke);
                    
                    if(reg.length === 0 || reg.length !== mfbList.routes.length){continue;}
                    
                    if(mfbList.routes.map((t) => reg.indexOf(t.Umleitungsstrecke)).every((a) => a >= 0)){
                        //console.log("remove old routes");
                        let updateReg = JSON.parse(JSON.stringify(mfbList.assignList[bobIndex].trains[trainIndex].vt[j].trains.filter((t) => t.Regelungsart === 'Umleitung')[0]));
                        mfbList.assignList[bobIndex].trains[trainIndex].vt[j].trains = mfbList.assignList[bobIndex].trains[trainIndex].vt[j].trains.filter((t) => t.Regelungsart !== 'Umleitung');
                        
                        updateReg.Umleitungsstrecke = mfbList.newRoute;
                        updateReg['Verspätung'] = mfbList.newDelay;
                        updateReg.Vorgangsnummer = mfbList.assignList[bobIndex].bobnr;
                        updateReg.Bemerkung = mfbList.mergedNote;
                        mfbList.assignList[bobIndex].trains[trainIndex].vt[j].trains.push(updateReg);
                        //console.log(mfbList.assignList[bobIndex].trains[index].vt[j]);
                        document.getElementById("nav-mfb-tab").click();
                        //document.getElementById("tbl-51827-4").scrollIntoView();
                    }
                }      
        };

        mfbList.deleteRoute = function(){
            mfbList.newRoute = '';
        };

        mfbList.ignoreRerouting = function(bobIndex, trainIndex, vtIndex){
            mfbList.assignList[bobIndex].trains[trainIndex].vt[vtIndex].ignore = true;
        };

        mfbList.quickSelectRouting = function(bobIndex, trainIndex, vtIndex, routeIndex){
            let newRoute = JSON.parse(JSON.stringify(mfbList.assignList[bobIndex].trains[trainIndex].vt[vtIndex].trains[routeIndex]));
            

            let r = mfbList.assignList[bobIndex].trains[trainIndex].vt[vtIndex].trains.filter((t) => t.Regelungsart === 'Umleitung');
            console.log(mfbList.assignList[bobIndex].trains[trainIndex].vt[vtIndex].trains);
            console.log(r);

            let note1 = r.map((t) => t.Vorgangsnummer);
            note1 = note1.filter((item, index) => note1.indexOf(item)===index).sort().join(', ');
            note1 = 'Fplo aus den Vorgängen ' + note1 + ' (Zusammenfassung Datenstand ' + mfbList.fromDate + ') ';

            newRoute.Bemerkung = note1 + newRoute.Bemerkung;

            mfbList.assignList[bobIndex].trains[trainIndex].vt[vtIndex].trains = mfbList.assignList[bobIndex].trains[trainIndex].vt[vtIndex].trains.filter((t) => t.Regelungsart !== 'Umleitung');            
            mfbList.assignList[bobIndex].trains[trainIndex].vt[vtIndex].trains.push(newRoute);

        };

        mfbList.deleteDoubleReroute = function(bobIndex, trainIndex, vtIndex){            
            mfbList.routes = mfbList.assignList[bobIndex].trains[trainIndex].vt[vtIndex].trains.filter((t) => t.Regelungsart === 'Umleitung');
            let routes = mfbList.routes.map((t) => t.Umleitungsstrecke);
            if(routes.every((r) => r === routes[0])){
                let newRoute = JSON.parse(JSON.stringify(mfbList.routes[0]));
                newRoute.Vorgangsnummer = mfbList.assignList[bobIndex].bobnr;
                mfbList.assignList[bobIndex].trains[trainIndex].vt[vtIndex].trains = mfbList.assignList[bobIndex].trains[trainIndex].vt[vtIndex].trains.filter((t) => t.Regelungsart !== 'Umleitung');
                mfbList.assignList[bobIndex].trains[trainIndex].vt[vtIndex].trains.push(newRoute);
                //console.log(newRoute);
            }            
        };

        mfbList.editRerouting = function(bobIndex, trainIndex, vtIndex){
            //console.log(bobIndex + " " + trainIndex + " " + vtIndex);
            mfbList.bobVorplan = [];
            mfbList.bobDelay = [];
            mfbList.bobReroute = [];
            mfbList.newRoute = '';
            mfbList.mergedNote = '';            
            mfbList.routes = mfbList.assignList[bobIndex].trains[trainIndex].vt[vtIndex].trains.filter((t) => t.Regelungsart === 'Umleitung');
            mfbList.newDelay = mfbList.routes[0]['Verspätung'];
            mfbList.stationArray = [];
            for (let index = 0; index < mfbList.routes.length; index+=1) {
                const route = mfbList.routes[index].Umleitungsstrecke.split(' - ');                
                let showRoute = [route[0]];
                for (let j = 1; j < route.length; j+=1) {
                    showRoute.push("|");
                    showRoute.push(route[j]);                    
                }
                mfbList.stationArray.push({
                    'bobIndex': bobIndex,
                    'trainIndex': trainIndex,
                    'route': route,
                    'show': showRoute
                });
            }

            let note1 = mfbList.routes.map((r) => r.Vorgangsnummer);
            note1 = note1.filter((item, index) => note1.indexOf(item)===index).sort().join(', ');
            note1 = 'Fplo aus den Vorgängen ' + note1 + ' (Zusammenfassung Datenstand ' + mfbList.fromDate + ') ';

            mfbList.mergedNote = note1 + mfbList.routes.map((r) => r.Bemerkung).join(', ');

            let allDays = mfbList.assignList[bobIndex].trains[trainIndex].vt.map((t) => t.day.VText);
            for (let k = 0; k < allDays.length; k+=1) {
                let allRules = mfbList.Trains.filter((t) => t.Zugnummer === mfbList.routes[0].Zugnummer && t.Verkehrstag.VText === allDays[k]);

                let bobVorplan = allRules.filter((r) => r.Regelungsart === "Vorplan").map((r) => r.Vorgangsnummer);
                bobVorplan = bobVorplan.filter((e) => !mfbList.bobSequence.includes(e));
                if(bobVorplan.length > 0){
                    mfbList.bobVorplan.push({
                        'vt': allDays[k],
                        'bobVorplan': bobVorplan.filter((item, index) => bobVorplan.indexOf(item)===index).sort()
                    });
                }

                let bobDelay = allRules.filter((r) => r.Regelungsart === "Verspätung").map((r) => r.Vorgangsnummer);
                bobDelay = bobDelay.filter((e) => !mfbList.bobSequence.includes(e));
                if(bobDelay.length > 0){
                    mfbList.bobDelay.push({
                        'vt': allDays[k],
                        'bobDelay': bobDelay.filter((item, index) => bobDelay.indexOf(item)===index).sort()                        
                    });
                } 

                let bobReroute = allRules.filter((r) => r.Regelungsart === "Umleitung").map((r) => r.Vorgangsnummer);
                bobReroute = bobReroute.filter((e) => !mfbList.bobSequence.includes(e));
                if(bobReroute.length > 0){
                    mfbList.bobReroute.push({
                        'vt': allDays[k],
                        'bobReroute': bobReroute.filter((item, index) => bobReroute.indexOf(item)===index).sort(),
                        'highlight': bobReroute.some((e)=> new RegExp('^5').test(e))
                    });
                }
                
            }            
            //console.log(mfbList.stationArray);            
            document.getElementById("nav-edit-tab").click();
        };

        mfbList.addVorplanNote = function(i){
            mfbList.mergedNote = mfbList.mergedNote + " Zielrechnung beachten durch Vorplan aus Maßnahme " + 
            mfbList.bobVorplan[i].bobVorplan.join(', ') + " am " + mfbList.bobVorplan[i].vt;
        };

        mfbList.addRerouteNote = function(i){
            mfbList.mergedNote = mfbList.mergedNote + " Zusätzliche Umleitung beachten aus Maßnahme " + 
            mfbList.bobReroute[i].bobReroute.join(', ') + " am " + mfbList.bobReroute[i].vt;
        };

        mfbList.addDelayNote = function(i){
            mfbList.mergedNote = mfbList.mergedNote + " Verspätung berücksichtigen aus Maßnahme " + 
            mfbList.bobDelay[i].bobDelay.join(', ') + " am " + mfbList.bobDelay[i].vt;
        };

        mfbList.assignTrainsToBobnr = function(){
            mfbList.assignList = [];
            if(mfbList.bobSequence.length > 1){
                let completeList = mfbList.Trains.filter((t) => mfbList.bobSequence.includes(t.Vorgangsnummer));
                console.log(completeList.length);
                if(completeList.length > 0){
                    for (let ind = 0; ind < mfbList.bobSequence.length; ind += 1) {
                        //console.log(ind + " " + mfbList.bobSequence.slice(0,ind));
                        let tNr = completeList.filter((t) => t.Vorgangsnummer === mfbList.bobSequence[ind]).map((t) => t.Zugnummer);
                        tNr = tNr.filter((item, index) => tNr.indexOf(item)===index);
                        let doubleNr = completeList.filter((t) => mfbList.bobSequence.slice(0,ind).includes(t.Vorgangsnummer) && tNr.includes(t.Zugnummer)).map((t) => t.Zugnummer);
                        doubleNr = doubleNr.filter((item, index) => doubleNr.indexOf(item)===index);
                        tNr = tNr.filter((t) => doubleNr.indexOf(t) === -1).sort((a,b) =>  a - b);
                        let trainList = [];
                        

                        for (let i = 0; i < tNr.length; i+= 1) {                
                            let vt = completeList.filter((t) => t.Zugnummer === tNr[i]).map((z) => z.Verkehrstag.VNumber);
                            vt = vt.filter((item, index) => vt.indexOf(item)===index).sort();
                            let d = [];
                            for (let j = 0; j < vt.length; j+= 1) {                    
                                d.push({ 
                                    'day': completeList.find((z) => z.Verkehrstag.VNumber === vt[j]).Verkehrstag,
                                    'trains': completeList.filter((z) => z.Zugnummer === tNr[i] && z.Verkehrstag.VNumber === vt[j]).sort((a,b) => (a.Regelungsart > b.Regelungsart) ? 1 : -1),
                                    'ignore': false
                                });
                            }
                            trainList.push({
                                'znr': tNr[i],
                                'zg': d[0].trains[0].Zuggattung,
                                'kd': d[0].trains[0].Kundennummer,
                                'von': d[0].trains[0].Abgangsbahnhof,
                                'bis': d[0].trains[0].Zielbahnhof,
                                'vt': d
                            });                                               
                        }

                        mfbList.assignList.push({
                            'bobnr': mfbList.bobSequence[ind],
                            'trains': trainList
                        });
                    }
                }
                
                if(mfbList.assignList.length >0){
                    mfbList.showAssignList = true;
                }else{
                    mfbList.showAssignList = false;
                } 

                console.log(mfbList.assignList.length);
                console.log(mfbList.assignList[0]);
                //console.log(mfbList.assignList[1]);
            }            
        };


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

        mfbList.filterTrain = function(znr, vt){
            mfbList.inputZNr = znr;
            mfbList.fromDate = vt;
            mfbList.toDate = vt;
            mfbList.filterAndShowRulesForTrain();
            document.getElementById("nav-profile-tab").click();
        };

        mfbList.download = function() {

            let filename = mfbList.fromDate + '-Aufteilung-' + mfbList.bobSequence.join('+') + '.csv';
            console.log(filename);
            let text = encodeURIComponent(createCsvText());

            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + text);
            element.setAttribute('download', filename);
        
            element.style.display = 'none';
            document.body.appendChild(element);
        
            element.click();
        
            document.body.removeChild(element);
        }

        function createCsvText(){

            let text = '';

            for (let i = 0; i < mfbList.assignList.length; i+= 1) {
                const element = mfbList.assignList[i];
                text += 'Vorgang ' + element.bobnr + ';;;;;;;;\n';
                text += 'Vorgang;Kunde;Zugnummer;Tag;Regelung;Laufweg;Bemerkung;Status;\n';
                for (let j = 0; j < element.trains.length; j+= 1) {
                    const train = element.trains[j];
                    for (let k = 0; k < train.vt.length; k++) {
                        const vt = train.vt[k];
                        for (let n = 0; n < vt.trains.length; n++) {
                            const regelung = vt.trains[n];
                            text += regelung.Vorgangsnummer + ';' + regelung.Kundennummer + ';' + regelung.Zugnummer + ';';
                            text += regelung.Verkehrstag.VText + ';' + regelung.Regelungsart + ';';
                            if(regelung.Regelungsart === 'Verspätung'){text += regelung.Verspätung + ' min;';}
                            else if(regelung.Regelungsart === 'Umleitung'){text += regelung.Umleitungsstrecke + ';';}
                            else if(regelung.Regelungsart === 'Ausfall'){text += 'von ' + regelung.Ausfallab + ' bis ' + regelung.Ausfallbis + ';';}
                            else if(regelung.Regelungsart === 'Vorplan'){text += 'ab ' + regelung['Vorplanab BS'] + ';';}
                            else {text += ';';}
                            text += regelung.Bemerkung.replace(/(\r\n|\n|\r)/gm," ") + ';;\n';
                        }
                    }
                }
                text += ';;;;;;;;\n';                
            }
            return text;
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