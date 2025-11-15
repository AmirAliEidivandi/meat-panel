# راه‌حل پرداخت فاکتور سفارش

## 📋 خلاصه مشکل

وقتی سفارش به مرحله `PARTIALLY_DELIVERED` می‌رسد:

- فاکتور صادر می‌شود
- کیف پول مشتری آپدیت می‌شود
- انبار آپدیت می‌شود

**سوال**: چگونه مشتری باید فاکتور را پرداخت کند؟

## 🎯 راه‌حل پیشنهادی

### 1. منطق پرداخت

**گزینه 1: پرداخت از کیف پول (اگر موجودی کافی باشد)**

- اگر موجودی کیف پول >= مبلغ فاکتور → پرداخت خودکار از کیف پول
- موجودی کیف پول کاهش می‌یابد
- وضعیت فاکتور به `PAID` تغییر می‌کند

**گزینه 2: پرداخت از درگاه (اگر موجودی کافی نباشد)**

- اگر موجودی کیف پول < مبلغ فاکتور → درخواست پرداخت از درگاه
- کاربر به درگاه پرداخت هدایت می‌شود
- بعد از پرداخت موفق، موجودی کیف پول افزایش می‌یابد و سپس از آن کسر می‌شود

**گزینه 3: پرداخت ترکیبی (پیشنهادی)**

- ابتدا از موجودی کیف پول کسر می‌شود (تا حد ممکن)
- باقیمانده از طریق درگاه پرداخت می‌شود

### 2. Endpoints مورد نیاز

#### 2.1. دریافت اطلاعات فاکتور برای پرداخت

```
GET /orders/{orderId}/invoice/payment-info
```

**Response:**

```typescript
{
  order_id: string;
  invoice_id: string;
  invoice_code: number;
  total_amount: number; // مبلغ کل فاکتور
  wallet_balance: number; // موجودی کیف پول
  remaining_amount: number; // مبلغ باقیمانده (total_amount - wallet_balance)
  can_pay_from_wallet: boolean; // آیا می‌تواند از کیف پول پرداخت کند؟
  payment_status: "NOT_PAID" | "PARTIALLY_PAID" | "PAID";
  created_at: string;
}
```

#### 2.2. پرداخت فاکتور از کیف پول

```
POST /orders/{orderId}/invoice/pay-from-wallet
```

**Request:**

```typescript
{
  amount?: number; // اختیاری - اگر نباشد، کل مبلغ باقیمانده پرداخت می‌شود
}
```

**Response:**

```typescript
{
  success: boolean;
  message: string;
  payment_id: string;
  remaining_amount: number; // مبلغ باقیمانده بعد از پرداخت
  wallet_balance_after: number; // موجودی کیف پول بعد از پرداخت
}
```

#### 2.3. درخواست پرداخت فاکتور از درگاه

```
POST /payments/invoices/{invoiceId}/gateway/zarinpal
POST /payments/invoices/{invoiceId}/gateway/zibal
```

**Request:**

```typescript
{
  amount: number; // مبلغی که باید از درگاه پرداخت شود
  gateway: "zarinpal" | "zibal";
}
```

**Response:**

```typescript
{
  payment_transaction_id: string;
  redirect_url: string;
  amount: number;
}
```

#### 2.4. Callback پرداخت فاکتور

```
GET /payments/invoices/{invoiceId}/callback/zarinpal
GET /payments/invoices/{invoiceId}/callback/zibal
```

**Query Parameters:**

- `payment_transaction_id`: string
- `Authority` (برای زرین‌پال): string
- `Status` (برای زرین‌پال): string
- `trackId` (برای زیبال): number

**Response:**

```typescript
{
  success: boolean;
  message: string;
  ref_id: string;
  invoice_id: string;
  order_id: string;
  amount_paid: number;
  wallet_balance_after: number;
}
```

### 3. Flow پرداخت

```
1. سفارش به مرحله PARTIALLY_DELIVERED می‌رسد
   ↓
2. فاکتور صادر می‌شود
   ↓
3. کاربر به صفحه پرداخت فاکتور هدایت می‌شود
   ↓
4. سیستم بررسی می‌کند:
   - موجودی کیف پول چقدر است؟
   - مبلغ فاکتور چقدر است؟
   ↓
5. اگر موجودی کافی باشد:
   - دکمه "پرداخت از کیف پول" نمایش داده می‌شود
   - کاربر کلیک می‌کند
   - از کیف پول کسر می‌شود
   - فاکتور به PAID تغییر می‌کند
   ↓
6. اگر موجودی کافی نباشد:
   - دکمه "پرداخت از درگاه" نمایش داده می‌شود
   - کاربر کلیک می‌کند
   - به درگاه پرداخت هدایت می‌شود
   - بعد از پرداخت موفق:
     * موجودی کیف پول افزایش می‌یابد
     * از کیف پول کسر می‌شود
     * فاکتور به PAID تغییر می‌کند
   ↓
7. کاربر به صفحه جزئیات سفارش بازمی‌گردد
```

### 4. TypeScript Types

