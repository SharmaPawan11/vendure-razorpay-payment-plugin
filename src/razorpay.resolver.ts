import { Args, Mutation, Resolver } from "@nestjs/graphql";
import {
    Ctx,
    ID,
    InternalServerError,
    Logger,
    OrderService,
    PaymentMethod,
    RequestContext,
    TransactionalConnection,
} from "@vendure/core";
import { PaymentMethodArgsHash, RazorpayOrderResult } from "./types";
import { razorpayPaymentMethodHandler } from "./razorpay-payment-method";
import { loggerCtx } from "./constants";
import { getRazorpayInstance } from "./razorpay-common";

@Resolver()
export class RazorpayResolver {
    constructor(
        private connection: TransactionalConnection,
        private orderService: OrderService
    ) {}

    @Mutation()
    async generateRazorpayOrderId(
        @Ctx() ctx: RequestContext,
        @Args() { orderId }: { orderId: ID }
    ) {
        let successResponse = {
            __typename: "RazorpayOrderIdSuccess",
            razorpayOrderId: "",
        };
        const order = await this.orderService.findOne(ctx, orderId);

        // Proceed only if current order exists.
        if (order && order.customer) {
            // Prevent user from generating orderIds if order state is not ArrangingPayment
            if (order?.state !== 'ArrangingPayment') {
                return {
                    __typename: "RazorpayOrderIdGenerationError",
                    errorCode: "INVALID_ORDER_STATE_ERROR",
                    message: 'The order must be in "ArrangingPayment" state in order to generate Razorpay OrderId for it',
                };
            }

            const args = await this.getPaymentMethodArgs(ctx);
            const razorpayClient = getRazorpayInstance(args);
            try {
                const razorPayOrder = await this.createRazorpayOrder(
                    razorpayClient,
                    {
                        amount: order.subTotalWithTax,
                        currency: "INR",
                    }
                );

                // Update "customFieldsRazorpay_order_id" field with generated razorpay order id
                let save = await this.orderService.updateCustomFields(
                    ctx,
                    orderId,
                    { razorpay_order_id: razorPayOrder.id }
                );
                if (save?.id) {
                    successResponse.razorpayOrderId = razorPayOrder.id;
                    return successResponse;
                }
            } catch (e) {
                Logger.error(e);
            }
        }
        return {
            __typename: "RazorpayOrderIdGenerationError",
            errorCode: "VENDURE_ORDER_ID_NOT_FOUND_ERROR",
            message: "The order id you have provided is invalid",
        };
    }

    private async getPaymentMethodArgs(
        ctx: RequestContext
    ): Promise<PaymentMethodArgsHash> {
        const method = await this.connection
            .getRepository(ctx, PaymentMethod)
            .findOne({
                where: {
                    code: razorpayPaymentMethodHandler.code,
                },
            });
        if (!method) {
            throw new InternalServerError(
                `[${loggerCtx}] Could not find Razorpay PaymentMethod`
            );
        }
        return method.handler.args.reduce((hash, arg) => {
            return {
                ...hash,
                [arg.name]: arg.value,
            };
        }, {} as PaymentMethodArgsHash);
    }

    private createRazorpayOrder(
        razorpayClient: any,
        orderArgs?: any
    ): Promise<RazorpayOrderResult> {
        if (!orderArgs.amount) {
            return Promise.reject("Required Argument Missing: Amount");
        }
        return new Promise((resolve, reject) => {
            razorpayClient.orders.create(
                orderArgs,
                (err: any, order: RazorpayOrderResult) => {
                    if (err) reject(err);
                    resolve(order);
                }
            );
        });
    }
}
