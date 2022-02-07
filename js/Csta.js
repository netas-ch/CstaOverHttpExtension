/*
 * Copyright © 2022 Netas Ltd., Switzerland.
 * All rights reserved.
 * @author  Lukas Buchs, lukas.buchs@netas.ch
 * @date    2022-02-04
 */


class Csta {

    constructor(url, user, password) {
        this._url = url;
        this._user = user;
        this._password = password;
    }

    // PUBLIC

    async requestSystemStatus() {
        let xml, rep = await this._doRequest(this._xml_RequestSystemStatus());
        if (rep && rep.srcElement && rep.srcElement.responseXML) {
            xml = rep.srcElement.responseXML;
        }
        let status = this._recursiveLookForNode(xml, 'systemStatus');

        return {status: status};


    }

    async makeCall(calledDirectoryNumber, doNotPrompt, callingDevice) {
        let xml, rep = await this._doRequest(this._xml_MakeCall(calledDirectoryNumber, doNotPrompt, callingDevice));
        if (rep && rep.srcElement && rep.srcElement.responseXML) {
            xml = rep.srcElement.responseXML;
        }
        let callID = this._recursiveLookForNode(xml, 'callID');
        let deviceID = this._recursiveLookForNode(xml, 'deviceID');

        return {callID: callID, deviceID: deviceID};
    }


    // PRIVATE
    _doRequest(postBody) {
        return new Promise((resolve, reject) => {
            if (!this._url) {
                reject(new Error('URL of CSTA device not set. Go to about:addons of your browser to set the url.'));
            }
            let req = new XMLHttpRequest();
            if (this._user) {
                req.open("POST", this._url, true, this._user, this._password);
                req.withCredentials = true;

            } else {
                req.open("POST", this._url, true);
            }
            req.setRequestHeader('Content-Type', 'text/xml');
            req.setRequestHeader('Accept', 'text/xml');

            req.addEventListener("load", (load) => {
                resolve(load);
            });
            req.addEventListener("error", (error) => {
                reject(error);
            });

            req.send(postBody);
        });
    }

    _xml_RequestSystemStatus() {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>' + "\n";
        xml += '<RequestSystemStatus xmlns="http://www.ecma-international.org/standards/ecma-323/csta/ed3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>';
        return xml;
    }

    _xml_MakeCall(calledDirectoryNumber, doNotPrompt, callingDevice) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>' + "\n";
        xml += '<MakeCall xmlns="http://www.ecma-international.org/standards/ecma-323/csta/ed5" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
        if (callingDevice && callingDevice.match(/@/) && callingDevice.substr(0, 4) !== 'sip:') {
            callingDevice = 'sip:' + callingDevice;
        }
        xml += '<callingDevice>' + this._escapeHtml(callingDevice || '') + '</callingDevice>';

        if (calledDirectoryNumber && calledDirectoryNumber.match(/@/) && calledDirectoryNumber.substr(0, 4) !== 'sip:') {
            calledDirectoryNumber = 'sip:' + calledDirectoryNumber;
        }
        xml += '<calledDirectoryNumber>' + this._escapeHtml(calledDirectoryNumber || '') + '</calledDirectoryNumber>';

        xml += '<autoOriginate>' + this._escapeHtml(doNotPrompt ? 'doNotPrompt' : 'prompt') + '</autoOriginate>';
        xml += '</MakeCall>';
        return xml;
    }

    _escapeHtml(text) {
        let map = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    _recursiveLookForNode(xml, nodeName) {
        if (xml && xml.nodeName && xml.nodeName === nodeName) {
            return xml.textContent || '';
        }

        if (xml && xml.childNodes && xml.childNodes.length > 0) {
            for (let i = 0; i < xml.childNodes.length; i++) {
                let t = this._recursiveLookForNode(xml.childNodes[i], nodeName);
                if (t !== null) {
                    return t;
                }
            }
        }

        return null;
    }
}