class ESP_UART {
  constructor() {
    this.device = null;
    this.onDisconnected = this.onDisconnected.bind(this);
  }
  request() {
    let options = {
      "filters": [{
      }],
      "optionalServices": ["0000aaaa-ead2-11e7-80c1-9a214cf093ae"]
    };
    return navigator.bluetooth.requestDevice(options)
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
