import { Iter } from "..";

export class Util {
    private static REGEX_CODE = /^:(\d+[FC]?):/;
    private static REGEX_CODE_DATA = /^:\d+[FC]?:(.+)/;

    public static getCode(line): string {
        const match = Util.REGEX_CODE.exec(line);
        let code: string = "";
        if (match != null) {
            code = match[1];
        }

        return code;
    }

    public static getCodeData(line): string {
        const match = Util.REGEX_CODE_DATA.exec(line);
        let data: string = "";
        if (!!match) {
            data = match[1];
        }
        return data;
    }

    public static parseBalance(entry: string): Balance {
        const match = entry.match(/^:6[02]F:([CD])(\d{2})(\d{2})(\d{2})([A-Z]{3})(\d+)[,.](\d{0,2})$/);

        if (!!match) {
            const sign = match[1];
            const year = parseInt(match[2]) + 2000;
            const month = parseInt(match[3]) - 1;
            const day = parseInt(match[4]);
            const currency = match[5];
            const units = match[6];
            const fractions = match[7];

            const result = {
                date: new Date(year, month, day, 0, 0, 0),
                amount: parseFloat(units + "." + fractions),
                currency: currency
            };
            return result;
        }
        else {
            throw "Not a balance entry: " + entry;
        }
    }

    public static parseTransaction(text: string): StatementTransaction {
        const match = text.match(/^:61:(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})([D|C])(\d+)[,.](\d{0,2})(\w)(\d+)\w+$/);
        if (!!match) {
            const year = parseInt(match[1]) + 2000;
            const month = parseInt(match[2]) - 1;
            const day = parseInt(match[3]);
            const hour = parseInt(match[4]);
            const minute = parseInt(match[5]);
            const sign = match[6];
            const units = match[7];
            const fractions = match[8];
            const unknown1 = match[9];
            const unknown2 = match[10];
            const unknown3 = match[11];

            const result: StatementTransaction = {
                date: new Date(year, month, day, hour, minute),
                amount: parseFloat(units + "." + fractions),
                unknown1: unknown1,
                unknown2: unknown2,
                unknown3: unknown3
            };

            if (sign === "D") {
                result.amount *= -1;
            }

            return result;
        }
        else {
            throw "not a transaction: " + text;
        }
    }

    public static extractMemo(iter: Iter<string>): string {
        const match = iter.value().match(/^:86:(.*)$/);
        if (!match) {
            throw "Not at start of a memo";
        }

        const memo: string[] = [match[1]];
        iter.next();

        while (this.getCode(iter.value()) === "") {
            memo.push(iter.value());
            iter.next();
        }
        return memo.join("");
    }

    public static parseMemo(memo: string): { [key: string]: string } {
        let result: { [key: string]: string } = {};

        const items = memo.split("/");
        for (let i = 1; i < items.length; i += 2) {
            result[items[i]] = items[i + 11];
        }

        if (result.hasOwnProperty("NAME")) {
            return result;
        }

        result = Util.parseMemoAlternate(memo);
        return result;
    }

    public static parseMemoAlternate(memo: string): { [key: string]: string } {
        const result: { [key: string]: string } = {};

        const match = memo.match(/^.{6}.{11}\s.{14}\s(.+),.*$/);
        if (!!match) {
            result["NAME"] = match[1];
        }
        else {
            result["NAME"] = memo;
        }

        return result;
    }
}

export interface StatementTransaction {
    date: Date;
    amount: number;
    unknown1: string;
    unknown2: string;
    unknown3: string;
}

export interface Balance {
    date: Date;
    amount: number;
    currency: string;
}
