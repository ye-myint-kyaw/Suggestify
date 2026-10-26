import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { toast } from "react-hot-toast";
import { slugify } from "../../util/helpers";

const QrCode = ({ url, name }) => {
  const [qr, setQr] = useState("");
  const [copyBtnText, setCopyBtnText] = useState("Copy the link");
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyBtnText("Copied");
      setTimeout(() => {
        setCopyBtnText("Copy the link");
      }, 3000);
    } catch (error) {
      console.error(error);
      toast.error("Couldn't copy. Long-press the link below instead.");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: name,
        text: `Leave anonymous feedback: ${name}`,
        url,
      });
    } catch (error) {
      // Closing the share sheet is not an error worth reporting.
      if (error.name !== "AbortError") console.error(error);
    }
  };

  useEffect(() => {
    QRCode.toDataURL(
      url,
      {
        width: 400,
        margin: 2,
        color: { dark: "#283618", light: "#FEFAE0" },
        errorCorrectionLevel: "H",
      },
      (err, dataUrl) => {
        if (err) {
          console.error(err);
          return;
        }
        setQr(dataUrl);
      }
    );
  }, [url]);

  return (
    <div className="text-darkGreen flex flex-col items-center gap-8">
      <h2 className="text-2xl font-semibold text-center">
        Share this QR code to get suggestions
      </h2>
      {qr && (
        <>
          <div className="w-[260px] md:w-[300px] border-4 border-darkGreen">
            <img src={qr} alt={`QR code linking to the "${name}" feedback form`} />
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body font-light text-sm break-all text-center underline underline-offset-4 max-w-full"
          >
            {url}
          </a>
          <div className="text-2xl md:text-3xl flex flex-col gap-4 w-full max-w-xs">
            {canShare && (
              <button
                className="bg-darkGreen text-primary h-fit px-7 py-2 font-display"
                onClick={handleShare}
              >
                Share
              </button>
            )}
            <a
              className={
                "bg-darkGreen text-primary h-fit px-7 py-2 font-display text-center"
              }
              href={qr}
              download={`${slugify(name)}-qr.png`}
            >
              Download the QR Code
            </a>
            <button
              className={"bg-green text-primary h-fit px-7 py-2 font-display"}
              onClick={handleCopy}
              aria-live="polite"
            >
              {copyBtnText}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default QrCode;
