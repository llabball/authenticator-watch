var div_sec = document.getElementById('timer')
  , div_totp = document.getElementById('totp')
  , otp = HOTP.randomBase32(8)

log()

function log () {
  div_sec.innerText = (new Date()).getSeconds()
  div_totp.innerText = HOTP.getOTP(otp)
  setTimeout(function() {
    log()
  }, 1000)
}