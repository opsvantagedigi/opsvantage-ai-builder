// Usage:
// node scripts/check-prod-auth.js https://your-prod-url
// Optionally set REGISTER_PAYLOAD as JSON string to POST to /api/register
// Optionally set LOGIN_PAYLOAD as JSON string for { email, password }

const [,, baseArg] = process.argv
const BASE = (baseArg || process.env.PROD_URL || '').replace(/\/$/, '')

if (!BASE) {
  console.error('Usage: node scripts/check-prod-auth.js https://your-prod-url')
  process.exit(1)
}

async function jsonFetch(url, opts = {}) {
  const res = await fetch(url, opts)
  const text = await res.text()
  let body
  try { body = JSON.parse(text) } catch { body = text }
  return { res, body }
}

async function main(){
  console.log('Checking diagnostics at', BASE + '/api/health/prod-check')
  try {
    const { res, body } = await jsonFetch(BASE + '/api/health/prod-check')
    console.log('Diagnostics status:', res.status)
    console.log(JSON.stringify(body, null, 2))
  } catch (err) {
    console.error('Diagnostics fetch failed', err)
    process.exit(2)
  }

  const registerPayload = process.env.REGISTER_PAYLOAD
  if (registerPayload) {
    let payload
    try { payload = JSON.parse(registerPayload) } catch(e){ console.error('Invalid REGISTER_PAYLOAD JSON'); process.exit(3) }
    console.log('Posting /api/register with payload keys:', Object.keys(payload))
    const { res, body } = await jsonFetch(BASE + '/api/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    console.log('/api/register ->', res.status)
    console.log(JSON.stringify(body, null, 2))
  }

  const loginPayloadEnv = process.env.LOGIN_PAYLOAD
  if (loginPayloadEnv) {
    let login
    try { login = JSON.parse(loginPayloadEnv) } catch(e){ console.error('Invalid LOGIN_PAYLOAD JSON'); process.exit(4) }

    console.log('Attempting credentials login flow (CSRF -> callback)')
    // get csrf
    const csrfRes = await fetch(BASE + '/api/auth/csrf')
    const csrfText = await csrfRes.text()
    let csrfBody
    try { csrfBody = JSON.parse(csrfText) } catch { csrfBody = csrfText }
    const csrfToken = csrfBody?.csrfToken || csrfBody?.csrf_token
    if (!csrfToken) {
      console.error('Could not read csrf token from /api/auth/csrf:', csrfBody)
      process.exit(5)
    }

    // build form
    const form = new URLSearchParams()
    form.append('csrfToken', csrfToken)
    // common fields required by NextAuth credentials callback
    for (const k of Object.keys(login)) form.append(k, login[k])

    const callbackRes = await fetch(BASE + '/api/auth/callback/credentials', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      redirect: 'manual',
    })

    console.log('Callback response status:', callbackRes.status)
    const setCookie = callbackRes.headers.get('set-cookie')
    const cookies = []
    if (setCookie) {
      // coarse handling: split on comma for multiple cookies
      cookies.push(...setCookie.split(/,(?=[^;]+=)/))
    }

    if (cookies.length === 0) {
      console.warn('No session cookie set by callback. Login may have failed or provider is OAuth.')
    } else {
      const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ')
      console.log('Got cookies:', cookieHeader)

      // check session
      const sessionRes = await fetch(BASE + '/api/auth/session', { headers: { cookie: cookieHeader } })
      const sessionBody = await sessionRes.json().catch(()=>null)
      console.log('/api/auth/session ->', sessionRes.status, JSON.stringify(sessionBody, null, 2))

      // attempt to access dashboard
      const dashRes = await fetch(BASE + '/dashboard', { headers: { cookie: cookieHeader } })
      const dashText = await dashRes.text()
      console.log('/dashboard ->', dashRes.status, dashText.slice(0, 500))
    }
  }

  console.log('Done')
}

main().catch(e=>{ console.error(e); process.exit(99) })
