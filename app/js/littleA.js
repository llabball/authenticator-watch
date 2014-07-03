//data mock
localStorage.otpStore = JSON.stringify({
	version: '1.0.0',
	accounts: {
		'llabball@github.com': {
			secret: 'SS3M362LELW7IFMVUFEBSD34LMHL5QU6',
			issuer: 'Github',
			created_at: '2014-06-28T22:55:53.740Z',
			icon: 'fa-github'
		},
		'llabball@googlemail.com': {
			secret: 'SS3M362LEXC7IFMVUFEBSD34LMHL5QU6',
			issuer: 'Google',
			created_at: '2014-06-18T22:55:53.740Z',
			icon: 'fa-google'
		},
		'yoracogonzales@bitbucket.com': {
			secret: 'SS11362LELW7IFMVUFEBSD34LMHL5QU6',
			issuer: 'Bitbucket',
			created_at: '2014-06-08T22:55:53.740Z',
			icon: 'fa-bitbucket'
		}
	}
})

var store = (function () {
	var _store, _accounts

	try {
		_store = JSON.parse(localStorage.otpStore)
	} catch (e) {
    _store = {version: '1.0.0'}
	}
	_accounts = _store.accounts || {}

	function save () {
		_store.accounts = _accounts
		localStorage.otpStore = JSON.stringify(_store)
	}

	return {
		getAccounts: function () {return _accounts},
		getAccount: function (email) {return _accounts[email]},
		delAccount: function (email) {
			if (_accounts[email]) {
				delete _accounts[email]
				save()
				return true
			} else {
				return false
			}
		},
		putAccount: function (email, secret, issuer) {
			if (email && secret && issuer) {
				_accounts[email] = {
					issuer: issuer,
					secret: secret,
					created_at: new Date().toISOString()
				}
				save()
				return true
			} else {
				return false
			}
		}
	}
})()

window.location.href = '#dashboard'
refreshDashboard()

function refreshDashboard () {
	var accounts = store.getAccounts()
		,	addbtn 	 = document.getElementById('dashboard-btn-add').parentElement

	while (addbtn.previousSibling) {
		addbtn.previousSibling.remove()
	}

	for (email in accounts) {
		if (accounts.hasOwnProperty(email))
			addDashboardbutton(email, accounts[email])
	}
}

function addDashboardbutton (email, account) {
	var user 		= email.match(/\w+/)
	  , host 		= account.issuer
		,	addbtn 	= document.getElementById('dashboard-btn-add').parentElement
	  , page 		= addbtn.parentElement
		, wrapper = document.createElement('div')
		,	button  = document.createElement('a')
		, divider

		wrapper.className = 'dashboard-btn-wrapper'
		button.className = 'dashboard-btn'				
		button.href = '#account'
		button.onclick = function () {showAccount(email)}

		if (account.icon) {
			divider = document.createElement('i')
			divider.className = 'fa ' + account.icon
		} else {
			divider = document.createElement('br')
		}

		button.innerHTML = user + divider.outerHTML + host

		wrapper.appendChild(button)
		page.insertBefore(wrapper, addbtn)
}

//refresh the account view when triggered
function showAccount (email) {
	var parts     = email.split('@')
		, user 		  = (parts[0]) ? parts[0] : 'unknown'
	  , host 		  = (parts[1]) ? parts[1] : 'unknown'
	  , totpfield = document.getElementById('account-hotp')
	

																totpfield.innerText = HOTP.getOTP(store.getAccount(email).secret)
	document.getElementById('account-name').innerText = user
	document.getElementById('account-host').innerText = host
	document.getElementById('currentEmail').value			= email

	startProgressBar()

	var startTime = Date.now();
	setCorrectingInterval(function() {
	  if (new Date().getSeconds() === 59)
	  	totpfield.innerText = HOTP.getOTP(store.getAccount(email).secret)
	}, 1000)
}
function startProgressBar() {
	document.getElementById('account-progressbar-progress').style['-webkit-animation-delay'] = '-'+(new Date().getSeconds())+'s'
}

function editAccount (email, secret, issuer) {
	var path = ''

	if (email && secret && issuer) {
		path = '#input-issuer'
	} else {
		if (email) {
			var account = store.getAccount(email)
			if (account) {
				secret = account.secret
				issuer = account.issuer
				path = '#input-issuer'
			} else {
				path = '#input-secret'
			}
		} else {
			path = '#input-secret'
		}
	}
	
	document.getElementById('input-text-secret').value = secret || ''
	document.getElementById('input-text-email').value  = email  || ''
	document.getElementById('input-text-issuer').value = issuer || ''

	window.location.href = path
}

//delete an account
function deleteAccount () {
	var email = document.getElementById('currentEmail').value
	
	if (store.delAccount(email))
		refreshDashboard()
}

//store Account
function storeAccount () {
	var secret 	     = document.getElementById('input-text-secret').value
		,	email  	     = document.getElementById('input-text-email').value
		, issuer 			 = document.getElementById('input-text-issuer').value
		, currentEmail = document.getElementById('currentEmail').value

	if (store.putAccount(email, secret, issuer)) {
		if (email !== currentEmail)
			store.delAccount(currentEmail)

		refreshDashboard()
		showAccount(email)
	} else {
		console.error('couldn\'t store the new account')
	}
}

//calc the progress when the accout page is requested directly
window.onload = function () {
 	document.getElementById('account-progressbar-progress').style['-webkit-animation'] = 'linear progress 60s infinite'
	startProgressBar()
}

function setCorrectingInterval(func, delay) {
  if (!(this instanceof setCorrectingInterval)) {
    return new setCorrectingInterval(func, delay)
  }

  var target = (new Date().valueOf()) + delay
  var that = this

  function tick() {
    if (that.stopped) return

    target += delay
    func()

    setTimeout(tick, target - (new Date().valueOf()))
  }

  setTimeout(tick, delay)
}