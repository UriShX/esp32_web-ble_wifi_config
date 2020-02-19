function listArray(list) {
    var self = this;
    self.list = ko.observableArray(list);
}

// based loosely on http://learn.knockoutjs.com/#/?tutorial=collections
function viewModel() {
    var self = this;
    
    // For future development. I want to get SSID list seen by esp32 device, and choose 1 from dropdown
    self.wifiList = ko.observableArray([]);
    self.selectedDropdown = ko.observableArray();
    self.selectedHolder = ko.observableArray();

    self.ssidPrim = ko.observable();
    self.pwPrim = ko.observable();
    self.ssidSec = ko.observable();
    self.pwSec = ko.observable();

    self.descript = ko.observable(false);
    self.config = ko.observable(true);
    
    self.ssidSecEnable = ko.observable(false);

    // Behaviours    
    self.passData = function() {
        var form = $("form.needs-validation");
        // jQuery.validator.setDefaults({ // Debug
        //     debug: true,
        //     success: "valid"
        // });
        let validator = form.validate({
            // https://stackoverflow.com/questions/1578007/jquery-validate-hide-display-validation-error-messages-show-custom-errors
            errorPlacement: function(error,element) {
                return false;
            }
        });
        if (form.hasClass('was-validated')) {
            validator.resetForm();
            form.removeClass('was-validated');
        }
        console.log("start validation");
        // console.log(form); // debug

        // using Bootstrap validation w/ jquery-validation
        if (form.valid()) {  
            console.log("valid"); 

            let jsonTemplate = {};

            jsonTemplate.ssidPrim = $('#ssidPrim').val();
            jsonTemplate.pwPrim = $('#pwPrim').val();

            if (!self.ssidSecEnable()){
                let temp = $('#ssidSec').val();
                if (temp == "") jsonTemplate.ssidSec = $('#ssidPrim').val();
                else jsonTemplate.ssidSec = temp;
                temp = $('#pwSec').val();
                if (temp == "") jsonTemplate.pwSec = $('#pwPrim').val();
                else jsonTemplate.pwSec = temp;
            } else {
                jsonTemplate.ssidSec = $('#ssidSec').val();
                jsonTemplate.pwSec = $('#pwSec').val();
            }

            jsonStringToSend = jsonAssemble(jsonTemplate);
            
            espconfig.writeCredentials(jsonStringToSend);
            // terminal._writeToCharacteristic(terminal._characteristic, jsonStringToSend);

            jsonStringToSend = undefined;

            form = null;
        } else {
            console.log("not valid");
            if (!form.hasClass('was-validated')) { form.addClass('was-validated') }
            form = null;
        }
        // $(".hideText").prop('disabled', true);
        console.log("finished validation");

        recieveCredentials();

        return false;
    }

    // Client-side routes    
    Sammy(function() {
        this.get('#descript', function() {
            self.descript(true);
            self.config(null);
        });

        this.post('#config', function() {
            event.preventDefault();
        });

        this.get('#config', function() {
            self.descript(false);
            self.config(true);
            if (bleConnected) {
                $('#setSSIDs').prop('disabled', false);
            }
        });
        
        this.get('', function() { 
            // self.wifiList.push("Kuki");
            this.app.runRoute('get', '/#config');
        });
    }).run();
};

$(window).on('load', function(){
    ko.applyBindings(viewModel);
})