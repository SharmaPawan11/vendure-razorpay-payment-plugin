
<p align="center">
  <a href="https://www.vendure.io/">
    <img alt="Vendure" src="https://camo.githubusercontent.com/313cb07332b15ed0109228c7dfefc2833a09754946c21812d94b9d7dcd9ed3b1/68747470733a2f2f612e73746f7279626c6f6b2e636f6d2f662f3332383235372f363939783438302f386462623463376133632f6c6f676f2d69636f6e2e706e67" width="100" />
  </a>
  <a href="https://razorpay.com/">
    <img alt="Razorpay" src="https://razorpay.com/blog-content/uploads/2020/10/rzp-glyph-positive.png" width="100" />
  </a>
</p>
<h1 align="center">
  Vendure Razorpay Plugin
</h1>
<p align="center">
A plugin to enable Razorpay as a payment provider for Vendure E-commerce
</p>


<p align="center">
  <a href="https://github.com/vendure-ecommerce/vendure/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Vendure is released under the MIT license." />
  </a>
  <a href="https://github.com/vendure-ecommerce/vendure/blob/master/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=vendure_io">
    <img src="https://img.shields.io/twitter/follow/vendure_io.svg?label=Follow%20@vendure_io" alt="Follow @vendure_io" />
  </a>
  <a href="https://www.npmjs.com/package/vendure-razorpay-payment-plugin">
    <img src="https://img.shields.io/npm/v/vendure-razorpay-payment-plugin" alt="PRs welcome!" />
  </a>

</p>

