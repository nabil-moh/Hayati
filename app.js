}catch(err){
  console.error('Hayati order error:',err);
  const code=err?.code||'';
  const message=err?.message||'';
  const details=err?.details||'';
  const hint=err?.hint||'';

  msg.textContent=
    'خطأ Supabase'
    +(code?' | الكود: '+code:'')
    +(message?' | '+message:'')
    +(hint?' | '+hint:'')
    +(details?' | '+details:'');
    }
