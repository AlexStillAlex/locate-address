// os-api-branding.js

var scriptTag = document.currentScript;

window.os = window.os || {};

os.Branding = {
    /**
     * Default configuration options.
     */
    options: {
        div: 'map',
        logo: 'https://www.lcpgroup.co.uk/assets/img/logo-2023.png', // Default logo URL
        logoClass: 'default-logo-class', // Default logo class name
        statement: 'Contains data &copy; Copyright holder YYYY',
        prefix: '',
        suffix: ''
    },

    /**
     * Initialize the branding with custom settings.
     */
    init: function(obj) {
        this.options.div = scriptTag.getAttribute('data-div') || this.options.div;
        this.options.logo = scriptTag.getAttribute('data-logo') || this.options.logo;
        this.options.logoClass = scriptTag.getAttribute('data-logo-class') || this.options.logoClass;
        this.options.statement = scriptTag.getAttribute('data-statement') || this.options.statement;
        this.options.prefix = scriptTag.getAttribute('data-prefix') || this.options.prefix;
        this.options.suffix = scriptTag.getAttribute('data-suffix') || this.options.suffix;

        obj = (typeof obj !== 'undefined') ? obj : {};
        Object.assign(this.options, obj);

        var elem = document.getElementById(this.options.div);

        if (!elem) return;

        var logoElement = document.createElement('img');
        logoElement.src = this.options.logo;
        logoElement.className = this.options.logoClass;

        var copyrightStatement = this.options.statement;
        copyrightStatement = copyrightStatement.replace('YYYY', new Date().getFullYear());

        if (this.options.prefix !== '') {
            copyrightStatement = this.options.prefix + '<span>|</span>' + copyrightStatement;
        }

        if (this.options.suffix !== '') {
            copyrightStatement = copyrightStatement + '<span>|</span>' + this.options.suffix;
        }

        document.querySelectorAll('#' + this.options.div + ' .os-api-branding').forEach(el => el.remove());

        // Append the logo.
        var div1 = document.createElement('div');
        div1.className = 'os-api-branding logo';
        div1.appendChild(logoElement);
        elem.appendChild(div1);

        // Append the copyright statement.
        var div2 = document.createElement('div');
        div2.className = 'os-api-branding copyright';
        div2.innerHTML = copyrightStatement;
        elem.appendChild(div2);
    }
};

os.Branding.init();