```typescript
// src/types/index.ts

export interface InvoicePaymentInfo {
  order_id: string;
  invoice_id: string;
  invoice_code: number;
  total_amount: number;
  wallet_balance: number;
  remaining_amount: number;
  can_pay_from_wallet: boolean;
  payment_status: "NOT_PAID" | "PARTIALLY_PAID" | "PAID";
  created_at: string;
}

export interface PayInvoiceFromWalletDto {
  amount?: number;
}

export interface PayInvoiceFromWalletResponse {
  success: boolean;
  message: string;
  payment_id: string;
  remaining_amount: number;
  wallet_balance_after: number;
}

export interface InitiateInvoicePaymentDto {
  amount: number;
  gateway: "zarinpal" | "zibal";
}

export interface InitiateInvoicePaymentResponse {
  payment_transaction_id: string;
  redirect_url: string;
  amount: number;
}

export interface InvoicePaymentCallbackResponse {
  success: boolean;
  message: string;
  ref_id: string;
  invoice_id: string;
  order_id: string;
  amount_paid: number;
  wallet_balance_after: number;
}
```

### 5. API Service Methods

```typescript
// src/services/api.ts

export const invoicePaymentService = {
  getInvoicePaymentInfo: async (
    orderId: string
  ): Promise<InvoicePaymentInfo> => {
    const response = await api.get(`/orders/${orderId}/invoice/payment-info`);
    return response.data;
  },

  payFromWallet: async (
    orderId: string,
    data: PayInvoiceFromWalletDto
  ): Promise<PayInvoiceFromWalletResponse> => {
    const response = await api.post(
      `/orders/${orderId}/invoice/pay-from-wallet`,
      data
    );
    return response.data;
  },

  initiateZarinpalPayment: async (
    invoiceId: string,
    amount: number
  ): Promise<InitiateInvoicePaymentResponse> => {
    const response = await api.post(
      `/payments/invoices/${invoiceId}/gateway/zarinpal`,
      { amount, gateway: "zarinpal" }
    );
    return response.data;
  },

  initiateZibalPayment: async (
    invoiceId: string,
    amount: number
  ): Promise<InitiateInvoicePaymentResponse> => {
    const response = await api.post(
      `/payments/invoices/${invoiceId}/gateway/zibal`,
      { amount, gateway: "zibal" }
    );
    return response.data;
  },

  zarinpalCallback: async (
    invoiceId: string,
    paymentTransactionId: string,
    authority: string,
    status: string
  ): Promise<InvoicePaymentCallbackResponse> => {
    const response = await api.get(
      `/payments/invoices/${invoiceId}/callback/zarinpal`,
      {
        params: {
          payment_transaction_id: paymentTransactionId,
          Authority: authority,
          Status: status,
        },
      }
    );
    return response.data;
  },

  zibalCallback: async (
    invoiceId: string,
    paymentTransactionId: string,
    trackId: number
  ): Promise<InvoicePaymentCallbackResponse> => {
    const response = await api.get(
      `/payments/invoices/${invoiceId}/callback/zibal`,
      {
        params: {
          payment_transaction_id: paymentTransactionId,
          trackId,
        },
      }
    );
    return response.data;
  },
};
```

### 6. UI Components

#### 6.1. صفحه پرداخت فاکتور

- مسیر: `/user/orders/{orderId}/invoice/payment`
- نمایش اطلاعات فاکتور
- نمایش موجودی کیف پول
- دکمه‌های پرداخت

#### 6.2. Callback Page

- مسیر: `/user/orders/{orderId}/invoice/payment/callback`
- نمایش نتیجه پرداخت
- هدایت به صفحه جزئیات سفارش

### 7. نکات مهم Backend

1. **Transaction Safety**: تمام عملیات پرداخت باید در Transaction انجام شود
2. **Idempotency**: درخواست‌های تکراری نباید باعث پرداخت مجدد شوند
3. **Wallet Update**: بعد از پرداخت موفق، کیف پول باید آپدیت شود
4. **Invoice Status**: وضعیت فاکتور باید به `PAID` تغییر کند
5. **Order Status**: اگر تمام فاکتورها پرداخت شدند، وضعیت سفارش می‌تواند تغییر کند
6. **Logging**: تمام تراکنش‌های پرداخت باید لاگ شوند

### 8. سناریوهای Edge Case

1. **پرداخت جزئی**: اگر کاربر بخشی از مبلغ را پرداخت کند
2. **پرداخت ناموفق**: اگر پرداخت از درگاه ناموفق باشد
3. **Timeout**: اگر کاربر از درگاه برنگردد
4. **Double Payment**: جلوگیری از پرداخت مجدد

### 9. امنیت

1. **Authentication**: کاربر باید لاگین باشد
2. **Authorization**: کاربر فقط می‌تواند فاکتور خودش را پرداخت کند
3. **Validation**: بررسی صحت مبلغ و موجودی
4. **Rate Limiting**: محدود کردن تعداد درخواست‌های پرداخت

## 📝 خلاصه

1. **Endpoint جدید**: `/orders/{orderId}/invoice/payment-info` برای دریافت اطلاعات
2. **Endpoint پرداخت از کیف پول**: `/orders/{orderId}/invoice/pay-from-wallet`
3. **Endpoint درگاه پرداخت**: `/payments/invoices/{invoiceId}/gateway/{gateway}`
4. **Callback Endpoints**: برای بازگشت از درگاه
5. **UI Component**: صفحه پرداخت فاکتور
6. **Integration**: اتصال به صفحه جزئیات سفارش

این راه‌حل انعطاف‌پذیر است و هم پرداخت از کیف پول و هم پرداخت از درگاه را پشتیبانی می‌کند.
