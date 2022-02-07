class TelHandler {

    constructor() {

        try {
            this._settings = null;
            this._csta = null;
            this._nrField = document.getElementById('number');
            this._msgDiv = document.getElementById('messages');
            this._autoCallAndClose = false;
            this._darkMode = false;
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this._darkMode = true;
            }

            // icon
            this._addIcon();

            // events
            this._nrField.addEventListener('blur', () => { this._onNrFieldBlur(); });
            document.getElementById('callBtn').addEventListener('click', () => { this._onCallBtnClick(); });

            // GET Parameter
            let tel = this._getGetParameter('tel');
            if (tel) {
                this._nrField.value = this._formatNumber(this._cleanupNumber(tel));
                this._autoCallAndClose = this._nrField.value !== '';
            }

            // Settings laden
            var gettingItem = browser.storage.sync.get();
            gettingItem.then((res) => {
                console.log(res);
                this._settings = res;

                this.init();
            });
        } catch (e) {
            this._showError(e);
        }
    }


    init() {
        this._csta = new Csta(this._settings.url, this._settings.user, this._settings.password);

        this._csta.requestSystemStatus().then((r) => {
            this._showMessage('phone status', r.status);

            if (this._autoCallAndClose) {
                this._makeCall(this._cleanupNumber(this._nrField.value), true);
            }

        }).catch((e) => {
            this._showError(e);
        });
    }

    _addIcon() {
        // <link rel="icon" href="icons/ico_light_16.png" type="image/png" />
        let ico = document.createElement('link');
        ico.setAttribute('rel', 'icon');
        ico.setAttribute('href', this._darkMode ? 'icons/ico_dark_16.png' : 'icons/ico_light_16.png');
        ico.setAttribute('type', 'image/png');
        document.getElementsByTagName('head')[0].appendChild(ico);
    }

    _makeCall(number, autoCall=false) {
        this._csta.makeCall(number, !!this._settings.doNotPrompt, this._settings.callingDevice).then((r) => {
            let msg = 'started call ID ' + r.callID;
            msg += ' from device ' + r.deviceID;

            this._showMessage('call', msg);

            // Fenster Schliessen
            if (autoCall) {
                window.setTimeout(() => {
                    window.close();
                }, 500);
            }

        }).catch((e) => {
            this._showError(e);
        });
    }

    _getGetParameter(parameterName) {
        var result = null,
            tmp = [];
        location.search
            .substr(1)
            .split("&")
            .forEach(function (item) {
                tmp = item.split("=");
                if (tmp[0] === parameterName) {
                    result = decodeURIComponent(tmp[1]);
                }
            });
        return result;
    }

    _onCallBtnClick() {
        let value = this._nrField.value.trim(), nr=this._cleanupNumber(value);
        if (nr) {
            this._makeCall(nr);
            
        } else if (!nr && value) {
            this._showError(new Error('invalid number'));
        }
    }

    _onNrFieldBlur() {
        this._nrField.value = this._formatNumber(this._cleanupNumber(this._nrField.value));
    }


    _cleanupNumber(telNr) {
        telNr = telNr.replace(/[^0-9\+]/g, '');
        telNr = telNr.replace(/^\+/, '00');
        telNr = telNr.replace(/[^0-9]/g, '');
        return telNr;
    }

    _formatNumber(telNr) {
        if (telNr.match(/^(\+41|0041|0)(8|9)[0-9]{8}$/)) {
            telNr = telNr.replace(/^(0041|0)(8|9)([0-9]{2})([0-9]{3})([0-9]{3})$/, '0$2$3 $4 $5');
        }
        if (telNr.match(/^(\+41|0041|0)[0-9]{9}$/)) {
            telNr = telNr.replace(/^(0041|0)([0-9]{2})([0-9]{3})([0-9]{2})([0-9]{2})$/, '0$2 $3 $4 $5');
        }

        return telNr;
    }

    _showMessage(title, msg) {
        if (msg) {
            let errDiv = document.createElement('div');
            errDiv.className = 'message';
            errDiv.style.display = '';
            errDiv.innerHTML = '<h3>' + this._escapeHtml(title) + '</h3><p>' + this._escapeHtml(msg) + '<p>';

            if (this._msgDiv.hasChildNodes()) {
                this._msgDiv.insertBefore(errDiv, this._msgDiv.firstChild);
            } else {
                this._msgDiv.appendChild(errDiv);
            }
        }
    }

    _showError(err) {
        if (err) {
            let errDiv = document.createElement('div');
            errDiv.className = 'error';
            errDiv.style.display = '';
            errDiv.innerHTML = '<h3>Error</h3><p>' + this._escapeHtml(err.message ? err.message : err) + '<p>';

            if (this._msgDiv.hasChildNodes()) {
                this._msgDiv.insertBefore(errDiv, this._msgDiv.firstChild);
            } else {
                this._msgDiv.appendChild(errDiv);
            }
        }
    }

    _escapeHtml(text) {
        if (typeof text !== 'string') {
            text = text.toString ? text.toString() : new String(text);
        }
        let map = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
}
