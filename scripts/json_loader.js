let environment = {
    os: "",
    nav: ""
}

let json;

$(document).ready(function() {
    var _version = navigator.appVersion;
    var _name = navigator.appName;
    var _agent = navigator.userAgent;
    var _vendor = navigator.vendor;
    var _venSub = navigator.vendorSub;

    console.log(_version);
    console.log(_name);
    console.log(_agent);
    console.log(_vendor);
    console.log(_venSub);

    if (_agent.indexOf("Linux") != -1 || _agent.indexOf("X11") != -1) environment.os = "unix";
    else if (_agent.indexOf("Mac") != -1) environment.os = "Mac";
    else if (_agent.indexOf("Android") != -1) environment.os = "Android";
    // else if (_agent.indexOf("Win") != -1) environment.os = "Windows";
    // BLE only supported on win 10
    else if (_agent.indexOf("Windows NT 10.0") != -1) OSName = "Windows_10";
    // else if (_agent.indexOf("Windows NT 6.2") != -1) OSName = "Windows 8";
    // else if (_agent.indexOf("Windows NT 6.1") != -1) OSName = "Windows 7";
    // else if (_agent.indexOf("Windows NT 6.0") != -1) OSName = "Windows Vista";
    // else if (_agent.indexOf("Windows NT 5.1") != -1) OSName = "Windows XP";
    // else if (_agent.indexOf("Windows NT 5.0") != -1) OSName = "Windows 2000";

    if (environment.os === "unix") {
        // console.log("found " + environment.os);
        if (_agent.indexOf("Chrome") != -1) environment.nav = "Chromium";
        else if (_agent.indexOf("Firefox") != -1) environment.nav = "Gecko";
    }

    if (environment.os === "Windows_10") {
        // console.log("found " + environment.os);
        if (_agent.indexOf("Chrome") != -1) environment.nav = "Chrome";
        else if (_agent.indexOf("Firefox") != -1) environment.nav = "Firefox";
    }

    if (environment.os === "Mac") {
        // console.log("found " + environment.os);
        if (_agent.indexOf("Chrom") != -1) environment.nav = "Chromium";
        else if (_agent.indexOf("Firefox") != -1) environment.nav = "Gecko";
    }

    if (environment.os === "Android") {
        if (_agent.indexOf("Gecko") != -1) environment.nav = "Gecko";
    }


    if (environment.nav != "") {
        if (environment.os === "unix") json = $.getJSON('util/linux_codes.json'); //(with path)
        else if (environment.os === "Windows_10") json = $.getJSON('util/windows_codes.json'); //(with path)
        else if (environment.os === "Mac") json = $.getJSON('util/mac_codes.json'); //(with path)
        else if (environment.os === "Android") json = $.getJSON('util/android_codes.json'); //(with path)
        else alert("Your operating system is not currently supported!");
    } else alert("You browser is not currently supported!");

    // console.log(json);

    // console.log(environment);
});
  