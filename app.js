if (error) {
  console.error("Order insert error:", error);

  const realError =
    error.message ||
    error.details ||
    error.hint ||
    error.code ||
    "خطأ غير معروف";

  if (msg) {
    msg.innerHTML = `
      <div style="
        color:#c00000;
        background:#fff0f0;
        border:1px solid #ffcccc;
        padding:12px;
        border-radius:10px;
        line-height:1.8;
        direction:rtl;
        text-align:right;
      ">
        <strong>لم يتم إرسال الطلب ❌</strong>
        <br>
        ${escapeHtml(realError)}
        ${
          error.code
            ? `<br><small>Code: ${escapeHtml(error.code)}</small>`
            : ""
        }
      </div>
    `;
  }

  return;
}
