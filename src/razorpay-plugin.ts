import { PluginCommonModule, VendurePlugin } from "@vendure/core";
import { gql } from "graphql-tag";
import { RazorpayResolver } from "./razorpay.resolver";
import { razorpayPaymentMethodHandler } from "./razorpay-payment-method";

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [],
    compatibility: '^3.0.0',
    configuration: (config) => {
        config.customFields.Order.push({
            name: "razorpay_order_id",
            public: true,
            nullable: true,
            type: "string",
        });
        config.paymentOptions.paymentMethodHandlers.push(
            razorpayPaymentMethodHandler
        );
        return config;
    },
    shopApiExtensions: {
        schema: gql`
            type RazorpayOrderIdGenerationError {
                errorCode: String
                message: String
            }

            type RazorpayOrderIdSuccess {
                razorpayOrderId: String!
            }

            union generateRazorpayOrderIdResult =
                  RazorpayOrderIdSuccess
                | RazorpayOrderIdGenerationError

            extend type Mutation {
                generateRazorpayOrderId(
                    orderId: ID!
                ): generateRazorpayOrderIdResult!
            }
        `,
        resolvers: [RazorpayResolver],
    },
})
export class RazorpayPlugin {}
