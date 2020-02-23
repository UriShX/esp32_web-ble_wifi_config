let jsonRecieved = undefined;
let jsonStringToSend = undefined;

// Obtain configured instance.
let espconfig = new Espconfig();
var bleConnected = false;

espconfig.setSsidListUuid('1d338124-7ddc-449e-afc7-67f8673a1160'); // SSID list characteristic. Read only.
espconfig.setConnectionStatusUuid('5b3595c4-ad4f-4e1e-954e-3b290cc02eb0'); // Notification, wifi connection status UUID

// Recieve int8Array from ESP32 utility, then XOR with device name.
// Finally decode as ASCII text, and parse as JSON
function recieveCredentials() {
  // alert(data);
  let decoder = new TextDecoder('windows-1252');

  espconfig.readCredentials().then(value => {
    // console.log(value);
    // console.log(decoder.decode(value));

    jsonRecieved = jsonEncodeDecode(value);
    jsonRecieved = decoder.decode(jsonRecieved);
    // console.log(jsonRecieved); // debug
    jsonRecieved = JSON.parse(jsonRecieved);
    // console.log(jsonRecieved);  // debug
    return jsonRecieved;
  }).then(jsonRecieved => {
    // Update fields (knockout observables)
    ssidPrim(jsonRecieved.ssidPrim);
    pwPrim(jsonRecieved.pwPrim);
    ssidSec(jsonRecieved.ssidSec);
    pwSec(jsonRecieved.pwSec);
  }).then(() => {
    if (espconfig.ssidListUuid) {
      dropdownMessage('Updating SSIDs from device...');
      espconfig.readSsidlist().then(value => {
        if (value) {
          dropdownMessage('SSID seen by device');
          value = decoder.decode(value);
          value = JSON.parse(value);
          wifiList(value.SSID);
          // console.log(value);
          return value;
        } else dropdownMessage();
      })
    }
  }).then(() => {
    if (espconfig.connectionStatusUuid) {
      espconfig.startConnectionstatusNotifications(statusUpdate);
    }
  });
};

espconfig.setOnConnected(function() {
  bleConnected = true;
  $('#connect_text').html('Disconnect ');
  $('#connection_status').html('bluetooth_connected');
  // $('#connection_status').attr('data','icons/bluetooth_connected-24px.svg');
  $('#configButtons').children().prop('disabled', false);
});

espconfig.setOnDisconnected(function() {
  if (espconfig.connectionStatusUuid) {
    espconfig.stopConnectionstatusNotifications(statusUpdate);
  }
  bleConnected = false;
  $('#connect_text').html('Connect ');
  $('#connection_status').html('bluetooth');
  // $('#connection_status').attr('data','icons/bluetooth-24px.svg');
  $('#notifyStatus').parent().removeClass('visible').addClass('invisible');
  $('#configButtons').children().prop('disabled', true);
});

$('body').on('click', '.passEn', function() {
  if ($(this).find('i').hasClass('fa-eye')) {
    $(this).find('i').removeClass('fa-eye').addClass('fa-eye-slash');
    $(this).parent().children('input').prop({type:'text'});
  } else {
    $(this).find('i').removeClass('fa-eye-slash').addClass('fa-eye');
    $(this).parent().children('input').prop({type:'password'});
  }
});

$('#ble_connect').on('click', function() {
  if (!bleConnected) {
    // Request the device for connection and get its name after successful connection.
    espconfig.request()
    .then(_ => espconfig.connect())
    .then(_ => { 
      recieveCredentials();
    })
    .catch(error => { console.log(error) });
  } else {
    // Disconnect from the connected device.
    espconfig.disconnect();
  }
});

$(document).on('click', '#eraseSSIDs', function() {
  console.log('erasing stored credentials from device');

  jsonStringToSend = jsonAssemble({erase:""});
  
  espconfig.writeCredentials(jsonStringToSend);

  jsonStringToSend = undefined;

  recieveCredentials();
});

$(document).on('click', '#resetSSIDs', function() {
  console.log('resetting device');

  jsonStringToSend = jsonAssemble({reset:""});
  
  espconfig.writeCredentials(jsonStringToSend);

  jsonStringToSend = undefined;
});

$(document).ready(function() {
  $('#configButtons').children().prop('disabled', true);
});

function statusUpdate(event) {
  let value = event.target.value;
  // console.log(value);
  $('#notifyStatus').parent().removeClass('invisible').addClass('visible');
  if (value.getUint8() == 0) $('#notifyStatus').html('ESP32 is not connected to WiFi AP');
  else if (value.getUint8() == 1) $('#notifyStatus').html('ESP32 connected to ' + $('#ssidPrim').val());
  else if (value.getUint8() == 2) $('#notifyStatus').html('ESP32 connected to ' + $('#ssidSec').val());
}

function jsonEncodeDecode(data) {
  let APName = espconfig.device.name;
  
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