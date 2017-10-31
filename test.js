const Luxafor = require('luxafor-api');

// api call to change the color
let opts = {
    defaults: {
        wave: {
            type: 2,
            speed: 90,
            repeat: 5
        }
    }
};
device = new Luxafor(options);
device.setColor('#fff');

 { vendorId: 1240,
    productId: 62322,
    path: 'IOService:/AppleACPIPlatformExpert/PCI0@0/AppleACPIPCI/XHC1@14/XHC1@14000000/HS01@14100000/LUXAFOR FLAG@14100000/IOUSBHostInterface@0/IOUSBHostHIDDevice@14100000,0',
    serialNumber: '',
    manufacturer: 'Microchip Technology Inc.',
    product: 'LUXAFOR FLAG',
    release: 256,
    interface: -1,
    usagePage: 65280,
    usage: 1 }
 */