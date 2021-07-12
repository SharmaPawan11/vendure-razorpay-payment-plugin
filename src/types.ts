import { ConfigArgValues } from "@vendure/core/dist/common/configurable-operation";

import { razorpayPaymentMethodHandler } from "./razorpay-payment-method";

export type PaymentMethodArgsHash = ConfigArgValues<
    typeof razorpayPaymentMethodHandler["args"]
>;

export class RazorpayOrderResult {
    id!: string;
    entity!: string;
    amount!: number;
    amount_paid!: number;
    amount_due!: number;
    currency!: string;
    receipt?: string;
    offer_id?: null;
    status!: string;
    attempts?: number;
    notes?: Array<any>;
    created_at?: number;
}

export class RazorpayRefundResult {
    id!: string;
    entity!: string;
    amount!: number;
    currency!: string;
    payment_id!: string;
    notes!: {[key: string]: string};
    receipt!: string;
    acquirer_data!: {[arn: string]: number};
    created_at!: number;
    batch_id!: null;
    status!: string;
    speed_processed!: string;
    speed_requested!: string;
}
