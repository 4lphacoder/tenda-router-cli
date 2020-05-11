'use-strict'
const puppeteer = require("puppeteer");


// DECLARING SOME GLOBAL VARIABLES
let browser = null;
let siteCookie = null;
let admHost = null;     // ADMIN PAGE ADDRESS OF YOUR TENDA ROUTER
let password = null;    // ADMIN PASSWORD OF YOUR TENDA ROUTER


async function reboot() {
    /*
    THIS FUNCTION LOGINS THE ROUTER AND REBOOT IT.
    */
   initialise();
    try {
        const loginPage = await (await browser).newPage();
        await loginPage.goto(admHost);      // FETCHING ADMIN-LOGIN-PAGE
        await loginPage.type("#login-password", password);      // ENTERING ADMIN-PASSWORD
        await loginPage.click("#save");     // LOGGING-IN
        await loginPage.waitFor(500);       // WAITING FOR 500MS TO LET BROWSER RENDER WEBPAGE
        // CHECKING FOR INCORRECT PASSWORD ATTEMP
        if( (await loginPage.$("#errMsg")) != null ) 
            throw "INVALID_PASSWORD_EXCEPTION";

        // ADDING A LISTENER THAT AUTOMATICALLY ACCEPTS REBOOT CONFIRM DIALOG
        loginPage.on("dialog" , function (dialog) {
            if (dialog.message() == "Reboot the device?")
                dialog.accept();
            else
                dialog.dismiss();
        });
        await loginPage.waitForSelector("#system", { visible: true });      // WAITING FOR ADMINISTRATION BUTTON ON NAVBAR
        await loginPage.click("#system");       // CLICKING ON ADMINISTRATION BUTTON ON NAVBAR
        await loginPage.waitFor(500);           // WAITING FOR 500MS TO LET BROWSER RENDER WEBPAGE
        await loginPage.waitForSelector("#reboot", { visible: true });      // WAITING FOR REBOOT BUTTON
        await loginPage.click('#reboot', { waitUntil:"NetworkIdle0" });     // CLICKING ON REBOOT BUTTON
        await loginPage.waitForSelector("#login-password", { visible:true });
    }
    catch (error) {
        throw error;
    }
    finally {
        // CLOSING OPEN INSTANCE OF WEB BROWSER
        await (await browser).close();
        return;
    }
}

function initialise() {
    // THIS FUNCTION CREATES HEADLESS BROWSER INSTANCE
    browser = puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"]
    });
}

function login(admHostURL, passwordString) {
    /*
    THIS FUNCTION INITIALISES ADMIN-HOST-URL AND PASSWORD VALUE
    1. admHost  --> STRING
    2. password --> STRING
    */
    admHost = admHostURL;
    password = passwordString;
}

function logout() {
    browser = null;
    admHost = null;
    password = null;
}

module.exports = { login, reboot, logout };

