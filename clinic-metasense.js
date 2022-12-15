<script> 
var Webflow = Webflow || [];
Webflow.push(function () {
  $(document).off("submit");
});
const navbarLogo = document.getElementById("navbarLogo");
navbarLogo.src =
  "https://uploads-ssl.webflow.com/62eabe682fd502f7a527aa06/63972a1185f836677a924dc4_OneCareMetasense.png";
navbarLogo.style.width = "350px";

var widgetId1, homeDemoKey;
const payNowBtn = document.getElementById("payNowBtn");
const nfcPopup = document.getElementById("nfcScannerPopup");
const closeNfcPopup = document.getElementById("closePopup");
const nfcResultBlock = document.getElementById("nfcResult");
const checkNfc = document.getElementById("checkNfcBtn");
const nfcNextBtn = document.getElementById("nfcNextBtn");
const homeDemoBtn = document.getElementById("homeDemoBtn");
const metasensePayDemoForm = document.getElementById("metasensePayForm");
const metasensePayFormBtn = document.getElementById("metasensePayFormBtn");
const payementRecaptche = document.getElementById("payementRecaptche");
const homeDemoPopup = document.getElementById("nfcPopupHomeDemo");
const homeDemoFormContainer = document.getElementById("homeDemoFormContainer");
const homeDemoNfcBtn = document.getElementById("homeDemoNfcBtn");
const homeDemoNfcResult = document.getElementById("homeDemoNfcResult");
const homeDemoForm = document.getElementById("homeDemoForm");
const demoNfcNextBtn = document.getElementById("demoNfcNextBtn");
const closeHomeDemoPopup = document.getElementById("closeHomeDemoPopup");
const demoFormBtn = document.getElementById("demoFormBtn");
const homeDemoRecaptche = document.getElementById("homeDemoRecaptche");
const payNowForm = document.getElementById("payNowForm");
const payFormError = document.getElementById("payFormError");
const demoFormError = document.getElementById("demoFormError");
const generalError = "Something went wrong, please contact our team";

const urlParams = new URLSearchParams(window.location.search);
const clinicID = urlParams.get("clinicID") || "56";
const doctorID = urlParams.get("doctorID") || "185";
const clinicName = urlParams.get("clinicName") || "OneCare Metasense" 
const url = "https://api.onecaredev.in";
const isIos = getMobileOperatingSystem() === "iOS"

function renderFormAndCaptcha(recaptche,formName,form){
form();
		if(!recaptche.innerHTML.length){
    grecaptcha.ready(function () {
      let key = grecaptcha.render(recaptche, {
        sitekey: "6Ld25EwjAAAAAI6ds1ABs4Ye_DaPfidj9NATd5zo",
        theme: "light",
      });
      if (formName === "payNow") {
        widgetId1 = key;
      } else {
        homeDemoKey = key;
      }
    });
   }
}

function rederFormWithCaptcha(formName, nextBtn, nfcBtn, recaptche,form) {
if(isIos){
 nfcNextBtn.style.display = "none";
 demoNfcNextBtn.style.display = "none";
 renderFormAndCaptcha(recaptche,formName,form);
 return;
 }   
  nextBtn.style.display = "block";
  nfcBtn.style.display = "none";
  nextBtn.innerHTML = "Next";
  nextBtn.addEventListener("click", function () {
    renderFormAndCaptcha(recaptche,formName,form);
  });
}

payNowBtn.addEventListener("click", async function () {
if(isIos){
 nfcPopup.style.display = "block";
 rederFormWithCaptcha("payNow", nfcNextBtn, checkNfc, payementRecaptche,showPayFormOnly)
}else{nfcPopup.style.display = "block";
  }
});

homeDemoBtn.addEventListener("click", function () {
if(isIos){
homeDemoPopup.style.display = "block";
rederFormWithCaptcha("homeDemo",demoNfcNextBtn,homeDemoNfcBtn,homeDemoRecaptche,showDemoFormOnly);
}else{
homeDemoPopup.style.display = "block";
 }
});

homeDemoNfcBtn.addEventListener("click", async function () {
 homeDemoNfcResult.style.display = "block";
 homeDemoNfcResult.innerHTML = "Checking for NFC ....";
 const result = await nfcReader(homeDemoNfcResult, demoNfcNextBtn);
 if (result) {
 rederFormWithCaptcha("homeDemo",demoNfcNextBtn,homeDemoNfcBtn,homeDemoRecaptche,showDemoFormOnly);
} else {homeDemoNfcBtn.innerHTML = "Check NFC again";}
});

checkNfc.addEventListener("click", async function () {
  nfcResultBlock.style.display = "block";
  nfcResultBlock.innerHTML = "Checking for NFC ....";
  const res = await nfcReader(nfcResultBlock, nfcNextBtn);

  if (res) {
    rederFormWithCaptcha("payNow", nfcNextBtn, checkNfc, payementRecaptche,showPayFormOnly);
  } else {
    checkNfc.innerHTML = "Check NFC again";
  }
});

closeNfcPopup.addEventListener("click", resetForms);
closeHomeDemoPopup.addEventListener("click", resetForms);

