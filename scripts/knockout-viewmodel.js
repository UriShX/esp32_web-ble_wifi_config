https://stackoverflow.com/questions/25172734/knockout-remove-select-options-from-array-when-already-in-use
function pinAssignment(options, n = "", normal = "NO", key = "", mods = []) {
    var self = this;
    self.selected = ko.observable(n);
    self.options = options;
    self.normal = ko.observable(normal);
    self.key = ko.observable(key);
    self.code = ko.observable();
    self.modifiers = ko.observableArray(mods);
    self.OldVal = n;

    // self.selected.extend({ notify: 'always' });

    self.selected.subscribe(function(oldValue) {
        // console.log(oldValue);
        self.OldVal = oldValue;
    }, null, "beforeChange");

    self.selected.subscribe(function() {
        watchList(self);
    }, null, "change");

    self.key.subscribe(function(value) {
        console.log("key change");
        if (value != "") {
            var searchIndex = json.responseJSON[environment.nav].indexOf(value);
            self.code(json.responseJSON.scancode[searchIndex]);
        }
    }, null, "change");
};

// based loosely on http://learn.knockoutjs.com/#/?tutorial=collections
function viewModel() {
    var self = this;
    
    self.Options = ko.observableArray([
        { pin: "", name: "ESP32 dev board button #", enabled: ko.observable(false) },
        { pin: "36", name: "GPIO_36 / VP", enabled: ko.observable(true) },
        { pin: "39", name: "GPIO_39 / VN", enabled: ko.observable(true) },
        { pin: "32", name: "GPIO_32", enabled: ko.observable(true) },
        { pin: "33", name: "GPIO_33", enabled: ko.observable(true) },
        { pin: "34", name: "GPIO_34", enabled: ko.observable(true) },
        { pin: "35", name: "GPIO_35", enabled: ko.observable(true) },
        { pin: "25", name: "GPIO_25", enabled: ko.observable(true) },
        { pin: "26", name: "GPIO_26", enabled: ko.observable(true) },
        { pin: "27", name: "GPIO_27", enabled: ko.observable(true) },
        { pin: "14", name: "GPIO_14", enabled: ko.observable(true) },
        { pin: "12", name: "GPIO_12", enabled: ko.observable(true) },
        { pin: "13", name: "GPIO_13 used for batt. level", enabled: ko.observable(false) },
        { pin: "15", name: "GPIO_15", enabled: ko.observable(true) },
        { pin: "2", name: "GPIO_2", enabled: ko.observable(true) },
        { pin: "0", name: "GPIO_0", enabled: ko.observable(true) },
        { pin: "4", name: "GPIO_4", enabled: ko.observable(true) },
        { pin: "16", name: "GPIO_16", enabled: ko.observable(true) },
        { pin: "17", name: "GPIO_17", enabled: ko.observable(true) },
        { pin: "5", name: "GPIO_5 used for LED indication", enabled: ko.observable(false) },
        { pin: "18", name: "GPIO_18 SPI SCK", enabled: ko.observable(false) },
        { pin: "23", name: "GPIO_23 SPI MOSI", enabled: ko.observable(false) },
        { pin: "19", name: "GPIO_19 SPI MISO", enabled: ko.observable(false) },
        { pin: "21", name: "GPIO_21 IIC SDA", enabled: ko.observable(false) },
        { pin: "22", name: "GPIO_22 IIC SCL", enabled: ko.observable(false) }
    ]);

    self.edit = ko.observable(true);
    self.reviewData = ko.observable();
    self.review = ko.observable();

    self.selectedDropdown = ko.observableArray();
    self.selectedHolder = ko.observableArray();

    self.pinAssign = ko.observableArray([
        new pinAssignment(Options),
    ]);

    // Behaviours    
    self.passData = function() {
        $(".hideText").prop('disabled', false);
        var form = $("form.needs-validation");
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
        // console.log(form);
        
        // self.selectedHolder(self.selectedDropdown.slice(0));
        // self.selectedDropdown([]);
        ko.utils.arrayForEach(self.selectedDropdown(), function(pin) {
            self.selectedHolder.push(pin);
        });
        ko.utils.arrayForEach(self.selectedDropdown(), function() {
            self.selectedDropdown.pop();
        });

        // using Bootstrap validation w/ jquery-validation
        if (form.valid()) {  
            console.log("valid");          
            let jsonTemplate = {
                id: "edit",
                form: []
            };
        
            $.each($('form').serializeObject(), function(_index, element) {
                if ( !element.hasOwnProperty('mod') ) { element.mod = [] }
                else {
                    element.mod.forEach(function(item, i) {
                        item = "KEY_" + item;
                        element.mod[i] = item;
                        console.log(item);
                    });
                }
                jsonTemplate.form.push(element);
            });

            self.reviewData(jsonTemplate);
            jsonStringToSend = JSON.stringify(jsonTemplate);
            console.log(jsonStringToSend);
            form = null;
            return (self.goToReview());
        } else {
            console.log("not valid");
            if (!form.hasClass('was-validated')) { form.addClass('was-validated') }
            // self.selectedDropdown(self.selectedHolder.slice(0));
            // self.selectedHolder([]);
            ko.utils.arrayForEach(self.selectedHolder(), function(pin) {
                self.selectedDropdown.push(pin);
            });
            ko.utils.arrayForEach(self.selectedHolder(), function() {
                self.selectedHolder.pop();
            });
            form = null;
        }
        $(".hideText").prop('disabled', true);
        console.log("finished validation");
        return false;
    }

    self.goToEdit = function() { 
        // self.selectedDropdown(self.selectedHolder.slice(0));
        // self.selectedHolder([]);
        ko.utils.arrayForEach(self.selectedHolder(), function(pin) {
            self.selectedDropdown.push(pin);
        });
        ko.utils.arrayForEach(self.selectedHolder(), function() {
            self.selectedHolder.pop();
        });
        $(".hideText").prop('disabled', true);
        location.hash = "Edit";
    };

    self.goToReview = function() { 
        location.hash = "Review"; 
    };

    // Operations
    self.addPinDef = function() {
        self.pinAssign.push(new pinAssignment(Options));
    }

    self.removePinDef = function(pin) {
        // console.log(pin.selected());
        self.pinAssign.remove(pin);
        self.selectedDropdown.remove(pin.selected())
    }

    self.watchList = function(data) {
        console.log(data.OldVal + '\t' + data.selected())
        self.selectedDropdown.remove(data.OldVal);
        self.selectedDropdown.push(data.selected())
    }

    selectedDropdown.subscribe(function(data) {
        // console.log(data);
        if (data[0].status === "deleted" && data[0].value != "") {
            // console.log(data[0].value);
            // http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
            ko.utils.arrayForEach(Options(), function(option) {
                if (option.pin == data[0].value) {
                    // console.log( option.name + " " + data[0].status );
                    // https://stackoverflow.com/questions/32425351/how-to-toggle-boolean-value-on-click-with-knockout
                    option.enabled(!option.enabled());
                }
            });
        }
        else if (data[0].status === "added" && data[0].value != "") {
            // console.log(data[0].value);
            // http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
            ko.utils.arrayForEach(Options(), function(option) {
                if (option.pin == data[0].value) {
                    // console.log( option.name + " " + data[0].status );
                    // https://stackoverflow.com/questions/32425351/how-to-toggle-boolean-value-on-click-with-knockout
                    option.enabled(!option.enabled);
                }
            });
        }
    }, self, "arrayChange");

    // Client-side routes    
    Sammy(function() {
        this.get('#Edit', function() {
            console.log("got to Edit");
            self.edit(true);
            self.review(null);
        });

        this.post('#Review', function() {
            event.preventDefault();
        });

        this.get('#Review', function() {
            console.log("got to Review");
            self.edit(false);
            self.review(pinAssign);
            if (bleConnected) {
                $('#sendToDevice').prop('disabled', false);
            }
            // console.log(ko.toJSON(review));
            // return false;
            // $.get("/mail", { mailId: this.params.mailId }, self.chosenMailData);
        });
        
        this.get('', function() { 
            this.app.runRoute('get', '#Edit') 
        });
    }).run();
};

// https://stackoverflow.com/questions/9543482/how-to-get-an-observablearrays-length
ko.observableArray.fn.totalVisible = function() {
    var items = this(), count = 0;

    if (items == null || typeof items.length === "undefined") {
        return 0;
    }

    for (var i = 0, l = items.length; i < l; i++) {
        if (items[i]._destroy !== true) {
            count++;
        }
    }

    return count;
};

$(window).on('load', function(){
    ko.applyBindings(viewModel);
})