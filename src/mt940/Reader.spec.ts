import { expect } from "chai";
import { Reader } from "./Reader";

// Prevent log output
import log = require("winston");
log.level = "fatal";

const REAL_ENTRY =
    ["ABNANL2A",
        "940",
        "ABNANL2A",
        ":20:ABN AMRO BANK NV",
        ":25:420123123",
        ":28:33001/1",
        ":60F:C141125EUR5623,78",
        ":61:1411261126D14,31N247NONREF",
        ":86:/TRTP/SEPA INCASSO ALGEMEEN DOORLOPEND/CSID/AB11CDE00000000000000",
        "00058/NAME/PAYPAL EUROPE S.A.R.L. ET CIE S.C.A/MARF/5WL2224MX5CZY",
        "/REMI/ABCDEFGHIJKLMN PAYPAL/IBAN/DE88500000000000000000/BIC/DEU",
        "TDEFFXXX/EREF/ABCDEFGHIJKLMN PP AFSCHRIJVING",
        ":61:1411261126D21,2N247NONREF",
        ":86:/TRTP/SEPA INCASSO ALGEMEEN DOORLOPEND/CSID/AB11CDE00000000000000",
        "00058/NAME/PAYPAL EUROPE S.A.R.L. ET CIE S.C.A/MARF/5WL2224MX5CZY",
        "/REMI/ABCDEFGHIJKLMN PAYPAL/IBAN/DE88500000000000000000/BIC/DEU",
        "TDEFFXXX/EREF/ABCDEFGHIJKLMN PP AFSCHRIJVING",
        ":61:1411261126D78,9N944NONREF",
        ":86:/TRTP/IDEAL/IBAN/NL77RABO0115856730/BIC/RABONL2U/NAME/ZIGGO BV",
        "/REMI/1111111111 0000000000000000 14879056 436434224 IDEALPORTAL",
        "ZIGGO BV/EREF/26-11-2014 12:59 0000000000000000",
        ":61:1411261126D160,54N658NONREF",
        ":86:/TRTP/SEPA OVERBOEKING/IBAN/NL69ABNA0111111111/BIC/ABNANL2A/NAME/",
        "LOREM IPSUM DOLOR/REMI/FACTUURNUMMBER: 111111 DEBITEURNUMME",
        "R: 0000/EREF/NOTPROVIDED",
        ":62F:C141126EUR5348,83"];

describe("MT940 Reader Tests", function () {

    ///////////////////////////////////////////////////////////////////////
    it("should get one entry for simple text", function () {
        const target = new Reader("ABNANL2A\n940");
        expect(target._rawEntries.length).to.equal(1);
    });

    it("should get two lines for simple text", function () {
        const target = new Reader("ABNANL2A\n940");
        expect(target._rawEntries[0].length).to.equal(2);
    });

    it("should get two entries for hyphen at char one", function () {
        const target = new Reader("ABNANL2A\n940\n-\nABNANL2A\n940");
        expect(target._rawEntries.length).to.equal(2);
    });

    it("should get two lines for both entries for hyphen at char one", function () {
        const target = new Reader("ABNANL2A\n940\n-\nABNANL2A\n940");
        expect(target._rawEntries[0].length).to.equal(2);
        expect(target._rawEntries[1].length).to.equal(2);
    });

    it("should create an account entry", function () {
        const target = new Reader(":20:ABN Amro\n:25:12345");
        expect(target.accounts["12345"])
            .to.be.ok;
    });

    it("should not create an account entry if no ID", function () {
        const target = new Reader(":20:ABN Amro\n:25:");
        expect(target.accounts["12345"]).to.be.undefined;
    });

    it("should correctly extract all statements", function () {
        const file = REAL_ENTRY.join("\n");
        const target = new Reader(file);
        expect(target.accounts["420123123"].statements.length)
            .to.equal(4);
    });

    it("should correctly extract statement 1", function () {
        const file = REAL_ENTRY.join("\n");
        const target = new Reader(file);
        expect(target.accounts["420123123"].statements.length)
            .to.equal(4);
    });
});