function showPayFormOnly() {
  nfcNextBtn.style.display = "none";
  checkNfc.style.display = "none";
  nfcResultBlock.style.display = "none";
  metasensePayDemoForm.style.display = "block";
}

function showDemoFormOnly() {
  demoNfcNextBtn.style.display = "none";
  homeDemoNfcBtn.style.display = "none";
  homeDemoNfcResult.style.display = "none";
  homeDemoFormContainer.style.display = "block";
  homeDemoRecaptche.style.display = "block";
}
metasensePayFormBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  payFormError.style.display = "none";
  const firstName = payNowForm?.payFormFirstName?.value;
  const lastName = payNowForm?.payFormLastName?.value;
  const phone = payNowForm?.payFormPhone?.value;

  let isValidForm = formValidation(payFormError, firstName, phone, widgetId1);
  if (!isValidForm) 
    return;

  let response = await fetchRazorPayUrl();
  showError(payFormError,"loading...")
  if (response?.status === "SUCCESS") {
    try {
      const payload = {
        firstName: firstName,
        lastName: lastName,
        mobileNumber: phone,
        clinicID: clinicID,
        doctorID: doctorID,
        clinicName:clinicName,
        paymentPageID: response.data?.id,
      };
      let res = await fetch(`${url}/v1/clinics/clinicTransaction`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-type": "application/json",
        },
      });

      let resData = await res.json();

      if (resData?.status === "SUCCESS") {
        window.open(response?.data?.paymentPageURL, "_blank");
        resetForms();
      } else {
        payFormError.innerHTML = generalError;
      }

      return;
    } catch (error) {
      payFormError.innerHTML = generalError;
      return;
    }
  }else{
   payFormError.innerHTML = generalError;
   return;
  }
});

demoFormBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  try {
    const name = homeDemoForm?.demoFormName?.value;
    const phone = homeDemoForm?.demoformPhone?.value;

    let isValidForm = formValidation(demoFormError, name, phone, homeDemoKey);
    if (!isValidForm)
      return;
    
    showError(demoFormError,"loading...")
    const payload = {
      name: homeDemoForm.name,
      site: "62eabe682fd502f7a527aa06",
      data: {
        Name: name,
        Phone: phone,
        utm_source: "Home Demo",
        leadSource: "Next OS",
        clinicID: clinicID,
        doctorID: doctorID,
        clinicName:clinicName,
      },
    };

    const res = await fetch(`${url}/v1/Integration/createMarketingLead`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {"Content-type": "application/json",},
    });
    const leadData = await res?.json();
    if(leadData?.status === "SUCCESS"){
		 window.location.href = "https://onecares.webflow.io/thank-you";
   	 resetForms();
    }else{
    showError(demoFormError,generalError)
    }
   
    return;
  } catch (error) {
    showError(demoFormError,generalError)
    return error;
  }
});

async function fetchRazorPayUrl() {
  try {
    const res = await fetch(
      `${url}/v1/clinics/paymentPage/${clinicID}?type=metasense`
    );
    const data = await res.json();
    return data;
  } catch (error) {
  	 showError(payFormError,generalError)
    return error;
  }
}

async function nfcReader(result, btn) {
  try {
    const ndef = new NDEFReader();
    await ndef.scan();

    result.innerHTML = "NFC present";
    result.style.color = "green";

    return true;
  } catch (error) {
    result.innerHTML =
      error.message === "NDEFReader is not defined"
 ? "Please open website in Google Chrome": error.message === "NFC setting is disabled."?"NFC setting is disabled.":"NFC is not present, you won’t be able to use METASENSE";
    result.style.color = "red";
    return false;
  }
}

function formValidation(formErrorBlock, name, phone, key) {
  const regexExpForMobileNumber = new RegExp(/^[6-9]\d{9}$/g);
  const captchResponse = grecaptcha.getResponse(key);
  if (!name || name.length == 0) {
   	showError(formErrorBlock,"Enter a valid name")
    return false;
  }

  if (!regexExpForMobileNumber.test(phone)) {
    showError(formErrorBlock,"Enter a valid phone number")
    return false;
  }

  if (!captchResponse) {
    showError(formErrorBlock,"reCaptche validation failed")
    return false;
  }
  return true;
}

function showError(errorBlock,error){
errorBlock.style.display = "block";
errorBlock.innerHTML = error;
}

function getMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent))return "Android";
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream)return "iOS";
    return "unknown";
}

function resetForms() {
  nfcPopup.style.display = "none";
  nfcResultBlock.style.display = "none";
  nfcNextBtn.style.display = "none";
  checkNfc.innerHTML = "Check NFC";
  checkNfc.style.display = "block";
  metasensePayDemoForm.style.display = "none";
  payFormError.style.display = "none";
  payFormError.innerHTML = generalError;
  homeDemoPopup.style.display = "none";
  homeDemoNfcResult.style.display = "none";
  demoNfcNextBtn.style.display = "none";
  homeDemoNfcBtn.innerHTML = "Check NFC";
  homeDemoNfcBtn.style.display = "block";
  homeDemoFormContainer.style.display = "none";
  demoFormError.style.display = "none";
  demoFormError.innerHTML = generalError;
}
</script>
