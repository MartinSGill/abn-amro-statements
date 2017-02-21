
import { StatementEntry } from "./StatementEntry";

export class BankAccount {
    public accountNumber: string = null;
    public bankName: string = null;

    public statements: StatementEntry[] = [];

    constructor() {

    }
}
