let jsonRecieved = undefined;
let jsonStringToSend = undefined;

// Obtain configured instance.
let terminal = new BluetoothTerminal();
var bleConnected = false;

terminal.setServiceUuid('0000aaaa-ead2-11e7-80c1-9a214cf093ae');
terminal.setCharacteristicUuid('00005555-ead2-11e7-80c1-9a214cf093ae');
// ('1d338124-7ddc-449e-afc7-67f8673a1160'); // SSID list characteristic. Read only.

// Override `receive` method to handle incoming data as you want.
// Recieve int8Array from ESP32 utility, then XOR with device name.
// Finally decode as ASCII text, and parse as JSON
terminal.receive = function(data) {
  // alert(data);
  terminal._characteristic.readValue().then(value => {
    let decoder = new TextDecoder('windows-1252');

    // console.log(value);
    // console.log(decoder.decode(value));

    jsonRecieved = jsonEncodeDecode(value);
    jsonRecieved = decoder.decode(jsonRecieved);
    // console.log(jsonRecieved); // debug
    jsonRecieved = JSON.parse(jsonRecieved);
    // console.log(jsonRecieved);  // debug
    return jsonRecieved;
  }).then(jsonRecieved => {
    // Update fields
    $('#ssidPrim').val(jsonRecieved.ssidPrim);
    $('#pwPrim').val(jsonRecieved.pwPrim);
    $('#ssidSec').val(jsonRecieved.ssidSec);
    $('#pwSec').val(jsonRecieved.pwSec);
  });
  // console.log(data);
};

terminal.setOnConnected(function() {
  bleConnected = true;
  $('#connect_text').html('Disconnect ');
  $('#connection_status').html('bluetooth_connected');
  $('#configButtons').children().prop('disabled', false);
});

terminal.setOnDisconnected(function() {
  bleConnected = false;
  $('#connect_text').html('Connect ');
  $('#connection_status').html('bluetooth');
  $('#configButtons').children().prop('disabled', true);
});

$('body').on('click', '.passEn', function() {
  if ($(this).find("i").hasClass('fa-eye')) {
    $(this).find("i").removeClass('fa-eye').addClass('fa-eye-slash');
    $(this).parent().children("input").prop({type:"text"});
  } else {
    $(this).find("i").removeClass('fa-eye-slash').addClass('fa-eye');
    $(this).parent().children("input").prop({type:"password"});
  }
});

$('#ble_connect').on('click', function() {
  if (!bleConnected) {
    // Request the device for connection and get its name after successful connection.
    terminal.connect().then(() => {
      // alert(terminal.getDeviceName() + ' is connected!');
      terminal.receive();
    });
  } else {
    // Disconnect from the connected device.
    terminal.disconnect();
  }
});

$(document).on('click', '#eraseSSIDs', function() {
  console.log('erasing stored credentials from device');

  jsonStringToSend = jsonAssemble({erase:""});
  
  terminal._writeToCharacteristic(terminal._characteristic, jsonStringToSend)

  jsonStringToSend = undefined;

  terminal.receive();
});

$(document).on('click', '#resetSSIDs', function() {
  console.log('resetting device');

  jsonStringToSend = jsonAssemble({reset:""});
  
  terminal._writeToCharacteristic(terminal._characteristic, jsonStringToSend)

  jsonStringToSend = undefined;
});

$(document).ready(function() {
  $('#configButtons').children().prop('disabled', true);
});

function jsonEncodeDecode(data) {
  let APName = terminal._device.name;
  
  // console.log(value);
  var keyIndex = 0;
  for (var i = 0; i < data.byteLength; i++) {
    data.setInt8(i, data.getInt8(i) ^ APName.charCodeAt(keyIndex));
    keyIndex++;
    if (keyIndex >= APName.length) keyIndex = 0;
  }

  return data;
}

function jsonAssemble(jsonTemplate) {
  // console.log(jsonTemplate); // debug
  jsonTemplate = JSON.stringify(jsonTemplate);
  // console.log(jsonTemplate); // debug
  jsonTemplate = str2ab(jsonTemplate);
  // console.log(jsonTemplate); // debug
  jsonTemplate = jsonEncodeDecode(jsonTemplate);
  let decoder = new TextDecoder('windows-1252');
  jsonTemplate = decoder.decode(jsonTemplate);
  // console.log(jsonTemplate); // debug
  return jsonTemplate;
}

// From https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
function str2ab(str) {
  var buf = new ArrayBuffer(str.length); // 1 byte for each char
  var bufView = new Int8Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return new DataView(buf);
}