## 🌟 Feature
This plugin have inside it a lot of stuff:
- A **[`PaymentMethodHandler`](https://docs.vendure.io/reference/typescript-api/payment/payment-method-handler/) to createPayments** and configure Razorpay transaction
- A **[custom field](https://docs.vendure.io/guides/developer-guide/custom-fields/) `customFieldsRazorpay_order_id`** on Order to set razorpayOrderId for corresponding vendure order id. 

- Refund payments in Admin UI

## ⚙️ Install
### 1. Install and configure Vendure
[Here](https://docs.vendure.io/guides/getting-started/installation/) you can find out how to install

### 2. Install the package
```bash
npm install vendure-razorpay-payment-plugin --save
```

### 3. Add the plugin in Vendure configuration
```typescript
import { RazorpayPlugin } from 'vendure-razorpay-payment-plugin';
const config: VendureConfig = {
  ...
  plugins: [
    RazorpayPlugin
  ]
}
```
If you are in production mode or have not set `synchronize: true` in your `dbConnectionOptions`, run

```bash
npx vendure migrate
```

You will need to do it twice, one to create a new migration, and one more to apply the migration(s) e.g. -

Upon first run - Select "Generate a new migration".

Upon second run - Select "Run pending migrations".

 See [Vendure Developer Guide for Migration](https://docs.vendure.io/guides/developer-guide/migrations/) to learn more.


### 4. Configure RazorPay
You will need to enable and configure the options to make the plugin work. You can edit this in _Payment Method_ section in Vendure Admin UI. 

### 5. Enjoy!
It's done!


## ⚙️ Frontend Setup ( Angular )


### 1. Add razorpay script 

```js
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

or load it on-demand for performance reasons like this.

```ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScriptService {

  constructor() { }

  scripts = [
      {
        name: 'razorpay',
        src: 'https://checkout.razorpay.com/v1/checkout.js'
      },
    ]

  loadScript(name: string) {
    return new Promise((resolve, reject) => {

      const scriptObject = this.scripts.find((script) => {
        if (script.name === name) {
          return script;
        }
        return null;
      });

      if (scriptObject) {
        let script = document.createElement('script');
        script.src = scriptObject.src;
        script.onload = () => {
          resolve(true);
        };
        script.onerror = (error: any) => resolve(false);
        document.getElementsByTagName('head')[0].appendChild(script);
      } else {
        resolve(false);
      }
    });
  }
}
```
```ts
const isScriptLoaded = await this.scriptService.loadScript('razorpay');
```

### 2. Set checkout form options accordingly - 

```ts
private _razorpayOptions = {
  key: environment.razorpayId,
  order_id: '',
  currency: 'INR',
  description: 'Description',
  // image: 'https://s3.amazonaws.com/rzp-mobile/images/rzp.png',
  prefill: {
    email: '',
    contact: '',
    name: '',
  },
  config: {
    display: {
      blocks: {
        card: {
          instruments: [
            {
              method: 'card',
              // issuers: ["UTIB"],
              networks: ['MasterCard', 'Visa', 'RuPay', 'Bajaj Finserv'],
            },
          ],
        },
        upi: {
          name: 'Pay using UPI',
          instruments: [
            {
              method: 'upi',
              flows: ['collect', 'intent', 'qr'],
              apps: ['google_pay', 'bhim', 'paytm', 'phonepe'],
            },
          ],
        },
        netbanking: {
          //  name for other block
          name: 'Pay using netbanking',
          instruments: [
            {
              method: 'netbanking',
            },
          ],
        },
        wallet: {
          name: 'Pay using wallets',
          instruments: [
            {
              method: 'wallet',
              wallets: ['phonepe', 'freecharge', 'airtelmoney'],
            },
          ],
        },
      },
      sequence: [
        'block.card',
        'block.upi',
        'block.netbanking',
        'block.wallet',
      ],
      preferences: {
        show_default_blocks: false,
      },
    },
  },
  handler: function (response: any) {
    console.log(response);
  },
  modal: {
    ondismiss: function () {},
  },
};
```

### 3. Generate Razorpay order id by calling mutation from plugin ( Order must be in "ArrangingPayment" state )

`razorpayService.ts`
```ts
const GENERATE_RAZORPAY_ORDER_ID = gql`
  mutation generateRazorpayOrderId($vendureOrderId: ID!) {
    generateRazorpayOrderId(orderId: $vendureOrderId) {
      __typename
      ... on RazorpayOrderIdSuccess {
        razorpayOrderId
      }
      ... on RazorpayOrderIdGenerationError {
        errorCode
        message
      }
    }
  }
  `;

generateRazorpayOrderId(vendureOrderId: string | number) {
  return this.requestor
    .mutate(GENERATE_RAZORPAY_ORDER_ID, {
      vendureOrderId,
    })
    .pipe(map((res) => res.generateRazorpayOrderId)
}
```

`checkout.component.ts`
```ts
this.orderService.generateRazorpayOrderId(this.orderDetails.id).pipe(
  this.updateOrderDetailsGlobally.operator(),
    takeUntil(this.destroy$)
  )
  .subscribe((res) => {
    this.onRazorpayIdGeneration(res);
});


onRazorpayIdGeneration(res: any) {
  if (res.__typename === 'RazorpayOrderIdSuccess') {
    const razorpayOrderId = res.razorpayOrderId;
    this.openRazorpayPopup(razorpayOrderId); // Implemented below
  } else {
    console.log(
      'Some error occurred while generating Razorpay orderId',
      res.message,
      res.errorCode
    );
    this.razorpayFlowActive = false;
    this.cd.detectChanges();
  }
}
```

### 4. Get Razorpay class

```ts
get Razorpay() {
  if (!(window as any).Razorpay) {
    throw new Error(
      'Can\'t find razorpay. Make sure you have added <script src="https://checkout.razorpay.com/v1/checkout.js"></script> in your index.html file'
    );
  }
  return (window as any).Razorpay;
}
```


### 5. Construct `success` and `manualClose` callbacks

&nbsp;&nbsp;&nbsp;&nbsp;5.1 Get a reference to Angular changeDetector and NgZone

&nbsp;&nbsp;&nbsp;&nbsp;`checkout.component.ts`

```ts
constructor(
    ...
    private cd: ChangeDetectorRef,
    private zone: NgZone
    ...
  ) {
    ...
  }
```

&nbsp;&nbsp;&nbsp;&nbsp;5.2 Construct the callbacks

&nbsp;&nbsp;&nbsp;&nbsp;`checkout.component.ts`

```ts
onRazorpayPaymentSuccess(metadata: Object) {
  this.cd.detectChanges();
  this.orderService
    .addRazorpayPaymentToOrder(metadata)
    .pipe(
      takeUntil(this.destroy$))
    .subscribe((res) => {
      switch (res.__typename) {
        case 'PaymentFailedError':
        case 'PaymentDeclinedError':
        case 'IneligiblePaymentMethodError':
        case 'OrderPaymentStateError':
          console.log(res.errorCode, res.message);
          break;
        case 'Order':
          console.log('PAYMENT SUCCESSFUL');
          this.zone.run(() => {
            this.router.navigate(['..'], {
              relativeTo: this.route,
            });
          })
      }
    });
}

onRazorpayManualClose() {
  if (confirm('Are you sure, you want to close the form?')) {
    console.log('Checkout form closed by the user');
    this.razorpayFlowActive = false;
    this.cd.detectChanges();
  } else {
    console.log('Complete the Payment');
  }
}

```

&nbsp;&nbsp;&nbsp;&nbsp;`razorpayService.ts`

```ts
addRazorpayPaymentToOrder(paymentMetadata: Object): Observable<Mutation["addPaymentToOrder"]> {
  const addPaymentMutationVariable = {
    paymentInput: {
      method: 'razorpay',
      metadata: JSON.stringify(paymentMetadata),
    },
  };
  return this.requestor
    .mutate(
      ADD_PAYMENT_TO_ORDER_MUTATION,
      addPaymentMutationVariable
    )
    .pipe(map((res) => res.addPaymentToOrder));
}
```

&nbsp;&nbsp;&nbsp;&nbsp;where `ADD_PAYMENT_TO_ORDER_MUTATION` is -

```ts
const ADD_PAYMENT_TO_ORDER_MUTATION = gql`
  mutation addPaymentToOrder($paymentInput: PaymentInput!) {
    addPaymentToOrder(input: $paymentInput) {
      __typename
      ... on Order {
        id
      }
      ... on PaymentFailedError {
        errorCode
        paymentErrorMessage
        message
      }
      ... on OrderPaymentStateError {
        errorCode
        message
      }
      ... on PaymentDeclinedError {
        message
        paymentErrorMessage
        errorCode
      }
    }
  }
`;
```

### 6. Set required things for checkout form options ( Sample code )

`razorpayService.ts`
```ts
get razorpayOptions() {
  return this._razorpayOptions;
}

set razorpayOrderId(orderId: string) {
  this._razorpayOptions.order_id = orderId;
}

set razorpayPrefill({
  email,
  contact,
  name,
}: {email: string | null, contact: string | null, name: string | null}) {
  email = email || '';
  contact = contact || '';
  name = name || '';
  this._razorpayOptions.prefill = {
    email, contact, name
  };
}
```
`checkout.component.ts`

```ts
openRazorpayPopup(razorpayOrderId: string) {
  try {
    const Razorpay = this.razorpayService.Razorpay;
    this.razorpayService.razorpayOrderId = razorpayOrderId;
    this.razorpayService.razorpayPrefill = {
      contact: this.customerDetails.customerPhNo,
      email: this.customerDetails.customerEmail,
      name: this.customerDetails.customerName,
    };
    this.razorpayService.razorpaySuccessCallback =
      this.onRazorpayPaymentSuccess.bind(this);
    this.razorpayService.razorpayManualCloseCallback =
      this.onRazorpayManualClose.bind(this);
    const rzp = new Razorpay(this.razorpayService.razorpayOptions);
    rzp.on('payment.failed', (response: any) => {
      // console.log(response);
    });
    rzp.open();
  } catch (e) {
    console.log(e);
  }
}
```

Check razorpay docs [here](https://razorpay.com/docs/payment-gateway/web-integration/standard/) 


## 😍 Do you like?
*Please, consider supporting my work as a lot of effort takes place to create this repo! Thanks a lot.*

<a href="https://www.buymeacoffee.com/deathwish" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-yellow.png" alt="Buy Me A Coffee" style="height: 51px !important;width: 217px !important;" ></a>

## ❗️ License
MIT 
