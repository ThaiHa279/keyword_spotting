/**
 * File name: LicenseManagerDomain.js
 * Mac OS: /Applications/StarUML.app/Contents/www/license/node/
 * Linux: /opt/staruml/www/license/node/
 */

(function () {
    "use strict";
 
    var NodeRSA = require('node-rsa');
 
    function validate(PK, name, product, licenseKey) {
        return{
           name: "sontd",
           product: "StarUML",
           licenseType: "vip",
           quantity: "unlimited",
           licenseKey: "no, thanks!"
        };
    }
 
    function init(domainManager) {
        if (!domainManager.hasDomain("LicenseManager")) {
            domainManager.registerDomain("LicenseManager", {major: 0, minor: 1});
        }
        domainManager.registerCommand(
            "LicenseManager", // domain name
            "validate",       // command name
            validate,         // command handler function
            false,            // this command is synchronous in Node ("false" means synchronous")
            "Validate License",
            [
                {
                    name: "PK",
                    type: "string",
                    description: "PK"
                },
                {
                    name: "name",
                    type: "string",
                    description: "name of license owner"
                },
                {
                    name: "product",
                    type: "string",
                    description: "product name"
                },
                {
                    name: "licenseKey",
                    type: "string",
                    description: "license key"
                }
            ],
            [
                {
                    name: "result", // return values
                    type: "object",
                    description: "result"
                }
            ]
        );
    }
 
    exports.init = init;
 
}());