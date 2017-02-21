
import { Iter } from "../Iter";
import { Util } from "./Util";

// Prevent log output
import log = require("winston");
log.level = "fatal";


describe("MT940 Util Tests", function () {

  ///////////////////////////////////////////////////////////////////////
  it("should correctly extract code from line with text", function () {
    expect(Util.getCode(":20:ABCD"))
      .toEqual("20");
  });

  it("should correctly extract code from code-only line", function () {
    expect(Util.getCode(":20:"))
      .toEqual("20");
  });

  it("should correctly skip non-code line", function () {
    expect(Util.getCode("abcdefg"))
      .toEqual("");
  });

  ///////////////////////////////////////////////////////////////////////
  it("should correctly extract data from code line with text", function () {
    expect(Util.getCodeData(":20:ABCD"))
      .toEqual("ABCD");
  });

  it("should correctly extract data from code line with text", function () {
    expect(Util.getCodeData(":61F:ABCD"))
      .toEqual("ABCD");
  });

  it("should correctly not extract data from code line with no text", function () {
    expect(Util.getCodeData(":61F:"))
      .toEqual("");
  });

  it("should correctly extract date from start balance", function () {
    const result = Util.parseBalance(":60F:C141125EUR5623,78");

    expect(result.date.getFullYear())
      .toEqual(2014);
    expect(result.date.getMonth())
      .toEqual(10);
    expect(result.date.getDate())
      .toEqual(25);
  });

  it("should correctly extract amount from start balance", function () {
    const result = Util.parseBalance(":60F:C141125EUR5623,78");
    expect(result.amount).toBeCloseTo(5623.78, 2);
  });

  it("should correctly extract currency from start balance", function () {
    const result = Util.parseBalance(":60F:C141125EUR5623,78");
    expect(result.currency).toEqual("EUR");
  });

  it("should correctly extract date from end balance", function () {
    const result = Util.parseBalance(":62F:C141126EUR5348,83");

    expect(result.date.getFullYear())
      .toEqual(2014);
    expect(result.date.getMonth())
      .toEqual(10);
    expect(result.date.getDate())
      .toEqual(26);
  });

  it("should correctly extract amount from end balance", function () {
    const result = Util.parseBalance(":62F:C141126EUR5348,83");
    expect(result.amount).toBeCloseTo(5348.83, 2);
  });

  it("should correctly extract currency from end balance", function () {
    const result = Util.parseBalance(":62F:C141126EUR5348,83");
    expect(result.currency).toEqual("EUR");
  });

  it("should correctly extract multiline memo", function () {
    const data = [
      ":86:/TRTP/SEPA INCASSO ALGEMEEN DOORLOPEND/CSID/AB11CDE00000000000000",
      "00058/NAME/PAYPAL EUROPE S.A.R.L. ET CIE S.C.A/MARF/5WL2224MX5CZY",
      "/REMI/ABCDEFGHIJKLMN PAYPAL/IBAN/DE88500000000000000000/BIC/DEU",
      "TDEFFXXX/EREF/ABCDEFGHIJKLMN PP AFSCHRIJVING",
      ":61:1411261126D78,9N944NONREF"];
    const expected =
      "/TRTP/SEPA INCASSO ALGEMEEN DOORLOPEND/CSID/AB11CDE0000000000000000058/NAME/PAYPAL EUROPE S.A.R.L. ET CIE S.C.A/MARF/5WL2224MX5CZY/REMI/ABCDEFGHIJKLMN PAYPAL/IBAN/DE88500000000000000000/BIC/DEUTDEFFXXX/EREF/ABCDEFGHIJKLMN PP AFSCHRIJVING";
    const iter = new Iter<string>(data);
    iter.next();
    expect(Util.extractMemo(iter)).toEqual(expected);
  });

  it("should correctly set iterator code line", function () {
    const data = [
      ":86:/TRTP/SEPA INCASSO ALGEMEEN DOORLOPEND/CSID/AB11CDE00000000000000",
      "00058/NAME/PAYPAL EUROPE S.A.R.L. ET CIE S.C.A/MARF/5WL2224MX5CZY",
      "/REMI/ABCDEFGHIJKLMN PAYPAL/IBAN/DE88500000000000000000/BIC/DEU",
      "TDEFFXXX/EREF/ABCDEFGHIJKLMN PP AFSCHRIJVING",
      ":61:1411261126D78,9N944NONREF"];
    const iter = new Iter<string>(data);
    iter.next();
    Util.extractMemo(iter);
    expect(iter.position()).toEqual(5);
  });

  it("should correctly extract debit amount from transaction", function () {
    const result = Util.parseTransaction(":61:1411261126D14,31N247NONREF");
    expect(result.amount).toBeCloseTo(-14.31, 2);
  });

  it("should correctly extract credit amount from transaction", function () {
    const result = Util.parseTransaction(":61:1411261126C14,31N247NONREF");
    expect(result.amount).toBeCloseTo(14.31, 2);
  });

  it("should correctly extract date from transaction", function () {
    const result = Util.parseTransaction(":61:1411261126C14,31N247NONREF");

    expect(result.date.getFullYear())
      .toEqual(2014);
    expect(result.date.getMonth())
      .toEqual(10);
    expect(result.date.getDate())
      .toEqual(26);
    expect(result.date.getHours())
      .toEqual(11);
    expect(result.date.getMinutes())
      .toEqual(26);
  });

  it("should correctly extract debit amount from transaction (2)", function () {
    const result = Util.parseTransaction(":61:1411031103D127,N247NONREF");
    expect(result.amount).toBeCloseTo(-127.0, 2);
  });

  it("should correctly extract credit amount from transaction (2)", function () {
    const result = Util.parseTransaction(":61:1411031103D127,N247NONREF");
    expect(result.amount).toBeCloseTo(-127.0, 2);
  });

  it("should correctly extract date from transaction (2)", function () {
    const result = Util.parseTransaction(":61:1411031103D127,N247NONREF");

    expect(result.date.getFullYear())
      .toEqual(2014);
    expect(result.date.getMonth())
      .toEqual(10);
    expect(result.date.getDate())
      .toEqual(3);
    expect(result.date.getHours())
      .toEqual(11);
    expect(result.date.getMinutes())
      .toEqual(3);
  });
});
