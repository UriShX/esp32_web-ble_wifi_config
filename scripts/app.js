// sources: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code, https://www.w3schools.com/jsref/prop_document_activeelement.asp
function uniKeyCode(event) {
  event.preventDefault();
  var key = event.code;
  document.activeElement.value = key;
}

let jsonRecieved = undefined;
let jsonStringToSend = undefined;

// Obtain configured instance.
let terminal = new BluetoothTerminal();
var bleConnected = false;

terminal.setServiceUuid('0000aaaa-ead2-11e7-80c1-9a214cf093ae');
terminal.setCharacteristicUuid('00005555-ead2-11e7-80c1-9a214cf093ae');
// 3rd uuid for later use: 71db542a-88a3-4b73-b861-db48e180d2b1

// Override `receive` method to handle incoming data as you want.
// Recieve int8Array from ESP32 utility, then XOR with device name.
// Finally decode as ASCII text, and parse as JSON
terminal.receive = function(data) {
  // alert(data);

  let decoder = new TextDecoder('windows-1252');
  let APName = terminal._device.name;

  terminal._characteristic.readValue().then(value => {
    // console.log(value);
    var keyIndex = 0;
    for (var i = 0; i < value.byteLength; i++) {
      value.setInt8(i, value.getInt8(i) ^ APName.charCodeAt(keyIndex));
      keyIndex++;
      if (keyIndex >= APName.length) keyIndex = 0;
    }
    jsonRecieved = JSON.parse(decoder.decode(value));
    console.log(jsonRecieved);
  });
  // console.log(data);
};

terminal.setOnConnected(function() {
  bleConnected = true;
  $('#connect_text').html('Disconnect ');
  $('#connection_status').html('bluetooth_connected');
  $('#sendToDevice').prop('disabled', false);
});

terminal.setOnDisconnected(function() {
  bleConnected = false;
  $('#connect_text').html('Connect ');
  $('#connection_status').html('bluetooth');
  $('#sendToDevice').prop('disabled', true);
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

$(document).on('click', '#sendToDevice', function() {
  console.log('detected click');
  terminal.send(jsonStringToSend);
  // terminal.send('Simon says: Hello, world!');
  jsonStringToSend = undefined;
});

$(document).ready(function() {
  $('#sendToDevice').prop('disabled', true);
});

// Request the device for connection and get its name after successful connection.
// terminal.connect().then(() => {
//   alert(terminal.getDeviceName() + ' is connected!');
// });

// Send something to the connected device.
// terminal.send('Simon says: Hello, world!');




// slider.oninput = function() {
//   output.innerHTML = this.value;
// }

// document.getElementById("setButton").onclick = function() {setMinMax()};

// function setMinMax() {
//   var boxMin = document.getElementById("min");
//   var boxMax = document.getElementById("max");
//   var slideMin = slider.getAttribute("min");
//   var slideMax = slider.getAttribute("max");
//   if (parseInt(boxMin.value) >= parseInt(boxMax.value)) {
//     alert("Minimum value must be set lower than maximum value!");
//     boxMin.value = slideMin;
//     boxMax.value = slideMax;
//     return;
//   }
//   if (boxMin.value != slideMin) {
//     if (parseInt(slider.value) < boxMin.value) {
//       slider.value = boxMin.value;
//       output.innerHTML = slider.value;
//       //alert(slider.value + "\t" + boxMin);
//     }
//   slideMin = slider.setAttribute("min", boxMin.value);
//   }
//   if (boxMax != slideMax.value) {
//     if (parseInt(slider.value) > boxMax.value) {
//       slider.value = boxMax.value;
//       output.innerHTML = slider.value;
//       //alert(slider.value + "\t" + boxMax);
//     }
//     slideMax = slider.setAttribute("max", boxMax.value);
//   }
// };
