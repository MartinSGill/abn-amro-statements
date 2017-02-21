export class StatementEntry {
    public date: Date;
    public amount: number;
    public payee: string;
    public memo: { [key: string]: string };

    constructor(date?: Date, amount?: number, payee?: string, memo?: { [key: string]: string }) {
        this.date = date ? date : new Date();
        this.amount = amount !== null ? amount : 0.0;
        this.payee = payee ? payee : "Unknown Payee";
        this.memo = memo ? memo : {};
    }
}
