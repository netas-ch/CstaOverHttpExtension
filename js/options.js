/*
 * Copyright © 2022 Netas Ltd., Switzerland.
 * All rights reserved.
 * @author  Lukas Buchs, lukas.buchs@netas.ch
 * @date    2022-02-04
 */


async function saveOptions() {

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

    if (await setGrantButtonVisibility()) {
        window.alert('settings saved, permission granted');
    } else {
        window.alert('settings saved, please grant permissions');
    }
}

async function grantPermissions() {
    let url = document.getElementById('url').value;
    if (!url.match(/^https?:\/\//i)) {
        url = 'http://' + url;
    }


    if (url && url.match(/^(https?|wss?|file|ftp|\*):\/\/(\*|\*\.[^*/]+|[^*/]+)\/.*$/)) {
        url = url.replace(/^https?:\/\//i, '*://');
        await browser.permissions.request({origins:[url]});
    } else {
        window.alert('invalid url.');
        return;
    }
    await saveOptions();
}

async function setGrantButtonVisibility() {
    let granted = false, url = document.getElementById('url').value;
    if (await browser.permissions.contains({origins:['<all_urls>']})) {
        granted = true;

    } else if (url && url.match(/^(https?|wss?|file|ftp|\*):\/\/(\*|\*\.[^*/]+|[^*/]+)\/.*$/) && await browser.permissions.contains({origins:[url]})) {
        granted = true;
    }

    if (granted) {
        document.getElementById('permissions').style.display = 'none';
        document.getElementById('savebtn').style.display = '';
    } else {
        document.getElementById('permissions').style.display = '';
        document.getElementById('savebtn').style.display = 'none';
    }

    return granted;
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
    document.getElementById('savebtn').addEventListener("click", saveOptions);
    document.getElementById('permissions').addEventListener("click", grantPermissions);
    restoreOptions();

    window.setInterval(() => {
        setGrantButtonVisibility();
    }, 1000);
});