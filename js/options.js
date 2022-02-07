/*
 * Copyright © 2022 Netas Ltd., Switzerland.
 * All rights reserved.
 * @author  Lukas Buchs, lukas.buchs@netas.ch
 * @date    2022-02-04
 */


function saveOptions(e) {

    let url = document.getElementById('url').value;
    if (!url.match(/^https?:\/\//i)) {
        url = 'http://' + url;
    }

    browser.storage.sync.set({
        url: url,
        user: document.getElementById('user').value,
        password: document.getElementById('password').value,
        callingDevice: document.getElementById('callingDevice').value,
        doNotPrompt: document.getElementById('doNotPrompt').checked
    });
    e.preventDefault();
}

function restoreOptions() {
    restoreOption('url');
    restoreOption('user');
    restoreOption('password');
    restoreOption('callingDevice');
    restoreOption('doNotPrompt', true);
}

function restoreOption(name, cb) {
    var gettingItem = browser.storage.sync.get(name);
    gettingItem.then((res) => {
        if (cb) {
            document.getElementById(name).checked = !!res[name];
        } else {
            document.getElementById(name).value = res[name] || '';
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('settingForm').addEventListener("submit", saveOptions);
    restoreOptions();
});