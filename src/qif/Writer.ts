
import { BankAccount } from "..";

export class Writer {
    public static write(account: BankAccount): string {
        const result: string[] = [];
        result.push("!Account");
        result.push("N " +  account.accountNumber);
        result.push("!Type:Cash");

        account.statements.forEach(function(value){
            result.push("D" + value.date.getDate()
                            + "/" + (value.date.getMonth() + 1)
                            + "/" + value.date.getFullYear());
            result.push("T" + value.amount);
            result.push("P" + value.payee);
            result.push("^");
        });

        return result.join("\n");
    }
}
