class ESP_UART {

  constructor() {
    this.device = null;
    this.onDisconnected = this.onDisconnected.bind(this);
  }

  request() {
    let bleOptions = {
      "filters": [{
        "name": "ESP32"
      }],
      "optionalServices": ['0000aaaa-ead2-11e7-80c1-9a214cf093ae']
    };
    return navigator.bluetooth.requestDevice(bleOptions)
    .then(device => {
      this.device = device;
      this.device.addEventListener('gattserverdisconnected', this.onDisconnected);
    });
  }

  connect() {
    if (!this.device) {
      return Promise.reject('Device is not connected.');
    }
    return this.device.gatt.connect();
  }

  writeFaderFreq(data) {
    return this.device.gatt.getPrimaryService("48696828-8aba-4445-b1d2-9fe5c3e47382")
    .then(service => service.getCharacteristic("7dd57463-acc5-48eb-9b7f-3052779322de"))
    .then(characteristic => characteristic.writeValue(data));
  }

  // startFaderFreqNotifications() {
  //   return this.device.gatt.getPrimaryService("48696828-8aba-4445-b1d2-9fe5c3e47382")
  //   .then(service => service.getCharacteristic("7dd57463-acc5-48eb-9b7f-3052779322de"))
  //   .then(characteristic => characteristic.startNotifications())
  //   .then(characteristic => characteristic.addEventListener('characteristicvaluechanged', handleNotifications))
  //   // .then(characteristic => characteristic.addEventListener('characteristicvalueupdated', handleNotifications))
  //   .catch(error => { console.log(error) });
  // }

  // stopFaderFreqNotifications() {
  //   return this.device.gatt.getPrimaryService("48696828-8aba-4445-b1d2-9fe5c3e47382")
  //   .then(service => service.getCharacteristic("7dd57463-acc5-48eb-9b7f-3052779322de"))
  //   .then(characteristic => characteristic.stopNotifications())
  //   .then(characteristic => characteristic.removeEventListener('characteristicvaluechanged', handleNotifications));
  // }

  disconnect() {
    if (!this.device) {
      return Promise.reject('Device is not connected.');
    }
    return this.device.gatt.disconnect();
  }

  onDisconnected() {
    console.log('Device is disconnected.');
  }
}

var espUART = new ESP_UART();
var slider = document.getElementById("myRange");

// slider.onchange = function() {
// 	try {
// 		let value = this.value;
// 		console.log(value + "\t" + typeof(value));
// 		espUART.writeFaderFreq(new Uint8Array([value]));
// 	}
// 	catch(error) { console.log(error); }
// }


document.getElementById('ble_connect').addEventListener('click', event => {
  espUART.request()
  .then(_ => espUART.connect())
  .then(_ => {
  /* Do something with espUART... */
  // espUART.startFaderFreqNotifications();
  // document.getElementById("connect_text").innerHTML = "Connected "; // removes <i> tag, need to swap only text w/Jquery
  document.getElementById("connection_status").innerHTML = "bluetooth_connected";
  })
  .catch(error => { console.log(error) });
});

function handleNotifications(event) {
  // console.log(event.target.isRead); /* Returns true if stored value comes from a read operation */
  console.log(event.target.value); /* Characteristic value */
  let value = event.target.value;
  // let peekValue = new DataView(value);
  // for (var i in value.byteLength) {
  //   var uintValue = value.getUint8(i);
  //   console.log(uintValue + "\n");
  // }
  console.log(value + "\t" + typeof(value) + "\t" + value.byteLength + "\t" + value.getUint8());
  let a = [];
  // Convert raw data bytes to hex values just for the sake of showing something.
  // In the "real" world, you'd use data.getUint8, data.getUint16 or even
  // TextDecoder to process raw data bytes.
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  console.log('> ' + a.join(' '));

  var _min = document.getElementById("min");
  var _max = document.getElementById("max");
  _min.value = value.getUint8(2);
  _max.value = value.getUint8(3);
  setMinMax();
  slider.value = value.getUint8(0);
	output.innerHTML = slider.value;
  console.log(slider.value + "\t" + typeof(slider.value));
}
