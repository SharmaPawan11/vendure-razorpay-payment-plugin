# Vendure Razorpay Plugin

💳 A plugin to enable Razorpay as a payment provider for Vendure E-commerce

## 🌟 Feature
This plugin have inside it a lot of stuff:
- A **[`PaymentMethodHandler`](https://www.vendure.io/docs/typescript-api/payment/payment-method-handler/) to createPayments** and configure Razorpay transaction
- A **[custom field](https://www.vendure.io/docs/developer-guide/customizing-models/#customizing-models-with-custom-fields) `customFieldsRazorpay_order_id`** on Order to set razorpayOrderId for corresponding vendure order id. 
- Refund payments in Admin UI

## ⚙️ Install
### 1. Install and configure Vendure
[Here](https://www.vendure.io/docs/getting-started/) you can find out how to install

### 2. Install the package
```bash
npm install vendure-razorpay-plugin --save
```

### 3. Add the plugin in Vendure configuration
```typescript
import { RazorpayPlugin } from 'vendure-razorpay-plugin';
const config: VendureConfig = {
  ...
  plugins: [
    RazorpayPlugin
  ]
}
```
### 4. Configure RazorPay
You will need to enable and configure the options to make work. You can edit this in _Payment Method_ section in Vendure Admin UI

### 5. Enjoy!
It's done!

## 😍 Do you like?
*Please, consider supporting my work as a lot of effort takes place to create this repo! Thanks a lot.*

<a href="https://www.buymeacoffee.com/deathwish" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-yellow.png" alt="Buy Me A Coffee" style="height: 51px !important;width: 217px !important;" ></a>

## ❗️ License
MIT 
