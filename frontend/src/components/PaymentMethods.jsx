import "./PaymentMethods.css";

const paymentImages = [
  { file: "1.png", alt: "شعار مدى" },
  { file: "2.png", alt: "شعار فيزا" },
  { file: "3.png", alt: "شعار ماستركارد" },
  { file: "4.png", alt: "شعار Apple Pay" },
  { file: "5.png", alt: "شعار stc pay" },
  { file: "6.png", alt: "شعار تمارا" },
  { file: "7.png", alt: "شعار تابي" },
  { file: "8.png", alt: "شعار PayPal" },
  { file: "9.png", alt: "شعار الدفع عند الاستلام" },
];

const PaymentMethods = () => {
  return (
    <div className="payment-methods" aria-label="وسائل الدفع المتاحة">
      <div className="payment-main">
        {paymentImages.map(({ file, alt }) => (
          <div className="payment-card" key={file}>
            <img
              src={`/image/${file}`}
              alt={alt}
              loading="lazy"
              className="payment-card-image"
            />
          </div>
        ))}
        <p className="payment-text">
          مرر
          <br />
          لرؤية
          <br />
          وسائل الدفع
        </p>
        <div className="payment-main_back" aria-hidden="true" />
      </div>
    </div>
  );
};

export default PaymentMethods;
