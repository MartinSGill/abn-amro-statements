import { BankAccount, StatementEntry, Iter } from "..";
import { Util } from "./Util";

import * as log from  "winston";

/**
 * Class responsible for reading MT940 Files in ABN Amro format.
 */
export class Reader {
  private _initialData: string = "";
  public _rawEntries: string[][] = [];

  public accounts: { [id: string]: BankAccount } = {};

  constructor(data: string) {
    if (!data) {
      throw "data parameter is required.";
    }

    this._initialData = data;
    this._splitData();
    this._parseEntries();
  }

  /**
   * Splits the _initialData into individual _rawEntries.
   */
  private _splitData() {
    const lines = this._initialData.split(/\r?\n/);
    let entry: string[] = [];

    for (let pos = 0; pos < lines.length; pos++) {
      const line = lines[pos];
      if (line.match("^-$")) {
        this._rawEntries.push(entry);
        entry = [];
      }
      else {
        entry.push(line);
      }
    }
    if (entry.length > 0) {
      this._rawEntries.push(entry);
    }
  }

  private _parseEntries() {
    log.debug("Beginning Parse");
    for (let entry = 0; entry < this._rawEntries.length; entry++) {
      log.debug("Parsing Entry " + entry);
      const obj = this._rawEntries[entry];
      this._parseEntry(obj);
    }
  }

  private _parseEntry(entry: string[]) {
    const entryIter = new Iter<string>(entry);
    while (entryIter.canMoveNext()) {
      entryIter.next();
      const line = entryIter.value();
      switch (Util.getCode(line)) {
        // New Account Entry
        case "20":
          log.debug("Found Account Entry");
          this._parseAccount(entryIter);
          break;

        default:
      }
    }
  }

  private _parseAccount(entryIter: Iter<string>) {
    const bankName = Util.getCodeData(entryIter.value());
    let startBalance = 0.0;
    let endBalance = 0.0;
    let statements: StatementEntry[] = [];
    let currentStatement: StatementEntry = null;
    let currentAccountId = "";

    while (entryIter.canMoveNext()) {
      entryIter.next();
      log.debug("Position: " + entryIter.position());
      const line = entryIter.value();
      const code = Util.getCode(line);

      log.debug("found code: " + code);
      switch (code) {
        case "20":
          // next account. We're done here.
          log.debug("next account");
          if (statements.length > 0) {
            log.debug("storing all " + statements.length + " statements");
            this.accounts[currentAccountId].statements.concat(statements);
            statements = [];
          }
          return;

        case "25":
          // Account number
          currentAccountId = Util.getCodeData(line);
          log.debug("found account Id: " + currentAccountId);

          if (statements.length > 0) {
            log.debug("storing all " + statements.length + " statements");
            this.accounts[currentAccountId].statements.concat(statements);
            statements = [];
          }

          if (currentAccountId === "") {
            log.error("(" + entryIter.position() + ") - Account without Number/Id");
            return;
          }

          if (this.accounts.hasOwnProperty(currentAccountId)) {
            log.debug("Account '" + currentAccountId + "' already exists.");
          }
          else {
            this.accounts[currentAccountId] = new BankAccount();
            this.accounts[currentAccountId].bankName = bankName;
            this.accounts[currentAccountId].accountNumber = currentAccountId;
          }

          break;

        case "28":
          break;

        // Statement Start
        case "61":
          log.debug("found new statement");

          if (currentStatement != null) {
            log.debug("storing statement");
            statements.push(currentStatement);
            currentStatement = new StatementEntry();
          }

          currentStatement = new StatementEntry();
          const transaction = Util.parseTransaction(entryIter.value());
          currentStatement.amount = transaction.amount;
          currentStatement.date = transaction.date;
          break;

        // Memo Start
        case "86":
          log.debug("found new memo");
          const memo = Util.extractMemo(entryIter);
          currentStatement.memo = Util.parseMemo(memo);
          currentStatement.payee = currentStatement.memo["NAME"];

          // Move back a step, loop is on the correct line next time around
          entryIter.previous();
          break;

        // Opening Balance
        case "60F":
          startBalance = Util.parseBalance(entryIter.value()).amount;
          log.debug("found start balance: " + startBalance);
          break;

        // Closing Balance
        case "62F":
          if (currentStatement != null) {
            log.debug("storing statement");
            statements.push(currentStatement);
            currentStatement = new StatementEntry();
          }
          // Todo: Test statements against balance

          endBalance = Util.parseBalance(entryIter.value()).amount;
          log.debug("found end balance: " + endBalance);
          break;
      }
    }

    if (statements.length > 0) {
      log.info("[" + currentAccountId + "]" + " found " + statements.length + " statements.");
      this.accounts[currentAccountId].statements = this.accounts[currentAccountId].statements.concat(statements);
      statements = [];
    }
  }
}
